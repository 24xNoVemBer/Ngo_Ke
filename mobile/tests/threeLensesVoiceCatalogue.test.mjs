import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import test from 'node:test';

const manifest = JSON.parse(readFileSync(new URL('../assets/voice/three-lenses/manifest.json', import.meta.url), 'utf8'));

test('Three Lenses lookup resolves exactly its frozen locale catalogue and node-less intro', async () => {
  const previousRequire = globalThis.require;
  globalThis.require = () => 42;
  let catalog;
  let tracks;
  try {
    catalog = await import('../src/voice/localizedCatalog.ts');
    tracks = await import('../src/voice/threeLensesCatalog.ts');
  } finally {
    if (previousRequire === undefined) delete globalThis.require;
    else globalThis.require = previousRequire;
  }

  const { THREE_LENSES_VOICE_COLLECTION, threeLensesVoiceCatalogues } = tracks;
  assert.equal(THREE_LENSES_VOICE_COLLECTION, 'old-quarter-three-lenses');
  assert.equal(manifest.scope, THREE_LENSES_VOICE_COLLECTION);
  assert.equal(manifest.humanApproved, false);

  for (const locale of ['en', 'vi']) {
    const source = manifest.catalogues[locale];
    const catalogue = threeLensesVoiceCatalogues[locale];
    assert.equal(catalogue.datasetRevision, source.datasetRevision);
    assert.equal(source.tracks.length, 28);
    assert.deepEqual(Object.keys(catalogue.tracks).sort(), source.tracks.map((entry) => entry.id).sort());

    for (const entry of source.tracks) {
      const query = {
        collectionId: THREE_LENSES_VOICE_COLLECTION,
        locale,
        contentId: entry.id,
        datasetRevision: source.datasetRevision,
      };
      const track = catalog.lookupVoiceTrack(query);
      assert.equal(track?.source, 42, `${locale}/${entry.id} should resolve through the app catalogue`);
      assert.equal(track?.kind, entry.kind);
      assert.equal(track?.nodeId, entry.nodeId);
      assert.equal(track?.textHash, entry.textHash);
      assert.equal(catalog.lookupVoiceTrack({ ...query, datasetRevision: 'stale' }), undefined);
      assert.equal(catalog.lookupVoiceTrack({ ...query, collectionId: 'other' }), undefined);
    }

    const intro = catalogue.tracks.intro;
    assert.equal(intro.kind, 'intro');
    assert.equal(Object.hasOwn(intro, 'nodeId'), false);
  }

  assert.equal(catalog.lookupVoiceTrack({
    collectionId: THREE_LENSES_VOICE_COLLECTION,
    locale: 'vi',
    contentId: 'intro',
    datasetRevision: manifest.catalogues.en.datasetRevision,
  }), undefined);
});
