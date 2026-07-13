import { NextResponse } from 'next/server'

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data }, { status })

export const created = <T>(data: T) =>
  NextResponse.json({ success: true, data }, { status: 201 })

export const noContent = () =>
  new NextResponse(null, { status: 204 })

export const badRequest = (message: string) =>
  NextResponse.json({ success: false, error: message }, { status: 400 })

export const unauthorized = (message = 'Non autorisé') =>
  NextResponse.json({ success: false, error: message }, { status: 401 })

export const forbidden = (message = 'Accès refusé') =>
  NextResponse.json({ success: false, error: message }, { status: 403 })

export const notFound = (message = 'Ressource introuvable') =>
  NextResponse.json({ success: false, error: message }, { status: 404 })

export const conflict = (message: string) =>
  NextResponse.json({ success: false, error: message }, { status: 409 })

export const serverError = (message = 'Erreur serveur') =>
  NextResponse.json({ success: false, error: message }, { status: 500 })
