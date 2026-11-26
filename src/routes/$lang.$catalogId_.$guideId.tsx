import { createFileRoute } from '@tanstack/react-router';
import { GuidePage } from '../components';
import { loadGuide } from '../library';
import { pageHead } from '../locale';

export const Route = createFileRoute('/$lang/$catalogId_/$guideId')({
  loader: ({ params, context: { language } }) =>
    loadGuide(language, params.catalogId, params.guideId),
  head: ({
    loaderData: data,
    match: {
      context: { language },
    },
  }) =>
    data
      ? pageHead(
          language,
          data.catalog.id + '/' + data.guide.id + '/',
          data.guide.title[language],
          data.guide.description[language],
        )
      : {},
  component: GuideRoute,
});

function GuideRoute() {
  const { language } = Route.useRouteContext();
  const { catalog, guide, markdown } = Route.useLoaderData();
  return <GuidePage language={language} catalog={catalog} guide={guide} markdown={markdown} />;
}
