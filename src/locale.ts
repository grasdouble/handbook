import { notFound } from '@tanstack/react-router';
import { origin } from '../site.mjs';
import type { Language } from './library';

export const languagePreferenceKey = 'handbook-language';

export function isLanguage(value: string | null | undefined): value is Language {
  return value === 'fr' || value === 'en';
}

export function requireLanguage(value: string): Language {
  if (!isLanguage(value)) throw notFound();
  return value;
}

export function preferredLanguage(saved: string | null, languages: readonly string[]): Language {
  if (isLanguage(saved)) return saved;
  for (const locale of languages) {
    const primary = locale.toLowerCase().split('-')[0];
    if (isLanguage(primary)) return primary;
  }
  return 'fr';
}

export function readLanguagePreference(): string | null {
  try {
    return window.localStorage.getItem(languagePreferenceKey);
  } catch {
    return null;
  }
}

export function saveLanguagePreference(language: Language) {
  try {
    window.localStorage.setItem(languagePreferenceKey, language);
  } catch {
    // Locale links still work when browser storage is disabled.
  }
}

export function translationLinks(language: Language, suffix: string) {
  const localized = (lang: Language) => origin + '/' + lang + '/' + suffix;
  return [
    { rel: 'canonical', href: localized(language) },
    { rel: 'alternate', hrefLang: 'fr', href: localized('fr') },
    { rel: 'alternate', hrefLang: 'en', href: localized('en') },
  ];
}

export function pageHead(language: Language, suffix: string, title: string, description: string) {
  return {
    meta: [{ title: title + ' | Handbook' }, { name: 'description', content: description }],
    links: translationLinks(language, suffix),
  };
}
