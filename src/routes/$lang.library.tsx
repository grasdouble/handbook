import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/library')({
  beforeLoad: ({ context: { language }, location }) => {
    throw redirect({ to: '/$lang/', params: { lang: language }, hash: location.hash });
  },
});
