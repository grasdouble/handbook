import { useMemo } from 'react';
import { difficulties, filterGuides, type Filters } from '../filters';
import type { Category, Language } from '../library';
import { CatalogHero } from './CatalogHero';
import { GuideCard, guideDifficultyLabels } from './GuideCard';
import { HandbookIcon } from './HandbookIcon';
import '../catalog-library.css';
import '../guides-index.css';

export interface GuidesIndexProps {
  language: Language;
  categories: Category[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function GuidesIndex({ language, categories, filters, onFiltersChange }: GuidesIndexProps) {
  const results = filterGuides(categories, filters);
  const allTags = useMemo(
    () =>
      [
        ...new Set(
          categories.flatMap((category) =>
            category.catalogs.flatMap((catalog) => catalog.guides.flatMap((guide) => guide.tags)),
          ),
        ),
      ].sort((a, b) => a.localeCompare(b, language)),
    [categories, language],
  );
  const strings =
    language === 'fr'
      ? {
          title: 'Tous les guides',
          description:
            'Des guides pratiques sur l’IA, l’architecture logicielle et les outils de développement.',
          filters: 'Filtres',
          matches: 'Guides trouvés',
          result: 'résultat',
          tags: 'Thèmes',
          difficulty: 'Niveau',
          results: 'résultats',
          clear: 'Effacer les filtres',
          empty: 'Aucun guide ne correspond à ces filtres.',
        }
      : {
          title: 'All guides',
          description: 'Practical guides on AI, software architecture, and developer tools.',
          filters: 'Filters',
          matches: 'Matching guides',
          result: 'result',
          tags: 'Topics',
          difficulty: 'Difficulty',
          results: 'results',
          clear: 'Clear filters',
          empty: 'No guides match these filters.',
        };

  const changeTag = (tag: string, checked: boolean) => {
    const tags = checked ? [...filters.tags, tag] : filters.tags.filter((item) => item !== tag);
    onFiltersChange({ ...filters, tags });
  };
  const changeDifficulty = (difficulty: (typeof difficulties)[number], checked: boolean) => {
    const selected = checked
      ? [...filters.difficulty, difficulty]
      : filters.difficulty.filter((item) => item !== difficulty);
    onFiltersChange({ ...filters, difficulty: selected });
  };

  return (
    <div className="catalog-library guide-index">
      <CatalogHero
        label="GrasDouble Handbook"
        title={strings.title}
        description={strings.description}
      />
      <div className="guides-layout">
        <aside className="guide-filters" aria-labelledby="guide-filters-title">
          <h2 className="guide-results-title" id="guide-filters-title">
            <HandbookIcon name="filter" />
            {strings.filters}
          </h2>
          <fieldset className="filter-group">
            <legend>{strings.difficulty}</legend>
            {difficulties.map((difficulty) => (
              <label className="filter-option" key={difficulty}>
                <input
                  type="checkbox"
                  checked={filters.difficulty.includes(difficulty)}
                  onChange={(event) => changeDifficulty(difficulty, event.currentTarget.checked)}
                />
                <span>{guideDifficultyLabels[language][difficulty]}</span>
              </label>
            ))}
          </fieldset>
          {allTags.length > 0 && (
            <details className="filter-topics">
              <summary>
                {strings.tags}
                {filters.tags.length > 0 && ` (${filters.tags.length})`}
              </summary>
              <fieldset className="filter-group" aria-label={strings.tags}>
                {allTags.map((tag) => (
                  <label className="filter-option" key={tag}>
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={(event) => changeTag(tag, event.currentTarget.checked)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </fieldset>
            </details>
          )}
          {(filters.tags.length > 0 || filters.difficulty.length > 0) && (
            <button
              className="guide-filter-reset"
              type="button"
              onClick={() => onFiltersChange({ tags: [], difficulty: [] })}
            >
              {strings.clear}
            </button>
          )}
        </aside>
        <section className="guide-results" aria-label={strings.title}>
          <header className="guide-results-header">
            <h2 className="guide-results-title">
              <HandbookIcon name="book" />
              {strings.matches}
            </h2>
            <p className="result-count" role="status">
              {results.length} {results.length === 1 ? strings.result : strings.results}
            </p>
          </header>
          {results.length === 0 ? (
            <p className="empty-state">{strings.empty}</p>
          ) : (
            <div className="guide-card-grid">
              {results.map(({ category, catalog, guide }) => (
                <GuideCard
                  key={`${catalog.id}/${guide.id}`}
                  guide={guide}
                  catalogId={catalog.id}
                  language={language}
                  context={
                    <>
                      <HandbookIcon name="book" />
                      {category.title[language]} · {catalog.title[language]}
                    </>
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
