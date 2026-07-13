import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ok, badRequest, serverError } from '@/lib/response'

const schema = z.object({ email: z.string().email('Email invalide') })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { email } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })

    // Réponse identique qu'un compte existe ou non (sécurité)
    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      })

      // TODO: envoyer l'email avec le token (intégration service email à venir)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Reset token for ${email}: ${token}`)
      }
    }

    return ok({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' })
  } catch {
    return serverError()
  }
}
