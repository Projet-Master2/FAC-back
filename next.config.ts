import type { NextConfig } from "next";

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

const nextConfig: NextConfig = {
  async headers() {
    return [
      // CORS pour les routes API
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin',      value: CORS_ORIGIN },
          { key: 'Access-Control-Allow-Methods',     value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers',     value: 'Authorization, Content-Type' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
      // Headers de sécurité pour toutes les routes
      {
        source: '/:path*',
        headers: [
          // Content Security Policy strict
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'none'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval requis par Next.js en dev
              "connect-src 'self'",
              "img-src 'self' data: blob:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Empêcher l'affichage en iframe
          { key: 'X-Frame-Options', value: 'DENY' },
          // Empêcher le sniffing MIME
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Protection XSS (legacy, mais encore utile)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Politique de referrer
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions API restrictives
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig;
