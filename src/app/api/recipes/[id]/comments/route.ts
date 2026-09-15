import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, badRequest, unauthorized, notFound, serverError } from '@/lib/response'

const schema = z.object({
  content: z.string().min(3, 'Commentaire trop court').max(2000, 'Commentaire trop long'),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const page  = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? 1))
    const limit = 20

    const [total, comments] = await prisma.$transaction([
      prisma.comment.count({ where: { recipeId: id } }),
      prisma.comment.findMany({
        where: { recipeId: id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, pseudo: true, avatar: true } },
          _count: { select: { reactions: true } },
        },
      }),
    ])

    return ok({ comments, total, page, totalPages: Math.ceil(total / limit) })
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
    const recipe = await prisma.recipe.findUnique({ where: { id }, select: { id: true } })
    if (!recipe) return notFound('Recette introuvable')

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const comment = await prisma.comment.create({
      data: { content: parsed.data.content, userId: session.userId, recipeId: id },
      include: { user: { select: { id: true, name: true, pseudo: true, avatar: true } } },
    })
    return created(comment)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
