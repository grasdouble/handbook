import { describe, expect, it } from 'vitest';
import { preferredLanguage, translationLinks } from '../locale';

describe('locale selection', () => {
  it('uses explicit preference rather than the browser locales', () => {
    expect(preferredLanguage('fr', ['en-US'])).toBe('fr');
  });

  it('scans supported browser locales in order and falls back to French', () => {
    expect(preferredLanguage('invalid', ['de-DE', 'EN-us', 'fr'])).toBe('en');
    expect(preferredLanguage(null, ['ja-JP'])).toBe('fr');
  });

  it('gives both translations their own canonical URL', () => {
    expect(translationLinks('en', 'prompts/first/')).toEqual([
      { rel: 'canonical', href: 'https://handbook.grasdouble.fr/en/prompts/first/' },
      {
        rel: 'alternate',
        hrefLang: 'fr',
        href: 'https://handbook.grasdouble.fr/fr/prompts/first/',
      },
      {
        rel: 'alternate',
        hrefLang: 'en',
        href: 'https://handbook.grasdouble.fr/en/prompts/first/',
      },
    ]);
  });
});
