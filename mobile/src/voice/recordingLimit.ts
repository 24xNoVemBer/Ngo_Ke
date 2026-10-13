export const MAX_VOICE_RECORDING_DURATION_MS = 20_000;
const RECORDING_STOP_GUARD_MS = 500;

export function hasReachedVoiceRecordingLimit(durationMs: number): boolean {
  // shortcut: recorder status arrives in batches; stop early to keep the encoded file under the gateway's hard limit.
  return Number.isFinite(durationMs) && durationMs >= MAX_VOICE_RECORDING_DURATION_MS - RECORDING_STOP_GUARD_MS;
}
