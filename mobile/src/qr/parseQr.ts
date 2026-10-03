const SCHEME = 'ngo-ke://node/';

/** Accept only the project's own QR format for a point that exists. */
export function parseQrNodeId(payload: string): string | undefined {
  const trimmed = payload.trim();
  if (!trimmed.startsWith(SCHEME)) {
    return undefined;
  }
  const id = trimmed.slice(SCHEME.length);
  return /^[a-z0-9][a-z0-9-]*$/.test(id) ? id : undefined;
}