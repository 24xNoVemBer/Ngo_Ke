# Local voice gateway

The gateway exposes only `GET /health` and `POST /v1/transcribe`. It requires Node 24+, the local Python 3.11 environment, `ffprobe`, and the cached faster-whisper model. It starts the ASR worker itself and listens on localhost by default.

From the repository root:

```powershell
$env:NGOKE_VOICE_HOST = '127.0.0.1'
$env:NGOKE_VOICE_PORT = '8787'
node tools/voice/gateway/server.mjs
```

For a phone on the same trusted Wi-Fi, set `NGOKE_VOICE_HOST='0.0.0.0'` and set the app's `EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL` to `http://<private-LAN-IP>:8787`; restart Metro after changing the app URL. Do not use a public IP, port-forward, or expose this HTTP gateway to the Internet. It has no auth because it is a local development service; public use requires HTTPS and authentication.

By default, the gateway loads pinned `Systran/faster-whisper-small` on CPU `int8`. Each request is validated, probed with `ffprobe`, transcribed, and returned with the same `turnId`, `nodeId`, `mode`, and `datasetRevision`. Temporary clip files are deleted; transcripts and audio are not logged or retained. The worker never sends an external request.

On this Windows RTX development host, the initial raw model benchmark on 21 synthetic questions matched 19/21 canonical forms with large-v3 CUDA (model-only p50/p95 0.507/0.575 seconds), versus 15/21 with small CPU (1.660/1.837 seconds). After adding two observed transcript forms as exact aliases on their own Q&A entries, the mobile helper → live gateway → production matcher returned 21/21 expected IDs, 0 unknown/wrong/context errors, at full-path p50/p95 570/634 ms. These are synthetic local clips, not a human-speech accuracy claim. To opt in, install the hash-pinned CUDA libraries into the ignored cache, ensure the pinned large-v3 snapshot is present, and start the gateway with:

```powershell
uv pip install --require-hashes --no-deps --target tools/voice/.cache/cuda-runtime --python tools/voice/.venv/Scripts/python.exe -r tools/voice/requirements-stt-cuda-win.txt
$env:NGOKE_VOICE_ASR_PROFILE = 'large-v3-cuda'
node tools/voice/gateway/server.mjs
```

The large model is `Systran/faster-whisper-large-v3` at revision `edaa852ec7e145841d8ffdb056a99866b5f0a478`, CUDA `float16`. The default remains `small-cpu`; an explicitly selected CUDA profile fails startup if its model or local runtime is missing and never silently changes profiles. `/health` reports the active profile, device, compute type, model, and revision. The synthetic score is not a human-speech guarantee; no paid API, cloud key, or user recording is used.

Model: [`Systran/faster-whisper-small`](https://huggingface.co/Systran/faster-whisper-small/tree/536b0662742c02347bc0e980a01041f333bce120), MIT. Runtime library: `faster-whisper==1.2.1`. See [the API contract](../../../docs/VOICE_API_CONTRACT.md).

Run the local end-to-end check after installing the model and FFmpeg:

```powershell
node tools/voice/gateway/smoke_test.mjs
```

It starts the worker on loopback, sends the locally generated WAV and the tracked synthetic AAC/M4A fixture at `test-fixtures/ios-aac-smoke.m4a`, verifies response context and non-empty transcripts, aborts a transcription and confirms the next turn succeeds, checks format/duration/silence guards, and exhausts the source-IP quota to verify `429 RATE_LIMITED`.
