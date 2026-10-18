import type { Locale } from './locale.ts';
import { canonicalDatasetJson } from './canonicalJson.ts';

import companionVi from '../../../data/journeys/three-lenses.vi.json' with { type: 'json' };
import companionEn from '../../../data/journeys/three-lenses.en.json' with { type: 'json' };
import bundledCoreVi from '../../../data/localized/three-lenses.vi.json' with { type: 'json' };
import bundledCoreEn from '../../../data/localized/three-lenses.en.json' with { type: 'json' };

export interface CompanionChapter {
  id: string;
  nodeId: string;
  title: string;
  text: string;
  voiceContentId: string;
  photoKey: string;
  qaIds: string[];
  evidence: string[];
  verification: 'LEGEND' | 'SOURCED_ONLY';
}

export interface CompanionTransition {
  id: string;
  nodeId: string;
  title: string;
  text: string;
  voiceContentId: string;
  evidence: string[];
}

export interface CompanionClosing {
  id: string;
  nodeId: string;
  title: string;
  text: string;
  voiceContentId: string;
  evidence: string[];
}

export interface ThreeLensesCompanion {
  schemaVersion: 1;
  collectionId: 'old-quarter-three-lenses';
  locale: Locale;
  title: string;
  tagline: string;
  verification: string;
  officiallyApproved: boolean;
  sourceDocument: string;
  chapters: CompanionChapter[];
  transitions: CompanionTransition[];
  closing: CompanionClosing;
  photoCredit: string;
  photoContext: string;
  scriptRevision: string;
  datasetRevision: string;
}

export const THREE_LENSES_COLLECTION_ID = 'old-quarter-three-lenses';

const COMPANIONS: Record<Locale, ThreeLensesCompanion> = {
  vi: companionVi as unknown as ThreeLensesCompanion,
  en: companionEn as unknown as ThreeLensesCompanion,
};

/**
 * Returns the bundled three-lenses companion for a given locale.
 */
export function getThreeLensesCompanion(locale: Locale): ThreeLensesCompanion {
  return COMPANIONS[locale] ?? COMPANIONS.vi;
}

/**
 * Retrieves the companion dataset revision for a given locale.
 * Sourced dynamically from the companion JSON.
 */
export function getThreeLensesDatasetRevision(locale: Locale): string {
  return getThreeLensesCompanion(locale).datasetRevision;
}

/**
 * Retrieves the companion script revision for a given locale.
 * Sourced dynamically from the companion JSON.
 */
export function getThreeLensesScriptRevision(locale: Locale): string {
  return getThreeLensesCompanion(locale).scriptRevision;
}

const CANONICAL_BUNDLED_CORE: Record<Locale, string> = {
  vi: canonicalDatasetJson(bundledCoreVi),
  en: canonicalDatasetJson(bundledCoreEn),
};

const CANONICAL_BUNDLED_COMPANION: Record<Locale, string> = {
  vi: canonicalDatasetJson(companionVi),
  en: canonicalDatasetJson(companionEn),
};

export interface ScopedCompanionQuery {
  mode?: string;
  collectionId?: string;
  locale?: Locale;
  datasetRevision?: string;
  dataset?: unknown;
}

/**
 * Strict fail-closed scopeguard for three-lenses companion:
 * - mode must be strictly 'demo' (missing or 'live' strictly rejected)
 * - collectionId must strictly be 'old-quarter-three-lenses'
 * - locale must strictly be 'vi' or 'en'
 * - datasetRevision must be strictly provided and match companion.datasetRevision
 * - dataset must be strictly provided and valid:
 *   - core.collectionId === 'old-quarter-three-lenses'
 *   - core.locale === query.locale (mismatched core locale strictly rejected)
 *   - core.kind === 'reviewed'
 *   - core.scriptRevision === companion.scriptRevision
 *   - canonicalDatasetJson(core) === CANONICAL_BUNDLED_CORE[locale] (mutated/tampered core text strictly rejected)
 */
export function getScopedCompanion(query?: ScopedCompanionQuery | null): ThreeLensesCompanion | null {
  if (!query || typeof query !== 'object') {
    return null;
  }

  const { mode, collectionId, locale, datasetRevision, dataset } = query;

  // 1. Fail closed on missing or non-demo mode
  if (!mode || mode !== 'demo') {
    return null;
  }

  // 2. Fail closed on missing or wrong collectionId
  if (!collectionId || collectionId !== THREE_LENSES_COLLECTION_ID) {
    return null;
  }

  // 3. Fail closed on missing or unsupported locale
  if (!locale || (locale !== 'vi' && locale !== 'en')) {
    return null;
  }

  // 4. Fail closed on missing datasetRevision
  if (!datasetRevision || typeof datasetRevision !== 'string') {
    return null;
  }

  // 5. Fail closed on missing dataset object
  if (!dataset || typeof dataset !== 'object') {
    return null;
  }

  const companion = COMPANIONS[locale];
  if (!companion) {
    return null;
  }

  // 6. Dataset revision must strictly match companion.datasetRevision
  if (datasetRevision !== companion.datasetRevision) {
    return null;
  }

  const core = dataset as Record<string, unknown>;

  // 7. Core collectionId must match
  if (core.collectionId !== THREE_LENSES_COLLECTION_ID) {
    return null;
  }

  // 8. Core locale must strictly match requested locale (fail closed on mismatched core locale)
  if (core.locale !== locale) {
    return null;
  }

  // 9. Core kind must be reviewed
  if (core.kind !== 'reviewed') {
    return null;
  }

  // 10. Core scriptRevision must strictly match companion.scriptRevision
  if (!core.scriptRevision || core.scriptRevision !== companion.scriptRevision) {
    return null;
  }

  // 11. Hash/integrity gate: core dataset text must strictly match canonical bundled core for this locale
  // Tampered or mutated core text (even claiming same revision) is strictly rejected!
  try {
    const canonicalCore = canonicalDatasetJson(core);
    if (canonicalCore !== CANONICAL_BUNDLED_CORE[locale]) {
      return null;
    }
  } catch {
    return null;
  }

  // 12. Companion snapshot integrity gate:
  // Compare actual companion full canonical payload against immutable module-load snapshot before return
  // Tampered or mutated companion text/chapters (even retaining claimed scriptRevision) is strictly rejected!
  try {
    const canonicalComp = canonicalDatasetJson(companion);
    if (canonicalComp !== CANONICAL_BUNDLED_COMPANION[locale]) {
      return null;
    }
  } catch {
    return null;
  }

  return companion;
}

export type StringHasher = (text: string) => string | Promise<string>;

/**
 * Verifies companion integrity according to THREE_LENSES_EXECUTION_SPEC:
 * 1. Companion payload without `scriptRevision` and `datasetRevision` serialized with
 *    canonicalDatasetJson produces `scriptRevision`.
 * 2. Complete core dataset serialized with canonicalDatasetJson produces `datasetRevision`.
 * 3. Core dataset's own `scriptRevision` equals companion's `scriptRevision`.
 */
export function prepareCompanionForScriptHash(companion: ThreeLensesCompanion): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...companion };
  delete clone.scriptRevision;
  delete clone.datasetRevision;
  return clone;
}

export function verifyCompanionIntegritySync(
  companion: ThreeLensesCompanion,
  hashFn: (input: string) => string,
  dataset?: unknown,
): {
  valid: boolean;
  scriptRevisionMatches: boolean;
  datasetRevisionMatches?: boolean;
  computedScriptRevision: string;
  computedDatasetRevision?: string;
} {
  const stripped = prepareCompanionForScriptHash(companion);
  const canonicalCompanion = canonicalDatasetJson(stripped);
  const computedScriptRevision = hashFn(canonicalCompanion);
  const scriptRevisionMatches = computedScriptRevision === companion.scriptRevision;

  let datasetRevisionMatches: boolean | undefined;
  let computedDatasetRevision: string | undefined;

  if (dataset !== undefined) {
    const canonicalDataset = canonicalDatasetJson(dataset);
    computedDatasetRevision = hashFn(canonicalDataset);
    datasetRevisionMatches =
      computedDatasetRevision === companion.datasetRevision &&
      (dataset as Record<string, unknown>).scriptRevision === companion.scriptRevision;
  }

  return {
    valid: scriptRevisionMatches && (datasetRevisionMatches === undefined || datasetRevisionMatches),
    scriptRevisionMatches,
    datasetRevisionMatches,
    computedScriptRevision,
    computedDatasetRevision,
  };
}
