import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start';
import { setResponseHeaders } from '@tanstack/react-start/server';

const securityHeadersMiddleware = createMiddleware().server(
  async ({ next }) => {
    setResponseHeaders(
      new Headers({
        'Content-Security-Policy':
          "base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
        'Content-Security-Policy-Report-Only':
          "default-src 'self'; base-uri 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' blob: data: https:; manifest-src 'self'; media-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; worker-src 'self' blob:",
        'Permissions-Policy':
          'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      }),
    );

    return next();
  },
);

export const startInstance = createStart(() => ({
  requestMiddleware: [
    securityHeadersMiddleware,
    createCsrfMiddleware({
      filter: (context) => context.handlerType === 'serverFn',
    }),
  ],
}));
