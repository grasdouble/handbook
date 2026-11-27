import { Badge, Card, Container, Stack, Text } from '@grasdouble/lufa_design-system';
import { Link } from '@tanstack/react-router';
import type { Category, Language } from '../library';

export interface CatalogIndexProps {
  language: Language;
  categories: Category[];
}

export function CatalogIndex({ language, categories }: CatalogIndexProps) {
  const strings =
    language === 'fr'
      ? {
          title: 'Bibliothèque',
          description:
            'Des parcours et des guides de référence sur l’IA, l’architecture logicielle et les outils de développement.',
          empty: 'Aucun catalogue disponible.',
        }
      : {
          title: 'Library',
          description:
            'Learning paths and reference guides on AI, software architecture, and developer tools.',
          empty: 'No catalogs are available.',
        };

  return (
    <Container size="xl" className="library-page">
      <header className="page-intro">
        <Text as="h1" variant="h1">
          {strings.title}
        </Text>
        <Text as="p" variant="body-large" color="secondary">
          {strings.description}
        </Text>
      </header>
      {categories.length === 0 ? (
        <p className="empty-state">{strings.empty}</p>
      ) : (
        <Stack direction="vertical" spacing="spacious" className="category-list">
          {categories.map((category) => (
            <section
              key={category.id}
              className="category-section"
              aria-labelledby={`category-${category.id}`}
            >
              <Text as="h2" variant="h2" id={`category-${category.id}`}>
                {category.title[language]}
              </Text>
              <div className="catalog-grid">
                {category.catalogs.map((catalog) => (
                  <Link
                    key={catalog.id}
                    to="/$lang/$catalogId/"
                    params={{ lang: language, catalogId: catalog.id }}
                    className="catalog-link"
                  >
                    <Card className="catalog-card">
                      <Stack
                        direction="vertical"
                        spacing="compact"
                        className="catalog-card-content"
                      >
                        <Text as="h3" variant="h3">
                          {catalog.title[language]}
                        </Text>
                        <Text variant="body" color="secondary">
                          {catalog.description[language]}
                        </Text>
                        <div className="catalog-card-meta">
                          <Badge variant="default">
                            {catalog.guides.length}{' '}
                            {catalog.guides.length === 1 ? 'guide' : 'guides'}
                          </Badge>
                          <span className="catalog-card-arrow" aria-hidden="true">
                            →
                          </span>
                        </div>
                      </Stack>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </Stack>
      )}
    </Container>
  );
}
