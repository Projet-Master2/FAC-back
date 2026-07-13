import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, unauthorized, forbidden, notFound, serverError } from '@/lib/response'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id } = await params

    const media = await prisma.recipeMedia.findUnique({
      where: { id },
      include: { recipe: { select: { authorId: true } } },
    })
    if (!media) return notFound('Média introuvable')
    if (media.recipe.authorId !== session.userId) return forbidden()

    await prisma.recipeMedia.delete({ where: { id } })
    return ok({ message: 'Média supprimé' })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
