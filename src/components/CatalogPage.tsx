import { Badge, Container, Text } from '@grasdouble/lufa_design-system';
import { Link } from '@tanstack/react-router';
import type { Catalog, Language } from '../library';

export interface CatalogPageProps {
  language: Language;
  catalog: Catalog;
}

export function CatalogPage({ language, catalog }: CatalogPageProps) {
  const strings =
    language === 'fr'
      ? {
          back: 'Tous les catalogues',
          guides: 'Guides',
          published: 'Publié le',
          updated: 'Mis à jour le',
          difficulty: { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' },
        }
      : {
          back: 'All catalogs',
          guides: 'Guides',
          published: 'Published',
          updated: 'Updated',
          difficulty: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
        };
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' }).format(
      new Date(value),
    );

  return (
    <Container size="xl" className="library-page">
      <nav className="breadcrumb" aria-label={language === 'fr' ? 'Fil d’Ariane' : 'Breadcrumb'}>
        <Link to="/$lang/" params={{ lang: language }}>
          {strings.back}
        </Link>
      </nav>
      <header className="page-intro catalog-intro">
        <Text as="h1" variant="h1">
          {catalog.title[language]}
        </Text>
        <Text as="p" variant="body-large" color="secondary">
          {catalog.description[language]}
        </Text>
      </header>
      <section className="catalog-guides" aria-labelledby="catalog-guides-title">
        <Text as="h2" id="catalog-guides-title" variant="h2">
          {strings.guides}
        </Text>
        {catalog.guides.length === 0 ? (
          <p className="empty-state">
            {language === 'fr' ? 'Aucun guide disponible.' : 'No guides available.'}
          </p>
        ) : (
          <ol className="catalog-guide-list">
            {catalog.guides.map((guide) => (
              <li className="catalog-guide-item" key={guide.id}>
                <Link
                  to="/$lang/$catalogId/$guideId/"
                  params={{ lang: language, catalogId: catalog.id, guideId: guide.id }}
                  className="catalog-guide-link"
                >
                  <span className="catalog-guide-copy">
                    <Text as="h3" variant="h3">
                      {guide.title[language]}
                    </Text>
                    <Text as="p" variant="body" color="secondary">
                      {guide.description[language]}
                    </Text>
                  </span>
                  <span className="catalog-guide-meta">
                    <Badge variant="default">{strings.difficulty[guide.difficulty]}</Badge>
                    <span className="catalog-guide-date">
                      {guide.updatedAt ? strings.updated : strings.published}{' '}
                      <time dateTime={guide.updatedAt ?? guide.publishedAt}>
                        {formatDate(guide.updatedAt ?? guide.publishedAt)}
                      </time>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Container>
  );
}
