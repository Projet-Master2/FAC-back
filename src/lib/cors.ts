import { NextResponse } from 'next/server'

const ORIGIN  = process.env.CORS_ORIGIN ?? 'http://localhost:5173'
const METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
const HEADERS = 'Content-Type, Authorization'

/** Handler OPTIONS à ré-exporter dans chaque route : export { OPTIONS } from '@/lib/cors' */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  ORIGIN,
      'Access-Control-Allow-Methods': METHODS,
      'Access-Control-Allow-Headers': HEADERS,
      'Access-Control-Max-Age':       '86400',
    },
  })
}
