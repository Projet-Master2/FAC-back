import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, badRequest, unauthorized, conflict, serverError } from '@/lib/response'

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

    const existing = await prisma.ingredient.findUnique({ where: { name: parsed.data.name } })
    if (existing) return conflict('Cet ingrédient existe déjà')

    const ingredient = await prisma.ingredient.create({ data: parsed.data })
    return created(ingredient)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
