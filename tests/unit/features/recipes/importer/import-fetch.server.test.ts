import { beforeEach, describe, expect, it, vi } from 'vitest';

const { lookup } = vi.hoisted(() => ({ lookup: vi.fn() }));

vi.mock('node:dns/promises', () => ({ lookup }));

import {
  fetchRecipeHtml,
  validateImportUrl,
} from '#/features/recipes/importer/import-fetch.server';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  lookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
  fetchMock.mockResolvedValue(
    new Response('<html></html>', {
      headers: { 'content-type': 'text/html' },
      status: 200,
    }),
  );
});

describe('validateImportUrl', () => {
  it('allows normal http and https URLs', () => {
    expect(validateImportUrl('https://example.com/recipe').toString()).toBe(
      'https://example.com/recipe',
    );
    expect(validateImportUrl('http://example.com/recipe').toString()).toBe(
      'http://example.com/recipe',
    );
  });

  it('rejects invalid URLs', () => {
    expect(() => validateImportUrl('not a url')).toThrow(
      'Enter a valid recipe URL.',
    );
  });

  it('rejects non-http protocols', () => {
    expect(() => validateImportUrl('file:///etc/passwd')).toThrow(
      'Recipe imports only support http and https URLs.',
    );
  });

  it('rejects localhost URLs', () => {
    expect(() => validateImportUrl('http://localhost:3000')).toThrow(
      'Recipe imports cannot fetch local or IP address URLs.',
    );
    expect(() => validateImportUrl('http://api.localhost:3000')).toThrow(
      'Recipe imports cannot fetch local or IP address URLs.',
    );
  });

  it('rejects IP address URLs', () => {
    expect(() => validateImportUrl('http://127.0.0.1')).toThrow(
      'Recipe imports cannot fetch local or IP address URLs.',
    );
    expect(() => validateImportUrl('http://[::1]')).toThrow(
      'Recipe imports cannot fetch local or IP address URLs.',
    );
  });
});

describe('fetchRecipeHtml', () => {
  it('allows a hostname when every resolved address is public', async () => {
    lookup.mockResolvedValue([
      { address: '93.184.216.34', family: 4 },
      { address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 },
    ]);

    await expect(
      fetchRecipeHtml(new URL('https://example.com/recipe')),
    ).resolves.toBe('<html></html>');

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    ['private IPv4', '10.0.0.1', 4],
    ['carrier-grade NAT', '100.100.100.200', 4],
    ['loopback IPv4', '127.0.0.1', 4],
    ['cloud metadata IPv4', '169.254.169.254', 4],
    ['private IPv4-mapped IPv6', '::ffff:192.168.1.1', 6],
    ['loopback IPv6', '::1', 6],
    ['unique-local IPv6', 'fd00:ec2::254', 6],
    ['link-local IPv6', 'fe80::1', 6],
  ])('rejects %s addresses before fetching', async (_, address, family) => {
    lookup.mockResolvedValue([{ address, family }]);

    await expect(
      fetchRecipeHtml(new URL('https://example.com/recipe')),
    ).rejects.toThrow(
      'Recipe imports cannot fetch private or reserved network addresses.',
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a hostname if any resolved address is private', async () => {
    lookup.mockResolvedValue([
      { address: '93.184.216.34', family: 4 },
      { address: '192.168.1.1', family: 4 },
    ]);

    await expect(
      fetchRecipeHtml(new URL('https://example.com/recipe')),
    ).rejects.toThrow(
      'Recipe imports cannot fetch private or reserved network addresses.',
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('resolves and validates the destination of every redirect', async () => {
    lookup.mockImplementation(async (hostname: string) => [
      hostname === 'example.com'
        ? { address: '93.184.216.34', family: 4 }
        : { address: '127.0.0.1', family: 4 },
    ]);
    fetchMock.mockResolvedValueOnce(
      new Response(null, {
        headers: { location: 'http://internal.example/recipe' },
        status: 302,
      }),
    );

    await expect(
      fetchRecipeHtml(new URL('https://example.com/recipe')),
    ).rejects.toThrow(
      'Recipe imports cannot fetch private or reserved network addresses.',
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(lookup).toHaveBeenCalledTimes(2);
  });

  it('does not fetch when DNS resolution fails', async () => {
    lookup.mockRejectedValue(new Error('DNS lookup failed'));

    await expect(
      fetchRecipeHtml(new URL('https://example.com/recipe')),
    ).rejects.toThrow('Unable to resolve this recipe URL.');

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
