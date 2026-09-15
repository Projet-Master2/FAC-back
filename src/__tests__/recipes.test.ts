import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    recipe: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { GET as getRecipes } from '@/app/api/recipes/route'
import { prisma } from '@/lib/prisma'

describe('GET /api/recipes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inclut les réactions dans la réponse des recettes listées', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([
      1,
      [
        {
          id: 'recipe_1',
          title: 'Tarte',
          description: 'Une bonne tarte',
          difficulty: 'EASY',
          prepTime: 10,
          cookTime: 20,
          servings: 4,
          estimatedCost: 3,
          createdAt: new Date(),
          author: { id: 'user_1', name: 'Alice', pseudo: null, avatar: null },
          tags: [],
          media: [],
          reactions: [{ type: 'LIKE' }, { type: 'LOVE' }],
          _count: { ratings: 1, comments: 2, favorites: 3 },
        },
      ],
    ] as never)

    vi.mocked(prisma.recipe.count).mockResolvedValue(1 as never)
    vi.mocked(prisma.recipe.findMany).mockResolvedValue([
      {
        id: 'recipe_1',
        title: 'Tarte',
        description: 'Une bonne tarte',
        difficulty: 'EASY',
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        estimatedCost: 3,
        createdAt: new Date(),
        author: { id: 'user_1', name: 'Alice', pseudo: null, avatar: null },
        tags: [],
        media: [],
        reactions: [{ type: 'LIKE' }, { type: 'LOVE' }],
        _count: { ratings: 1, comments: 2, favorites: 3 },
      },
    ] as never)

    const req = new NextRequest('http://localhost:3000/api/recipes')
    const res = await getRecipes(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.recipes[0].reactions).toEqual([{ type: 'LIKE' }, { type: 'LOVE' }])
  })
})
