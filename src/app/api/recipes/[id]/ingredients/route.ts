import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'

const schema = z.object({
  ingredientId: z.string().cuid('ID ingrédient invalide'),
  quantity:     z.number().positive('Quantité invalide'),
  unit:         z.string().min(1, 'Unité requise'),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ingredients = await prisma.recipeIngredient.findMany({
      where: { recipeId: id },
      include: { ingredient: true },
    })
    return ok(ingredients)
  } catch {
    return serverError()
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id } = await params
    const recipe = await prisma.recipe.findUnique({ where: { id }, select: { authorId: true } })
    if (!recipe) return notFound('Recette introuvable')
    if (recipe.authorId !== session.userId) return forbidden()

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const ri = await prisma.recipeIngredient.create({
      data: { recipeId: id, ...parsed.data },
      include: { ingredient: true },
    })
    return created(ri)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
