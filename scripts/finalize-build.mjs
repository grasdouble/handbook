import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { languages, origin, publicPaths } from '../site.mjs';

const library = JSON.parse(await readFile('src/generated/library.json', 'utf8'));
const paths = ['/', ...publicPaths(library)];
const output = 'dist/client';
await Promise.all([
  ...paths.map((path) => access(join(output, path, 'index.html'))),
  access(join(output, '404.html')),
]);

await Promise.all([
  ...languages.map(async (lang) => {
    const destination = `/${lang}/`;
    const directory = join(output, lang, 'library');
    await mkdir(directory, { recursive: true });
    await writeFile(
      join(directory, 'index.html'),
      `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <title>Handbook</title>
  <link rel="canonical" href="${origin}${destination}">
  <script>location.replace(${JSON.stringify(destination)} + location.hash);</script>
  <meta http-equiv="refresh" content="0;url=${destination}">
</head>
<body><a href="${destination}">Handbook</a></body>
</html>
`,
    );
  }),
  writeFile(
    join(output, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      paths.map((path) => `  <url><loc>${origin}${path}</loc></url>\n`).join('') +
      '</urlset>\n',
  ),
  writeFile(
    join(output, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  ),
]);
