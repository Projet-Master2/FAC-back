import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ok, badRequest, unauthorized, serverError } from '@/lib/response'
export { OPTIONS } from '@/lib/cors'


const schema = z.object({
  token:    z.string(),
  password: z.string().min(8, 'Mot de passe : 8 caractÃ¨res minimum'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const { token, password } = parsed.data

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return unauthorized('Token invalide ou expirÃ©')
    }

    const hashed = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
      // Invalide tous les refresh tokens existants
      prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } }),
    ])

    return ok({ message: 'Mot de passe rÃ©initialisÃ© avec succÃ¨s' })
  } catch {
    return serverError()
  }
}
