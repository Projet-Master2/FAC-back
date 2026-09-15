import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'

const schema = z.object({ tagId: z.string().min(1, 'ID tag requis') })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id } = await params
    const recipe = await prisma.recipe.findUnique({ where: { id }, select: { authorId: true } })
    if (!recipe) return notFound('Recette introuvable')
    if (recipe.authorId !== session.userId) return forbidden()

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    await prisma.recipeTag.upsert({
      where: { recipeId_tagId: { recipeId: id, tagId: parsed.data.tagId } },
      create: { recipeId: id, tagId: parsed.data.tagId },
      update: {},
    })

    const tags = await prisma.recipeTag.findMany({ where: { recipeId: id }, include: { tag: true } })
    return ok(tags.map(t => t.tag))
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
