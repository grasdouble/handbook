import type { Category, Difficulty, Language } from './library';

export const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

export type Filters = {
  q: string;
  tags: string[];
  difficulty: Difficulty[];
};

function stringValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string'))]
    : [];
}

export function normalizeFilters(search: Record<string, unknown>): Filters {
  return {
    q: typeof search.q === 'string' ? search.q : '',
    tags: stringValues(search.tags),
    difficulty: stringValues(search.difficulty).filter((item): item is Difficulty =>
      difficulties.some((level) => level === item),
    ),
  };
}

export function filterGuides(
  categories: readonly Category[],
  language: Language,
  filters: Filters,
) {
  const query = filters.q.trim().toLocaleLowerCase(language);
  return categories.flatMap((category) =>
    category.catalogs.flatMap((catalog) =>
      catalog.guides
        .filter(
          (guide) =>
            (query === '' || guide.title[language].toLocaleLowerCase(language).includes(query)) &&
            filters.tags.every((tag) => guide.tags.includes(tag)) &&
            (filters.difficulty.length === 0 || filters.difficulty.includes(guide.difficulty)),
        )
        .map((guide) => ({ category, catalog, guide })),
    ),
  );
}
