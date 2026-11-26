import { Badge, Container, Input, Text } from '@grasdouble/lufa_design-system';
import { Link } from '@tanstack/react-router';
import type { Category, Filters, Language } from '../library';
import { filterGuides } from '../library';

export interface GuidesIndexProps {
  language: Language;
  categories: Category[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

const difficultyLabels: Record<Language, Record<(typeof difficulties)[number], string>> = {
  fr: { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' },
  en: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
};

export function GuidesIndex({ language, categories, filters, onFiltersChange }: GuidesIndexProps) {
  const results = filterGuides(categories, language, filters);
  const allTags = [
    ...new Set(
      categories.flatMap((category) =>
        category.catalogs.flatMap((catalog) => catalog.guides.flatMap((guide) => guide.tags)),
      ),
    ),
  ].sort((a, b) => a.localeCompare(b, language));
  const strings =
    language === 'fr'
      ? {
          title: 'Tous les guides',
          search: 'Rechercher un guide',
          tags: 'Thèmes',
          difficulty: 'Niveau',
          results: 'résultats',
          clear: 'Effacer les filtres',
          empty: 'Aucun guide ne correspond à ces filtres.',
        }
      : {
          title: 'All guides',
          search: 'Search guides',
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
    <Container size="xl" className="library-page">
      <header className="page-intro">
        <Text as="h1" variant="h1">
          {strings.title}
        </Text>
      </header>
      <div className="guides-layout">
        <form
          className="guide-filters"
          onSubmit={(event) => event.preventDefault()}
          aria-label={strings.title}
        >
          <label className="filter-search-label" htmlFor="guide-search">
            {strings.search}
          </label>
          <Input
            id="guide-search"
            type="search"
            value={filters.q}
            fullWidth
            onChange={(event) => onFiltersChange({ ...filters, q: event.currentTarget.value })}
          />
          <fieldset className="filter-group">
            <legend>{strings.tags}</legend>
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
          <fieldset className="filter-group">
            <legend>{strings.difficulty}</legend>
            {difficulties.map((difficulty) => (
              <label className="filter-option" key={difficulty}>
                <input
                  type="checkbox"
                  checked={filters.difficulty.includes(difficulty)}
                  onChange={(event) => changeDifficulty(difficulty, event.currentTarget.checked)}
                />
                <span>{difficultyLabels[language][difficulty]}</span>
              </label>
            ))}
          </fieldset>
          {(filters.q !== '' || filters.tags.length > 0 || filters.difficulty.length > 0) && (
            <button
              className="text-button"
              type="button"
              onClick={() => onFiltersChange({ q: '', tags: [], difficulty: [] })}
            >
              {strings.clear}
            </button>
          )}
        </form>
        <section className="guide-results" aria-live="polite" aria-label={strings.title}>
          <p className="result-count">
            {results.length} {strings.results}
          </p>
          {results.length === 0 ? (
            <p className="empty-state">{strings.empty}</p>
          ) : (
            <div className="guide-card-grid">
              {results.map(({ category, catalog, guide }) => (
                <article className="guide-card" key={`${catalog.id}/${guide.id}`}>
                  <Link
                    to="/$lang/$catalogId/$guideId/"
                    params={{ lang: language, catalogId: catalog.id, guideId: guide.id }}
                    className="guide-card-link"
                  >
                    <span className="eyebrow">
                      {category.title[language]} · {catalog.title[language]}
                    </span>
                    <Text as="h2" variant="h3">
                      {guide.title[language]}
                    </Text>
                    <Text as="p" variant="body" color="secondary">
                      {guide.description[language]}
                    </Text>
                  </Link>
                  <div className="guide-card-meta">
                    <Badge variant="default">{difficultyLabels[language][guide.difficulty]}</Badge>
                    {guide.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Container>
  );
}
