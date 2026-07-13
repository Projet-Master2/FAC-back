import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, badRequest, unauthorized, forbidden, notFound, conflict, serverError } from '@/lib/response'

const patchSchema = z.object({
  name:     z.string().min(2).optional(),
  pseudo:   z.string().min(2).optional(),
  bio:      z.string().max(300).optional(),
  avatar:   z.string().url().optional(),
  password: z.string().min(8).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, pseudo: true, avatar: true, bio: true, createdAt: true },
    })
    if (!user) return notFound('Utilisateur introuvable')
    return ok(user)
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
    if (session.userId !== id) return forbidden()

    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { password, pseudo, ...rest } = parsed.data

    if (pseudo) {
      const taken = await prisma.user.findFirst({ where: { pseudo, NOT: { id } } })
      if (taken) return conflict('Ce pseudo est déjà pris')
    }

    const data: Record<string, unknown> = { ...rest }
    if (pseudo) data.pseudo = pseudo
    if (password) data.password = await bcrypt.hash(password, 12)

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, pseudo: true, avatar: true, bio: true },
    })

    return ok(user)
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
    if (session.userId !== id) return forbidden()

    await prisma.user.delete({ where: { id } })
    return ok({ message: 'Compte supprimé' })
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
