import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, badRequest, unauthorized, serverError } from '@/lib/response'
import { ReactionType } from '@/generated/prisma/client'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id, type } = await params

    if (!Object.values(ReactionType).includes(type as ReactionType)) {
      return badRequest('Type de réaction invalide')
    }

    await prisma.reaction.deleteMany({
      where: { userId: session.userId, recipeId: id, type: type as ReactionType },
    })
    return ok({ message: 'Réaction supprimée' })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
