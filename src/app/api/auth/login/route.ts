import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, refreshTokenExpiry } from '@/lib/jwt'
import { ok, badRequest, unauthorized, serverError } from '@/lib/response'

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return unauthorized('Email ou mot de passe incorrect')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return unauthorized('Email ou mot de passe incorrect')

    const payload = { userId: user.id, email: user.email }
    const accessToken  = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
    })

    return ok({
      user: { id: user.id, email: user.email, name: user.name, pseudo: user.pseudo, avatar: user.avatar },
      accessToken,
      refreshToken,
    })
  } catch {
    return serverError()
  }
}
