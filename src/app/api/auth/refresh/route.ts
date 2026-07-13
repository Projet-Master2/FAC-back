import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, signAccessToken, signRefreshToken, refreshTokenExpiry } from '@/lib/jwt'
import { ok, badRequest, unauthorized, serverError } from '@/lib/response'

const schema = z.object({ refreshToken: z.string() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Refresh token requis')

    const { refreshToken } = parsed.data

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      return unauthorized('Token invalide ou expiré')
    }

    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      return unauthorized('Token invalide')
    }

    // Rotation : supprime l'ancien, crée un nouveau
    await prisma.refreshToken.delete({ where: { token: refreshToken } })

    const newAccessToken  = signAccessToken({ userId: payload.userId, email: payload.email })
    const newRefreshToken = signRefreshToken({ userId: payload.userId, email: payload.email })

    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: payload.userId, expiresAt: refreshTokenExpiry() },
    })

    return ok({ accessToken: newAccessToken, refreshToken: newRefreshToken })
  } catch {
    return serverError()
  }
}
