import { createServer } from 'node:http';
import { readDataset } from './database.mjs';

function json(response, status, body, headers = {}) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...headers,
  });
  response.end(JSON.stringify(body));
}

function fail(response, status, code, message, headers) {
  json(response, status, { error: { code, message } }, headers);
}

export function createApp({ db, serveSimulatedData = false }) {
  return createServer({ headersTimeout: 10000, requestTimeout: 10000, maxHeaderSize: 8192 }, (request, response) => {
    request.resume();
    if (request.method !== 'GET') {
      fail(response, 405, 'METHOD_NOT_ALLOWED', 'Only GET is supported', { allow: 'GET' });
      return;
    }

    let url;
    try {
      url = new URL(request.url, 'http://backend');
    } catch {
      fail(response, 400, 'INVALID_INPUT', 'Invalid request URL');
      return;
    }
    const path = url.pathname;
    if (!['/api/health', '/api/ready', '/api/dataset'].includes(path)) {
      fail(response, 404, 'NOT_FOUND', 'Route not found');
      return;
    }
    if ([...url.searchParams.keys()].length) {
      fail(response, 400, 'INVALID_INPUT', 'Query parameters are not supported');
      return;
    }
    if (path === '/api/health') {
      try {
        db.prepare('SELECT 1').get();
        json(response, 200, { status: 'ok', database: 'ok' });
      } catch {
        fail(response, 503, 'DATABASE_UNAVAILABLE', 'Database is unavailable');
      }
      return;
    }

    let dataset;
    try {
      dataset = readDataset(db);
    } catch {
      fail(response, 503, 'DATABASE_UNAVAILABLE', 'Database or dataset is invalid');
      return;
    }
    const isVisible = dataset && (dataset.kind === 'reviewed' || serveSimulatedData);
    if (!isVisible) {
      const status = path === '/api/dataset' ? 404 : 503;
      fail(response, status, 'NO_REVIEWED_DATA', 'No dataset is available for live mode');
      return;
    }
    if (path === '/api/ready') {
      json(response, 200, { status: 'ready', database: 'ok', dataset: dataset.kind });
      return;
    }
    json(response, 200, dataset);
  });
}
