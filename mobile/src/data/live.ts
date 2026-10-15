import {
  liveEmpty,
  liveError,
  parseDataset,
  MAX_BODY_BYTES,
  type SourceState,
} from './sourceState.ts';

const DEFAULT_TIMEOUT_MS = 8000;
const DATASET_PATH = '/api/dataset';

type FetchImpl = (url: string, init: { signal: AbortSignal }) => Promise<Response>;

export type LiveOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: FetchImpl;
  signal?: AbortSignal;
};

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

    const actualBytes = new TextEncoder().encode(text).length;
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