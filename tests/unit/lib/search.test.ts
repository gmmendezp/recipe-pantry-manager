import { describe, expect, it } from 'vitest';

import { matchesSearch, normalizeSearchText } from '#/lib/search';

describe('normalizeSearchText', () => {
  it('trims, lowercases, and collapses whitespace', () => {
    expect(normalizeSearchText('  Cherry   Tomato Soup  ')).toBe(
      'cherry tomato soup',
    );
  });

  it('returns an empty string for null or undefined values', () => {
    expect(normalizeSearchText(null)).toBe('');
    expect(normalizeSearchText(undefined)).toBe('');
  });
});

describe('matchesSearch', () => {
  it('matches every item when the query is empty', () => {
    expect(matchesSearch(['Tomato Soup'], '')).toBe(true);
    expect(matchesSearch(['Tomato Soup'], '   ')).toBe(true);
  });

  it('matches against any provided field', () => {
    expect(matchesSearch(['Dinner', 'Tomato Soup'], 'soup')).toBe(true);
  });

  it('normalizes query and field text before matching', () => {
    expect(matchesSearch(['Cherry   Tomato Soup'], ' tomato   soup ')).toBe(
      true,
    );
  });

  it('ignores null or undefined fields', () => {
    expect(matchesSearch([null, undefined, 'Pantry staples'], 'staples')).toBe(
      true,
    );
  });

  it('returns false when no field matches the query', () => {
    expect(matchesSearch(['Tomato Soup', 'Dinner'], 'breakfast')).toBe(false);
  });
});
