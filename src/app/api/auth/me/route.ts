import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, unauthorized, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req)

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, pseudo: true, avatar: true, bio: true, createdAt: true },
    })

    if (!user) return unauthorized()
    return ok(user)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
