import { createServer } from 'node:http';
import { DatasetInvalidError, readDataset, readLocalizedPublication } from './database.mjs';

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

function failLocalized(response, status, code, message, locale) {
  json(response, status, { error: { code, message }, locale });
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
    if (!['/api/health', '/api/ready', '/api/dataset', '/api/v2/ready', '/api/v2/dataset'].includes(path)) {
      fail(response, 404, 'NOT_FOUND', 'Route not found');
      return;
    }
    const localizedPath = path === '/api/v2/dataset' || path === '/api/v2/ready';
    let locale;
    if (localizedPath) {
      const locales = url.searchParams.getAll('locale');
      if ([...url.searchParams.keys()].length !== 1 || locales.length !== 1 || !['vi', 'en'].includes(locales[0])) {
        fail(response, 400, 'INVALID_INPUT', 'Exactly one supported locale is required');
        return;
      }
      locale = locales[0];
      let publication;
      try {
        publication = readLocalizedPublication(db, locale);
      } catch (error) {
        const invalid = error instanceof DatasetInvalidError;
        failLocalized(response, 503, invalid ? 'DATASET_INVALID' : 'DATABASE_UNAVAILABLE',
          invalid ? 'Published dataset is invalid' : 'Database is unavailable', locale);
        return;
      }
      const visible = publication && (publication.dataset.kind === 'reviewed' || serveSimulatedData);
      if (!visible) {
        failLocalized(response, path === '/api/v2/dataset' ? 404 : 503, 'NO_REVIEWED_DATA',
          'No dataset is available for this locale', locale);
        return;
      }
      if (path === '/api/v2/ready') {
        json(response, 200, {
          status: 'ready', database: 'ok', dataset: publication.dataset.kind,
          locale, collectionId: publication.collectionId, revision: publication.revision,
        });
        return;
      }
      json(response, 200, publication.dataset, { 'content-language': locale });
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
