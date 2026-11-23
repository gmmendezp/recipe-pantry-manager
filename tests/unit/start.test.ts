import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  config: undefined as
    | {
        requestMiddleware: Array<unknown>;
      }
    | undefined,
  csrfOptions: undefined as
    | {
        filter: (context: { handlerType: string }) => boolean;
      }
    | undefined,
  setResponseHeaders: vi.fn(),
}));

vi.mock('@tanstack/react-start', () => ({
  createCsrfMiddleware: vi.fn(
    (options: { filter: (context: { handlerType: string }) => boolean }) => {
      mocks.csrfOptions = options;
      return { type: 'csrf' };
    },
  ),
  createMiddleware: () => ({
    server: (handler: unknown) => handler,
  }),
  createStart: (createConfig: () => { requestMiddleware: Array<unknown> }) => {
    mocks.config = createConfig();
    return mocks.config;
  },
}));

vi.mock('@tanstack/react-start/server', () => ({
  setResponseHeaders: mocks.setResponseHeaders,
}));

describe('global request middleware', () => {
  beforeEach(() => {
    mocks.setResponseHeaders.mockClear();
  });

  it('sets security headers and continues the request', async () => {
    await import('#/start');
    const middleware = mocks.config?.requestMiddleware[0] as (context: {
      next: () => Promise<string>;
    }) => Promise<string>;

    await expect(middleware({ next: async () => 'response' })).resolves.toBe(
      'response',
    );

    const headers = mocks.setResponseHeaders.mock.calls[0]?.[0] as Headers;
    expect(headers.get('content-security-policy')).toBe(
      "base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
    );
    expect(headers.get('content-security-policy-report-only')).toContain(
      "default-src 'self'",
    );
    expect(headers.get('permissions-policy')).toBe(
      'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
    );
    expect(headers.get('referrer-policy')).toBe(
      'strict-origin-when-cross-origin',
    );
    expect(headers.get('strict-transport-security')).toBe('max-age=31536000');
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('x-frame-options')).toBe('DENY');
  });

  it('retains CSRF checks for server functions only', async () => {
    await import('#/start');

    expect(mocks.config?.requestMiddleware).toHaveLength(2);
    expect(mocks.csrfOptions?.filter({ handlerType: 'serverFn' })).toBe(true);
    expect(mocks.csrfOptions?.filter({ handlerType: 'ssr' })).toBe(false);
  });
});
