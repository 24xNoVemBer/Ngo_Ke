import type { Locale } from '../data/locale';

export type VoiceTranscriptContext = {
  turnId: string;
  locale: Locale;
  mode: 'demo' | 'live';
  nodeId: string;
  datasetRevision: string;
};

type VoiceAudioPart = Blob | { name: string; type: string; bytes: () => Promise<Uint8Array> };

export function createVoiceRequestBody(audioFile: VoiceAudioPart, fileName: string, context: VoiceTranscriptContext): FormData {
  const body = new FormData();
  body.append('audio', audioFile as Blob, fileName);
  body.append('turnId', context.turnId);
  body.append('locale', context.locale);
  body.append('nodeId', context.nodeId);
  body.append('mode', context.mode);
  body.append('datasetRevision', context.datasetRevision);
  return body;
}

export async function transcribeVoiceRequest(
  apiBaseUrl: string,
  body: FormData,
  controller: AbortController,
  context: VoiceTranscriptContext,
  timeoutMs = 45_000,
): Promise<string> {
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl}/v1/transcribe`, { method: 'POST', body, signal: controller.signal });
    } catch (cause) {
      const error = cause instanceof Error ? cause : undefined;
      console.warn('Voice transcription request failed', error?.name ?? 'UnknownError', error?.message.slice(0, 160) ?? '');
      throw new Error(controller.signal.aborted ? 'ASR_TIMEOUT' : 'ASR_UNAVAILABLE', { cause });
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error(controller.signal.aborted ? 'ASR_TIMEOUT' : 'INVALID_RESPONSE');
    }
    const result = payload as {
      code?: string; turnId?: string; locale?: string; mode?: string; nodeId?: string;
      datasetRevision?: string; decoderLanguage?: string; text?: string;
    };
    if (!response.ok) throw new Error(result.code || 'ASR_UNAVAILABLE');
    if (result.turnId !== context.turnId || result.locale !== context.locale || result.mode !== context.mode
        || result.nodeId !== context.nodeId || result.datasetRevision !== context.datasetRevision
        || (context.locale === 'en' && result.decoderLanguage !== 'en')
        || (result.decoderLanguage !== undefined && result.decoderLanguage !== context.locale)
        || typeof result.text !== 'string' || !result.text.trim()) {
      throw new Error('INVALID_RESPONSE');
    }
    return result.text.trim();
  } finally {
    clearTimeout(timeout);
  }
}
