import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist/client');
const notFound = await readFile(resolve(root, '404.html'));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  try {
    const path = decodeURIComponent(url.pathname);
    const file = resolve(root, '.' + path, ...(path.endsWith('/') ? ['index.html'] : []));
    if (!file.startsWith(root + sep)) throw new Error('Invalid path');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    response.end(body);
  } catch (error) {
    if (error.code === 'EISDIR') {
      response.writeHead(301, { Location: url.pathname + '/' + url.search });
      response.end();
      return;
    }
    response.writeHead(404, { 'Content-Type': types['.html'] });
    response.end(notFound);
  }
});
server.listen(4173, '127.0.0.1', () => console.log('Handbook preview: http://127.0.0.1:4173'));
