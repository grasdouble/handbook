import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/en/library')({
  beforeLoad: ({ location }) => {
    throw redirect({ to: '/{-$lang}/', params: { lang: 'en' }, hash: location.hash });
  },
});
