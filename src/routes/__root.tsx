import type { ReactNode } from 'react';
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from '@tanstack/react-router';
import { HandbookIcon } from '../components/HandbookIcon';
import { ReadingTheme } from '../components/ReadingTheme';
import { normalizeFilters } from '../filters';
import type { Language } from '../library';
import { isLanguage, saveLanguagePreference } from '../locale';
import '@grasdouble/lufa_design-system-tokens/tokens.css';
import '@grasdouble/lufa_design-system/style.css';
import '../handbook.css';
import '../guide-page.css';

const emptyFilters = normalizeFilters({});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'color-scheme', content: 'light dark' },
      { title: 'Handbook' },
    ],
    links: [{ rel: 'icon', type: 'image/svg+xml', href: '/handbook-mark.svg' }],
  }),
  shellComponent: Document,
  component: Outlet,
  notFoundComponent: NotFound,
});

const shellLabels = {
  fr: {
    skip: 'Aller au contenu',
    navigation: 'Navigation principale',
    library: 'Catalogues',
    guides: 'Guides',
    languages: 'Langue',
  },
  en: {
    skip: 'Skip to content',
    navigation: 'Main navigation',
    library: 'Catalogs',
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
  const isGuide = isLanguage(segment) && Boolean(catalogId && guideId);
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
        <header className={isGuide ? 'site-header site-header-guide' : 'site-header'}>
          <div className="site-header-inner">
            <Link className="site-brand" to="/$lang/" params={{ lang: language }}>
              <img src="/handbook-mark.svg" width="40" height="32" alt="" />
              <span>GrasDouble</span>
              <span className="site-brand-product">Handbook</span>
            </Link>
            {isLanguage(segment) && (
              <>
                <nav className="site-nav" aria-label={labels.navigation}>
                  <Link to="/$lang/" params={{ lang: language }} activeOptions={{ exact: true }}>
                    Handbook
                  </Link>
                  <Link
                    to="/$lang/guides/"
                    params={{ lang: language }}
                    search={emptyFilters}
                    data-section-active={isGuide || undefined}
                  >
                    {labels.guides}
                  </Link>
                </nav>
                <div className="site-header-controls">
                  {isGuide && <ReadingTheme language={language} />}
                  <nav className="site-language" aria-label={labels.languages}>
                    {isGuide ? (
                      <details key={language} className="guide-language-menu">
                        <summary aria-label={labels.languages}>
                          {language.toUpperCase()}
                          <HandbookIcon name="down" />
                        </summary>
                        <TranslationLink
                          activeLanguage={language}
                          catalogId={catalogId}
                          guideId={guideId}
                        />
                      </details>
                    ) : (
                      <TranslationLink
                        activeLanguage={language}
                        catalogId={catalogId}
                        guideId={guideId}
                      />
                    )}
                  </nav>
                </div>
              </>
            )}
          </div>
        </header>
        <main className="site-main" id="main-content" tabIndex={-1}>
          {children}
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
    children: (
      <>
        <HandbookIcon name="globe" />
        {lang === 'en' ? 'English' : 'Français'}
      </>
    ),
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
    <div className="library-page">
      <h1>{lang === 'fr' ? 'Page introuvable' : 'Page not found'}</h1>
      <Link to="/$lang/" params={{ lang }} hash="catalogs">
        {shellLabels[lang].library}
      </Link>
    </div>
  );
}
