import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/response'

const schema = z.object({
  score: z.number().int().min(1, 'Note minimale : 1').max(5, 'Note maximale : 5'),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id } = await params
    const recipe = await prisma.recipe.findUnique({ where: { id }, select: { id: true } })
    if (!recipe) return notFound('Recette introuvable')

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const rating = await prisma.rating.upsert({
      where:  { userId_recipeId: { userId: session.userId, recipeId: id } },
      create: { score: parsed.data.score, userId: session.userId, recipeId: id },
      update: { score: parsed.data.score },
    })
    return ok(rating)
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

    await prisma.rating.deleteMany({ where: { userId: session.userId, recipeId: id } })
    return ok({ message: 'Note supprimée' })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
