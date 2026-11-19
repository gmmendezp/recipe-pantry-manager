import { describe, expect, it } from 'vitest';

import {
  extractJsonLdValues,
  findRecipeObject,
} from '#/features/recipes/importer/json-ld-recipe';

describe('extractJsonLdValues', () => {
  it('extracts JSON-LD script values', () => {
    const values = extractJsonLdValues(`
      <html>
        <script type="application/ld+json">{"@type":"Recipe","name":"Soup"}</script>
      </html>
    `);

    expect(values).toEqual([{ '@type': 'Recipe', name: 'Soup' }]);
  });

  it('extracts JSON-LD with an unquoted type attribute', () => {
    const values = extractJsonLdValues(`
      <script type=application/ld+json class=schema-data>{"@type":"Recipe","name":"Example Recipe"}</script>
    `);

    expect(values).toEqual([{ '@type': 'Recipe', name: 'Example Recipe' }]);
  });

  it('parses entity-encoded JSON-LD when raw JSON fails', () => {
    const values = extractJsonLdValues(`
      <script type="application/ld+json">{&quot;@type&quot;:&quot;Recipe&quot;,&quot;name&quot;:&quot;Soup&quot;}</script>
    `);

    expect(values).toEqual([{ '@type': 'Recipe', name: 'Soup' }]);
  });

  it('ignores invalid JSON-LD scripts', () => {
    const values = extractJsonLdValues(`
      <script type="application/ld+json">not json</script>
      <script type="application/ld+json">{"@type":"Recipe","name":"Soup"}</script>
    `);

    expect(values).toEqual([{ '@type': 'Recipe', name: 'Soup' }]);
  });
});

describe('findRecipeObject', () => {
  it('finds a direct Recipe object', () => {
    expect(findRecipeObject([{ '@type': 'Recipe', name: 'Soup' }])).toEqual({
      '@type': 'Recipe',
      name: 'Soup',
    });
  });

  it('finds a Recipe object with type array', () => {
    expect(
      findRecipeObject([{ '@type': ['Thing', 'Recipe'], name: 'Soup' }]),
    ).toEqual({ '@type': ['Thing', 'Recipe'], name: 'Soup' });
  });

  it('finds a Recipe object inside @graph', () => {
    expect(
      findRecipeObject([
        {
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'WebPage' },
            { '@type': 'Recipe', name: 'Soup' },
          ],
        },
      ]),
    ).toEqual({ '@type': 'Recipe', name: 'Soup' });
  });

  it('returns null when no Recipe object exists', () => {
    expect(findRecipeObject([{ '@type': 'WebPage', name: 'Page' }])).toBeNull();
  });
});
