import { NextRequest } from 'next/server'
import { verifyAccessToken, JwtPayload } from './jwt'

/** Extrait et vérifie le JWT depuis le header Authorization. */
export function getAuthUser(req: NextRequest): JwtPayload | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  try {
    return verifyAccessToken(token)
  } catch {
    return null
  }
}

/** Retourne le payload JWT ou lance une erreur si non authentifié. */
export function requireAuth(req: NextRequest): JwtPayload {
  const user = getAuthUser(req)
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}
