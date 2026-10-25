import { URL } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Executes the real resolver and static asset tables; native decoding/layout is
// deliberately outside these host tests. Assets keep distinct identities.
const root = fileURLToPath(new URL('../../src/', import.meta.url));
const cache = new Map();
export function loadVisualModule(file, overrides = {}, globals = {}) {
  const absolute = resolve(root, file);
  const cacheable = !Object.keys(overrides).length && !Object.keys(globals).length;
  if (cacheable && cache.has(absolute)) return cache.get(absolute);
  const mod = { exports: {} };
  const code = ts.transpileModule(readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  runInNewContext('(function(require,module,exports){\n' + code + '\n})', globals)((id) => {
    if (Object.hasOwn(overrides, id)) return overrides[id];
    let target = resolve(dirname(absolute), id);
    if (/\.(jpg|png|jpeg)$/.test(target)) {
      if (!existsSync(target)) throw new Error(`Missing image: ${target}`);
      return target;
    }
    if (id.endsWith('.json')) return JSON.parse(readFileSync(target, 'utf8'));
    if (!extname(target)) target += '.ts';
    return loadVisualModule(target);
  }, mod, mod.exports);
  if (cacheable) cache.set(absolute, mod.exports);
  return mod.exports;
}
export const nodeVisualModule = loadVisualModule('assets/nodeVisual.ts');
export const visualComponentStubs = {
  HeritageSketchPlaceholder: 'HeritageSketchPlaceholder',
  NodeVisualImage: 'NodeVisualImage',
  NodeVisualCredit: 'NodeVisualCredit',
};
