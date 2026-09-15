import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, refreshTokenExpiry } from '@/lib/jwt'
import { created, badRequest, conflict, serverError } from '@/lib/response'
import { rateLimit } from '@/lib/rate-limit'
import { getRequestMeta, logError, logInfo, logWarn } from '@/lib/logger'
export { OPTIONS } from '@/lib/cors'


const schema = z.object({
  email:  z.string().email('Email invalide'),
  name:   z.string().min(2, 'Nom trop court'),
  pseudo: z.string().min(2, 'Pseudo trop court').optional(),
  password: z.string().min(8, 'Mot de passe : 8 caractÃ¨res minimum'),
})

export async function POST(req: NextRequest) {
  const meta = getRequestMeta(req)

  // Rate limiting: 5 requêtes par minute
  const rateLimitResponse = rateLimit(req, { maxRequests: 5, windowMs: 60_000 })
  if (rateLimitResponse) {
    logWarn('Rate limit exceeded on register', meta)
    return rateLimitResponse
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { email, name, pseudo, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      logWarn('Register conflict: email already used', { ...meta, email })
      return conflict('Cet email est déjà utilisé')
    }

    if (pseudo) {
      const pseudoTaken = await prisma.user.findUnique({ where: { pseudo } })
      if (pseudoTaken) {
        logWarn('Register conflict: pseudo already used', { ...meta, pseudo })
        return conflict('Ce pseudo est déjà pris')
      }
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, name, pseudo, password: hashed },
      select: { id: true, email: true, name: true, pseudo: true, createdAt: true },
    })

    const payload = { userId: user.id, email: user.email }
    const accessToken  = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: refreshTokenExpiry() },
    })

    logInfo('Register success', { ...meta, userId: user.id })

    return created({ user, accessToken, refreshToken })
  } catch (error) {
    logError('Register route failed', error, meta)
    return serverError()
  }
}
