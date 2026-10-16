import { File, Paths } from 'expo-file-system';
import type { Locale } from './locale';
import {
  LOCALE_FILENAME,
  formatPersistedLocale,
  parsePersistedLocale,
} from './localeStorageCore';

export * from './localeStorageCore';

/**
 * Reads the persisted manual locale choice from Paths.document.
 * Returns undefined if the file doesn't exist, is unreadable, or contains corrupt data.
 */
export async function readPersistedLocaleAsync(): Promise<Locale | undefined> {
  try {
    const file = new File(Paths.document, LOCALE_FILENAME);
    if (!file.exists) {
      return undefined;
    }
    const text = await file.text();
    return parsePersistedLocale(text);
  } catch {
    return undefined;
  }
}

/**
 * Writes the manual locale choice to Paths.document in an isolated JSON file.
 * Returns true if successful, false on error without throwing.
 */
export async function writePersistedLocaleAsync(locale: Locale): Promise<boolean> {
  try {
    const file = new File(Paths.document, LOCALE_FILENAME);
    if (!file.exists) {
      file.create();
    }
    file.write(formatPersistedLocale(locale));
    return true;
  } catch {
    return false;
  }
}
