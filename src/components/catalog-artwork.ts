export interface CatalogArtwork {
  src: string;
  width: number;
  height: number;
}

export const libraryCover: CatalogArtwork = { src: '/library/cover.webp', width: 800, height: 314 };

const artworkByCatalog: Partial<Record<string, CatalogArtwork>> = {
  'llm-fundamentals': { src: '/library/llm-fundamentals.webp', width: 280, height: 124 },
  'llm-architecture': { src: '/library/llm-architecture.webp', width: 272, height: 124 },
  'llm-evaluation-limits': { src: '/library/llm-evaluation-limits.webp', width: 262, height: 124 },
  'prompting-fundamentals': {
    src: '/library/prompting-fundamentals.webp',
    width: 268,
    height: 124,
  },
  'prompting-advanced': { src: '/library/prompting-advanced.webp', width: 272, height: 124 },
  'tooling-essentials': { src: '/library/tooling-essentials.webp', width: 374, height: 164 },
  'frontend-architecture': { src: '/library/frontend-architecture.webp', width: 370, height: 164 },
};

export function getCatalogArtwork(id: string): CatalogArtwork | undefined {
  return Object.hasOwn(artworkByCatalog, id) ? artworkByCatalog[id] : undefined;
}
