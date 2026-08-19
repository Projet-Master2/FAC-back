import { withSentryConfig } from '@sentry/nextjs';
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "gleadns-inc",

  project: "fac-back",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
