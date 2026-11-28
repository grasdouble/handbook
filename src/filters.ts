import type { Category, Difficulty } from './library';

export const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

export type Filters = {
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
    tags: stringValues(search.tags),
    difficulty: stringValues(search.difficulty).filter((item): item is Difficulty =>
      difficulties.some((level) => level === item),
    ),
  };
}

export function filterGuides(categories: readonly Category[], filters: Filters) {
  return categories.flatMap((category) =>
    category.catalogs.flatMap((catalog) =>
      catalog.guides
        .filter(
          (guide) =>
            filters.tags.every((tag) => guide.tags.includes(tag)) &&
            (filters.difficulty.length === 0 || filters.difficulty.includes(guide.difficulty)),
        )
        .map((guide) => ({ category, catalog, guide })),
    ),
  );
}
