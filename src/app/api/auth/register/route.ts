import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, refreshTokenExpiry } from '@/lib/jwt'
import { created, badRequest, conflict, serverError } from '@/lib/response'
import { rateLimit } from '@/lib/rate-limit'
export { OPTIONS } from '@/lib/cors'


const schema = z.object({
  email:  z.string().email('Email invalide'),
  name:   z.string().min(2, 'Nom trop court'),
  pseudo: z.string().min(2, 'Pseudo trop court').optional(),
  password: z.string().min(8, 'Mot de passe : 8 caractÃ¨res minimum'),
})

export async function POST(req: NextRequest) {
  // Rate limiting: 5 requêtes par minute
  const rateLimitResponse = rateLimit(req, { maxRequests: 5, windowMs: 60_000 })
  if (rateLimitResponse) return rateLimitResponse

  console.log('[register] DATABASE_URL prefix:', process.env.DATABASE_URL?.slice(0, 30))
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { email, name, pseudo, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return conflict('Cet email est dÃ©jÃ  utilisÃ©')

    if (pseudo) {
      const pseudoTaken = await prisma.user.findUnique({ where: { pseudo } })
      if (pseudoTaken) return conflict('Ce pseudo est dÃ©jÃ  pris')
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

    return created({ user, accessToken, refreshToken })
  } catch {
    return serverError()
  }
}
