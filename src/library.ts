import { notFound } from '@tanstack/react-router';
import publishedLibrary from './generated/library.json';

export { filterGuides } from './filters';
export type { Filters } from './filters';

export type Language = 'fr' | 'en';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type LocalizedText = Record<Language, string>;

export type Guide = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  tags: string[];
  difficulty: Difficulty;
  publishedAt: string;
  updatedAt?: string;
};

export type Catalog = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  guides: Guide[];
};

export type Category = {
  id: string;
  title: LocalizedText;
  catalogs: Catalog[];
};

export const categories = publishedLibrary.categories as Category[];
const catalogs = new Map(
  categories.flatMap(({ catalogs }) => catalogs.map((catalog) => [catalog.id, catalog])),
);
const markdown = import.meta.glob<string>('./generated/guides/**/*.md', {
  query: '?raw',
  import: 'default',
});

export function requireCatalog(id: string): Catalog {
  const catalog = catalogs.get(id);
  if (!catalog) throw notFound();
  return catalog;
}

export async function loadGuide(language: Language, catalogId: string, guideId: string) {
  const catalog = requireCatalog(catalogId);
  const guide = catalog.guides.find(({ id }) => id === guideId);
  const loadMarkdown =
    markdown['./generated/guides/' + language + '/' + catalogId + '/' + guideId + '.md'];
  if (!guide || !loadMarkdown) throw notFound();
  return { catalog, guide, markdown: await loadMarkdown() };
}
