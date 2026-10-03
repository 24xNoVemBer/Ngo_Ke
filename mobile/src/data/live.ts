import { liveEmpty, liveError, parseDataset, type SourceState } from './sourceState.ts';

const DEFAULT_TIMEOUT_MS = 8000;
const DATASET_PATH = '/api/dataset';

type FetchImpl = (url: string, init: { signal: AbortSignal }) => Promise<Response>;

export type LiveOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: FetchImpl;
};

/**
 * The live URL comes from the environment first so each environment can point
 * somewhere else without a code change; app.json is the fallback.
 */
export function readLiveConfig(
  env: Record<string, string | undefined>,
  extra: Record<string, unknown> | undefined,
): string | undefined {
  const fromEnv = env.EXPO_PUBLIC_NGOKE_API_BASE_URL?.trim();
  const fromExtra = typeof extra?.apiBaseUrl === 'string' ? extra.apiBaseUrl.trim() : undefined;
  const base = fromEnv !== undefined && fromEnv.length > 0 ? fromEnv : fromExtra;
  return base === undefined || base.length === 0 ? undefined : base.replace(/\/+$/, '');
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    // A body that is not JSON is a data problem, not a connection problem.
    return undefined;
  }
}

/**
 * Load the dataset for live mode. Every failure keeps the mode as live and
 * never falls back to the bundled fixture.
 */
export async function loadLiveSource(options: LiveOptions): Promise<SourceState> {
  const baseUrl = options.baseUrl?.replace(/\/+$/, '');
  if (baseUrl === undefined || baseUrl.length === 0) {
    return liveEmpty('no-config');
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const doFetch: FetchImpl = options.fetchImpl ?? ((url, init) => fetch(url, init));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await doFetch(`${baseUrl}${DATASET_PATH}`, { signal: controller.signal });
    if (response.status === 404) {
      return liveEmpty('no-data');
    }
    if (!response.ok) {
      return liveError('http');
    }
    const body = await readJson(response);
    if (body === undefined) {
      return liveError('shape');
    }
    const dataset = parseDataset(body);
    if (dataset === undefined) {
      const nodes = (body as { nodes?: unknown } | null)?.nodes;
      return Array.isArray(nodes) && nodes.length === 0 ? liveEmpty('no-data') : liveError('shape');
    }
    return {
      mode: 'live',
      status: 'ready',
      title: `Live · ${dataset.nodes.length} điểm đã duyệt`,
      detail: `Nguồn: ${baseUrl}${DATASET_PATH}. Dữ liệu live không lưu trong app.`,
      dataset,
    };
  } catch {
    // Our own abort is the only timeout signal we trust; everything else is
    // treated as a connection failure.
    return liveError(controller.signal.aborted ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}

loadLiveSource.defaultTimeoutMs = DEFAULT_TIMEOUT_MS;