import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRequestMeta, logError, logInfo } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const startedAt = Date.now()
  const meta = getRequestMeta(req)

  try {
    await prisma.$queryRaw`SELECT 1`

    const durationMs = Date.now() - startedAt
    logInfo('Health check passed', { ...meta, durationMs })

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        checks: {
          database: 'up',
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'x-request-id': meta.requestId,
        },
      }
    )
  } catch (error) {
    const durationMs = Date.now() - startedAt
    logError('Health check failed', error, { ...meta, durationMs })

    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        checks: {
          database: 'down',
        },
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'x-request-id': meta.requestId,
        },
      }
    )
  }
}
