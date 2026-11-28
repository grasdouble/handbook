import { Link } from '@tanstack/react-router';
import { languageSegment } from '../../site.mjs';
import type { Catalog, Language } from '../library';
import { getCatalogArtwork } from './catalog-artwork';
import { HandbookIcon } from './HandbookIcon';

export function CatalogCard({ catalog, language }: { catalog: Catalog; language: Language }) {
  const artwork = getCatalogArtwork(catalog.id);
  return (
    <Link
      to="/{-$lang}/$catalogId/"
      params={{ lang: languageSegment(language), catalogId: catalog.id }}
      className="catalog-feature-card"
    >
      {artwork && (
        <img
          className="catalog-feature-art"
          src={artwork.src}
          width={artwork.width}
          height={artwork.height}
          alt=""
        />
      )}
      <div className="catalog-feature-copy">
        <h3>{catalog.title[language]}</h3>
        <p>{catalog.description[language]}</p>
        <span className="catalog-guide-count">
          <HandbookIcon name="book" />
          {catalog.guides.length} {catalog.guides.length === 1 ? 'guide' : 'guides'}
        </span>
      </div>
    </Link>
  );
}
