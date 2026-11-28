import { createFileRoute } from '@tanstack/react-router';
import { CatalogIndex } from '../components';
import { categories } from '../library';
import { pageHead } from '../locale';

const copy = {
  fr: {
    title: 'Manuel technique',
    description: 'Tous les catalogues et guides du Handbook, classés par sujet.',
  },
  en: {
    title: 'Technical handbook',
    description: 'All Handbook catalogs and guides, organized by topic.',
  },
};

export const Route = createFileRoute('/$lang/')({
  head: ({
    match: {
      context: { language },
    },
  }) => pageHead(language, '', copy[language].title, copy[language].description),
  component: HomeRoute,
});

function HomeRoute() {
  const { language } = Route.useRouteContext();
  return <CatalogIndex language={language} categories={categories} />;
}
