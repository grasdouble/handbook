import type { ReactNode } from 'react';
import { Container } from '@grasdouble/lufa_design-system';
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from '@tanstack/react-router';
import { normalizeFilters } from '../filters';
import type { Language } from '../library';
import { isLanguage, saveLanguagePreference } from '../locale';
import '@grasdouble/lufa_design-system-tokens/tokens.css';
import '@grasdouble/lufa_design-system/style.css';
import '../handbook.css';

const emptyFilters = normalizeFilters({});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'color-scheme', content: 'light dark' },
      { title: 'Handbook' },
    ],
  }),
  shellComponent: Document,
  component: Outlet,
  notFoundComponent: NotFound,
});

const shellLabels = {
  fr: {
    skip: 'Aller au contenu',
    navigation: 'Navigation principale',
    catalogs: 'Catalogues',
    guides: 'Guides',
    languages: 'Langue',
  },
  en: {
    skip: 'Skip to content',
    navigation: 'Main navigation',
    catalogs: 'Catalogs',
    guides: 'Guides',
    languages: 'Language',
  },
};

function Document({ children }: { children: ReactNode }) {
  const [, segment, catalogId, guideId] = useLocation({
    select: ({ pathname }) => pathname.split('/'),
  });
  const language = isLanguage(segment) ? segment : 'fr';
  const labels = shellLabels[language];
  return (
    <html lang={language} data-theme="handbook" suppressHydrationWarning>
      <head>
        <script src="/color-mode.js"></script>
        <HeadContent />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          {labels.skip}
        </a>
        <header className="site-header">
          <Container size="xl">
            <div className="site-header-inner">
              <Link className="site-brand" to="/$lang/" params={{ lang: language }}>
                Handbook
              </Link>
              {isLanguage(segment) && (
                <>
                  <nav className="site-nav" aria-label={labels.navigation}>
                    <Link to="/$lang/" params={{ lang: language }} activeOptions={{ exact: true }}>
                      {labels.catalogs}
                    </Link>
                    <Link to="/$lang/guides/" params={{ lang: language }} search={emptyFilters}>
                      {labels.guides}
                    </Link>
                  </nav>
                  <nav className="site-language" aria-label={labels.languages}>
                    <TranslationLink
                      activeLanguage={language}
                      catalogId={catalogId}
                      guideId={guideId}
                    />
                  </nav>
                </>
              )}
            </div>
          </Container>
        </header>
        <main className="site-main" id="main-content" tabIndex={-1}>
          <Container size="xl">{children}</Container>
        </main>
        <Scripts />
      </body>
    </html>
  );
}

function TranslationLink({
  activeLanguage,
  catalogId,
  guideId,
}: {
  activeLanguage: Language;
  catalogId?: string;
  guideId?: string;
}) {
  const lang = activeLanguage === 'fr' ? 'en' : 'fr';
  const props = {
    lang,
    hrefLang: lang,
    onClick: () => saveLanguagePreference(lang),
    children: lang === 'en' ? 'English' : 'Français',
  };
  if (catalogId && guideId) {
    return (
      <Link {...props} to="/$lang/$catalogId/$guideId/" params={{ lang, catalogId, guideId }} />
    );
  }
  if (catalogId === 'guides') {
    return <Link {...props} to="/$lang/guides/" params={{ lang }} search={normalizeFilters} />;
  }
  if (catalogId) return <Link {...props} to="/$lang/$catalogId/" params={{ lang, catalogId }} />;
  return <Link {...props} to="/$lang/" params={{ lang }} />;
}

function NotFound() {
  const segment = useLocation({ select: ({ pathname }) => pathname.split('/')[1] });
  const lang = isLanguage(segment) ? segment : 'fr';
  return (
    <>
      <h1>{lang === 'fr' ? 'Page introuvable' : 'Page not found'}</h1>
      <Link to="/$lang/" params={{ lang }}>
        {shellLabels[lang].catalogs}
      </Link>
    </>
  );
}
