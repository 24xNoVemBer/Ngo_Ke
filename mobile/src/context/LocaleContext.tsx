import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { Locale } from '../data/locale';
import {
  readPersistedLocaleAsync,
  writePersistedLocaleAsync,
  resolveEffectiveLocale,
} from '../data/localeStorage';
import {
  DEFAULT_COLLECTION_ID,
  type CollectionId,
} from '../data/collections';
import { t, type TranslationKey } from '../i18n/translator';

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  collectionId: CollectionId;
  setCollectionId: (next: CollectionId) => void;
  isReady: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'vi',
  setLocale: () => {},
  collectionId: DEFAULT_COLLECTION_ID,
  setCollectionId: () => {},
  isReady: true,
  t: (key, params) => t('vi', key, params),
});

export function LocaleProvider({
  children,
  initialLocale,
  initialCollectionId = DEFAULT_COLLECTION_ID,
  value: providedValue,
}: {
  children: ReactNode;
  initialLocale?: Locale;
  initialCollectionId?: CollectionId;
  value?: LocaleContextValue;
}): ReactElement {
  if (providedValue) {
    return <LocaleContext.Provider value={providedValue}>{children}</LocaleContext.Provider>;
  }

  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? resolveEffectiveLocale(undefined));
  const [collectionId, setCollectionIdState] = useState<CollectionId>(initialCollectionId);
  const [isReady, setIsReady] = useState(initialLocale !== undefined);
  const manualChoiceRef = useRef(false);

  useEffect(() => {
    if (initialLocale !== undefined) {
      return;
    }
    let cancelled = false;
    readPersistedLocaleAsync().then((saved) => {
      if (!cancelled) {
        if (!manualChoiceRef.current && saved) {
          setLocaleState(saved);
        }
        setIsReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    manualChoiceRef.current = true;
    setLocaleState(next);
    void writePersistedLocaleAsync(next);
  }, []);

  const setCollectionId = useCallback((next: CollectionId) => {
    setCollectionIdState(next);
  }, []);

  const translateKey = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      return t(locale, key, params);
    },
    [locale],
  );

  const value: LocaleContextValue = {
    locale,
    setLocale,
    collectionId,
    setCollectionId,
    isReady,
    t: translateKey,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
