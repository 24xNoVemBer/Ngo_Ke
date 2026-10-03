/**
 * Local verification server for the live mode. NOT a backend.
 *
 * It exists so the live adapter can be checked against a real HTTP server on
 * the empty, error, timeout and ready branches without inventing production
 * data: every payload here is simulated and clearly labelled as such.
 *
 *   node tools/mock-api/server.mjs [port]
 *
 * The app always requests {baseUrl}/api/dataset, so each case is chosen with
 * a base URL prefix: /dataset, /empty, /broken, /server-error or /hang.
 *
 *   GET /api/dataset  simulated dataset in schema version 1 (ready)
 *   GET /empty/api/dataset     no points at all            (empty)
 *   GET /broken/api/dataset    a point without its source  (error: shape)
 *   GET /hang/api/dataset      never answers               (error: timeout)
 *   GET /server-error/api/dataset                          (error: http)
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const port = Number(process.argv[2] ?? 8086);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dataset = JSON.parse(readFileSync(join(root, 'data', 'demo.json'), 'utf8'));

const broken = structuredClone(dataset);
broken.qa[0].evidence = [];
broken.disclaimer = `${broken.disclaimer} Bản này cố tình sai định dạng để kiểm tra trạng thái lỗi.`;

function send(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  response.end(payload);
}

createServer((request, response) => {
  const path = (request.url ?? '/').split('?')[0];
  process.stdout.write(`${new Date().toISOString()} ${request.method} ${path}\n`);
  const segments = path.replace(/^\//, '').split('/');
  // /api/dataset and /<case>/api/dataset
  const segment = segments.length === 3 ? segments[0] : '';
  const route = segments.length === 3 ? segments.slice(1).join('/') : segments.join('/');
  if (route !== 'api/dataset') {
    send(response, 404, { error: 'not found' });
    return;
  }
  if (segment === 'empty') {
    send(response, 200, { ...dataset, nodes: [] });
  } else if (segment === 'broken') {
    send(response, 200, broken);
  } else if (segment === 'server-error') {
    send(response, 500, { error: 'boom' });
  } else if (segment === 'hang') {
    return; // never answers: exercises the 8 second timeout
  } else {
    send(response, 200, dataset);
  }
}).listen(port, '0.0.0.0', () => {
  process.stdout.write(`mock api on http://0.0.0.0:${port} (verification only)\n`);
});