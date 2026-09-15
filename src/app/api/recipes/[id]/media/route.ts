import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { created, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'
import { MediaType } from '@/generated/prisma/client'

const schema = z.object({
  url:   z.string().url('URL invalide'),
  type:  z.nativeEnum(MediaType),
  order: z.number().int().min(0).optional(),
})

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

    // TODO: intégration CDN — l'URL doit pointer vers un fichier déjà uploadé sur le CDN
    const media = await prisma.recipeMedia.create({ data: { recipeId: id, ...parsed.data } })
    return created(media)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
