export const origin = 'https://handbook.grasdouble.fr';
export const languages = ['fr', 'en'];

export function publicPaths(library) {
  return languages.flatMap((lang) => [
    `/${lang}/`,
    `/${lang}/guides/`,
    ...library.categories.flatMap(({ catalogs }) =>
      catalogs.flatMap(({ id, guides }) => [
        `/${lang}/${id}/`,
        ...guides.map((guide) => `/${lang}/${id}/${guide.id}/`),
      ]),
    ),
  ]);
}
