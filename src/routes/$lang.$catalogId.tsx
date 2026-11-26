import { createFileRoute } from '@tanstack/react-router';
import { CatalogPage } from '../components';
import { requireCatalog } from '../library';
import { pageHead } from '../locale';

export const Route = createFileRoute('/$lang/$catalogId')({
  loader: ({ params }) => requireCatalog(params.catalogId),
  head: ({
    loaderData: catalog,
    match: {
      context: { language },
    },
  }) =>
    catalog
      ? pageHead(language, catalog.id + '/', catalog.title[language], catalog.description[language])
      : {},
  component: CatalogRoute,
});

function CatalogRoute() {
  const { language } = Route.useRouteContext();
  return <CatalogPage language={language} catalog={Route.useLoaderData()} />;
}
