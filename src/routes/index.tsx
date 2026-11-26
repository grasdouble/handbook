import { useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { origin } from '../../site.mjs';
import { preferredLanguage, readLanguagePreference, saveLanguagePreference } from '../locale';

export const Route = createFileRoute('/')({
  head: () => ({ links: [{ rel: 'canonical', href: origin + '/' }] }),
  component: LanguagePicker,
});

function LanguagePicker() {
  const navigate = useNavigate();
  useEffect(() => {
    const lang = preferredLanguage(readLanguagePreference(), navigator.languages);
    void navigate({ to: '/$lang/', params: { lang }, replace: true });
  }, [navigate]);

  return (
    <section>
      <h1>Handbook</h1>
      <ul>
        <li>
          <Link
            to="/$lang/"
            params={{ lang: 'fr' }}
            lang="fr"
            onClick={() => saveLanguagePreference('fr')}
          >
            Français
          </Link>
        </li>
        <li>
          <Link
            to="/$lang/"
            params={{ lang: 'en' }}
            lang="en"
            onClick={() => saveLanguagePreference('en')}
          >
            English
          </Link>
        </li>
      </ul>
    </section>
  );
}
