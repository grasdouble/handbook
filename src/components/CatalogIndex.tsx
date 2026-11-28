import type { Catalog, Category, Language } from '../library';
import { CatalogCard } from './CatalogCard';
import { CatalogHero } from './CatalogHero';
import { HandbookIcon } from './HandbookIcon';
import '../catalog-library.css';

export interface CatalogIndexProps {
  language: Language;
  categories: Category[];
}

const copy = {
  fr: {
    label: 'Manuel technique',
    title: 'Comprendre. Concevoir. Construire.',
    description:
      'Des guides pratiques et approfondis sur l’IA, l’architecture logicielle et les outils de développement.',
    explore: 'Explorer les catalogues',
    seeCategory: 'Voir la catégorie',
    more: 'Autres catalogues IA & LLM',
    empty: 'Aucun catalogue disponible.',
  },
  en: {
    label: 'Technical handbook',
    title: 'Understand. Design. Build.',
    description: 'In-depth, practical guides on AI, software architecture, and developer tools.',
    explore: 'Explore catalogs',
    seeCategory: 'View category',
    more: 'More AI & LLM catalogs',
    empty: 'No catalogs are available.',
  },
};

const categoryDesign = {
  'ia-llm': {
    icon: 'robot',
    fr: 'Comprendre, utiliser et évaluer les LLMs, du fonctionnement aux techniques de prompt avancées.',
    en: 'Understand, use, and evaluate LLMs, from the basics to advanced prompting techniques.',
  },
  tooling: {
    icon: 'wrench',
    fr: 'Les outils et pratiques pour un environnement de développement efficace.',
    en: 'Tools and practices for an efficient development environment.',
  },
  architecture: {
    icon: 'layers',
    fr: 'Concevoir des applications robustes, maintenables et évolutives.',
    en: 'Design robust, maintainable, and scalable applications.',
  },
} as const;

const featuredCount = 5;

export function CatalogIndex({ language, categories }: CatalogIndexProps) {
  const strings = copy[language];
  const featured = categories.find(({ id }) => id === 'ia-llm');
  const more = featured?.catalogs.slice(featuredCount) ?? [];

  return (
    <div className="catalog-library">
      <CatalogHero
        label={`GrasDouble · ${strings.label}`}
        title={strings.title}
        description={strings.description}
      >
        <a className="catalog-explore" href="#catalogs">
          <HandbookIcon name="book" />
          {strings.explore}
        </a>
      </CatalogHero>
      <div className="catalog-sections" id="catalogs">
        {categories.length === 0 && <p className="empty-state">{strings.empty}</p>}
        {featured && (
          <CatalogSection
            id={`category-${featured.id}`}
            title={featured.title[language]}
            design={categoryDesign['ia-llm']}
            catalogs={featured.catalogs.slice(0, featuredCount)}
            language={language}
            moreLabel={more.length > 0 ? strings.seeCategory : undefined}
            wide
          />
        )}
        {categories.map((category) =>
          category === featured ? null : (
            <CatalogSection
              key={category.id}
              id={`category-${category.id}`}
              title={category.title[language]}
              design={categoryDesign[category.id as keyof typeof categoryDesign]}
              catalogs={category.catalogs}
              language={language}
            />
          ),
        )}
        {more.length > 0 && (
          <CatalogSection
            id="more-ai-catalogs"
            title={strings.more}
            design={categoryDesign['ia-llm']}
            catalogs={more}
            language={language}
            wide
          />
        )}
      </div>
    </div>
  );
}

function CatalogSection({
  id,
  title,
  design,
  catalogs,
  language,
  moreLabel,
  wide,
}: {
  id: string;
  title: string;
  design?: (typeof categoryDesign)[keyof typeof categoryDesign];
  catalogs: Catalog[];
  language: Language;
  moreLabel?: string;
  wide?: boolean;
}) {
  return (
    <section
      id={id}
      className={wide ? 'catalog-section catalog-section-wide' : 'catalog-section'}
      aria-labelledby={`${id}-title`}
    >
      <header className="catalog-section-header">
        <HandbookIcon name={design?.icon ?? 'book'} />
        <div className="catalog-section-copy">
          <h2 id={`${id}-title`}>{title}</h2>
          {design && id !== 'more-ai-catalogs' && <p>{design[language]}</p>}
        </div>
        {moreLabel && (
          <a className="catalog-more" href="#more-ai-catalogs">
            {moreLabel}
            <HandbookIcon name="arrow" />
          </a>
        )}
      </header>
      <div className="catalog-grid">
        {catalogs.map((catalog) => (
          <CatalogCard key={catalog.id} catalog={catalog} language={language} />
        ))}
      </div>
    </section>
  );
}
