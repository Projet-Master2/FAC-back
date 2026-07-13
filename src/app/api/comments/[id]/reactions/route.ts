import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, badRequest, unauthorized, notFound, serverError } from '@/lib/response'
import { ReactionType } from '@/generated/prisma/client'

const schema = z.object({ type: z.nativeEnum(ReactionType) })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id } = await params
    const comment = await prisma.comment.findUnique({ where: { id }, select: { id: true } })
    if (!comment) return notFound('Commentaire introuvable')

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const reaction = await prisma.reaction.upsert({
      where:  { userId_commentId_type: { userId: session.userId, commentId: id, type: parsed.data.type } },
      create: { type: parsed.data.type, userId: session.userId, commentId: id },
      update: {},
    })
    return ok(reaction)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
