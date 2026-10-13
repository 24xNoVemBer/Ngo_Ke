export function readVoiceApiBaseUrl(
  env: Record<string, string | undefined>,
  extra: Record<string, unknown> | undefined,
): string | undefined {
  const fromEnv = env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL?.trim();
  const fromExtra = typeof extra?.voiceApiBaseUrl === 'string' ? extra.voiceApiBaseUrl.trim() : undefined;
  const base = fromEnv && fromEnv.length > 0 ? fromEnv : fromExtra;
  return base && base.length > 0 ? base.replace(/\/+$/, '') : undefined;
}
