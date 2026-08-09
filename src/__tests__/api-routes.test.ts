import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    recipe: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn(), findMany: vi.fn() },
    favorite: { upsert: vi.fn(), deleteMany: vi.fn() },
    comment: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    reaction: { upsert: vi.fn(), deleteMany: vi.fn() },
  },
}))

import { GET as getAuthMe } from '@/app/api/auth/me/route'
import { POST as createComment } from '@/app/api/recipes/[id]/comments/route'
import { PATCH as updateComment, DELETE as deleteComment } from '@/app/api/comments/[id]/route'
import { POST as createCommentReaction, DELETE as deleteCommentReaction } from '@/app/api/comments/[id]/reactions/route'
import { DELETE as deleteCommentReactionType } from '@/app/api/comments/[id]/reactions/[type]/route'
import { GET as getRecipes, POST as createRecipe } from '@/app/api/recipes/route'
import { GET as getRecipe, PATCH as updateRecipe, DELETE as deleteRecipe } from '@/app/api/recipes/[id]/route'
import { POST as postFavorite, DELETE as deleteFavorite } from '@/app/api/recipes/[id]/favorites/route'
import { POST as postReaction } from '@/app/api/recipes/[id]/reactions/route'
import { DELETE as deleteReaction } from '@/app/api/recipes/[id]/reactions/[type]/route'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

function makeRequest(url: string, body?: object, method = 'POST') {
  return new NextRequest(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('API routes critiques', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuth).mockReturnValue({ userId: 'user_1' } as never)
  })

  it('liste les recettes avec un payload de réponse cohérent', async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (_queries: unknown[]) => [2, [{ id: 'recipe_1' }]] as never)

    const req = makeRequest('http://localhost:3000/api/recipes?q=pizza')
    const res = await getRecipes(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.total).toBe(2)
    expect(body.data.recipes[0].id).toBe('recipe_1')
  })

  it('refuse la création d\'une recette avec des données invalides', async () => {
    const req = makeRequest('http://localhost:3000/api/recipes', {
      title: 'AB',
      description: 'court',
      prepTime: 0,
      cookTime: 0,
    })
    const res = await createRecipe(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('retourne 404 si la recette demandée n\'existe pas', async () => {
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue(null)

    const req = new NextRequest('http://localhost:3000/api/recipes/unknown')
    const res = await getRecipe(req, { params: Promise.resolve({ id: 'unknown' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.success).toBe(false)
  })

  it('refuse la modification d\'une recette par un utilisateur non auteur', async () => {
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({ authorId: 'user_2' } as never)

    const req = makeRequest('http://localhost:3000/api/recipes/recipe_1', { title: 'Nouveau titre' }, 'PATCH')
    const res = await updateRecipe(req, { params: Promise.resolve({ id: 'recipe_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.success).toBe(false)
  })

  it('supprime une recette si l\'utilisateur en est l\'auteur', async () => {
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({ authorId: 'user_1' } as never)
    vi.mocked(prisma.recipe.delete).mockResolvedValue({} as never)

    const req = new NextRequest('http://localhost:3000/api/recipes/recipe_1', { method: 'DELETE' })
    const res = await deleteRecipe(req, { params: Promise.resolve({ id: 'recipe_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('bloque l\'accès à la route profil sans authentification', async () => {
    vi.mocked(requireAuth).mockImplementation(() => {
      throw new Error('UNAUTHORIZED')
    })

    const req = new NextRequest('http://localhost:3000/api/auth/me')
    const res = await getAuthMe(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it('refuse la création d\'une note avec une valeur hors limites', async () => {
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({ id: 'recipe_1' } as never)

    const req = makeRequest('http://localhost:3000/api/recipes/recipe_1/ratings', { score: 6 })
    const res = await (await import('@/app/api/recipes/[id]/ratings/route')).POST(req, { params: Promise.resolve({ id: 'recipe_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('refuse la modification d\'un commentaire par un utilisateur non auteur', async () => {
    vi.mocked(prisma.comment.findUnique).mockResolvedValue({ userId: 'user_2' } as never)

    const req = makeRequest('http://localhost:3000/api/comments/comment_1', { content: 'Nouveau contenu' }, 'PATCH')
    const res = await (await import('@/app/api/comments/[id]/route')).PATCH(req, { params: Promise.resolve({ id: 'comment_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.success).toBe(false)
  })

  it('ajoute un favori sur une recette existante', async () => {
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({ id: 'recipe_1' } as never)
    vi.mocked(prisma.favorite.upsert).mockResolvedValue({} as never)

    const req = makeRequest('http://localhost:3000/api/recipes/recipe_1/favorites')
    const res = await postFavorite(req, { params: Promise.resolve({ id: 'recipe_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(prisma.favorite.upsert).toHaveBeenCalledWith({
      where: { userId_recipeId: { userId: 'user_1', recipeId: 'recipe_1' } },
      create: { userId: 'user_1', recipeId: 'recipe_1' },
      update: {},
    })
  })

  it('retourne 404 si la recette n\'existe pas lors de l\'ajout d\'un favori', async () => {
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue(null)

    const req = makeRequest('http://localhost:3000/api/recipes/unknown/favorites')
    const res = await postFavorite(req, { params: Promise.resolve({ id: 'unknown' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.success).toBe(false)
  })

  it('retire un favori pour l\'utilisateur connecté', async () => {
    vi.mocked(prisma.favorite.deleteMany).mockResolvedValue({ count: 1 } as never)

    const req = makeRequest('http://localhost:3000/api/recipes/recipe_1/favorites', undefined, 'DELETE')
    const res = await deleteFavorite(req, { params: Promise.resolve({ id: 'recipe_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user_1', recipeId: 'recipe_1' } })
  })

  it('crée un commentaire sur une recette existante', async () => {
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({ id: 'recipe_1' } as never)
    vi.mocked(prisma.comment.create).mockResolvedValue({
      id: 'comment_1',
      content: 'Excellent',
      userId: 'user_1',
      recipeId: 'recipe_1',
    } as never)

    const req = makeRequest('http://localhost:3000/api/recipes/recipe_1/comments', { content: 'Excellent' })
    const res = await createComment(req, { params: Promise.resolve({ id: 'recipe_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.content).toBe('Excellent')
  })

  it('refuse la création d\'un commentaire trop court', async () => {
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({ id: 'recipe_1' } as never)

    const req = makeRequest('http://localhost:3000/api/recipes/recipe_1/comments', { content: 'ok' })
    const res = await createComment(req, { params: Promise.resolve({ id: 'recipe_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('supprime un commentaire si l\'utilisateur en est l\'auteur', async () => {
    vi.mocked(prisma.comment.findUnique).mockResolvedValue({ userId: 'user_1' } as never)
    vi.mocked(prisma.comment.delete).mockResolvedValue({} as never)

    const req = makeRequest('http://localhost:3000/api/comments/comment_1', undefined, 'DELETE')
    const res = await deleteComment(req, { params: Promise.resolve({ id: 'comment_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: 'comment_1' } })
  })

  it('refuse la suppression d\'un commentaire par un autre utilisateur', async () => {
    vi.mocked(prisma.comment.findUnique).mockResolvedValue({ userId: 'user_2' } as never)

    const req = makeRequest('http://localhost:3000/api/comments/comment_1', undefined, 'DELETE')
    const res = await deleteComment(req, { params: Promise.resolve({ id: 'comment_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.success).toBe(false)
  })

  it('ajoute une réaction sur un commentaire', async () => {
    vi.mocked(prisma.comment.findUnique).mockResolvedValue({ id: 'comment_1' } as never)
    vi.mocked(prisma.reaction.upsert).mockResolvedValue({ id: 'reaction_1', type: 'LIKE', userId: 'user_1', commentId: 'comment_1' } as never)

    const req = makeRequest('http://localhost:3000/api/comments/comment_1/reactions', { type: 'LIKE' })
    const res = await createCommentReaction(req, { params: Promise.resolve({ id: 'comment_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.type).toBe('LIKE')
  })

  it('supprime une réaction sur un commentaire', async () => {
    vi.mocked(prisma.reaction.deleteMany).mockResolvedValue({ count: 1 } as never)

    const req = makeRequest('http://localhost:3000/api/comments/comment_1/reactions/LIKE', undefined, 'DELETE')
    const res = await deleteCommentReactionType(req, { params: Promise.resolve({ id: 'comment_1', type: 'LIKE' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('ajoute une réaction sur une recette', async () => {
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({ id: 'recipe_1' } as never)
    vi.mocked(prisma.reaction.upsert).mockResolvedValue({ id: 'reaction_1', type: 'LIKE', userId: 'user_1', recipeId: 'recipe_1' } as never)

    const req = makeRequest('http://localhost:3000/api/recipes/recipe_1/reactions', { type: 'LIKE' })
    const res = await postReaction(req, { params: Promise.resolve({ id: 'recipe_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.type).toBe('LIKE')
  })

  it('refuse une réaction avec un type invalide', async () => {
    const req = makeRequest('http://localhost:3000/api/recipes/recipe_1/reactions', { type: 'INVALID' })
    const res = await postReaction(req, { params: Promise.resolve({ id: 'recipe_1' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('supprime une réaction existante', async () => {
    vi.mocked(prisma.reaction.deleteMany).mockResolvedValue({ count: 1 } as never)

    const req = makeRequest('http://localhost:3000/api/recipes/recipe_1/reactions/LIKE', undefined, 'DELETE')
    const res = await deleteReaction(req, { params: Promise.resolve({ id: 'recipe_1', type: 'LIKE' }) } as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(prisma.reaction.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user_1', recipeId: 'recipe_1', type: 'LIKE' } })
  })
})
