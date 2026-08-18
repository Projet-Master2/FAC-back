import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

import { GET as healthGET } from '@/app/health/route'
import { prisma } from '@/lib/prisma'

describe('GET /health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne 200 et status ok quand la base est joignable', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }] as never)

    const req = new NextRequest('http://localhost:3000/health')
    const res = await healthGET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.checks.database).toBe('up')
  })

  it('retourne 503 et status degraded quand la base est indisponible', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('DB unavailable'))

    const req = new NextRequest('http://localhost:3000/health')
    const res = await healthGET(req)
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.status).toBe('degraded')
    expect(body.checks.database).toBe('down')
  })
})
