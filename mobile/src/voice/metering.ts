export function meteringToLevel(metering?: number): number {
  if (typeof metering !== 'number' || !Number.isFinite(metering)) return 0;
  return Math.max(0, Math.min(1, (metering + 80) / 80));
}
