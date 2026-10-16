export const LOCALES = ['vi', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'vi';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function parseLocale(value: unknown, fallback: Locale = DEFAULT_LOCALE): Locale {
  if (isLocale(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'en' || normalized.startsWith('en-') || normalized.startsWith('en_')) {
      return 'en';
    }
    if (normalized === 'vi' || normalized.startsWith('vi-') || normalized.startsWith('vi_')) {
      return 'vi';
    }
  }
  return fallback;
}

export function assertLocale(value: unknown): asserts value is Locale {
  if (!isLocale(value)) {
    throw new Error(`Unsupported or invalid locale: ${String(value)}`);
  }
}
