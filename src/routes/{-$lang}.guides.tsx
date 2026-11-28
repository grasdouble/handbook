import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { GuidesIndex } from '../components';
import { normalizeFilters } from '../filters';
import { categories } from '../library';
import { pageHead } from '../locale';

export const Route = createFileRoute('/{-$lang}/guides')({
  validateSearch: normalizeFilters,
  search: { middlewares: [stripSearchParams({ tags: [], difficulty: [] })] },
  head: ({
    match: {
      context: { language },
    },
  }) =>
    pageHead(
      language,
      'guides/',
      'Guides',
      language === 'fr' ? 'Tous les guides du Handbook.' : 'All Handbook guides.',
    ),
  component: GuidesIndexRoute,
});

function GuidesIndexRoute() {
  const { language } = Route.useRouteContext();
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <GuidesIndex
      language={language}
      categories={categories}
      filters={filters}
      onFiltersChange={(search) => void navigate({ search, replace: true, resetScroll: false })}
    />
  );
}
