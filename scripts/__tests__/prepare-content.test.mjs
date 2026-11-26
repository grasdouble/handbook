import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildLibrary, writeGeneratedContent } from '../prepare-content.mjs';

const temporaryDirectories = [];

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'llm-handbook-content-'));
  temporaryDirectories.push(root);
  await mkdir(path.join(root, 'catalog-a'), { recursive: true });
  await writeFile(
    path.join(root, 'library.json'),
    JSON.stringify({
      categories: [
        { id: 'category-a', title: { fr: 'Catégorie', en: 'Category' }, catalogs: ['catalog-a'] },
      ],
    }),
  );
  await writeFile(
    path.join(root, 'catalog-a', 'catalog.json'),
    JSON.stringify({
      title: { fr: 'Catalogue', en: 'Catalog' },
      description: { fr: 'Description', en: 'Description' },
      guides: [
        {
          id: 'published',
          fr: { title: 'Publié', description: 'Desc fr' },
          en: { title: 'Published', description: 'Desc en' },
          status: 'published',
          difficulty: 'beginner',
          tags: ['llm'],
          publishedAt: '2026-01-01',
        },
        {
          id: 'draft',
          fr: { title: 'Brouillon' },
          status: 'draft',
        },
      ],
    }),
  );
  for (const language of ['fr', 'en']) {
    await writeFile(
      path.join(root, 'catalog-a', `published.${language}.md`),
      `Published ${language}\n`,
    );
    await writeFile(path.join(root, 'catalog-a', `draft.${language}.md`), `Draft ${language}\n`);
  }
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('prepare-content', () => {
  it('builds the shared localized library and omits drafts', async () => {
    const contentRoot = await fixture();
    const { library, guides } = await buildLibrary(contentRoot);

    expect(library).toEqual({
      categories: [
        {
          id: 'category-a',
          title: { fr: 'Catégorie', en: 'Category' },
          catalogs: [
            {
              id: 'catalog-a',
              title: { fr: 'Catalogue', en: 'Catalog' },
              description: { fr: 'Description', en: 'Description' },
              guides: [
                {
                  id: 'published',
                  title: { fr: 'Publié', en: 'Published' },
                  description: { fr: 'Desc fr', en: 'Desc en' },
                  tags: ['llm'],
                  difficulty: 'beginner',
                  publishedAt: '2026-01-01',
                },
              ],
            },
          ],
        },
      ],
    });
    expect(guides).toEqual({
      'catalog-a/published': { fr: 'Published fr\n', en: 'Published en\n' },
    });
  });

  it('keeps publication dates as display metadata instead of using them as visibility state', async () => {
    const contentRoot = await fixture();
    const catalogPath = path.join(contentRoot, 'catalog-a', 'catalog.json');
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
    catalog.guides[0].publishedAt = '9999-12-31';
    await writeFile(catalogPath, JSON.stringify(catalog));

    const { library, guides } = await buildLibrary(contentRoot);

    expect(library.categories[0].catalogs[0].guides[0].publishedAt).toBe('9999-12-31');
    expect(guides['catalog-a/published']).toBeDefined();
  });

  it('omits catalogs and categories with no published guides', async () => {
    const contentRoot = await fixture();
    const catalogPath = path.join(contentRoot, 'catalog-a', 'catalog.json');
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
    catalog.guides[0].status = 'draft';
    await writeFile(catalogPath, JSON.stringify(catalog));

    const { library, guides } = await buildLibrary(contentRoot);

    expect(library.categories).toEqual([]);
    expect(guides).toEqual({});
  });

  it('requires both localized Markdown files for published guides', async () => {
    const contentRoot = await fixture();
    await rm(path.join(contentRoot, 'catalog-a', 'published.en.md'));

    await expect(buildLibrary(contentRoot)).rejects.toThrow(/missing en translation/);
  });

  it('requires publishedAt for published guides', async () => {
    const contentRoot = await fixture();
    const catalogPath = path.join(contentRoot, 'catalog-a', 'catalog.json');
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
    delete catalog.guides[0].publishedAt;
    await writeFile(catalogPath, JSON.stringify(catalog));

    await expect(buildLibrary(contentRoot)).rejects.toThrow(/published.*publishedAt/i);
  });

  it('rejects impossible publishedAt dates', async () => {
    const contentRoot = await fixture();
    const catalogPath = path.join(contentRoot, 'catalog-a', 'catalog.json');
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
    catalog.guides[0].publishedAt = '2026-02-30';
    await writeFile(catalogPath, JSON.stringify(catalog));

    await expect(buildLibrary(contentRoot)).rejects.toThrow(/publishedAt/i);
  });

  it('rejects catalog IDs reserved by the guides route', async () => {
    const contentRoot = await fixture();
    const libraryPath = path.join(contentRoot, 'library.json');
    const library = JSON.parse(await readFile(libraryPath, 'utf8'));
    library.categories[0].catalogs = ['guides'];
    await writeFile(libraryPath, JSON.stringify(library));

    await expect(buildLibrary(contentRoot)).rejects.toThrow(/reserved.*guides/i);
  });

  it('clears stale generated results and writes only the new library and published guide texts', async () => {
    const contentRoot = await fixture();
    const projectRoot = path.join(contentRoot, 'project');
    const generatedRoot = path.join(projectRoot, 'src', 'generated');
    await mkdir(path.join(generatedRoot, 'guides', 'fr', 'stale'), { recursive: true });
    await writeFile(path.join(generatedRoot, 'guides', 'fr', 'stale', 'old.md'), 'stale');

    await writeGeneratedContent({ contentRoot, projectRoot });

    expect(await readFile(path.join(generatedRoot, 'library.json'), 'utf8')).toContain(
      'category-a',
    );
    expect(
      await readFile(path.join(generatedRoot, 'guides', 'fr', 'catalog-a', 'published.md'), 'utf8'),
    ).toBe('Published fr\n');
    await expect(
      readFile(path.join(generatedRoot, 'guides', 'fr', 'catalog-a', 'draft.md'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(path.join(generatedRoot, 'guides', 'fr', 'stale', 'old.md'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
