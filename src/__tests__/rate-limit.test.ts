import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user:         { findUnique: vi.fn() },
    refreshToken: { create: vi.fn() },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn().mockResolvedValue(false), // Par défaut, pas de match
  },
}))

vi.mock('@/lib/jwt', () => ({
  signAccessToken:    vi.fn().mockReturnValue('mock_access_token'),
  signRefreshToken:   vi.fn().mockReturnValue('mock_refresh_token'),
  refreshTokenExpiry: vi.fn().mockReturnValue(new Date('2099-01-01')),
}))

// ─── Imports ──────────────────────────────────────────────────────────────────

import { POST as loginPOST } from '@/app/api/auth/login/route'

function makeLoginRequest(body: object, ip: string = '127.0.0.1') {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow up to 5 requests within 1 minute', async () => {
    const payload = { email: 'test@example.com', password: 'password123' }
    
    // Les 5 premières requêtes doivent passer (même si elles échouent pour d'autres raisons)
    for (let i = 0; i < 5; i++) {
      const req = makeLoginRequest(payload, '192.168.1.100')
      const res = await loginPOST(req)
      // Le rate limit ne devrait pas bloquer (status !== 429)
      expect(res.status).not.toBe(429)
    }
  })

  it('should block the 6th request with 429 Too Many Requests', async () => {
    const payload = { email: 'test@example.com', password: 'password123' }
    const ip = '192.168.1.101'
    
    // 5 premières requêtes OK
    for (let i = 0; i < 5; i++) {
      const req = makeLoginRequest(payload, ip)
      await loginPOST(req)
    }
    
    // 6ème requête doit être bloquée
    const req = makeLoginRequest(payload, ip)
    const res = await loginPOST(req)
    
    expect(res.status).toBe(429)
    
    const data = await res.json()
    expect(data.error).toContain('Trop de requêtes')
    
    // Vérifier les headers de rate limit
    expect(res.headers.get('Retry-After')).toBeTruthy()
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  it('should track rate limits separately per IP address', async () => {
    const payload = { email: 'test@example.com', password: 'password123' }
    
    // IP 1: faire 5 requêtes
    for (let i = 0; i < 5; i++) {
      const req = makeLoginRequest(payload, '192.168.1.102')
      await loginPOST(req)
    }
    
    // IP 2: devrait pouvoir faire 5 requêtes aussi
    for (let i = 0; i < 5; i++) {
      const req = makeLoginRequest(payload, '192.168.1.103')
      const res = await loginPOST(req)
      expect(res.status).not.toBe(429)
    }
    
    // IP 1: 6ème requête bloquée
    const req1 = makeLoginRequest(payload, '192.168.1.102')
    const res1 = await loginPOST(req1)
    expect(res1.status).toBe(429)
    
    // IP 2: 6ème requête bloquée aussi
    const req2 = makeLoginRequest(payload, '192.168.1.103')
    const res2 = await loginPOST(req2)
    expect(res2.status).toBe(429)
  })
})
