import { isLocale, parseLocale, type Locale } from './locale.ts';

export type PersistedLocalePayload = {
  locale: Locale;
  updatedAt?: string;
};

export const LOCALE_FILENAME = 'ngoke-locale.json';

/**
 * Parses raw stored content from disk.
 * Returns valid Locale ('vi' | 'en') if the JSON payload contains a valid locale.
 * Returns undefined on corrupt JSON, non-object payloads, or unsupported locale values.
 */
export function parsePersistedLocale(raw: unknown): Locale | undefined {
  if (typeof raw !== 'string') {
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
      const record = raw as Record<string, unknown>;
      return typeof record.locale === 'string' && isLocale(record.locale)
        ? record.locale
        : undefined;
    }
    return undefined;
  }

  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (isLocale(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return undefined;
    }
    const record = parsed as Record<string, unknown>;
    if (typeof record.locale === 'string' && isLocale(record.locale)) {
      return record.locale;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Formats a Locale for persistence in isolated JSON format.
 */
export function formatPersistedLocale(locale: Locale): string {
  const payload: PersistedLocalePayload = {
    locale,
    updatedAt: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Resolves the effective locale with strict manual choice priority:
 * 1. Saved manual choice (if valid 'vi' or 'en')
 * 2. OS fallback parsed via parseLocale (en -> en, vi -> vi, anything else -> vi)
 */
export function resolveEffectiveLocale(
  persistedLocale: Locale | undefined,
  osLocaleCandidate?: string,
): Locale {
  if (persistedLocale && isLocale(persistedLocale)) {
    return persistedLocale;
  }
  const osLocale =
    osLocaleCandidate ??
    (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function'
      ? Intl.DateTimeFormat().resolvedOptions().locale
      : undefined);
  return parseLocale(osLocale);
}
