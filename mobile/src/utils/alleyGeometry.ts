import type { DemoNode } from '../data/sourceState';

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface ComputedTrailPin {
  id: string;
  order: number;
  alongAlleyMeters: number;
  x: number;
  y: number;
  xPct: number;
  yPct: number;
  side: 'left' | 'right';
  icon: string;
}

export interface AlleyLayoutResult {
  canvasPolyline: CanvasPoint[];
  splinePoints: CanvasPoint[];
  pins: ComputedTrailPin[];
}

export interface SchematicTrailPin {
  id: string;
  xPct: number;
  yPct: number;
  side: 'left' | 'right';
}

export interface SchematicTrailLayoutResult {
  pins: SchematicTrailPin[];
  splinePoints: CanvasPoint[];
}

export function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) {
    return '';
  }
  const first = points[0];
  if (!first) {
    return '';
  }
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)] ?? points[0];
    const p1 = points[i] ?? points[0];
    const p2 = points[i + 1] ?? points[points.length - 1];
    const p3 = points[Math.min(points.length - 1, i + 2)] ?? points[points.length - 1];

    if (!p0 || !p1 || !p2 || !p3) {
      continue;
    }

    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function computeAlleyLayout(
  polyline: [number, number][],
  nodes: DemoNode[],
  canvasWidth: number,
  canvasHeight: number,
  lengthMeters?: number,
): AlleyLayoutResult {
  if (!polyline || polyline.length < 2) {
    return { canvasPolyline: [], splinePoints: [], pins: [] };
  }

  const firstCoord = polyline[0]!;
  const mPerLat = 111139;
  const mPerLon = 111139 * Math.cos((firstCoord[0] * Math.PI) / 180);

  const localPts = polyline.map(([lat, lon]) => ({
    x: (lon - firstCoord[1]) * mPerLon,
    y: (lat - firstCoord[0]) * mPerLat,
  }));

  const last = localPts[localPts.length - 1]!;
  const angle = Math.atan2(last.y, last.x);
  const rot = Math.PI / 2 - angle;

  const rotPts = localPts.map((p) => ({
    x: p.x * Math.cos(rot) - p.y * Math.sin(rot),
    y: p.x * Math.sin(rot) + p.y * Math.cos(rot),
  }));

  const cumLens: number[] = [0];
  for (let i = 0; i < localPts.length - 1; i++) {
    const cur = localPts[i]!;
    const next = localPts[i + 1]!;
    const d = Math.hypot(next.x - cur.x, next.y - cur.y);
    cumLens.push((cumLens[i] ?? 0) + d);
  }
  const polylineTotalLength = cumLens[cumLens.length - 1] ?? 1;
  const totalLen = lengthMeters && lengthMeters > 0 ? lengthMeters : polylineTotalLength;

  const knownAnchors: Array<{ ord: number; m: number }> = [];
  nodes.forEach((n, idx) => {
    const ord = n.order ?? idx + 1;
    if (typeof n.alongAlleyMeters === 'number' && Number.isFinite(n.alongAlleyMeters)) {
      knownAnchors.push({ ord, m: n.alongAlleyMeters });
    }
  });

  const anchors = [
    { ord: 0, m: 0 },
    ...knownAnchors,
    { ord: nodes.length + 1, m: totalLen },
  ].sort((a, b) => a.ord - b.ord);

  const nodeDistances = nodes.map((n, idx) => {
    const ord = n.order ?? idx + 1;
    if (typeof n.alongAlleyMeters === 'number' && Number.isFinite(n.alongAlleyMeters)) {
      return n.alongAlleyMeters;
    }
    let prev = anchors[0]!;
    let next = anchors[anchors.length - 1]!;
    for (let i = 0; i < anchors.length; i++) {
      const cur = anchors[i]!;
      if (cur.ord < ord && cur.ord >= prev.ord) prev = cur;
      if (cur.ord > ord && cur.ord <= next.ord) {
        next = cur;
        break;
      }
    }
    const spanOrd = next.ord - prev.ord;
    const frac = spanOrd > 0 ? (ord - prev.ord) / spanOrd : 0;
    return prev.m + frac * (next.m - prev.m);
  });

  const yMin = Math.min(...rotPts.map((p) => p.y));
  const yMax = Math.max(...rotPts.map((p) => p.y));
  const xMin = Math.min(...rotPts.map((p) => p.x));
  const xMax = Math.max(...rotPts.map((p) => p.x));
  const dY = Math.max(1, yMax - yMin);
  const dX = Math.max(1, xMax - xMin);

  const yTop = canvasHeight * 0.08;
  const yBottom = canvasHeight * 0.88;
  const hTarget = yBottom - yTop;
  let scale = hTarget / dY;

  const maxW = canvasWidth * 0.45;
  if (scale * dX > maxW) {
    scale = maxW / dX;
  }

  const xMid = (xMin + xMax) / 2;
  const xCenter = canvasWidth * 0.5;

  const toCanvas = (p: { x: number; y: number }): CanvasPoint => ({
    x: xCenter + (p.x - xMid) * scale,
    y: yTop + (p.y - yMin) * scale,
  });

  const canvasPolyline = rotPts.map(toCanvas);

  function getPointAtMeter(m: number): CanvasPoint {
    const targetM = polylineTotalLength > 0 ? (m / totalLen) * polylineTotalLength : m;
    let idx = 0;
    while (idx < cumLens.length - 2 && (cumLens[idx + 1] ?? 0) < targetM) {
      idx++;
    }
    const c0 = cumLens[idx] ?? 0;
    const c1 = cumLens[idx + 1] ?? polylineTotalLength;
    const segLen = c1 - c0;
    const t = segLen > 0 ? (targetM - c0) / segLen : 0;
    const clampedT = Math.max(0, Math.min(1, t));
    const p1 = rotPts[idx]!;
    const p2 = rotPts[idx + 1] ?? p1;
    return toCanvas({
      x: p1.x + clampedT * (p2.x - p1.x),
      y: p1.y + clampedT * (p2.y - p1.y),
    });
  }

  const ICONS = ['🚪', '📜', '🏮', '🍲', '🏮', '🚩'];

  const pins: ComputedTrailPin[] = nodes.map((n, i) => {
    const dist = nodeDistances[i] ?? 0;
    const pt = getPointAtMeter(dist);
    return {
      id: n.id,
      order: n.order ?? i + 1,
      alongAlleyMeters: dist,
      x: pt.x,
      y: pt.y,
      xPct: pt.x / canvasWidth,
      yPct: pt.y / canvasHeight,
      side: i % 2 === 0 ? 'right' : 'left',
      icon: ICONS[i % ICONS.length] ?? '📍',
    };
  });

  const firstCanvas = canvasPolyline[0]!;
  const lastCanvas = canvasPolyline[canvasPolyline.length - 1]!;
  const splinePoints: CanvasPoint[] = [
    { x: firstCanvas.x, y: 0 },
    ...canvasPolyline,
    { x: lastCanvas.x, y: canvasHeight },
  ];

  return {
    canvasPolyline,
    splinePoints,
    pins,
  };
}

/**
 * Place real node IDs on a schematic sequence when no surveyed polyline exists.
 * This is visual ordering only; it does not represent geographic coordinates,
 * distance, or a navigable route.
 */
export function computeSchematicTrailLayout(
  nodes: readonly { id: string }[],
  canvasWidth: number,
  canvasHeight: number,
): SchematicTrailLayoutResult {
  if (
    !nodes
    || nodes.length === 0
    || !Number.isFinite(canvasWidth)
    || canvasWidth <= 0
    || !Number.isFinite(canvasHeight)
    || canvasHeight <= 0
  ) {
    return { pins: [], splinePoints: [] };
  }

  if (nodes.length === 1) {
    const pin: SchematicTrailPin = {
      id: nodes[0]!.id,
      xPct: 0.5,
      yPct: 0.5,
      side: 'right',
    };
    return {
      pins: [pin],
      splinePoints: [
        { x: canvasWidth * 0.5, y: 0 },
        { x: canvasWidth * pin.xPct, y: canvasHeight * pin.yPct },
        { x: canvasWidth * 0.5, y: canvasHeight },
      ],
    };
  }

  const startY = 0.15;
  const endY = 0.85;
  const stepY = (endY - startY) / (nodes.length - 1);
  const pins = nodes.map((node, index): SchematicTrailPin => {
    const side = index % 2 === 0 ? 'right' : 'left';
    return {
      id: node.id,
      xPct: side === 'right' ? 0.56 : 0.44,
      yPct: startY + index * stepY,
      side,
    };
  });

  return {
    pins,
    splinePoints: [
      { x: canvasWidth * 0.5, y: 0 },
      ...pins.map((pin) => ({ x: canvasWidth * pin.xPct, y: canvasHeight * pin.yPct })),
      { x: canvasWidth * 0.5, y: canvasHeight },
    ],
  };
}
