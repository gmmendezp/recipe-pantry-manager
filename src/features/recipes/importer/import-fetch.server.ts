import { isIP } from 'node:net';

const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 8000;

export function validateImportUrl(url: string) {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Enter a valid recipe URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Recipe imports only support http and https URLs.');
  }

  const hostname = parsed.hostname.toLowerCase();
  const ipHostname = hostname.replace(/^\[(.*)]$/, '$1');

  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    isIP(ipHostname) !== 0
  ) {
    throw new Error('Recipe imports cannot fetch local or IP address URLs.');
  }

  return parsed;
}

export async function fetchRecipeHtml(url: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let currentUrl = url;

    for (
      let redirectCount = 0;
      redirectCount <= MAX_REDIRECTS;
      redirectCount += 1
    ) {
      const response = await fetch(currentUrl, {
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'user-agent': 'RecipePantryManager/1.0',
        },
        redirect: 'manual',
        signal: controller.signal,
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');

        if (!location) {
          throw new Error('Recipe import redirect was missing a destination.');
        }

        currentUrl = validateImportUrl(
          new URL(location, currentUrl).toString(),
        );
        continue;
      }

      return readRecipeHtmlResponse(response);
    }

    throw new Error('Recipe import followed too many redirects.');
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Recipe import timed out. Try another URL.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function readRecipeHtmlResponse(response: Response) {
  if (!response.ok) {
    throw new Error('Unable to fetch this recipe page.');
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.toLowerCase().includes('html')) {
    throw new Error('This URL did not return an HTML recipe page.');
  }

  const reader = response.body?.getReader();

  if (!reader) return response.text();

  const chunks: Uint8Array[] = [];
  let received = 0;
  let readResult = await reader.read();

  while (!readResult.done) {
    const { value } = readResult;

    if (value) {
      received += value.byteLength;

      if (received > MAX_RESPONSE_BYTES) {
        throw new Error('This recipe page is too large to import.');
      }

      chunks.push(value);
    }

    readResult = await reader.read();
  }

  return new TextDecoder().decode(concatUint8Arrays(chunks, received));
}

function concatUint8Arrays(chunks: Uint8Array[], length: number) {
  const result = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return result;
}
