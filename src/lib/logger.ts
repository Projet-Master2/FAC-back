import { NextRequest } from 'next/server'

type LogLevel = 'info' | 'warn' | 'error'

type LogMeta = Record<string, unknown>

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return { message: String(error) }
}

function write(level: LogLevel, message: string, meta: LogMeta = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  }

  const line = JSON.stringify(payload)

  if (level === 'error') {
    console.error(line)
    return
  }

  if (level === 'warn') {
    console.warn(line)
    return
  }

  console.log(line)
}

export function getRequestMeta(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = (forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown')

  return {
    method: req.method,
    path: req.nextUrl.pathname,
    ip,
    userAgent: req.headers.get('user-agent') || 'unknown',
    requestId: req.headers.get('x-request-id') || 'unknown',
  }
}

export function logInfo(message: string, meta: LogMeta = {}) {
  write('info', message, meta)
}

export function logWarn(message: string, meta: LogMeta = {}) {
  write('warn', message, meta)
}

export function logError(message: string, error: unknown, meta: LogMeta = {}) {
  write('error', message, { ...meta, error: serializeError(error) })
}
