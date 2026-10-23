# W3 handoff — four alley VI intro voice

**Date:** 23/10/2026  
**Task:** A2 script and A3 Vietnamese generation  
**Outcome:** A2 complete; A3 complete with four VI intro tracks generated from the approved text. All tracks remain unlistened, unapproved, and unselected for shipping.

## A2 completed

- Added `tools/voice/generate_alleys_intro.py`. Running it without `--generate` performs an offline audit; `--generate` is the only mode that reads the key or calls ElevenLabs.
- The script reads the current `intro.text` directly from the four locale JSON files, computes canonical dataset revisions with the project serializer, and checks VI text hashes/revisions against the reserved slots.
- Pinned VI voice/model/output to Nhật Phong `6adFm46eyy74snVn6YrT`, `eleven_v3`, `language_code: vi`, `mp3_44100_128`. EN generation remained separate from A3; this dispatch did not regenerate EN.
- Kept the approved `RESERVE = 10000`, `BUDGET = 80000`, and requires `can_extend_character_limit` to be exactly `false`. Each paid request records progress before sending; uncertain outcomes block resends, while an already-received response resumes from its hash-checked partial without another POST. Audio uses a `.partial` file followed by an atomic rename after MP3 decode validation.
- Added seven offline generator self-tests for exact payload text, zero-key audit behavior, missing-key no-network behavior, uncertain-request blocking, known-response resume, and API error key redaction.

## Source audit

The current VI sources match all four reservations. Character counts below are Unicode code points in the exact `intro.text` values.

| Collection | Characters | Dataset revision | Text hash |
| --- | ---: | --- | --- |
| `ngo-trung-yen` | 626 | `1291ae869a7d66b684d3bd764f87fe99817d250d19c544da0938e30f8ec5ae19` | `05cd6a7070c4fc90e8f148d9ff6719c70bf72e318acee918b916476e068e143c` |
| `ngo-tam-thuong` | 581 | `3086e80f2dda45e2354289882cb89a6526574fa98b5cfe4f2f17f02d092745e9` | `846bf31e046012f7f1526a3b5d6328ef218807f9efc30ce6cde792f6f42ef8bc` |
| `ngo-cam-chi` | 611 | `b7898f698efc6b8db0a137d151bfc622fef52082bdfc2f8d97c44b1b2e08b48c` | `3b45c4d9b90e0d69ddd09a2d47e93de2de1eb3ad00dea199b7cd3e73ec5a9a92` |
| `ngo-phat-loc` | 614 | `d6e9fc6d93f4f0961dd20bdd0128df35229f33e0e89caf2071dccc9f46aff195` | `d6a9cbbc66c17a3c6c6ae20074887c542fb5d716d28ffdcb598b6e429a48d401` |

Total audited: **2,432 characters**, 4 VI tracks, 0 EN tracks.

## Earlier A3 attempt — voice access blocked (resolved)

The user authorized direct generation and the coordinator confirmed `RESERVE = 10000`. Subscription preflight passed. The pinned voice lookup then failed: `GET /v1/voices/6adFm46eyy74snVn6YrT` returned HTTP 400, “voice not found.” A safe account voice-list GET returned HTTP 200 with no Nhật Phong name or pinned ID; the pinned Talia ID returned HTTP 200. No TTS POST was made and **0 characters were sent**. No audio, manifest, or progress file was created; `alleysCatalog.ts` remains four empty reservations, so text fallback remains active. No paid request has an uncertain outcome.

Keep the selected VI voice/model unchanged. Resume A3 only after the configured account can access the exact pinned voice. Do not mark narration listened, approved, or selected for shipping until a human has heard it.

## A3 completed — 23/10/2026

The exact selected shared voice was found in the voice library, added/bookmarked (HTTP 200), and verified through the account voice endpoint (HTTP 200 with the same `voice_id`). The initial lookup failure is resolved; no other voice or model was selected.

Four VI TTS requests returned HTTP 200. All used `eleven_v3`, `language_code: vi`, `mp3_44100_128`, and the exact current `intro.text` values without edits.

| Collection | Characters sent | HTTP | Bytes | Duration | Audio SHA-256 |
| --- | ---: | ---: | ---: | ---: | --- |
| `ngo-trung-yen` | 626 | 200 | 647,461 | 40.40 s | `afcc5a1d2800ed3ebfef973f34c1b8764f1206f1b0edade5d305f43a88f9088e` |
| `ngo-tam-thuong` | 581 | 200 | 601,486 | 37.52 s | `20ab45e88d0f9077a5535be21a4def0d52a246002fd333163db3e2ec57428bfb` |
| `ngo-cam-chi` | 611 | 200 | 615,278 | 38.40 s | `6cec9d32d1b8bc1c2ab6344fcc40b31a6538e17ee75f3cd0693ed2c7d6f5df04` |
| `ngo-phat-loc` | 614 | 200 | 597,724 | 37.28 s | `912ffc6ae031e5b0e3c25c21822ad2d808deb9b77f8e166ee1628ab10f52a428` |

The API accepted all 2,432 characters. The immediate subscription counter delta recorded in the manifest is 726; no billing interpretation is inferred. All four files decode as mono 44.1 kHz MP3, and their hashes, current dataset revisions, and text hashes match manifest/progress/source. Existing EN audio hashes still match the EN manifest. `humanApproved`, `listened`, and `selectedForShipping` remain false for all VI tracks.

Assets are under `mobile/assets/voice/alleys-intro/vi/`; `manifest.vi.json` and `progress.vi.json` record the generation and API outcomes without credentials.

## Checks from the earlier blocked attempt

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

## Checks — completed A3

- `python -X utf8 tools/voice/generate_alleys_intro.py --locale vi` — pass; four current VI intros, 2,432 characters, reserved revisions/text hashes match, zero API requests in audit mode.
- `python -X utf8 tools/voice/test_generate_alleys_intro.py` — 7/7 pass.
- `node --test mobile/tests/alleysVoiceCatalogue.test.mjs` — 2/2 pass; checks both locales, current revision matching, source hashes, and missing-track lookup fallback.
- `npm --prefix mobile run typecheck` — pass.
- `npm --prefix mobile run lint` — pass.
- `git diff --check` — pass on the shared checkout.
- Full mobile suite was not run in this retry; the shared checkout still has concurrent FE changes. The earlier 347/360 suite snapshot and its 13 FE failures above belong to the previous dispatch, not this validation.

## Current user review after A3 generation

- **Cần anh quyết:** Sau khi nghe bốn track VI, anh xác nhận có duyệt cách đọc của giọng Nhật Phong cho bản demo không; đề xuất chỉ duyệt track nào đã nghe đạt. Nếu chưa chốt, trạng thái vẫn không được đánh dấu `humanApproved` hoặc `selectedForShipping`.
- **Cần anh tự làm:** Nghe đủ bốn track VI trên tai nghe/loa và báo lỗi phát âm hoặc track đạt; hiện chưa có bằng chứng con người đã nghe hay kiểm trên thiết bị.

## Follow-up from the earlier blocked attempt (resolved)

- **Decision needed:** keep the pinned Nhật Phong ID, as requested; do not substitute. If that ID was intended to be different, confirm the correct ID before A3 resumes.
- **User action:** make the pinned voice available to the configured API account or confirm the correct voice ID **[ngoài plan]**; the account owner controls voice access, and A3 cannot send the selected narration until the exact voice resolves. After audio exists, listen to all four and report pronunciation issues. No listening or approval is claimed here.
