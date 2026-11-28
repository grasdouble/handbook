import { describe, expect, it } from 'vitest';
import { filterGuides, normalizeFilters } from '../filters';
import type { Category, Guide } from '../library';

const guide = (
  id: string,
  title: string,
  tags: string[],
  difficulty: Guide['difficulty'],
): Guide => ({
  id,
  title: { fr: title, en: id },
  description: { fr: 'Long unrelated explanation', en: 'Long unrelated explanation' },
  tags,
  difficulty,
  publishedAt: '2026-06-07',
});
const category: Category = {
  id: 'ai',
  title: { fr: 'IA', en: 'AI' },
  catalogs: [
    {
      id: 'prompts',
      title: { fr: 'Prompts', en: 'Prompts' },
      description: { fr: '', en: '' },
      guides: [
        guide('first', 'Un prompt', ['prompt', 'llm'], 'beginner'),
        guide('second', 'Optimiser un prompt', ['prompt'], 'advanced'),
        guide('third', 'Tester un prompt', ['prompt', 'llm'], 'intermediate'),
        guide('fourth', 'Un autre prompt', ['prompt', 'llm'], 'advanced'),
      ],
    },
  ],
};

describe('public guide filters', () => {
  it('intersects tags, unions levels and keeps editorial order', () => {
    const result = filterGuides([category], {
      tags: ['prompt', 'llm'],
      difficulty: ['beginner', 'intermediate'],
    });
    expect(result.map(({ guide }) => guide.id)).toEqual(['first', 'third']);
  });

  it('handles foreign and repeated values from a shared URL', () => {
    expect(
      normalizeFilters({ tags: ['llm', 3, 'llm'], difficulty: ['beginner', 'expert'] }),
    ).toEqual({
      tags: ['llm'],
      difficulty: ['beginner'],
    });
  });
});
