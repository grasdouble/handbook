import { createFileRoute } from '@tanstack/react-router';
import { CatalogIndex } from '../components';
import { categories } from '../library';
import { pageHead } from '../locale';

export const Route = createFileRoute('/$lang/')({
  head: ({
    match: {
      context: { language },
    },
  }) =>
    language === 'fr'
      ? pageHead(
          language,
          '',
          'Catalogues',
          'Des parcours pour apprendre l’IA, l’architecture et les outils de développement.',
        )
      : pageHead(
          language,
          '',
          'Catalogs',
          'Learning paths for AI, architecture, and developer tools.',
        ),
  component: CatalogIndexRoute,
});

function CatalogIndexRoute() {
  const { language } = Route.useRouteContext();
  return <CatalogIndex language={language} categories={categories} />;
}
