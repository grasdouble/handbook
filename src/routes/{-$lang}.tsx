import { createFileRoute } from '@tanstack/react-router';
import type { Language } from '../library';

export const Route = createFileRoute('/{-$lang}')({
  params: {
    parse: ({ lang }) => (lang === undefined || lang === 'en' ? { lang } : false),
  },
  beforeLoad: ({ params }): { language: Language } => ({
    language: params.lang === 'en' ? 'en' : 'fr',
  }),
});
