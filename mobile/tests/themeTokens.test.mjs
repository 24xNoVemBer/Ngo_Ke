import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import test from 'node:test';
import { colors, radius, typography } from '../src/theme.ts';

const sourceRoot = new URL('../src/', import.meta.url);
const [alleySelectSource, passportSource, notebookSource] = await Promise.all([
  readFile(new URL('screens/AlleySelectScreen.tsx', sourceRoot), 'utf8'),
  readFile(new URL('components/AlleyPassportModal.tsx', sourceRoot), 'utf8'),
  readFile(new URL('components/NotebookDrawerModal.tsx', sourceRoot), 'utf8'),
]);

function styleBlock(source, name) {
  const start = source.indexOf(`${name}: {`);
  assert.notEqual(start, -1, `Missing ${name} style`);
  const end = source.indexOf('\n  },', start);
  assert.notEqual(end, -1, `Unclosed ${name} style`);
  return source.slice(start, end);
}

function luminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi)?.map((pair) => Number.parseInt(pair, 16) / 255);
  assert.equal(channels?.length, 3, `Expected an RGB hex color, got ${hex}`);
  const [red, green, blue] = channels.map((channel) => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground, background) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

test('v1.1 tokens are additive and preserve the established public keys', () => {
  const legacyColorKeys = [
    'background', 'surface', 'surfaceWarm', 'text', 'muted', 'accent', 'accentHover',
    'accentSoft', 'terracotta', 'terracottaSoft', 'border', 'borderStrong', 'error',
    'errorSoft', 'overlay',
  ];
  const legacyTypographyKeys = [
    'titleLarge', 'titleMedium', 'titleSmall', 'bodyLarge', 'bodyMedium', 'bodySmall',
    'label', 'caption', 'micro',
  ];

  for (const key of legacyColorKeys) assert.ok(key in colors, `Missing colors.${key}`);
  for (const key of legacyTypographyKeys) assert.ok(key in typography, `Missing typography.${key}`);

  assert.equal(colors.muted, '#626559');
  assert.equal(typography.label.fontSize, 13);
  assert.equal(typography.titleLarge.fontSize, 32);
  assert.equal(radius.xl, 24);
  assert.equal(colors.canvasBackground, '#1E2019');
  assert.equal(colors.toolCardDesc, '#75685C');
});

test('semantic text colors meet WCAG AA on their intended opaque surfaces', () => {
  const pairs = [
    [colors.toolCardDesc, colors.toolCardBg],
    [colors.canvasText, colors.canvasBackground],
    [colors.canvasTextMuted, colors.canvasBackground],
    [colors.visitedGreenText, colors.visitedGreenSoft],
  ];

  for (const [foreground, background] of pairs) {
    assert.ok(
      contrastRatio(foreground, background) >= 4.5,
      `${foreground} on ${background} must meet 4.5:1 contrast`,
    );
  }
});

test('01A visual consumers use the approved semantic surface tokens', () => {
  assert.match(styleBlock(alleySelectSource, 'rootContainer'), /backgroundColor: colors\.background/);
  assert.match(styleBlock(alleySelectSource, 'topBar'), /backgroundColor: colors\.surface/);
  assert.match(styleBlock(alleySelectSource, 'topBar'), /borderColor: colors\.border/);

  const passportSheet = styleBlock(passportSource, 'journalDrawerSheet');
  assert.match(passportSheet, /backgroundColor: colors\.surface/);
  assert.match(passportSheet, /borderColor: colors\.border/);
  assert.doesNotMatch(passportSheet, /#1E241D|#B9A589/);

  assert.match(styleBlock(notebookSource, 'toolGridDesc'), /color: colors\.toolCardDesc/);
});
