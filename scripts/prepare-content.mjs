import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const languages = ['fr', 'en'];
const validDifficulties = new Set(['beginner', 'intermediate', 'advanced']);

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function buildLibrary(contentRoot) {
  const configuration = await readJson(path.join(contentRoot, 'library.json'));
  const categories = [];
  const guides = {};

  for (const category of configuration.categories) {
    const catalogs = [];
    for (const catalogId of category.catalogs) {
      if (catalogId === 'guides')
        throw new Error('Catalog ID "guides" is reserved by the guides route');
      const catalogRoot = path.join(contentRoot, catalogId);
      const catalog = await readJson(path.join(catalogRoot, 'catalog.json'));
      const publishedGuides = [];

      for (const sourceGuide of catalog.guides) {
        if (sourceGuide.status !== 'published') continue;
        const markdown = {};
        for (const language of languages) {
          const filePath = path.join(catalogRoot, `${sourceGuide.id}.${language}.md`);
          try {
            markdown[language] = await readFile(filePath, 'utf8');
          } catch (error) {
            if (error.code === 'ENOENT') {
              throw new Error(
                `Published guide ${catalogId}/${sourceGuide.id} is missing ${language} translation`,
              );
            }
            throw error;
          }
        }

        const publishedAt = sourceGuide.publishedAt;
        if (!isDate(publishedAt))
          throw new Error(
            `Published guide ${catalogId}/${sourceGuide.id} is missing a valid publishedAt`,
          );
        if (!validDifficulties.has(sourceGuide.difficulty)) {
          throw new Error(`Published guide ${catalogId}/${sourceGuide.id} has invalid difficulty`);
        }
        if (!Array.isArray(sourceGuide.tags))
          throw new Error(`Published guide ${catalogId}/${sourceGuide.id} is missing tags`);
        for (const language of languages) {
          const localized = sourceGuide[language];
          if (!localized?.title || !localized?.description) {
            throw new Error(
              `Published guide ${catalogId}/${sourceGuide.id} is missing ${language} title or description`,
            );
          }
          if (!markdown[language].trim())
            throw new Error(
              `Published guide ${catalogId}/${sourceGuide.id} has empty ${language} content`,
            );
        }

        publishedGuides.push({
          id: sourceGuide.id,
          title: Object.fromEntries(
            languages.map((language) => [language, sourceGuide[language].title]),
          ),
          description: Object.fromEntries(
            languages.map((language) => [language, sourceGuide[language].description]),
          ),
          tags: sourceGuide.tags,
          difficulty: sourceGuide.difficulty,
          publishedAt,
          ...(sourceGuide.updatedAt ? { updatedAt: sourceGuide.updatedAt } : {}),
        });
        guides[`${catalogId}/${sourceGuide.id}`] = Object.fromEntries(
          languages.map((language) => [language, markdown[language]]),
        );
      }

      if (publishedGuides.length > 0) {
        catalogs.push({
          id: catalogId,
          title: catalog.title,
          description: catalog.description,
          guides: publishedGuides,
        });
      }
    }
    if (catalogs.length > 0) categories.push({ id: category.id, title: category.title, catalogs });
  }

  return { library: { categories }, guides };
}

export async function writeGeneratedContent({ contentRoot, projectRoot }) {
  const { library, guides } = await buildLibrary(contentRoot);
  const generatedRoot = path.join(projectRoot, 'src', 'generated');
  await rm(generatedRoot, { recursive: true, force: true });
  await mkdir(generatedRoot, { recursive: true });
  await writeFile(
    path.join(generatedRoot, 'library.json'),
    `${JSON.stringify(library, null, 2)}\n`,
  );

  for (const [guidePath, translations] of Object.entries(guides)) {
    for (const language of languages) {
      const filePath = path.join(generatedRoot, 'guides', language, `${guidePath}.md`);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, translations[language]);
    }
  }
  return { library, guides };
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const projectRoot = path.resolve(path.dirname(scriptPath), '..');
  const { library, guides } = await writeGeneratedContent({
    contentRoot: path.join(projectRoot, 'content'),
    projectRoot,
  });
  const catalogCount = library.categories.reduce(
    (count, category) => count + category.catalogs.length,
    0,
  );
  console.log(
    `Prepared ${Object.keys(guides).length} public guides in ${catalogCount} public catalogs.`,
  );
}
