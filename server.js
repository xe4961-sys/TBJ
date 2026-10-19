import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || !mime[extname(file)]) {
      response.writeHead(404).end('Not found');
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] + (extname(file) === '.mp3' ? '' : '; charset=utf-8'), 'Content-Length': body.length, 'Cache-Control': 'no-cache' });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log(`TBJ tracker listening on port ${server.address().port}`));
