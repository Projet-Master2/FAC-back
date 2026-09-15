import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Mocks (hoistés avant les imports par Vitest) ─────────────────────────────

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user:         { findUnique: vi.fn(), create: vi.fn() },
    refreshToken: { create: vi.fn(), deleteMany: vi.fn() },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash:    vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}))

vi.mock('@/lib/jwt', () => ({
  signAccessToken:    vi.fn().mockReturnValue('mock_access_token'),
  signRefreshToken:   vi.fn().mockReturnValue('mock_refresh_token'),
  refreshTokenExpiry: vi.fn().mockReturnValue(new Date('2099-01-01')),
  verifyAccessToken:  vi.fn(),
}))

// Mock du rate limiter pour ne pas bloquer les tests
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockReturnValue(null), // Pas de limitation dans les tests
}))

// ─── Imports après les mocks ──────────────────────────────────────────────────

import { POST as registerPOST } from '@/app/api/auth/register/route'
import { POST as loginPOST }    from '@/app/api/auth/login/route'
import { GET  as meGET }        from '@/app/api/auth/me/route'
import { prisma }               from '@/lib/prisma'
import { verifyAccessToken }    from '@/lib/jwt'
import bcrypt                   from 'bcryptjs'

// Helpers pour créer des requêtes Next.js simulées
function makeRequest(body: object, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/auth/register', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

function makeLoginRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeAuthRequest(url: string, token?: string) {
  return new NextRequest(url, {
    method:  'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

// ─── Tests Register ───────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const validPayload = {
    email:    'alice@example.com',
    name:     'Alice Martin',
    password: 'password123',
  }

  const mockUser = {
    id:        'user_001',
    email:     'alice@example.com',
    name:      'Alice Martin',
    pseudo:    null,
    createdAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never)
  })

  it('crée un compte avec des données valides → 201', async () => {
    const req = makeRequest(validPayload)
    const res = await registerPOST(req)
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.user.email).toBe('alice@example.com')
    expect(body.data.accessToken).toBe('mock_access_token')
    expect(body.data.refreshToken).toBe('mock_refresh_token')
    // Le mot de passe ne doit JAMAIS apparaître dans la réponse
    expect(body.data.user.password).toBeUndefined()
  })

  it('refuse si email déjà utilisé → 409', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

    const req = makeRequest(validPayload)
    const res = await registerPOST(req)
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/email/i)
  })

  it('refuse si email invalide → 400', async () => {
    const req = makeRequest({ ...validPayload, email: 'pas_un_email' })
    const res = await registerPOST(req)

    expect(res.status).toBe(400)
    expect((await res.json()).success).toBe(false)
  })

  it('refuse si mot de passe trop court (< 8 chars) → 400', async () => {
    const req = makeRequest({ ...validPayload, password: 'court' })
    const res = await registerPOST(req)

    expect(res.status).toBe(400)
    expect((await res.json()).success).toBe(false)
  })

  it('refuse si nom manquant → 400', async () => {
    const { name, ...noName } = validPayload
    void name
    const req = makeRequest(noName)
    const res = await registerPOST(req)

    expect(res.status).toBe(400)
    expect((await res.json()).success).toBe(false)
  })

  it('hache le mot de passe avant de le stocker', async () => {
    const req = makeRequest(validPayload)
    await registerPOST(req)

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
  })
})

// ─── Tests Login ──────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  const mockUser = {
    id:       'user_001',
    email:    'alice@example.com',
    name:     'Alice Martin',
    pseudo:   null,
    avatar:   null,
    password: 'hashed_password',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never)
  })

  it('connecte avec identifiants corrects → 200 + tokens', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    const req = makeLoginRequest({ email: 'alice@example.com', password: 'password123' })
    const res = await loginPOST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.accessToken).toBe('mock_access_token')
    expect(body.data.user.email).toBe('alice@example.com')
  })

  it('refuse si email inconnu → 401', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const req = makeLoginRequest({ email: 'inconnu@example.com', password: 'password123' })
    const res = await loginPOST(req)

    expect(res.status).toBe(401)
    expect((await res.json()).success).toBe(false)
  })

  it('refuse si mot de passe incorrect → 401', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

    const req = makeLoginRequest({ email: 'alice@example.com', password: 'mauvais' })
    const res = await loginPOST(req)

    expect(res.status).toBe(401)
  })

  it('refuse si corps vide → 400', async () => {
    const req = makeLoginRequest({})
    const res = await loginPOST(req)

    expect(res.status).toBe(400)
  })

  it("ne révèle pas si l'email existe ou non (même message d'erreur)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const res1 = await loginPOST(makeLoginRequest({ email: 'inconnu@test.com', password: 'pwd' }))

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
    const res2 = await loginPOST(makeLoginRequest({ email: 'alice@example.com', password: 'mauvais' }))

    const body1 = await res1.json()
    const body2 = await res2.json()

    // Les deux erreurs doivent avoir le même message (pas de fuite d'info)
    expect(body1.error).toBe(body2.error)
  })
})

// ─── Tests GET /api/auth/me ───────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  const mockUser = {
    id:        'user_001',
    email:     'alice@example.com',
    name:      'Alice Martin',
    pseudo:    null,
    avatar:    null,
    bio:       null,
    createdAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne le profil avec un token valide → 200', async () => {
    vi.mocked(verifyAccessToken).mockReturnValue({ userId: 'user_001', email: 'alice@example.com' })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

    const req = makeAuthRequest('http://localhost:3000/api/auth/me', 'valid_token')
    const res = await meGET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.email).toBe('alice@example.com')
    expect(body.data.password).toBeUndefined()
  })

  it('refuse sans token → 401', async () => {
    const req = makeAuthRequest('http://localhost:3000/api/auth/me')
    const res = await meGET(req)

    expect(res.status).toBe(401)
  })

  it('refuse avec token invalide → 401', async () => {
    vi.mocked(verifyAccessToken).mockImplementation(() => {
      throw new Error('invalid token')
    })

    const req = makeAuthRequest('http://localhost:3000/api/auth/me', 'token_invalide')
    const res = await meGET(req)

    expect(res.status).toBe(401)
  })
})
