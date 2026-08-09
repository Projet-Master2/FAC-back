import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ok, badRequest, serverError } from '@/lib/response'
export { OPTIONS } from '@/lib/cors'


const schema = z.object({ refreshToken: z.string() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest('Refresh token requis')

    await prisma.refreshToken.deleteMany({
      where: { token: parsed.data.refreshToken },
    })

    return ok({ message: 'DÃ©connectÃ© avec succÃ¨s' })
  } catch {
    return serverError()
  }
}
