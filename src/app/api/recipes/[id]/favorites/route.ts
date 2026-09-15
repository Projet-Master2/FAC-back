import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, unauthorized, notFound, serverError } from '@/lib/response'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id } = await params
    const recipe = await prisma.recipe.findUnique({ where: { id }, select: { id: true } })
    if (!recipe) return notFound('Recette introuvable')

    await prisma.favorite.upsert({
      where:  { userId_recipeId: { userId: session.userId, recipeId: id } },
      create: { userId: session.userId, recipeId: id },
      update: {},
    })
    return ok({ message: 'Ajouté aux favoris' })
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

    await prisma.favorite.deleteMany({ where: { userId: session.userId, recipeId: id } })
    return ok({ message: 'Retiré des favoris' })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
