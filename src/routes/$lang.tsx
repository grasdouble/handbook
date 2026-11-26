import { createFileRoute } from '@tanstack/react-router';
import { requireLanguage } from '../locale';

export const Route = createFileRoute('/$lang')({
  beforeLoad: ({ params }) => ({ language: requireLanguage(params.lang) }),
});
