import { localizedBase, origin } from '../site.mjs';
import type { Language } from './library';

export function translationLinks(language: Language, suffix: string) {
  const localized = (lang: Language) => origin + localizedBase(lang) + suffix;
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
