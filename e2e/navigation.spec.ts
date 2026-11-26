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
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('link[rel=alternate][hreflang]')).toHaveCount(2);
    }
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en/');
    await expect(page.getByRole('link', { name: 'Français' })).toHaveAttribute('href', '/fr/');
  } finally {
    await page.close();
  }
});

test('restores the filtered index and opens translations without a document reload', async ({
  page,
}) => {
  await page.goto('/en/guides/?q=what+is+a+prompt');
  const start = await documentStart(page);
  await page.getByRole('link', { name: titleEn }).click();
  await expect(page.getByRole('heading', { level: 1, name: titleEn })).toBeVisible();
  await expect(page).toHaveURL('/en' + path);
  expect(await documentStart(page)).toBe(start);

  await page.getByRole('link', { name: 'Français' }).click();
  await expect(page.getByRole('heading', { level: 1, name: titleFr })).toBeVisible();
  await expect(page).toHaveURL('/fr' + path);
  expect(await documentStart(page)).toBe(start);

  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL(/\/en\/guides\/\?q=/);
  await expect(page.getByRole('link', { name: titleEn })).toBeVisible();

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
