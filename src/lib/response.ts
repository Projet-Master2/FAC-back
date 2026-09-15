import { NextResponse } from 'next/server'

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

function withCors(res: NextResponse): NextResponse {
  res.headers.set('Access-Control-Allow-Origin', CORS_ORIGIN)
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}

export const ok = <T>(data: T, status = 200) =>
  withCors(NextResponse.json({ success: true, data }, { status }))

export const created = <T>(data: T) =>
  withCors(NextResponse.json({ success: true, data }, { status: 201 }))

export const noContent = () =>
  withCors(new NextResponse(null, { status: 204 }))

export const badRequest = (message: string) =>
  withCors(NextResponse.json({ success: false, error: message }, { status: 400 }))

export const unauthorized = (message = 'Non autorisé') =>
  withCors(NextResponse.json({ success: false, error: message }, { status: 401 }))

export const forbidden = (message = 'Accès refusé') =>
  withCors(NextResponse.json({ success: false, error: message }, { status: 403 }))

export const notFound = (message = 'Ressource introuvable') =>
  withCors(NextResponse.json({ success: false, error: message }, { status: 404 }))

export const conflict = (message: string) =>
  withCors(NextResponse.json({ success: false, error: message }, { status: 409 }))

export const serverError = (message = 'Erreur serveur') =>
  withCors(NextResponse.json({ success: false, error: message }, { status: 500 }))

