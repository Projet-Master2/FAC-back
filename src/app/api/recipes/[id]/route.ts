import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'
import { Difficulty } from '@/generated/prisma/client'

const patchSchema = z.object({
  title:         z.string().min(3).optional(),
  description:   z.string().min(10).optional(),
  difficulty:    z.nativeEnum(Difficulty).optional(),
  prepTime:      z.number().int().positive().optional(),
  cookTime:      z.number().int().min(0).optional(),
  servings:      z.number().int().positive().optional(),
  estimatedCost: z.number().positive().optional(),
  published:     z.boolean().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        author:      { select: { id: true, name: true, pseudo: true, avatar: true } },
        ingredients: { include: { ingredient: true } },
        steps:       { orderBy: { order: 'asc' } },
        tags:        { include: { tag: true } },
        media:       { orderBy: { order: 'asc' } },
        reactions:   { select: { type: true } },
        _count:      { select: { ratings: true, comments: true, favorites: true } },
        ratings:     { select: { score: true } },
      },
    })

    if (!recipe) return notFound('Recette introuvable')

    const avgRating = recipe.ratings.length
      ? recipe.ratings.reduce((s: number, r: { score: number }) => s + r.score, 0) / recipe.ratings.length
      : null

    const { ratings, ...rest } = recipe
    return ok({ ...rest, avgRating })
  } catch {
    return serverError()
  }
}

export async function PATCH(
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
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const updated = await prisma.recipe.update({
      where: { id },
      data: parsed.data,
      select: { id: true, title: true, difficulty: true, prepTime: true, cookTime: true, updatedAt: true },
    })

    return ok(updated)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id } = await params
    const recipe = await prisma.recipe.findUnique({ where: { id }, select: { authorId: true } })
    if (!recipe) return notFound('Recette introuvable')
    if (recipe.authorId !== session.userId) return forbidden()

    await prisma.recipe.delete({ where: { id } })
    return ok({ message: 'Recette supprimée' })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
