import { describe, expect, it } from 'vitest';
import { translationLinks } from '../locale';

describe('localized page metadata', () => {
  it('gives both translations their own canonical URL', () => {
    expect(translationLinks('en', 'prompts/first/')).toEqual([
      { rel: 'canonical', href: 'https://handbook.grasdouble.fr/en/prompts/first/' },
      {
        rel: 'alternate',
        hrefLang: 'fr',
        href: 'https://handbook.grasdouble.fr/prompts/first/',
      },
      {
        rel: 'alternate',
        hrefLang: 'en',
        href: 'https://handbook.grasdouble.fr/en/prompts/first/',
      },
    ]);
  });

  it('uses the site root for the French homepage', () => {
    expect(translationLinks('fr', '')[0]).toEqual({
      rel: 'canonical',
      href: 'https://handbook.grasdouble.fr/',
    });
  });
});
