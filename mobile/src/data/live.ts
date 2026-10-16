import {
  liveEmpty,
  liveError,
  parseDataset,
  parseDatasetV2,
  MAX_BODY_BYTES,
  type SourceState,
  type DemoDatasetV2,
} from './sourceState.ts';
import { type Locale } from './locale.ts';

const DEFAULT_TIMEOUT_MS = 8000;
const DATASET_PATH = '/api/dataset';
const DATASET_V2_PATH = '/api/v2/dataset';

type FetchImpl = (url: string, init: { signal: AbortSignal }) => Promise<Response>;

export type LiveOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: FetchImpl;
  signal?: AbortSignal;
};

export function getUtf8ByteLength(text: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text).length;
  }
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code <= 0x7f) {
      bytes += 1;
    } else if (code <= 0x7ff) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      i++;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

/**
 * The live URL comes from the environment first so each environment can point
 * somewhere else without a code change; app.json is the fallback.
 * Strictly enforces HTTP(S) with no credentials, query parameters, or fragments.
 */
export function readLiveConfig(
  env: Record<string, string | undefined>,
  extra: Record<string, unknown> | undefined,
): string | undefined {
  const fromEnv = env.EXPO_PUBLIC_NGOKE_API_BASE_URL?.trim();
  const fromExtra = typeof extra?.apiBaseUrl === 'string' ? extra.apiBaseUrl.trim() : undefined;
  const raw = fromEnv !== undefined && fromEnv.length > 0 ? fromEnv : fromExtra;
  if (raw === undefined || raw.length === 0) {
    return undefined;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return undefined;
    }
    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
      return undefined;
    }
    return raw.replace(/\/+$/, '');
  } catch {
    return undefined;
  }
}

/**
 * Load the dataset for live mode. Every failure keeps the mode as live and
 * never falls back to the bundled fixture.
 */
export async function loadLiveSource(options: LiveOptions): Promise<SourceState> {
  const rawBase = options.baseUrl?.trim();
  if (rawBase === undefined || rawBase.length === 0) {
    return liveEmpty('no-config');
  }

  let cleanUrl: string;
  let safeOrigin: string;
  try {
    const parsed = new URL(rawBase);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return liveError('shape');
    }
    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
      return liveError('shape');
    }
    cleanUrl = rawBase.replace(/\/+$/, '');
    safeOrigin = parsed.origin;
  } catch {
    return liveError('shape');
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const doFetch: FetchImpl = options.fetchImpl ?? ((url, init) => fetch(url, init));
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onExternalAbort = () => {
    controller.abort();
  };

  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timer);
      controller.abort();
    } else {
      options.signal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  try {
    const response = await doFetch(`${cleanUrl}${DATASET_PATH}`, { signal: controller.signal });
    if (response.status === 404) {
      return liveEmpty('no-data');
    }
    if (!response.ok) {
      return liveError('http');
    }

    const contentLengthHeader = response.headers?.get?.('content-length');
    if (contentLengthHeader !== null && contentLengthHeader !== undefined) {
      const parsedLength = parseInt(contentLengthHeader, 10);
      if (Number.isFinite(parsedLength) && parsedLength > MAX_BODY_BYTES) {
        return liveError('shape');
      }
    }

    let text: string;
    if (typeof response.text === 'function') {
      text = await response.text();
    } else if (typeof response.json === 'function') {
      const jsonVal = await response.json();
      text = JSON.stringify(jsonVal);
    } else {
      return liveError('shape');
    }

    const actualBytes = getUtf8ByteLength(text);
    if (actualBytes > MAX_BODY_BYTES) {
      return liveError('shape');
    }

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return liveError('shape');
    }

    const dataset = parseDataset(body, { mode: 'live' });
    if (dataset === undefined) {
      return liveError('shape');
    }

    const title = dataset.kind === 'reviewed'
      ? `Live · ${dataset.nodes.length} điểm đã duyệt`
      : `Live · ${dataset.nodes.length} điểm mô phỏng (chưa xác minh)`;

    return {
      mode: 'live',
      status: 'ready',
      title,
      detail: `Nguồn: ${safeOrigin}. Dữ liệu live không lưu trong app.`,
      dataset,
    };
  } catch {
    if (options.signal?.aborted) {
      return liveError('network');
    }
    if (timedOut) {
      return liveError('timeout');
    }
    return liveError('network');
  } finally {
    clearTimeout(timer);
    if (options.signal) {
      options.signal.removeEventListener('abort', onExternalAbort);
    }
  }
}

loadLiveSource.defaultTimeoutMs = DEFAULT_TIMEOUT_MS;

export type LiveOptionsV2 = LiveOptions & {
  locale: Locale;
};

export async function loadLiveSourceV2(options: LiveOptionsV2): Promise<SourceState<DemoDatasetV2>> {
  const locale = options.locale;
  const rawBase = options.baseUrl?.trim();
  if (rawBase === undefined || rawBase.length === 0) {
    return liveEmpty<DemoDatasetV2>('no-config', locale);
  }

  let cleanUrl: string;
  let safeOrigin: string;
  try {
    const parsed = new URL(rawBase);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return liveError<DemoDatasetV2>('shape', locale);
    }
    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
      return liveError<DemoDatasetV2>('shape', locale);
    }
    cleanUrl = rawBase.replace(/\/+$/, '');
    safeOrigin = parsed.origin;
  } catch {
    return liveError<DemoDatasetV2>('shape', locale);
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const doFetch: FetchImpl = options.fetchImpl ?? ((url, init) => fetch(url, init));
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onExternalAbort = () => {
    controller.abort();
  };

  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timer);
      controller.abort();
    } else {
      options.signal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  try {
    const url = `${cleanUrl}${DATASET_V2_PATH}?locale=${encodeURIComponent(locale)}`;
    const response = await doFetch(url, { signal: controller.signal });
    if (response.status === 404) {
      return liveEmpty<DemoDatasetV2>('no-data', locale);
    }
    if (response.status === 503) {
      return liveError<DemoDatasetV2>('shape', locale);
    }
    if (!response.ok) {
      return liveError<DemoDatasetV2>('http', locale);
    }

    const contentLanguage = response.headers?.get?.('content-language');
    if (contentLanguage !== null && contentLanguage !== undefined && contentLanguage.toLowerCase() !== locale) {
      return liveError<DemoDatasetV2>('shape', locale);
    }

    const contentLengthHeader = response.headers?.get?.('content-length');
    if (contentLengthHeader !== null && contentLengthHeader !== undefined) {
      const parsedLength = parseInt(contentLengthHeader, 10);
      if (Number.isFinite(parsedLength) && parsedLength > MAX_BODY_BYTES) {
        return liveError<DemoDatasetV2>('shape', locale);
      }
    }

    let text: string;
    if (typeof response.text === 'function') {
      text = await response.text();
    } else if (typeof response.json === 'function') {
      const jsonVal = await response.json();
      text = JSON.stringify(jsonVal);
    } else {
      return liveError<DemoDatasetV2>('shape', locale);
    }

    const actualBytes = getUtf8ByteLength(text);
    if (actualBytes > MAX_BODY_BYTES) {
      return liveError<DemoDatasetV2>('shape', locale);
    }

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return liveError<DemoDatasetV2>('shape', locale);
    }

    const dataset = parseDatasetV2(body, { mode: 'live', expectedLocale: locale });
    if (dataset === undefined) {
      return liveError<DemoDatasetV2>('shape', locale);
    }

    const title = locale === 'en'
      ? (dataset.kind === 'reviewed'
          ? `Live · ${dataset.nodes.length} reviewed points`
          : `Live · ${dataset.nodes.length} simulated points (unverified)`)
      : (dataset.kind === 'reviewed'
          ? `Live · ${dataset.nodes.length} điểm đã duyệt`
          : `Live · ${dataset.nodes.length} điểm mô phỏng (chưa xác minh)`);

    const detail = locale === 'en'
      ? `Source: ${safeOrigin}. Live data is not stored on the device.`
      : `Nguồn: ${safeOrigin}. Dữ liệu live không lưu trong app.`;

    return {
      mode: 'live',
      status: 'ready',
      title,
      detail,
      dataset,
    };
  } catch {
    if (options.signal?.aborted) {
      return liveError<DemoDatasetV2>('network', locale);
    }
    if (timedOut) {
      return liveError<DemoDatasetV2>('timeout', locale);
    }
    return liveError<DemoDatasetV2>('network', locale);
  } finally {
    clearTimeout(timer);
    if (options.signal) {
      options.signal.removeEventListener('abort', onExternalAbort);
    }
  }
}

loadLiveSourceV2.defaultTimeoutMs = DEFAULT_TIMEOUT_MS;