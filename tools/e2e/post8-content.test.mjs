#!/usr/bin/env node
/**
 * Post8 content-contract tests (W4 T3a). Text-layer only: no servers,
 * emulator, audio tooling or model probes.
 *
 *   node --test tools/e2e/post8-content.test.mjs
 *
 * Covers all 4 datasets (fiction VI V1-implicit, fiction EN, pilot VI/EN):
 * collection/node/QA identity + graph + pair parity, real-matcher lookup
 * (within-node, unknown, cross-node/cross-locale isolation), strict 60-QA
 * membership, field/body limits, reviewed/legend/food-2024 semantics,
 * geometry rules, and original 34-track VI audio+manifest hash integrity.
 * Structural pair checks use a tiny local helper; the shared V2 parser
 * itself belongs to W2 and is intentionally not duplicated here.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import demoVi from '../../data/demo.json' with { type: 'json' };
import manifest from '../../mobile/assets/voice/manifest.json' with { type: 'json' };
import { normalizeQuestion, findAnswer } from '../../mobile/src/qa/match.ts';
import { parseDatasetV2, validateDatasetV2Pair } from '../../mobile/src/data/sourceState.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const readRaw = (rel) => readFileSync(join(ROOT, rel));
const loadJson = (rel) => JSON.parse(readRaw(rel).toString('utf8'));
const fictionEn = loadJson('data/localized/fiction.en.json');
const pilotVi = loadJson('data/localized/old-quarter.vi.json');
const pilotEn = loadJson('data/localized/old-quarter.en.json');

const sha256hex = (bytes) => createHash('sha256').update(bytes).digest('hex');
const MAX_BODY = 512 * 1024;

const entriesOf = (dataset, nodeId) => dataset.qa.filter((q) => q.nodeId === nodeId);
const normKeys = (dataset) => dataset.qa.flatMap((q) => [q.question, ...q.aliases].map(normalizeQuestion));

describe('inventory: four datasets, exact counts and identities', () => {
  it('fiction VI is 6 nodes / 21 QA (V1 implicit locale)', () => {
    assert.equal(demoVi.nodes.length, 6);
    assert.equal(demoVi.qa.length, 21);
    assert.equal(demoVi.locale ?? 'vi-implicit', 'vi-implicit');
    assert.equal(demoVi.kind, 'simulated');
  });
  it('fiction EN is 6 nodes / 21 QA with explicit locale + collection', () => {
    assert.equal(fictionEn.nodes.length, 6);
    assert.equal(fictionEn.qa.length, 21);
    assert.equal(fictionEn.locale, 'en');
    assert.equal(fictionEn.collectionId, 'fiction-letter');
    assert.equal(fictionEn.kind, 'simulated');
  });
  it('pilot VI/EN are 3 nodes / 9 QA reviewed collections', () => {
    for (const [name, ds] of [['vi', pilotVi], ['en', pilotEn]]) {
      assert.equal(ds.nodes.length, 3, name);
      assert.equal(ds.qa.length, 9, name);
      assert.equal(ds.kind, 'reviewed', name);
      assert.equal(ds.collectionId, 'old-quarter-pilot', name);
      assert.equal(ds.reviewStatus, 'approved', name);
    }
    assert.equal(pilotVi.locale, 'vi');
    assert.equal(pilotEn.locale, 'en');
  });
  it('strict 60-QA membership: 30 per locale across 2 collections, shared logical IDs', () => {
    // Locales share logical QA identity by contract (§2: same IDs across
    // locales), so uniqueness holds per locale, and the ID sets must agree.
    const viIds = [...demoVi.qa.map((q) => q.id), ...pilotVi.qa.map((q) => q.id)];
    const enIds = [...fictionEn.qa.map((q) => q.id), ...pilotEn.qa.map((q) => q.id)];
    assert.equal(viIds.length, 30);
    assert.equal(enIds.length, 30);
    assert.equal(new Set(viIds).size, 30);
    assert.equal(new Set(enIds).size, 30);
    assert.deepEqual([...new Set(enIds)].sort(), [...new Set(viIds)].sort());
    const fictionIds = new Set(demoVi.qa.map((q) => q.id));
    const pilotIds = new Set(pilotVi.qa.map((q) => q.id));
    assert.equal(new Set([...fictionIds, ...pilotIds]).size, 30, 'collections must not share QA namespaces');
  });
});

describe('pair parity: EN mirrors VI structurally', () => {
  for (const [label, vi, en] of [['fiction', demoVi, fictionEn], ['pilot', pilotVi, pilotEn]]) {
    it(`${label}: node IDs/order/meta/geometry/tags identical`, () => {
      assert.deepEqual(en.nodes.map((n) => n.id), vi.nodes.map((n) => n.id));
      en.nodes.forEach((n, i) => {
        const v = vi.nodes[i];
        assert.equal(n.visitMinutes, v.visitMinutes);
        assert.equal(n.available, v.available);
        assert.equal(n.visited, v.visited);
        assert.equal(n.latitude, v.latitude);
        assert.equal(n.longitude, v.longitude);
        assert.deepEqual(n.tags, v.tags);
      });
      assert.equal(en.startNodeId, vi.startNodeId);
    });
    it(`${label}: QA IDs/order/nodeId/followUps identical`, () => {
      assert.deepEqual(en.qa.map((q) => q.id), vi.qa.map((q) => q.id));
      en.qa.forEach((q, i) => {
        assert.equal(q.nodeId, vi.qa[i].nodeId);
        assert.deepEqual(q.followUps, vi.qa[i].followUps);
      });
    });
  }
  it('pilot reviewed metadata present on intro, every node and every QA', () => {
    for (const ds of [pilotVi, pilotEn]) {
      for (const rec of [ds, ds.intro, ...ds.nodes, ...ds.qa]) {
        assert.equal(rec.reviewStatus, 'approved');
        assert.match(rec.updatedAt ?? '', /^\d{4}-\d{2}-\d{2}T/);
      }
      assert.ok(ds.intro.evidence.length >= 1);
    }
  });
});

describe('graph integrity (local structural helper, not the app validator)', () => {
  for (const [label, ds] of [['fictionVi', demoVi], ['fictionEn', fictionEn], ['pilotVi', pilotVi], ['pilotEn', pilotEn]]) {
    it(`${label}: unique IDs, resolvable nodeIds/followUps/startNode`, () => {
      const nodeIds = new Set(ds.nodes.map((n) => n.id));
      const qaIds = new Set(ds.qa.map((q) => q.id));
      assert.equal(nodeIds.size, ds.nodes.length);
      assert.equal(qaIds.size, ds.qa.length);
      assert.ok(nodeIds.has(ds.startNodeId));
      for (const q of ds.qa) {
        assert.ok(nodeIds.has(q.nodeId), `${label}/${q.id} bad nodeId`);
        for (const f of q.followUps) assert.ok(qaIds.has(f), `${label}/${q.id} dangling ${f}`);
      }
    });
    it(`${label}: normalized questions+aliases globally unique (isolation basis)`, () => {
      const keys = normKeys(ds);
      assert.equal(new Set(keys).size, keys.length);
    });
  }
});

describe('QA lookup through the real matcher', () => {
  const sets = [['fictionVi', demoVi], ['fictionEn', fictionEn], ['pilotVi', pilotVi], ['pilotEn', pilotEn]];
  for (const [label, ds] of sets) {
    it(`${label}: every question + alias resolves within its node`, () => {
      for (const node of ds.nodes) {
        const entries = entriesOf(ds, node.id);
        assert.ok(entries.length > 0, `${label}/${node.id} has no QA`);
        for (const q of entries) {
          const byQ = findAnswer(entries, q.question);
          assert.equal(byQ.status, 'matched');
          assert.equal(byQ.entry.id, q.id);
          for (const alias of q.aliases) {
            const byA = findAnswer(entries, alias);
            assert.equal(byA.status, 'matched', `${label}/${q.id} alias missed`);
            assert.equal(byA.entry.id, q.id);
          }
        }
      }
    });
    it(`${label}: unknown and empty stay unknown`, () => {
      for (const node of ds.nodes) {
        const entries = entriesOf(ds, node.id);
        assert.equal(findAnswer(entries, 'cau hoi hoan toan khong ton tai xyz').status, 'unknown');
        assert.equal(findAnswer(entries, '   ').status, 'unknown');
      }
    });
  }
  it('cross-node isolation: node-A wording unknown inside node B', () => {
    const pairs = [[demoVi, 'demo-01', 'demo-02'], [fictionEn, 'demo-01', 'demo-02'],
      [pilotVi, 'oldquarter-bach-ma', 'oldquarter-dong-xuan'],
      [pilotEn, 'oldquarter-bach-ma', 'oldquarter-dong-xuan']];
    for (const [ds, a, b] of pairs) {
      const bEntries = entriesOf(ds, b);
      for (const q of entriesOf(ds, a)) {
        assert.equal(findAnswer(bEntries, q.question).status, 'unknown', `${q.id} leaks across nodes`);
      }
    }
  });
  it('cross-locale isolation: VI wording unknown in EN entries and vice versa', () => {
    const allEn = [...fictionEn.qa, ...pilotEn.qa];
    const allVi = [...demoVi.qa, ...pilotVi.qa];
    for (const q of [...demoVi.qa, ...pilotVi.qa]) {
      assert.equal(findAnswer(allEn, q.question).status, 'unknown', `VI leaks: ${q.id}`);
    }
    for (const q of [...fictionEn.qa, ...pilotEn.qa]) {
      assert.equal(findAnswer(allVi, q.question).status, 'unknown', `EN leaks: ${q.id}`);
    }
  });
});

describe('field and body limits (Phase 8 contract)', () => {
  const files = {
    fictionVi: 'data/demo.json',
    fictionEn: 'data/localized/fiction.en.json',
    pilotVi: 'data/localized/old-quarter.vi.json',
    pilotEn: 'data/localized/old-quarter.en.json',
  };
  for (const [label, rel] of Object.entries(files)) {
    it(`${label}: raw body within 512KiB`, () => {
      assert.ok(readRaw(rel).length <= MAX_BODY);
    });
  }
  for (const [label, ds] of [['fictionVi', demoVi], ['fictionEn', fictionEn], ['pilotVi', pilotVi], ['pilotEn', pilotEn]]) {
    it(`${label}: text/ID/count caps hold`, () => {
      assert.ok(ds.disclaimer.length <= 2000 && ds.disclaimer.length > 0);
      assert.ok(ds.intro.text.length <= 4000 && ds.intro.evidence.length >= 1);
      for (const n of ds.nodes) {
        assert.ok(n.id.length <= 128 && n.story.length <= 2000 && n.caption.length <= 220);
        assert.ok(n.tags.length >= 1 && n.tags.length <= 20);
      }
      for (const q of ds.qa) {
        assert.ok(q.answer.length <= 2000);
        assert.ok(q.aliases.length >= 1 && q.aliases.length <= 7);
        assert.ok(q.followUps.length <= 2);
        assert.ok(q.evidence.length >= 1 && q.evidence.length <= 20);
        assert.ok(q.evidence.every((e) => e.length >= 1 && e.length <= 2000));
      }
    });
  }
});

describe('review semantics: legend, food-2024, geometry, attribution', () => {
  it('BM legend stays a legend in both locales', () => {
    const vi = pilotVi.qa.find((q) => q.id === 'bm-horse');
    const en = pilotEn.qa.find((q) => q.id === 'bm-horse');
    assert.match(vi.answer, /truyền thuyết/);
    assert.match(vi.answer, /không.*(chứng minh|lịch sử)/);
    assert.match(en.answer, /legend/);
    assert.match(en.answer, /not.*proven history|does not establish/);
  });
  it('DX food is dated 2024 with current-stall refusal in both locales', () => {
    const vi = pilotVi.qa.find((q) => q.id === 'dx-food');
    const en = pilotEn.qa.find((q) => q.id === 'dx-food');
    assert.match(vi.answer, /2024/);
    assert.match(en.answer, /2024/);
    const cur = pilotVi.qa.find((q) => q.id === 'dx-current');
    assert.match(cur.answer, /dị ứng|chế độ ăn/);
  });
  it('no fake Bạch Mã coords; MM/DX coords finite and locale-equal', () => {
    for (const ds of [pilotVi, pilotEn]) {
      const bm = ds.nodes.find((n) => n.id === 'oldquarter-bach-ma');
      assert.equal(bm.latitude, null);
      assert.equal(bm.longitude, null);
      for (const n of ds.nodes.filter((x) => x.id !== 'oldquarter-bach-ma')) {
        assert.ok(Number.isFinite(n.latitude) && Number.isFinite(n.longitude));
      }
    }
    pilotVi.nodes.forEach((n, i) => {
      assert.equal(pilotEn.nodes[i].latitude, n.latitude);
      assert.equal(pilotEn.nodes[i].longitude, n.longitude);
    });
  });
  it('OSM attribution present in both pilot disclaimers or intro evidence', () => {
    for (const ds of [pilotVi, pilotEn]) {
      const hay = ds.disclaimer + ' ' + JSON.stringify(ds.intro);
      assert.match(hay, /OpenStreetMap/);
    }
  });
});

describe('shared V2 parser + pair validator on the real pilot pair', () => {
  it('accepts both locales with the matching expectation', () => {
    const vi = parseDatasetV2(pilotVi, { mode: 'live', expectedLocale: 'vi' });
    const en = parseDatasetV2(pilotEn, { mode: 'live', expectedLocale: 'en' });
    assert.ok(vi && en);
    assert.deepEqual(validateDatasetV2Pair(vi, en), { ok: true });
  });
  it('rejects wrong-locale expectation and wrong schema', () => {
    assert.equal(parseDatasetV2(pilotEn, { mode: 'live', expectedLocale: 'vi' }), undefined);
    assert.equal(parseDatasetV2({ ...pilotEn, schemaVersion: 1 }, { mode: 'live' }), undefined);
    assert.equal(parseDatasetV2({ ...pilotEn, locale: 'en-US' }, { mode: 'live' }), undefined);
  });
  it('pair validator rejects tampered pairs with reasons', () => {
    const vi = parseDatasetV2(pilotVi, { expectedLocale: 'vi' });
    const en = parseDatasetV2(pilotEn, { expectedLocale: 'en' });
    assert.ok(vi && en);
    // Dangling followUp reference never parses (parser guards the graph).
    const dropped = JSON.parse(JSON.stringify(pilotEn));
    dropped.qa = dropped.qa.filter((q) => q.id !== 'dx-current');
    assert.equal(parseDatasetV2(dropped, { expectedLocale: 'en' }), undefined);
    // An extra valid node parses alone but fails the pair count gate.
    const padded = JSON.parse(JSON.stringify(pilotEn));
    padded.nodes.push({ ...padded.nodes[0], id: 'oldquarter-extra-check' });
    const paddedParsed = parseDatasetV2(padded, { expectedLocale: 'en' });
    assert.ok(paddedParsed);
    const countRes = validateDatasetV2Pair(vi, paddedParsed);
    assert.equal(countRes.ok, false);
    assert.match(countRes.reason, /Node count mismatch/);
    const relabeled = JSON.parse(JSON.stringify(pilotEn));
    relabeled.locale = 'vi';
    const relabeledParsed = parseDatasetV2(relabeled, {});
    assert.ok(relabeledParsed, 'schema accepts vi locale on its own');
    const localeRes = validateDatasetV2Pair(vi, relabeledParsed);
    assert.equal(localeRes.ok, false);
    assert.match(localeRes.reason, /invalid locale/);
    const dangling = JSON.parse(JSON.stringify(pilotEn));
    dangling.qa[0].followUps = ['ghost-qa'];
    assert.equal(parseDatasetV2(dangling, { expectedLocale: 'en' }), undefined);
  });
});

describe('original 34-track VI audio bytes + manifest baseline', () => {
  // Provenance (corrected 2026-10-16, root-verified in all 4 worktrees):
  // raw working-tree bytes = 13112 B = SHA 34925f5d; LF-normalized = 12783 B
  // = 92e277 = git blob at 91ddfbd. The 329-byte gap is exactly Git EOL
  // normalization (CRLF checkout vs LF blob), not a provenance gap and not a
  // source change, so both anchors are asserted and no file/EOL/source rewrite
  // was made. Always read raw Buffer (never universal-newline text) for raw.
  // MP3 bytes are unaffected either way.
  it('raw manifest bytes match the 34925f baseline anchor', () => {
    assert.equal(sha256hex(readRaw('mobile/assets/voice/manifest.json')),
      '34925f5d005fa7fb684c4f8fac19992865b581c6eeaa6bde0e9183431c9be05a');
  });
  it('LF-normalized manifest matches git source 91ddfbd', () => {
    // Compare git blobs (LF) rather than the checkout (CRLF on this host):
    // pins tracked content to the baseline byte-for-byte.
    const show = (rev) => execSync(`git show ${rev}:mobile/assets/voice/manifest.json`, { cwd: ROOT, encoding: 'buffer', maxBuffer: 8 * 1024 * 1024 });
    assert.equal(sha256hex(show('HEAD')), sha256hex(show('91ddfbd')));
    assert.equal(sha256hex(show('91ddfbd')),
      '92e27735cb63ddf7c9a58f43e817b07521203f59e7cdd599ca3f369c26e1b5c0');
  });
  it('all 34 MP3 bytes hash to their manifest audioSha256', () => {
    assert.equal(manifest.entries.length, 34);
    let total = 0;
    for (const entry of manifest.entries) {
      assert.ok(!entry.path.includes('..'), `unsafe path ${entry.id}`);
      const bytes = readFileSync(join(ROOT, entry.path));
      assert.ok(bytes.length > 2048, `tiny clip ${entry.id}`);
      total += bytes.length;
      assert.equal(sha256hex(bytes), entry.audioSha256, `modified clip ${entry.id}`);
    }
    assert.ok(total > 1024 * 1024, `suspicious total ${total}`);
  });
});

describe('original 34-track VI text catalogue integrity', () => {
  const clipRows = (dataset) => {
    const rows = [{ id: 'intro', kind: 'intro', text: dataset.intro.text }];
    for (const node of dataset.nodes) {
      rows.push({ id: `${node.id}-story`, kind: 'story', nodeId: node.id, text: node.story });
      rows.push({ id: `${node.id}-caption`, kind: 'caption', nodeId: node.id, text: node.caption });
    }
    for (const item of dataset.qa) {
      rows.push({ id: `${item.id}-answer`, kind: 'answer', nodeId: item.nodeId, text: item.answer });
    }
    return rows;
  };
  it('sourceDataSha256 matches data/demo.json bytes', () => {
    const actual = sha256hex(readRaw('data/demo.json'));
    assert.ok(timingSafeEqual(Buffer.from(actual), Buffer.from(manifest.sourceDataSha256)));
  });
  it('34 entries in canonical order with matching text hashes', () => {
    const rows = clipRows(demoVi);
    assert.equal(rows.length, 34);
    assert.equal(manifest.entries.length, 34);
    manifest.entries.forEach((entry, i) => {
      assert.equal(entry.id, rows[i].id);
      assert.equal(entry.kind, rows[i].kind);
      assert.equal(entry.textSha256, sha256hex(Buffer.from(rows[i].text, 'utf8')));
      assert.match(entry.audioSha256 ?? '', /^[0-9a-f]{64}$/);
      assert.ok(entry.durationSeconds > 0);
    });
  });
});
