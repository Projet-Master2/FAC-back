import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, badRequest, unauthorized, serverError } from '@/lib/response'
import { getIngredientIcon } from '@/lib/ingredient-icons'
export { OPTIONS } from '@/lib/cors'


const schema = z.object({
  name:     z.string().min(2, 'Nom trop court'),
  iconName: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') ?? ''
    const ingredients = await prisma.ingredient.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
      take: 50,
    })
    return ok(ingredients)
  } catch {
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    // Normalisation : minuscules + singulier simple (retire le "s" final si > 3 lettres)
    const raw  = parsed.data.name.trim().toLowerCase()
    const name = raw.length > 3 && raw.endsWith('s') ? raw.slice(0, -1) : raw

    // Si l'ingredient existe deja (exact ou singulier), on le retourne
    const existing = await prisma.ingredient.findUnique({ where: { name } })
    if (existing) return ok(existing)

    // Attribution automatique de l'icone via le dictionnaire
    const iconName = parsed.data.iconName ?? getIngredientIcon(name) ?? undefined

    const ingredient = await prisma.ingredient.create({ data: { name, iconName } })
    return created(ingredient)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    console.error('[ingredients POST] error:', e)
    return serverError()
  }
}
