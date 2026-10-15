import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = fileURLToPath(new URL('../', import.meta.url));

export function readConfig(env = process.env) {
  const portText = env.PORT ?? '8086';
  if (!/^\d+$/.test(portText) || Number(portText) < 1 || Number(portText) > 65535) {
    throw new Error('Invalid config: PORT must be 1..65535');
  }
  const host = env.HOST ?? '127.0.0.1';
  if (!host.trim()) throw new Error('Invalid config: HOST cannot be empty');
  const dbPath = env.DB_PATH ?? 'var/ngoke.sqlite';
  if (!dbPath.trim() || dbPath === ':memory:') throw new Error('Invalid config: DB_PATH must be a persistent file');
  const serve = env.SERVE_SIMULATED_DATA ?? 'false';
  if (!['true', 'false'].includes(serve)) throw new Error('Invalid config: SERVE_SIMULATED_DATA must be true or false');
  return { host, port: Number(portText), dbPath: resolve(backendRoot, dbPath), serveSimulatedData: serve === 'true' };
}
