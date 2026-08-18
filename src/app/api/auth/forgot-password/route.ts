import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ok, badRequest, serverError } from '@/lib/response'
import { rateLimit } from '@/lib/rate-limit'
import { getRequestMeta, logError, logInfo, logWarn } from '@/lib/logger'
export { OPTIONS } from '@/lib/cors'


const schema = z.object({ email: z.string().email('Email invalide') })

export async function POST(req: NextRequest) {
  const meta = getRequestMeta(req)

  // Rate limiting: 5 requêtes par minute
  const rateLimitResponse = rateLimit(req, { maxRequests: 5, windowMs: 60_000 })
  if (rateLimitResponse) {
    logWarn('Rate limit exceeded on forgot-password', meta)
    return rateLimitResponse
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { email } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })

    // RÃ©ponse identique qu'un compte existe ou non (sÃ©curitÃ©)
    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      })

      // TODO: envoyer l'email avec le token (intÃ©gration service email Ã  venir)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Reset token for ${email}: ${token}`)
      }

      logInfo('Password reset token generated', { ...meta, userId: user.id })
    }

    if (!user) {
      logInfo('Forgot-password requested for unknown email', { ...meta, email })
    }

    return ok({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' })
  } catch (error) {
    logError('Forgot-password route failed', error, meta)
    return serverError()
  }
}
