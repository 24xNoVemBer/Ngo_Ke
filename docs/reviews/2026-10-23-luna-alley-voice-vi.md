# W3 handoff — four alley VI intro voice

**Date:** 23/10/2026  
**Task:** A2 script and A3 Vietnamese generation  
**Outcome:** A2 complete; A3 blocked because the pinned Nhật Phong voice is not available to the configured account. No TTS POST was sent.

## A2 completed

- Added `tools/voice/generate_alleys_intro.py`. Running it without `--generate` performs an offline audit; `--generate` is the only mode that reads the key or calls ElevenLabs.
- The script reads the current `intro.text` directly from the four locale JSON files, computes canonical dataset revisions with the project serializer, and checks VI text hashes/revisions against the reserved slots.
- Pinned VI voice/model/output to Nhật Phong `6adFm46eyy74snVn6YrT`, `eleven_v3`, `language_code: vi`, `mp3_44100_128`. The future EN configuration is present, but EN was not generated; it remains for the separate A4 dispatch after A1 is final.
- Kept the approved `RESERVE = 10000`, `BUDGET = 80000`, and requires `can_extend_character_limit` to be exactly `false`. Each paid request records progress before sending; uncertain outcomes block resends, while an already-received response resumes from its hash-checked partial without another POST. Audio uses a `.partial` file followed by an atomic rename after MP3 decode validation.
- Added six offline generator self-tests for exact payload text, zero-key audit behavior, missing-key no-network behavior, uncertain-request blocking, known-response resume, and API error key redaction.

## Source audit

The current VI sources match all four reservations. Character counts below are Unicode code points in the exact `intro.text` values.

| Collection | Characters | Dataset revision | Text hash |
| --- | ---: | --- | --- |
| `ngo-trung-yen` | 626 | `1291ae869a7d66b684d3bd764f87fe99817d250d19c544da0938e30f8ec5ae19` | `05cd6a7070c4fc90e8f148d9ff6719c70bf72e318acee918b916476e068e143c` |
| `ngo-tam-thuong` | 581 | `3086e80f2dda45e2354289882cb89a6526574fa98b5cfe4f2f17f02d092745e9` | `846bf31e046012f7f1526a3b5d6328ef218807f9efc30ce6cde792f6f42ef8bc` |
| `ngo-cam-chi` | 611 | `b7898f698efc6b8db0a137d151bfc622fef52082bdfc2f8d97c44b1b2e08b48c` | `3b45c4d9b90e0d69ddd09a2d47e93de2de1eb3ad00dea199b7cd3e73ec5a9a92` |
| `ngo-phat-loc` | 614 | `d6e9fc6d93f4f0961dd20bdd0128df35229f33e0e89caf2071dccc9f46aff195` | `d6a9cbbc66c17a3c6c6ae20074887c542fb5d716d28ffdcb598b6e429a48d401` |

Total audited: **2,432 characters**, 4 VI tracks, 0 EN tracks.

## A3 status

The user authorized direct generation and the coordinator confirmed `RESERVE = 10000`. Subscription preflight passed. The pinned voice lookup then failed: `GET /v1/voices/6adFm46eyy74snVn6YrT` returned HTTP 400, “voice not found.” A safe account voice-list GET returned HTTP 200 with no Nhật Phong name or pinned ID; the pinned Talia ID returned HTTP 200. No TTS POST was made and **0 characters were sent**. No audio, manifest, or progress file was created; `alleysCatalog.ts` remains four empty reservations, so text fallback remains active. No paid request has an uncertain outcome.

Keep the selected VI voice/model unchanged. Resume A3 only after the configured account can access the exact pinned voice. Do not mark narration listened, approved, or selected for shipping until a human has heard it.

## Checks

- `python tools/voice/generate_alleys_intro.py --locale vi` — pass; four VI intros, 2,432 characters, canonical revisions and text hashes match reservations; 0 API requests.
- `python tools/voice/generate_alleys_intro.py --locale vi --generate` — subscription guard passed; pinned VI voice GET returned HTTP 400 before TTS; 0 TTS POSTs, 0 characters sent.
- Safe voice diagnostics — account voice list HTTP 200 with no pinned Nhật Phong match; VI voice HTTP 400; Talia HTTP 200. No response body, account identifier, balance, or key was logged.
- `python tools/voice/test_generate_alleys_intro.py` — 6/6 pass.
- `npm test --prefix mobile` — **347/360 pass**, 13 fail, 0 skipped/cancelled. Failures are in concurrent FE tests in `landingQuickActions.test.mjs` (4), `landingRedesign.test.mjs` (6), `remediationIntegration.test.mjs` (1), and `uiFlows.test.mjs` (2); the two alley voice catalogue tests pass. This is a shared-checkout snapshot; no FE files or tests were changed here.
- `npm --prefix mobile run typecheck` — pass (exit 0).
- `npm --prefix mobile run lint` — pass (exit 0).
- `git diff --check` — pass (exit 0); Git printed only line-ending conversion warnings on concurrent worktree files.

The mobile checks were rerun on the shared checkout after A1 finalized; this is not an isolated A2/A3 tree. Generator tests, typecheck, lint, and `git diff --check` passed, while the shared mobile test run had the 13 concurrent FE failures listed above; both alley voice catalogue tests passed.

The Python test created `tools/voice/__pycache__/generate_alleys_intro.cpython-311.pyc`. Commit `12f5f23` ignores this Python cache, so it is left untouched.

## User follow-up

- **Decision needed:** keep the pinned Nhật Phong ID, as requested; do not substitute. If that ID was intended to be different, confirm the correct ID before A3 resumes.
- **User action:** make the pinned voice available to the configured API account or confirm the correct voice ID **[ngoài plan]**; the account owner controls voice access, and A3 cannot send the selected narration until the exact voice resolves. After audio exists, listen to all four and report pronunciation issues. No listening or approval is claimed here.
