import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, unauthorized, forbidden, notFound, serverError } from '@/lib/response'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id, tagId } = await params
    const recipe = await prisma.recipe.findUnique({ where: { id }, select: { authorId: true } })
    if (!recipe) return notFound('Recette introuvable')
    if (recipe.authorId !== session.userId) return forbidden()

    await prisma.recipeTag.delete({ where: { recipeId_tagId: { recipeId: id, tagId } } })
    return ok({ message: 'Tag retiré' })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
