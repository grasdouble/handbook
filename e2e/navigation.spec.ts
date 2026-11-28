import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const path = '/prompting-fundamentals/what-is-a-prompt/';
const titleEn = 'What is a prompt?';
const titleFr = "Qu'est-ce qu'un prompt ?";

async function documentStart(page: Page) {
  return page.evaluate(() => performance.timeOrigin);
}

test('serves both translations directly without JavaScript', async ({ browser, baseURL }) => {
  const page = await browser.newPage({ baseURL, javaScriptEnabled: false });
  try {
    for (const [locale, title] of [
      ['fr', titleFr],
      ['en', titleEn],
    ]) {
      const response = await page.goto('/' + locale + path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Handbook', exact: true })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('link[rel=alternate][hreflang]')).toHaveCount(2);
    }
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Handbook', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en/');
    await expect(page.getByRole('link', { name: 'Français' })).toHaveAttribute('href', '/fr/');
  } finally {
    await page.close();
  }
});

test('browses catalogs from the unified bilingual home page', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 1300 });
  await page.goto('/fr/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Comprendre. Concevoir. Construire.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Explorer les catalogues' }).click();
  await expect(page).toHaveURL('/fr/#catalogs');
  const catalogHeading = page.getByRole('heading', { name: 'IA & LLM' });
  await expect
    .poll(() =>
      catalogHeading.evaluate(
        (heading) =>
          heading.getBoundingClientRect().top -
          document.querySelector('.site-header')!.getBoundingClientRect().bottom,
      ),
    )
    .toBeLessThan(32);
  await expect(page.getByRole('link', { name: /Fondamentaux des LLMs/ })).toHaveAttribute(
    'href',
    '/fr/llm-fundamentals/',
  );
  await expect(page.getByRole('link', { name: /Tooling moderne/ })).toHaveAttribute(
    'href',
    '/fr/tooling-essentials/',
  );
  await expect(page.getByRole('link', { name: /Architecture front-end/ })).toHaveAttribute(
    'href',
    '/fr/frontend-architecture/',
  );

  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL('/en/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Understand. Design. Build.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: /Prompting Fundamentals/ }).click();
  await expect(page).toHaveURL('/en/prompting-fundamentals/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Prompting Fundamentals' }),
  ).toBeVisible();
  await page.getByRole('link', { name: titleEn }).click();
  await expect(page).toHaveURL('/en' + path);
  await page.goBack();
  await expect(page).toHaveURL('/en/prompting-fundamentals/');
  await page.getByRole('link', { name: 'All catalogs' }).click();
  await expect(page).toHaveURL('/en/#catalogs');
  await expect(page.getByRole('heading', { name: 'AI & LLM' })).toBeInViewport();
});

test('redirects legacy library URLs to the localized home page', async ({ page }) => {
  await page.goto('/en/library/#category-tooling');
  await expect(page).toHaveURL('/en/#category-tooling');
  await expect(page.getByRole('heading', { name: 'Tooling', exact: true })).toBeInViewport();
});

test('links from a guide breadcrumb to its category on the home page', async ({ page }) => {
  await page.goto('/en' + path);
  await page
    .getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { name: 'AI & LLM' })
    .click();
  await expect(page).toHaveURL('/en/#category-ia-llm');
  await expect(page.getByRole('heading', { name: 'AI & LLM' })).toBeInViewport();
});

test('redirects the French library and opens the guide index without JavaScript on mobile', async ({
  browser,
  baseURL,
}) => {
  const page = await browser.newPage({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  try {
    await page.goto('/fr/library/');
    await expect(page).toHaveURL('/fr/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Comprendre. Concevoir. Construire.' }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    await page.getByRole('link', { name: 'Guides', exact: true }).click();
    await expect(page).toHaveURL('/fr/guides/');
    await expect(page.getByRole('heading', { name: 'Tous les guides' })).toBeVisible();
    await expect(page.getByRole('link', { name: titleFr })).toBeVisible();
  } finally {
    await page.close();
  }
});

test('combines guide filters and resets the results on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/en/guides/');
  const results = page.getByRole('region', { name: 'All guides' });
  const guide = results.getByRole('link', { name: titleEn });
  await expect(guide).toBeVisible();
  await page.getByText('Topics', { exact: true }).click();
  await page.getByRole('checkbox', { name: 'prompting', exact: true }).check();
  await expect(page).toHaveURL((url) => url.searchParams.has('tags'));
  await expect(guide).toBeVisible();
  await page.getByRole('checkbox', { name: 'Advanced', exact: true }).check();
  await expect(guide).toBeHidden();
  await expect(page.getByRole('checkbox', { name: 'Advanced', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page).toHaveURL('/en/guides/');
  await expect(guide).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
});

test('restores the filtered index and opens translations without a document reload', async ({
  page,
}) => {
  await page.goto('/en/guides/?tags=prompting');
  const start = await documentStart(page);
  await page.getByRole('link', { name: titleEn }).click();
  await expect(page.getByRole('heading', { level: 1, name: titleEn })).toBeVisible();
  await expect(page).toHaveURL('/en' + path);
  expect(await documentStart(page)).toBe(start);

  await page.getByRole('navigation', { name: 'Language' }).locator('summary').click();
  await page.getByRole('link', { name: 'Français' }).click();
  await expect(page.getByRole('heading', { level: 1, name: titleFr })).toBeVisible();
  await expect(page).toHaveURL('/fr' + path);
  expect(await documentStart(page)).toBe(start);

  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL(
    (url) => url.pathname === '/en/guides/' && url.searchParams.has('tags'),
  );
  await expect(page.getByRole('link', { name: titleEn })).toBeVisible();
  await page.getByText('Topics (1)', { exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'prompting', exact: true })).toBeChecked();

  await page.goto('/');
  await expect(page).toHaveURL('/fr/');
});

test('reloading a deep link keeps the language from the URL', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/en/');
  await page.goto('/fr' + path);
  expect((await page.reload())?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: titleFr })).toBeVisible();
});

test('renders code and diagrams and makes the table of contents navigable', async ({ page }) => {
  await page.goto('/en/frontend-architecture/react-micro-frontends/');
  await expect(page.getByRole('img', { name: 'Diagram' }).locator('svg')).toBeVisible();
  await expect(
    page.locator('pre code').filter({ hasText: 'registerApplication' }).first(),
  ).toBeVisible();
  await page.getByRole('link', { name: 'The actual bet' }).click();
  await expect(page).toHaveURL(/#the-actual-bet$/);
  await expect(page.getByRole('heading', { name: 'The actual bet' })).toBeInViewport();
});

test('keeps the guide readable on a narrow dark display', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/en/frontend-architecture/react-micro-frontends/');

  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  const summary = page.locator('summary').filter({ hasText: 'On this page' });
  const section = page.getByRole('link', { name: 'The actual bet' });
  await expect(section).toBeHidden();
  await summary.click();
  await section.click();
  await expect(page).toHaveURL(/#the-actual-bet$/);

  const code = page.locator('pre').filter({ hasText: 'registerApplication' }).first();
  expect(await code.evaluate((block) => block.scrollWidth > block.clientWidth)).toBe(true);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThanOrEqual(0);
});

test('shows the published guide outline and follows a related page', async ({ page }) => {
  await page.goto('/fr/llm-fundamentals/what-is-an-llm/');
  const catalog = page.getByRole('navigation', { name: 'IA & LLM' });
  await expect(catalog.getByRole('link', { name: "Qu'est-ce qu'un LLM ?" })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(
    page
      .getByRole('navigation', { name: 'Dans cette page' })
      .getByRole('link', { name: 'Définition' }),
  ).toBeVisible();
  const article = page.getByRole('article');
  await expect(article.getByText('Génération', { exact: true })).toBeVisible();
  await expect(article).not.toContainText('guide-steps');
  const outline = page.locator('.guide-outline');
  await expect(
    outline.getByText('La plupart des LLM modernes reposent sur l’architecture Transformer.'),
  ).toBeVisible();
  await outline.getByRole('link', { name: 'Tokens' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tokens' })).toBeVisible();
});

test('persists the chosen reading theme over the system preference', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/en' + path);
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});
