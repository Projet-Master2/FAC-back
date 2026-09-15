import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { processImage, AVATAR_OPTIONS } from '@/lib/image'
import { ok, badRequest, unauthorized, forbidden, serverError } from '@/lib/response'
export { OPTIONS } from '@/lib/cors'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(req)
    const { id }  = await params
    if (session.userId !== id) return forbidden()

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return badRequest('Fichier requis')

    const { dataUrl, sizeKb } = await processImage(file, AVATAR_OPTIONS)

    const user = await prisma.user.update({
      where: { id },
      data:  { avatar: dataUrl },
      select: { id: true, email: true, name: true, pseudo: true, avatar: true, bio: true },
    })

    console.log(`[avatar] user ${id} — ${sizeKb} Ko (WebP 400×400)`)
    return ok(user)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    if (e instanceof Error && (e.message.includes('volumineux') || e.message.includes('image'))) {
      return badRequest(e.message)
    }
    return serverError()
  }
}
