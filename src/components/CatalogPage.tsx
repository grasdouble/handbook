import { Link } from '@tanstack/react-router';
import { languageSegment } from '../../site.mjs';
import type { Catalog, Language } from '../library';
import { getCatalogArtwork } from './catalog-artwork';
import { CatalogHero } from './CatalogHero';
import { GuideCard } from './GuideCard';
import { HandbookIcon } from './HandbookIcon';
import '../catalog-library.css';

export interface CatalogPageProps {
  language: Language;
  catalog: Catalog;
}

export function CatalogPage({ language, catalog }: CatalogPageProps) {
  const strings =
    language === 'fr'
      ? {
          label: 'GrasDouble · Catalogue',
          back: 'Tous les catalogues',
          guides: 'Guides',
          published: 'Publié le',
          updated: 'Mis à jour le',
          empty: 'Aucun guide disponible.',
        }
      : {
          label: 'GrasDouble · Catalog',
          back: 'All catalogs',
          guides: 'Guides',
          published: 'Published',
          updated: 'Updated',
          empty: 'No guides available.',
        };
  const dateFormat = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' });
  const count = catalog.guides.length;

  return (
    <div className="catalog-library catalog-detail">
      <CatalogHero
        label={strings.label}
        title={catalog.title[language]}
        description={catalog.description[language]}
        artwork={getCatalogArtwork(catalog.id)}
      >
        <Link
          className="catalog-back"
          to="/{-$lang}/"
          params={{ lang: languageSegment(language) }}
          hash="catalogs"
        >
          <HandbookIcon name="arrow" />
          {strings.back}
        </Link>
      </CatalogHero>
      <section
        className="guide-results catalog-detail-guides"
        aria-labelledby="catalog-guides-title"
      >
        <header className="guide-results-header">
          <h2 className="guide-results-title" id="catalog-guides-title">
            <HandbookIcon name="book" />
            {strings.guides}
          </h2>
          <p className="result-count">
            {count} {count === 1 ? 'guide' : 'guides'}
          </p>
        </header>
        {count === 0 ? (
          <p className="empty-state">{strings.empty}</p>
        ) : (
          <ol className="guide-card-grid catalog-detail-list" role="list">
            {catalog.guides.map((guide) => {
              const displayedDate = guide.updatedAt ?? guide.publishedAt;
              return (
                <li key={guide.id}>
                  <GuideCard
                    guide={guide}
                    catalogId={catalog.id}
                    language={language}
                    context={
                      <>
                        <HandbookIcon name="calendar" />
                        <span>
                          {guide.updatedAt ? strings.updated : strings.published}{' '}
                          <time dateTime={displayedDate}>
                            {dateFormat.format(new Date(displayedDate))}
                          </time>
                        </span>
                      </>
                    }
                  />
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
