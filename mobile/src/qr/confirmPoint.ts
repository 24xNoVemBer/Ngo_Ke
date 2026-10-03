import type { DemoNode } from '../data/sourceState';
import { parseQrNodeId } from './parseQr.ts';

export type QrConfirmation =
  | { ok: true; node: DemoNode }
  | { ok: false; reason: 'unknown' };

/** A scan only confirms a point; it never changes the current point by itself. */
export function confirmByQr(nodes: readonly DemoNode[], payload: string): QrConfirmation {
  const id = parseQrNodeId(payload);
  const node = id === undefined ? undefined : selectManually(nodes, id);
  return node === undefined ? { ok: false, reason: 'unknown' } : { ok: true, node };
}

export function selectManually(nodes: readonly DemoNode[], id: string): DemoNode | undefined {
  return nodes.find((node) => node.id === id);
}