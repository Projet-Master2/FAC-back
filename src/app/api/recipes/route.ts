import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, created, badRequest, unauthorized, serverError } from '@/lib/response'
import { Difficulty } from '@/generated/prisma/client'
export { OPTIONS } from '@/lib/cors'


const MAX_LIMIT = 50

const createSchema = z.object({
  title:         z.string().min(3, 'Titre trop court'),
  description:   z.string().min(10, 'Description trop courte'),
  difficulty:    z.nativeEnum(Difficulty).optional(),
  prepTime:      z.number().int().positive(),
  cookTime:      z.number().int().min(0),
  servings:      z.number().int().positive().optional(),
  estimatedCost: z.number().positive().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const q         = searchParams.get('q') ?? ''
    const difficulty = searchParams.get('difficulty') as Difficulty | null
    const minTime   = Number(searchParams.get('minTime') ?? 0)
    const maxTime   = Number(searchParams.get('maxTime') ?? 9999)
    const maxCost   = Number(searchParams.get('maxCost') ?? 9999)
    const tags      = searchParams.get('tags')?.split(',').filter(Boolean) ?? []
    const sort      = searchParams.get('sort') ?? 'recent'
    const page      = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit     = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get('limit') ?? 12)))

    const where = {
      published: true,
      ...(q && {
        OR: [
          { title:       { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
          // Recherche dans les noms d'ingredients
          { ingredients: { some: { ingredient: { name: { contains: q, mode: 'insensitive' as const } } } } },
        ],
      }),
      ...(difficulty && { difficulty }),
      ...(maxCost < 9999 && { estimatedCost: { lte: maxCost } }),
      ...(tags.length > 0 && { tags: { some: { tag: { slug: { in: tags } } } } }),
    }

    const orderBy =
      sort === 'quickest' ? [{ prepTime: 'asc' as const }, { cookTime: 'asc' as const }] :
      sort === 'cheapest' ? [{ estimatedCost: 'asc' as const }] :
      sort === 'rating'   ? [{ ratings: { _count: 'desc' as const } }] :
      [{ createdAt: 'desc' as const }]

    const [total, recipes] = await prisma.$transaction([
      prisma.recipe.count({ where }),
      prisma.recipe.findMany({
        where,
        orderBy,
        skip:  (page - 1) * limit,
        take:  limit,
        select: {
          id: true, title: true, description: true, difficulty: true,
          prepTime: true, cookTime: true, servings: true, estimatedCost: true, createdAt: true,
          author: { select: { id: true, name: true, pseudo: true, avatar: true } },
          tags:   { select: { tag: { select: { id: true, name: true, slug: true } } } },
          media:  { where: { order: 0 }, take: 1, select: { url: true, type: true } },
          reactions: { select: { type: true } },
          _count: { select: { ratings: true, comments: true, favorites: true } },
        },
      }),
    ])

    return ok({ recipes, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch {
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireAuth(req)
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0].message)

    const recipe = await prisma.recipe.create({
      data: { ...parsed.data, authorId: session.userId },
      select: { id: true, title: true, difficulty: true, prepTime: true, cookTime: true, createdAt: true },
    })

    return created(recipe)
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return unauthorized()
    return serverError()
  }
}
