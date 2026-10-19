# Voice gateway API contract

This contract is for the local Voice-only gateway. It accepts a microphone clip, returns a Vietnamese or English transcript from the pinned local Whisper worker, and does not call a hosted ASR service or an LLM.

## Health

`GET /health` returns `200` only after the Python worker loads. The response includes Node, `faster-whisper==1.2.1`, model ID, and immutable model revision.

## Transcribe

`POST /v1/transcribe` accepts `multipart/form-data` with:

| Field | Required | Rule |
| --- | --- | --- |
| `audio` | Yes | One audio file. Native app sends M4A/AAC as `audio/mp4`; WAV/PCM is accepted for local tests. The server verifies the file signature and probes the actual stream. |
| `turnId` | Yes | 8–80 ASCII letters, digits, or hyphens. Echoed in the response. |
| `locale` | Yes | `vi` or `en`. The worker decodes using the requested language. |
| `nodeId` | Yes | 1–80 ASCII letters, digits, `_`, or `-`. It is context only; the server never chooses an answer. |
| `mode` | Yes | `demo` or `live`, echoed unchanged. |
| `datasetRevision` | Yes | 1–128 characters, echoed unchanged for client-side stale-turn checks. |

Successful response (`200`):

```json
{
  "turnId": "m4t7x-abc123",
  "locale": "vi",
  "mode": "demo",
  "nodeId": "demo-02",
  "datasetRevision": "<active-revision>",
  "durationSeconds": 4.2,
  "decoderLanguage": "vi",
  "text": "Câu vừa được nhận dạng"
}
```

The gateway requires the worker's language to equal the requested locale; a mismatch returns HTTP `502` with `ASR_LANGUAGE_MISMATCH`. The app requires every context field to equal the active turn before using `text`; an English turn also requires `decoderLanguage === 'en'`. It then looks up only the active node's fixed Q&A and aliases through the existing matcher. An unknown transcript is not fuzzy-matched to another question or chapter.

## Validation and service limits

- Raw multipart body: 16 MiB maximum; audio file: 12 MiB maximum.
- Actual stream duration: 0.5–20 seconds; sample rate 8–96 kHz; 1–2 channels; AAC or PCM WAV only. The app stops capture at 20 seconds and waits for the user to tap Gửi; the gateway independently enforces the same duration.
- Per source IP: 12 requests per minute; no more than two ASR jobs in flight; each ASR request times out after 45 seconds.
- If the client disconnects during ASR, the gateway drops that request from the response map. The persistent Python worker cannot preempt a transcription already running; it finishes that clip, its result is ignored, and the worker removes the temporary file in `finally`. A retry is a new user turn with new context.
- Input bytes, MIME type, codec, sample rate, channel count, and duration are validated server-side. Client-reported duration and filename are not trusted.
- Temporary probe files are deleted in `finally`; the Python worker deletes its temporary clip after transcription. The model cache remains local for reuse.
- Logs contain status, error code, and elapsed time only. They do not contain audio, transcript, filename, or request fields.

Errors are JSON `{ "turnId": "…", "code": "…" }` with these codes: `INVALID_REQUEST`, `UNSUPPORTED_CONTENT_TYPE`, `INVALID_MULTIPART`, `MISSING_AUDIO`, `PAYLOAD_TOO_LARGE`, `AUDIO_SIZE_LIMIT`, `UNSUPPORTED_AUDIO_FORMAT`, `INVALID_AUDIO`, `AUDIO_TOO_SHORT`, `AUDIO_TOO_LONG`, `RATE_LIMITED`, `ASR_BUSY`, `ASR_TIMEOUT`, `ASR_UNAVAILABLE`, `NO_SPEECH`, `INVALID_ASR_RESPONSE`, and `ASR_LANGUAGE_MISMATCH`. The client retries only after the user starts another voice turn.

## Runtime and network boundary

The gateway requires Node.js 24+, Python 3.11, `ffprobe`, the pinned local model cache, and the `tools/voice/.venv` dependencies. It binds to `127.0.0.1` by default. For a phone on the same trusted Wi-Fi, set `NGOKE_VOICE_HOST=0.0.0.0` and point `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` or `app.json` `extra.voiceApiBaseUrl` at the development machine's private LAN address. The API URL is configuration, not a credential.

This development gateway has no account authentication and uses HTTP on localhost/private LAN. Do not port-forward it or deploy it publicly. HTTPS, authentication, and deployment-specific abuse controls are required before any public exposure; that is outside the authorized scope.

## Model and license

The default worker profile uses `Systran/faster-whisper-small` revision `536b0662742c02347bc0e980a01041f333bce120`, CPU `int8`, and the requested Vietnamese or English locale. An explicit Windows-only `large-v3-cuda` profile uses `Systran/faster-whisper-large-v3` revision `edaa852ec7e145841d8ffdb056a99866b5f0a478`, CUDA `float16`, and hash-pinned optional runtime packages from `tools/voice/requirements-stt-cuda-win.txt`. The worker reports its active profile/device/model from `/health`; selecting a profile never falls back silently. Both model repositories declare MIT; `faster-whisper==1.2.1` is pinned separately in `tools/voice/requirements-stt.txt`. No paid key or cloud quota is used.
