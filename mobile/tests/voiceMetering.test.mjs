import assert from 'node:assert/strict';
import test from 'node:test';
import { meteringToLevel } from '../src/voice/metering.ts';

test('real dBFS metering keeps quiet speech visible without inventing signal', () => {
  assert.equal(meteringToLevel(-60), 0.25);
  assert.equal(meteringToLevel(-40), 0.5);
  assert.equal(meteringToLevel(-10), 0.875);
  assert.equal(meteringToLevel(-80), 0);
  assert.equal(meteringToLevel(-160), 0);
  assert.equal(meteringToLevel(0), 1);
  assert.equal(meteringToLevel(undefined), 0);
  assert.equal(meteringToLevel(Number.NaN), 0);
});
