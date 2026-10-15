import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readConfig } from '../src/config.mjs';

test('defaults bind loopback and hide simulated data', () => {
  const config = readConfig({});
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.port, 8086);
  assert.equal(config.serveSimulatedData, false);
});

test('invalid network and storage settings fail closed', () => {
  for (const env of [
    { PORT: '0' }, { PORT: 'abc' }, { PORT: '65536' },
    { HOST: '' }, { DB_PATH: '' }, { DB_PATH: ':memory:' },
    { SERVE_SIMULATED_DATA: 'yes' },
  ]) assert.throws(() => readConfig(env), /config/i);
  assert.equal(readConfig({ HOST: '0.0.0.0', SERVE_SIMULATED_DATA: 'true' }).host, '0.0.0.0');
});
