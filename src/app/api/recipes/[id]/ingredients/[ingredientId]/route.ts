import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'

const schema = z.object({
  quantity: z.number().positive().optional(),
  unit:     z.string().min(1).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ingredientId: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id, ingredientId } = await params
    const recipe = await prisma.recipe.findUnique({ where: { id }, select: { authorId: true } })
    if (!recipe) return notFound('Recette introuvable')
    if (recipe.authorId !== session.userId) return forbidden()

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const ri = await prisma.recipeIngredient.update({
      where: { recipeId_ingredientId: { recipeId: id, ingredientId } },
      data: parsed.data,
      include: { ingredient: true },
    })
    return ok(ri)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ingredientId: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id, ingredientId } = await params
    const recipe = await prisma.recipe.findUnique({ where: { id }, select: { authorId: true } })
    if (!recipe) return notFound('Recette introuvable')
    if (recipe.authorId !== session.userId) return forbidden()

    await prisma.recipeIngredient.delete({
      where: { recipeId_ingredientId: { recipeId: id, ingredientId } },
    })
    return ok({ message: 'Ingrédient retiré' })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
