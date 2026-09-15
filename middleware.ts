import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logInfo } from '@/lib/logger'

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age':       '86400',
}

export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()

  // Preflight OPTIONS → réponse immédiate avec les headers CORS
  if (request.method === 'OPTIONS') {
    const preflight = new NextResponse(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        'x-request-id': requestId,
      },
    })

    logInfo('HTTP preflight', {
      method: request.method,
      path: request.nextUrl.pathname,
      requestId,
    })

    return preflight
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)

  // Toutes les autres requêtes → on laisse passer en ajoutant les headers CORS
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  Object.entries(CORS_HEADERS).forEach(([key, value]) =>
    response.headers.set(key, value)
  )
  response.headers.set('x-request-id', requestId)

  logInfo('HTTP request', {
    method: request.method,
    path: request.nextUrl.pathname,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown',
    requestId,
  })

  return response
}

export const config = {
  matcher: ['/api/:path*', '/health'],
}
