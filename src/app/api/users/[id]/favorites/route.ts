import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, notFound, serverError } from '@/lib/response'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return notFound('Utilisateur introuvable')

    const favorites = await prisma.favorite.findMany({
      where: { userId: id },
      include: {
        recipe: {
          select: {
            id: true, title: true, difficulty: true, prepTime: true,
            cookTime: true, estimatedCost: true,
            author: { select: { id: true, name: true, pseudo: true, avatar: true } },
            media: { where: { order: 0 }, take: 1, select: { url: true, type: true } },
            _count: { select: { ratings: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return ok(favorites.map(f => f.recipe))
  } catch {
    return serverError()
  }
}
