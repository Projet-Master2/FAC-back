import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, refreshTokenExpiry } from '@/lib/jwt'
import { ok, badRequest, unauthorized, serverError } from '@/lib/response'
import { rateLimit } from '@/lib/rate-limit'
import { getRequestMeta, logError, logInfo, logWarn } from '@/lib/logger'
export { OPTIONS } from '@/lib/cors'


const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export async function POST(req: NextRequest) {
  const meta = getRequestMeta(req)

  // Rate limiting: 5 requêtes par minute
  const rateLimitResponse = rateLimit(req, { maxRequests: 5, windowMs: 60_000 })
  if (rateLimitResponse) {
    logWarn('Rate limit exceeded on login', meta)
    return rateLimitResponse
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      logWarn('Login failed: unknown email', { ...meta, email })
      return unauthorized('Email ou mot de passe incorrect')
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      logWarn('Login failed: invalid password', { ...meta, userId: user.id })
      return unauthorized('Email ou mot de passe incorrect')
    }

    const payload = { userId: user.id, email: user.email }
    const accessToken  = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
    })

    logInfo('Login success', { ...meta, userId: user.id })

    return ok({
      user: { id: user.id, email: user.email, name: user.name, pseudo: user.pseudo, avatar: user.avatar },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    logError('Login route failed', error, meta)
    return serverError()
  }
}
