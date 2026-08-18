import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, badRequest, unauthorized, conflict, serverError } from '@/lib/response'
export { OPTIONS } from '@/lib/cors'


const schema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  slug: z.string().min(2, 'Slug trop court').regex(/^[a-z0-9-]+$/, 'Slug invalide (minuscules, chiffres, tirets)'),
})

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
    return ok(tags)
  } catch {
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const existing = await prisma.tag.findFirst({
      where: { OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }] },
    })
    if (existing) return conflict('Ce tag existe dÃ©jÃ ')

    const tag = await prisma.tag.create({ data: parsed.data })
    return created(tag)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
