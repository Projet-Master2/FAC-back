import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'

const schema = z.object({ content: z.string().min(3).max(2000) })

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id } = await params
    const comment = await prisma.comment.findUnique({ where: { id }, select: { userId: true } })
    if (!comment) return notFound('Commentaire introuvable')
    if (comment.userId !== session.userId) return forbidden()

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const updated = await prisma.comment.update({ where: { id }, data: { content: parsed.data.content } })
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
    const comment = await prisma.comment.findUnique({ where: { id }, select: { userId: true } })
    if (!comment) return notFound('Commentaire introuvable')
    if (comment.userId !== session.userId) return forbidden()

    await prisma.comment.delete({ where: { id } })
    return ok({ message: 'Commentaire supprimé' })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
