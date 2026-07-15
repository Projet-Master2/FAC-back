import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { processImage, RECIPE_OPTIONS } from '@/lib/image'
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from '@/lib/response'
export { OPTIONS } from '@/lib/cors'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id }  = await params

    const recipe = await prisma.recipe.findUnique({ where: { id }, select: { authorId: true } })
    if (!recipe) return notFound('Recette introuvable')
    if (recipe.authorId !== session.userId) return forbidden()

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return badRequest('Fichier requis')

    const { dataUrl, sizeKb } = await processImage(file, RECIPE_OPTIONS)

    // Upsert : une seule image par recette (order = 0)
    const existing = await prisma.recipeMedia.findFirst({
      where: { recipeId: id, order: 0 },
    })

    const media = existing
      ? await prisma.recipeMedia.update({
          where: { id: existing.id },
          data:  { url: dataUrl, type: 'IMAGE' },
        })
      : await prisma.recipeMedia.create({
          data: { url: dataUrl, type: 'IMAGE', order: 0, recipeId: id },
        })

    console.log(`[image] recipe ${id} — ${sizeKb} Ko (WebP 1200×800)`)
    return ok(media)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    if (e instanceof Error && (e.message.includes('volumineux') || e.message.includes('image'))) {
      return badRequest(e.message)
    }
    return serverError()
  }
}
