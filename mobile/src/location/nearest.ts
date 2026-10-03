import type { DemoNode } from '../data/sourceState.ts';

export type Position = { latitude: number; longitude: number; accuracy?: number };

export type Limits = { maxAccuracyMeters: number; maxDistanceMeters: number };

export type Candidate =
  | { kind: 'needs-position' }
  | { kind: 'poor-accuracy'; accuracy: number }
  | { kind: 'no-coordinates' }
  | { kind: 'outside-cluster'; distanceMeters: number }
  | { kind: 'candidate'; node: DemoNode; distanceMeters: number; accuracy: number };

const EARTH_RADIUS_M = 6_371_000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const deltaLat = toRadians(b.latitude - a.latitude);
  const deltaLng = toRadians(b.longitude - a.longitude);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(haversine));
}

/**
 * Suggest at most one point. The result is always a hint: nothing here changes
 * the current point, that is the user's confirmation to do.
 */
export function pickCandidate(
  nodes: readonly DemoNode[],
  position: Position | undefined,
  limits: Limits,
): Candidate {
  if (position === undefined) {
    return { kind: 'needs-position' };
  }
  const accuracy = position.accuracy ?? 0;
  if (accuracy > limits.maxAccuracyMeters) {
    return { kind: 'poor-accuracy', accuracy };
  }

  const located = nodes
    .filter(
      (node) =>
        node.available
        && Number.isFinite(node.latitude)
        && Number.isFinite(node.longitude),
    )
    .map((node) => ({
      node,
      distanceMeters: distanceMeters(position, {
        latitude: node.latitude,
        longitude: node.longitude,
      }),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  const nearest = located[0];
  if (nearest === undefined) {
    return { kind: 'no-coordinates' };
  }
  if (nearest.distanceMeters > limits.maxDistanceMeters) {
    return { kind: 'outside-cluster', distanceMeters: nearest.distanceMeters };
  }
  return {
    kind: 'candidate',
    node: nearest.node,
    distanceMeters: nearest.distanceMeters,
    accuracy,
  };
}