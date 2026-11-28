import type { ReactNode } from 'react';
import { libraryCover, type CatalogArtwork } from './catalog-artwork';

export function CatalogHero({
  label,
  title,
  description,
  artwork = libraryCover,
  children,
}: {
  label: string;
  title: string;
  description: string;
  artwork?: CatalogArtwork;
  children?: ReactNode;
}) {
  return (
    <header className="catalog-hero">
      <div className="catalog-hero-copy">
        <p className="catalog-hero-label">{label}</p>
        <h1>{title}</h1>
        <p className="catalog-hero-description">{description}</p>
        {children && <div className="catalog-hero-actions">{children}</div>}
      </div>
      <img
        className="catalog-hero-art"
        src={artwork.src}
        alt=""
        width={artwork.width}
        height={artwork.height}
        fetchPriority="high"
      />
    </header>
  );
}
