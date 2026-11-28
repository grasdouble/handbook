import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import type { Difficulty, Guide, Language } from '../library';

export const guideDifficultyLabels: Record<Language, Record<Difficulty, string>> = {
  fr: { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' },
  en: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
};

export function GuideCard({
  guide,
  catalogId,
  language,
  context,
}: {
  guide: Guide;
  catalogId: string;
  language: Language;
  context: ReactNode;
}) {
  return (
    <Link
      to="/$lang/$catalogId/$guideId/"
      params={{ lang: language, catalogId, guideId: guide.id }}
      className="catalog-feature-card guide-card"
    >
      <div className="guide-card-context">{context}</div>
      <h3>{guide.title[language]}</h3>
      <p>{guide.description[language]}</p>
      <div className="guide-card-meta">
        <span className="guide-card-level">
          {guideDifficultyLabels[language][guide.difficulty]}
        </span>
        {guide.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </Link>
  );
}
