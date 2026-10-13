# Local voice gateway

The gateway exposes only `GET /health` and `POST /v1/transcribe`. It requires Node 24+, the local Python 3.11 environment, `ffprobe`, and the cached faster-whisper model. It starts the ASR worker itself and listens on localhost by default.

From the repository root:

```powershell
$env:NGOKE_VOICE_HOST = '127.0.0.1'
$env:NGOKE_VOICE_PORT = '8787'
node tools/voice/gateway/server.mjs
```

For a phone on the same trusted Wi-Fi, set `NGOKE_VOICE_HOST='0.0.0.0'` and set the app's `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` to `http://<private-LAN-IP>:8787`; restart Metro after changing the app URL. Do not use a public IP, port-forward, or expose this HTTP gateway to the Internet. It has no auth because it is a local development service; public use requires HTTPS and authentication.

The first run loads the pinned `Systran/faster-whisper-small` model into memory. Each request is validated, probed with `ffprobe`, transcribed on CPU `int8`, and returned with the same `turnId`, `nodeId`, `mode`, and `datasetRevision`. Temporary clip files are deleted; transcripts and audio are not logged or retained. The worker never sends an external request.

Model: [`Systran/faster-whisper-small`](https://huggingface.co/Systran/faster-whisper-small/tree/536b0662742c02347bc0e980a01041f333bce120), MIT. Runtime library: `faster-whisper==1.2.1`. See [the API contract](../../../docs/VOICE_API_CONTRACT.md).

Run the local end-to-end check after installing the model and FFmpeg:

```powershell
node tools/voice/gateway/smoke_test.mjs
```

It starts the worker on loopback, sends a locally generated synthetic clip, verifies the response context and transcript, and checks that a media-signature mismatch is rejected.
