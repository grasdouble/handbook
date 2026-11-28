export const origin = 'https://handbook.grasdouble.fr';
const languages = ['fr', 'en'];

/** @param {'fr' | 'en'} language */
export function languageSegment(language) {
  return language === 'en' ? 'en' : undefined;
}

/** @param {'fr' | 'en'} language */
export function localizedBase(language) {
  const segment = languageSegment(language);
  return segment ? `/${segment}/` : '/';
}

export function publicPaths(library) {
  return languages.flatMap((language) => {
    const base = localizedBase(language);
    return [
      base,
      `${base}guides/`,
      ...library.categories.flatMap(({ catalogs }) =>
        catalogs.flatMap(({ id, guides }) => [
          `${base}${id}/`,
          ...guides.map((guide) => `${base}${id}/${guide.id}/`),
        ]),
      ),
    ];
  });
}
