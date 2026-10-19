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

import { canonicalDatasetJson } from './canonicalJson.ts';

const DEFAULT_TIMEOUT_MS = 8000;
const DATASET_PATH = '/api/dataset';
const DATASET_V2_PATH = '/api/v2/dataset';

type FetchImpl = (url: string, init: { signal: AbortSignal }) => Promise<Response>;

export type LiveOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: FetchImpl;
  signal?: AbortSignal;
  digestImpl?: (canonicalJson: string) => Promise<string>;
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

function isNoReviewedDataEnvelope(body: unknown): boolean {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return false;
  }
  const record = body as Record<string, unknown>;
  if (
    record.error &&
    typeof record.error === 'object' &&
    record.error !== null &&
    !Array.isArray(record.error)
  ) {
    const err = record.error as Record<string, unknown>;
    return err.code === 'NO_REVIEWED_DATA';
  }
  return false;
}

async function readBodyTextSafe(
  response: Response | { text?: () => Promise<string>; json?: () => Promise<unknown> },
): Promise<string> {
  if (typeof response.text === 'function') {
    return response.text();
  }
  if (typeof response.json === 'function') {
    const jsonVal = await response.json();
    return JSON.stringify(jsonVal);
  }
  throw new Error('UNREADABLE_BODY');
}

export async function loadLiveSourceV2(options: LiveOptionsV2): Promise<SourceState<DemoDatasetV2>> {
  const locale = options.locale;

  // 1. Pre-aborted signal check: zero requests if caller already aborted
  if (options.signal?.aborted) {
    return liveError<DemoDatasetV2>('network', locale);
  }

  // 2. Base URL validation
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
  const startTime = Date.now();
  const doFetch: FetchImpl = options.fetchImpl ?? ((url, init) => fetch(url, init));
  const controller = new AbortController();

  let timer: ReturnType<typeof setTimeout> | undefined;
  let timedOut = false;
  let externalAborted = false;

  const deadlinePromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      try {
        controller.abort();
      } catch {
        // ignore
      }
      const err = new Error('TIMEOUT');
      err.name = 'TimeoutError';
      reject(err);
    }, timeoutMs);
  });

  let removeExternalAbort: (() => void) | undefined;
  const externalAbortPromise = new Promise<never>((_, reject) => {
    if (options.signal) {
      const onAbort = () => {
        externalAborted = true;
        try {
          controller.abort();
        } catch {
          // ignore
        }
        const err = new Error('EXTERNAL_ABORT');
        err.name = 'AbortError';
        reject(err);
      };
      if (options.signal.aborted) {
        onAbort();
      } else {
        options.signal.addEventListener('abort', onAbort, { once: true });
        removeExternalAbort = () => {
          options.signal?.removeEventListener('abort', onAbort);
        };
      }
    }
  });

  try {
    const url = `${cleanUrl}${DATASET_V2_PATH}?locale=${encodeURIComponent(locale)}`;

    // Race fetch against deadline and external abort
    const fetchPromise = doFetch(url, { signal: controller.signal });
    const response = await Promise.race([fetchPromise, deadlinePromise, externalAbortPromise]);

    // Handle 404
    if (response.status === 404) {
      const contentLengthHeader = response.headers?.get?.('content-length');
      if (contentLengthHeader !== null && contentLengthHeader !== undefined) {
        const parsedLength = parseInt(contentLengthHeader, 10);
        if (Number.isFinite(parsedLength) && parsedLength > MAX_BODY_BYTES) {
          return liveError<DemoDatasetV2>('shape', locale);
        }
      }

      let text: string;
      try {
        text = await Promise.race([readBodyTextSafe(response), deadlinePromise, externalAbortPromise]);
      } catch (err: unknown) {
        if (options.signal?.aborted || externalAborted || (err instanceof Error && err.name === 'AbortError')) {
          return liveError<DemoDatasetV2>('network', locale);
        }
        if (timedOut || (err instanceof Error && err.name === 'TimeoutError') || Date.now() - startTime >= timeoutMs) {
          return liveError<DemoDatasetV2>('timeout', locale);
        }
        return liveError<DemoDatasetV2>('shape', locale);
      }

      if (getUtf8ByteLength(text) > MAX_BODY_BYTES) {
        return liveError<DemoDatasetV2>('shape', locale);
      }

      let errorBody: unknown;
      try {
        errorBody = JSON.parse(text);
      } catch {
        return liveError<DemoDatasetV2>('shape', locale);
      }

      if (options.signal?.aborted || externalAborted) {
        return liveError<DemoDatasetV2>('network', locale);
      }
      if (timedOut || Date.now() - startTime >= timeoutMs) {
        return liveError<DemoDatasetV2>('timeout', locale);
      }

      if (isNoReviewedDataEnvelope(errorBody)) {
        return liveEmpty<DemoDatasetV2>('no-data', locale);
      }

      return liveError<DemoDatasetV2>('http', locale);
    }

    if (response.status !== 200) {
      if (response.status === 503) {
        let isDatasetInvalid = false;
        try {
          const text = await Promise.race([readBodyTextSafe(response), deadlinePromise, externalAbortPromise]);
          if (getUtf8ByteLength(text) <= MAX_BODY_BYTES) {
            const body = JSON.parse(text);
            if (
              typeof body === 'object' &&
              body !== null &&
              !Array.isArray(body) &&
              typeof (body as Record<string, unknown>).error === 'object' &&
              (body as Record<string, unknown>).error !== null &&
              ((body as Record<string, unknown>).error as Record<string, unknown>).code === 'DATASET_INVALID'
            ) {
              isDatasetInvalid = true;
            }
          }
        } catch {
          // ignore read/parse error; defaults to http
        }

        if (options.signal?.aborted || externalAborted) {
          return liveError<DemoDatasetV2>('network', locale);
        }
        if (timedOut || Date.now() - startTime >= timeoutMs) {
          return liveError<DemoDatasetV2>('timeout', locale);
        }

        return isDatasetInvalid
          ? liveError<DemoDatasetV2>('shape', locale)
          : liveError<DemoDatasetV2>('http', locale);
      }
      return liveError<DemoDatasetV2>('http', locale);
    }

    // Status 200: Content-Language is REQUIRED and must exact match requested locale
    const contentLanguage = response.headers?.get?.('content-language')?.trim();
    if (!contentLanguage || contentLanguage.toLowerCase() !== locale) {
      return liveError<DemoDatasetV2>('shape', locale);
    }

    const contentLengthHeader = response.headers?.get?.('content-length');
    if (contentLengthHeader !== null && contentLengthHeader !== undefined) {
      const parsedLength = parseInt(contentLengthHeader, 10);
      if (Number.isFinite(parsedLength) && parsedLength > MAX_BODY_BYTES) {
        return liveError<DemoDatasetV2>('shape', locale);
      }
    }

    const text = await Promise.race([readBodyTextSafe(response), deadlinePromise, externalAbortPromise]);

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

    // Compute dataset revision via canonical JSON hashing within the same overall deadline
    if (typeof options.digestImpl !== 'function') {
      return liveError<DemoDatasetV2>('shape', locale);
    }

    const canonicalJson = canonicalDatasetJson(dataset);
    let rawRevision: unknown;
    try {
      rawRevision = await Promise.race([
        options.digestImpl(canonicalJson),
        deadlinePromise,
        externalAbortPromise,
      ]);
    } catch (err: unknown) {
      if (options.signal?.aborted || externalAborted || (err instanceof Error && err.name === 'AbortError')) {
        return liveError<DemoDatasetV2>('network', locale);
      }
      if (timedOut || (err instanceof Error && err.name === 'TimeoutError') || Date.now() - startTime >= timeoutMs) {
        return liveError<DemoDatasetV2>('timeout', locale);
      }
      return liveError<DemoDatasetV2>('shape', locale);
    }

    // Final guard before returning ready: check external abort and elapsed deadline
    if (options.signal?.aborted || externalAborted) {
      return liveError<DemoDatasetV2>('network', locale);
    }
    if (timedOut || Date.now() - startTime >= timeoutMs) {
      return liveError<DemoDatasetV2>('timeout', locale);
    }

    if (typeof rawRevision !== 'string') {
      return liveError<DemoDatasetV2>('shape', locale);
    }
    const revision = rawRevision.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(revision)) {
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
      revision,
    };
  } catch (err: unknown) {
    if (options.signal?.aborted || externalAborted || (err instanceof Error && err.name === 'AbortError')) {
      return liveError<DemoDatasetV2>('network', locale);
    }
    if (timedOut || (err instanceof Error && err.name === 'TimeoutError') || Date.now() - startTime >= timeoutMs) {
      return liveError<DemoDatasetV2>('timeout', locale);
    }
    return liveError<DemoDatasetV2>('network', locale);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    if (removeExternalAbort !== undefined) {
      removeExternalAbort();
    }
  }
}

loadLiveSourceV2.defaultTimeoutMs = DEFAULT_TIMEOUT_MS;