import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count:     number
  resetTime: number
}

// Store en mémoire (simple pour MVP/dev — utiliser Redis en production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Nettoyer les entrées expirées toutes les minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60_000)

interface RateLimitOptions {
  maxRequests: number  // Nombre max de requêtes
  windowMs:    number  // Fenêtre de temps en millisecondes
}

/**
 * Rate limiter middleware
 * @param req NextRequest
 * @param options Configuration du rate limiter
 * @returns NextResponse avec 429 si limite dépassée, null sinon
 */
export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = { maxRequests: 5, windowMs: 60_000 }
): NextResponse | null {
  // Récupérer l'IP du client
  const ip = 
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  const key = `${ip}`
  const now = Date.now()

  // Récupérer ou créer l'entrée
  let entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    // Nouvelle fenêtre
    entry = {
      count:     1,
      resetTime: now + options.windowMs,
    }
    rateLimitStore.set(key, entry)
    return null
  }

  // Incrémenter le compteur
  entry.count++

  if (entry.count > options.maxRequests) {
    // Limite dépassée
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans quelques instants.' },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': options.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
        },
      }
    )
  }

  return null
}
