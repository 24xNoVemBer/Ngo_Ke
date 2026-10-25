import { URL } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { nodeVisualModule as visuals, loadVisualModule } from './helpers/nodeVisualModules.mjs';

const collections = loadVisualModule('data/collections.ts');
const photoMap = loadVisualModule('assets/photoMap.ts');
const { resolveNodeVisual, resolveCollectionVisual, NODE_MOTIF_MAP, QUARANTINED_GOOGLE_MAPS_NODES } = visuals;
const developmentVisuals = loadVisualModule('assets/nodeVisual.ts', {}, { __DEV__: true });
const releaseVisuals = loadVisualModule('assets/nodeVisual.ts', {}, { __DEV__: false });
const jsx = (type, props) => typeof type === 'function' ? type(props) : { type, props };
const components = loadVisualModule('components/HeritageSketchPlaceholder.tsx', {
  'react-native': { Image: 'Image', View: 'View', Text: 'Text', StyleSheet: { create: (s) => s, absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } } },
  'react-native-svg': { __esModule: true, default: 'Svg', Path: 'Path' },
  'react/jsx-runtime': { jsx, jsxs: jsx },
});
function elements(tree, type) {
  if (!tree) return [];
  if (Array.isArray(tree)) return tree.flatMap((node) => elements(node, type));
  return [...(tree.type === type ? [tree] : []), ...elements(tree.props?.children, type)];
}
function text(tree) {
  if (tree == null || tree === false) return '';
  if (typeof tree !== 'object') return String(tree);
  return Array.isArray(tree) ? tree.map(text).join(' ') : text(tree.props?.children);
}

for (const locale of ['vi', 'en']) {
  test(`all 8 collection/node scopes use documented visuals and actual localized names (${locale})`, () => {
    let stops = 0;
    for (const collection of collections.AVAILABLE_COLLECTIONS) {
      const dataset = collections.getBundledDataset(collection.id, locale);
      for (const node of dataset.nodes) {
        stops++;
        const visual = resolveNodeVisual(node.id, node.photoKey, collection.id, locale);
        if (collection.id === 'fiction-letter') {
          assert.equal(visual.kind, 'photo');
          assert.equal(visual.source, photoMap.NODE_PHOTO_MAP[node.id].source);
          assert.equal(visual.isIllustrative, true);
        } else {
          assert.equal(visual.kind, 'placeholder', `${collection.id}/${node.id}`);
          assert.equal(visual.siteName, node.name);
          assert.ok(visual.badgeLabel.length > 0);
          assert.equal('source' in visual, false);
          assert.equal('photographer' in visual, false);
        }
      }
    }
    assert.equal(stops, 29);
  });

  test(`all 17 new stops have exact approved motif assignments and no hero fallback (${locale})`, () => {
    assert.equal(Object.keys(NODE_MOTIF_MAP).length, 17);
    for (const id of ['ngo-gach', 'ngo-trung-yen', 'ngo-tam-thuong', 'ngo-cam-chi', 'ngo-phat-loc']) {
      for (const node of collections.getBundledDataset(id, locale).nodes) {
        const visual = resolveNodeVisual(node.id, undefined, id, locale);
        assert.equal(visual.kind, 'placeholder');
        assert.equal(visual.motif, NODE_MOTIF_MAP[node.id]);
      }
    }
  });

  test(`four quarantined contributors cannot be selected through node/key/scope overrides (${locale})`, () => {
    assert.equal(QUARANTINED_GOOGLE_MAPS_NODES.size, 4);
    for (const nodeId of QUARANTINED_GOOGLE_MAPS_NODES) {
      assert.ok(photoMap.NODE_PHOTO_MAP[nodeId].source);
      for (const collectionId of [undefined, 'fiction-letter', 'ngo-gach', 'ngo-trung-yen', 'old-quarter-three-lenses']) {
        for (const key of [undefined, 'bach-ma', 'dong-xuan-fire']) {
          assert.equal(resolveNodeVisual(nodeId, key, collectionId, locale).kind, 'placeholder');
        }
      }
    }
  });

  test(`cover rights are checked independently and unknown/live scopes never inherit fiction (${locale})`, () => {
    for (const collection of collections.AVAILABLE_COLLECTIONS) {
      const visual = resolveCollectionVisual(collection.id, locale);
      assert.equal(visual.kind, collection.id === 'fiction-letter' ? 'photo' : 'placeholder');
    }
    for (const scope of [undefined, '', 'new-live-collection', 'old-quarter-pilot']) {
      assert.equal(resolveNodeVisual('demo-01', 'bach-ma', scope, locale).kind, 'placeholder');
      assert.equal(resolveCollectionVisual(scope, locale).kind, 'placeholder');
    }
    for (const nodeId of ['trung-yen-pho-vui', 'trung-yen-mien-tron-muc', 'missing-node', undefined]) {
      assert.equal(resolveNodeVisual(nodeId, undefined, 'ngo-trung-yen', locale).kind, 'placeholder');
    }
  });

  test(`Three Lenses photoKey and chapter switches do not bypass rights policy (${locale})`, () => {
    for (const key of Object.keys(photoMap.THREE_LENSES_PHOTOS)) {
      const visual = resolveNodeVisual('oldquarter-dong-xuan', key, 'old-quarter-three-lenses', locale);
      assert.equal(visual.kind, 'placeholder');
      assert.equal(visual.siteName, collections.getBundledDataset('old-quarter-three-lenses', locale).nodes.find((n) => n.id === 'oldquarter-dong-xuan').name);
    }
  });

  test(`placeholder ratios, motifs, long labels, accessibility and neutral credit (${locale})`, () => {
    for (const [nodeId, scope] of [['ngo-gach-dinh-thanh-ha', 'ngo-gach'], ['trung-yen-pho-suong', 'ngo-trung-yen'], ['cam-chi-ngo-hoi-vu', 'ngo-cam-chi']]) {
      const visual = resolveNodeVisual(nodeId, undefined, scope, locale);
      const longName = `${visual.siteName} — ${visual.siteName} — ${visual.siteName}`;
      for (const ratio of ['4:3', '16:9', '1:1', 'full']) {
        const tree = components.HeritageSketchPlaceholder({ visual, locale, ratio, siteName: longName });
        assert.equal(tree.props.accessibilityRole, 'image');
        assert.ok(tree.props.accessibilityLabel.includes(longName));
        assert.ok(tree.props.accessibilityLabel.includes(visual.alleyName));
        assert.match(tree.props.accessibilityLabel, locale === 'en' ? /Generic illustrative sketch/ : /Ký họa minh họa trung tính/);
        assert.equal(elements(tree, 'Path').length, 1);
        assert.equal(elements(tree, 'Image').length, 0);
        assert.doesNotMatch(text(tree), /Google|Pexels|quyền|rights|copyright/i);
        assert.ok(elements(tree, 'Text').every((node) => node.props.allowFontScaling !== false && !node.props.maxFontSizeMultiplier));
        if (ratio === '1:1' || ratio === 'full') assert.equal(text(tree).includes(longName), false);
        else assert.ok(text(tree).includes(visual.badgeLabel));
      }
      const credit = components.NodeVisualCredit({ visual, locale });
      assert.equal(text(credit), `● ${visual.badgeLabel}`);
      assert.doesNotMatch(text(credit), /Photo:|Tác giả:|Pexels/);
    }
  });

  test(`illustrative photo labeling and image lifecycle callbacks survive (${locale})`, () => {
    const visual = resolveNodeVisual('demo-01', undefined, 'fiction-letter', locale);
    const onLoad = () => {};
    const tree = components.NodeVisualImage({ visual, locale, siteName: 'Stop', onLoad, style: { width: 60, height: 60 } });
    const photo = elements(tree, 'Image')[0];
    assert.equal(photo.props.source, photoMap.NODE_PHOTO_MAP['demo-01'].source);
    assert.equal(photo.props.onLoad, onLoad);
    assert.match(photo.props.accessibilityLabel, locale === 'en' ? /Illustration photo/ : /Ảnh minh họa/);
    const credit = text(components.NodeVisualCredit({ visual, locale }));
    assert.match(credit, /Thuan Pham/);
    assert.match(credit, locale === 'en' ? /Illustration photo/ : /Ảnh minh họa/);
  });
}

test('missing optional metadata and unsupported locales have a safe localized placeholder', () => {
  const visual = resolveNodeVisual(undefined, undefined, undefined, 'fr');
  assert.equal(visual.kind, 'placeholder');
  assert.equal(visual.alleyName, undefined);
  const tree = components.HeritageSketchPlaceholder({ visual });
  assert.ok(tree.props.accessibilityLabel.includes(visual.siteName));
  assert.doesNotMatch(tree.props.accessibilityLabel, /undefined|null/);
});

test('safe undo: image frames clip neutral artwork and omit competing seal/title/status overlays', () => {
  for (const locale of ['vi', 'en']) {
    const visual = resolveCollectionVisual('ngo-gach', locale);
    for (const style of [{ width: 230, height: 182 }, { width: 320, height: 120 }]) {
      const tree = components.NodeVisualImage({ visual, locale, siteName: 'A long collection title', ratio: '16:9', style });
      const frame = Object.assign({}, ...tree.props.style);
      assert.equal(frame.overflow, 'hidden');
      assert.equal(frame.height, style.height);
      assert.equal(elements(tree, 'Text').length, 0, 'card owns its labels; image has no competing overlays');
      assert.equal(elements(tree, 'Image').length, 0, 'rights-unverified cover stays hidden');
      const sketch = elements(tree, 'View').find((view) => view.props.accessibilityRole === 'image');
      const fill = Object.assign({}, ...sketch.props.style.filter(Boolean));
      assert.equal(fill.position, 'absolute');
      assert.equal(fill.width, '100%');
      assert.equal(fill.height, '100%');
      assert.ok(sketch.props.accessibilityLabel.includes(visual.badgeLabel));
    }
  }
});

test('all active node/collection consumers use the policy, not archival image helpers or raw cover sources', () => {
  for (const file of ['screens/HomeScreen.tsx', 'screens/QaScreen.tsx', 'components/PostcardCard.tsx', 'screens/CameraScreen.tsx', 'screens/LocationScreen.tsx', 'screens/LandingScreen.tsx', 'screens/AlleySelectScreen.tsx']) {
    const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /getNodePhoto\(|getNodePhotographer\(|source=\{col\.coverPhoto\}/, file);
    assert.match(source, /resolveNodeVisual|resolveCollectionVisual/, file);
  }
});

for (const locale of ['vi', 'en']) {
  test(`internal development restores all original collection covers and scoped node photos (${locale})`, () => {
    let mappedNodes = 0;
    let fallbackNodes = 0;
    for (const collection of collections.AVAILABLE_COLLECTIONS) {
      const cover = developmentVisuals.resolveCollectionVisual(collection.id, locale);
      assert.equal(cover.kind, 'photo');
      assert.equal(cover.source, collection.coverPhoto, 'exact original registry cover, not an arbitrary substitute');
      for (const node of collections.getBundledDataset(collection.id, locale).nodes) {
        const actual = developmentVisuals.resolveNodeVisual(node.id, undefined, collection.id, locale);
        assert.equal(actual.kind, 'photo');
        assert.equal(actual.source, photoMap.getNodePhoto(node.id, undefined, collection.id));
        assert.equal(actual.photographer, photoMap.getNodePhotographer(node.id, undefined, collection.id, locale));
        if (Object.hasOwn(photoMap.NODE_PHOTO_MAP, node.id)) {
          mappedNodes++;
          assert.equal(actual.source, photoMap.NODE_PHOTO_MAP[node.id].source);
        } else {
          fallbackNodes++;
          assert.equal(actual.source, photoMap.HERO_PHOTO, 'missing mapping uses the old fixed fallback, not a new photo assignment');
          assert.equal(actual.isIllustrative, true);
        }
      }
    }
    assert.equal(mappedNodes, 20);
    assert.equal(fallbackNodes, 9);
  });

  test(`internal development restores all five Three Lenses chapter images (${locale})`, () => {
    for (const [key, nodeId] of [
      ['bach-ma', 'oldquarter-bach-ma'], ['ma-may', 'oldquarter-ma-may'],
      ['dong-xuan-timeline', 'oldquarter-dong-xuan'], ['dong-xuan-fire', 'oldquarter-dong-xuan'], ['dong-xuan-street', 'oldquarter-dong-xuan'],
    ]) {
      const actual = developmentVisuals.resolveNodeVisual(nodeId, key, 'old-quarter-three-lenses', locale);
      assert.equal(actual.kind, 'photo');
      assert.equal(actual.source, photoMap.THREE_LENSES_PHOTOS[key]);
      assert.equal(actual.photographer, photoMap.getNodePhotographer(nodeId, key, 'old-quarter-three-lenses', locale));
    }
    assert.equal(developmentVisuals.resolveNodeVisual('ngo-gach-ca-phe-no1', 'bach-ma', 'ngo-gach', locale).source,
      photoMap.NODE_PHOTO_MAP['ngo-gach-ca-phe-no1'].source, 'chapter key from another collection cannot replace the assigned node image');
  });
}

test('development restoration does not grant release permission or expose unknown/obsolete node scopes', () => {
  for (const nodeId of QUARANTINED_GOOGLE_MAPS_NODES) {
    const scope = nodeId.startsWith('ngo-gach') ? 'ngo-gach' : 'ngo-trung-yen';
    assert.equal(developmentVisuals.resolveNodeVisual(nodeId, undefined, scope).kind, 'photo');
    assert.equal(releaseVisuals.resolveNodeVisual(nodeId, undefined, scope).kind, 'placeholder');
    assert.equal(resolveNodeVisual(nodeId, undefined, scope).kind, 'placeholder', 'VM contexts cannot change the existing non-development policy');
  }
  assert.equal(releaseVisuals.resolveCollectionVisual('ngo-gach').kind, 'placeholder');
  for (const scope of [undefined, 'unknown-live-collection']) {
    assert.equal(developmentVisuals.resolveCollectionVisual(scope).kind, 'placeholder');
    assert.equal(developmentVisuals.resolveNodeVisual('demo-01', 'bach-ma', scope).kind, 'placeholder');
  }
  for (const id of ['trung-yen-pho-vui', 'trung-yen-mien-tron-muc', 'missing']) {
    assert.equal(developmentVisuals.resolveNodeVisual(id, undefined, 'ngo-trung-yen').kind, 'placeholder');
  }
});

test('collection cover image dimensions override intrinsic asset size inside the unchanged card frame', () => {
  const sourceSizes = {
    'ngo-phat-loc': [960, 1280],
    'ngo-tam-thuong': [1440, 1586],
    'ngo-trung-yen': [1024, 1536],
    'ngo-cam-chi': [700, 875],
  };
  for (const locale of ['vi', 'en']) {
    for (const [collectionId, [sourceWidth, sourceHeight]] of Object.entries(sourceSizes)) {
      const visual = developmentVisuals.resolveCollectionVisual(collectionId, locale);
      for (const viewportWidth of [320, 360, 375, 430]) {
        for (const [width, height] of [[Math.min(260, viewportWidth * 0.72), 330], [viewportWidth - 32, 220]]) {
          const frame = { width, height };
          const tree = components.NodeVisualImage({ visual, locale, ratio: '16:9', style: frame });
          assert.equal(tree.props.style.at(-1), frame, 'caller still owns card geometry');
          const image = elements(tree, 'Image')[0];
          assert.equal(image.props.source, visual.source);
          assert.equal(image.props.resizeMode, 'cover', 'aspect-preserving cover is retained');
          // RN Image.ios/Image.android prepend intrinsic source dimensions before
          // the supplied style. Absolute offsets alone do not override them.
          const resolved = { width: sourceWidth, height: sourceHeight, ...image.props.style };
          assert.equal(resolved.width, '100%', `${collectionId}: image width must fit its frame`);
          assert.equal(resolved.height, '100%', `${collectionId}: image height must fit its frame`);
          assert.equal(resolved.position, 'absolute');
          assert.equal(resolved.transform, undefined, 'no artificial zoom or focal transform');
        }
      }
    }
  }
});
