# Post-8 Final-100 QA report (standalone, current)

Task `task_5aee15b7bf27`. Model Muse Spark 1.3 Free. Branch `valentino/post8-qa`.
This file is the current standalone report; older `POST8_CONTENT_TEST_REPORT.md`
sections stay as history. No product edits; no native runs in this task.

## 1. Bad build f2d0 (source `5eae095`, 96,634,526 bytes)

ZIP holds 100 MP3 but `app.manifest` lists 78 assets / 46 MP3 (stale Gradle
task). New MM/DX tracks resolve to an unreadable path: ExoPlayer
`openLocalFile` EACCES + SELinux denial, UI stuck at Ready 00:00 with no
error shown; BM tracks play normally. My initial “44/46 missing” claim is
WITHDRAWN — it was a Windows archive-extraction artifact (proper zip
streaming finds all 100 entries with full hash-multiset equality), not real
missing bytes. Guard `tools/e2e/audit_apk_assets.py` fails this build with
exactly the 54 missing manifest mappings.

## 2. Fixed build 13b2 (same source `5eae095`, 96,636,130 bytes, SHA-256
`13b27ffd1c0494b7fa55f246ec8c64a0362e5f615188c444e940cc1542e05bfb`)

Manifest regenerated: 132 assets / 100 MP3 / 54 remaining; guard passes
(100/100 multiset + per-file MD5/entry/name/raw-folder). Native retest on
emulator-5554 (mobile-mcp refs, binary PNG): MM EN story 00:24/01:09, MM VI
00:30–00:31/00:48, DX VI 00:38/00:46, fiction EN 00:04–00:09/00:24 — all with
progress, pause/stop controls, no autoplay. Progress proves state only, not
audibility. Checks from the f2d0/d68223e era are NOT assigned to 13b2 unless
re-tested above; unchanged scope carried forward is labeled as such.

## 3. Post-13b2 fixes (not yet natively verified)

W3 `e3a12c7` → candidate `ff94710` (generic native error latch/retry +
reload); W2 badge `41e64c8`→`DD`; final combined native retest pending in a
new task after root is ready. Current source `dd6d098` noted, not tested here.

## 4. QA guard and suites

`audit_apk_assets.py` + 5 stdlib unittests (complete / missing-entry /
missing-asset / wrong-name / wrong-folder): fail preserved
`Temp/ngoke-post8-f2d0-stale-manifest.apk` with exactly 54, pass
`Temp/ngoke-post8-13b2-mapping-ok.apk`; source ZIP SHA-256 multiset +
source MD5 + same raw filename/folder matching. Content suite 47/47 green.
No new tests for external devices.

## 5. Synthetic ASR (W3 report, not rerun)

36 clips: 18 expected / 18 unknown / 0 wrong / 0 decoder mismatch, 18 graph
follow-ups with 9 after expected canonical. No claim of all-9-pairs success;
forced decoder locale is request metadata, not independent classification.
All 66 new tracks `humanApproved: false`, not shipping.

## 6. Font-200 corrections (honest scope)

Proven clean at 200: Prologue, drawer, Qa EN, Location EN. Home pilot EN
(`font200-home2-en.png`) clean EXCEPT two real findings: (a) trail cards show
“10/15 simulated min” on REVIEWED content — wrong per reviewed/editorial/
unmeasured contract (the Location-screen fix did not reach AlleyTrailView),
routed to W2; (b) dock “Notebook” tab wraps to two lines. Retract earlier
blanket wording: `font200-home-en.png` and `font200-pilothome-en.png` are
AlleySelect, not Home; its “Tất cả” filter and “Ẩm thực” row stay VI; the area
qualifier is hidden by one-line ellipsis — all recorded, none passing as Home
evidence. Decorative story circle clips “Story” to “Sto” (W2 `S` badge
accepted, native pending). Keyboard at 200 and screen reader remain pending.

## 7. Pending (explicit)

In-place locale switch during active playback/recording (no in-Qa toggle;
hook-level covered separately); human listening/naturalness and mic
audibility (AVD has no audio); real GPS fix; QR scan; physical
device/iPhone (MCP enumerated the personal iPhone but never acted on it);
bulk-54 human QC; final combined rebuild native retest. Emulator stopped
after evidence; settings/permissions restored exactly.

## 8. Native final-2d9b (2026-10-16, release 93c8 on emulator-5554 via mobile-mcp)

Build: candidate 2d9b210, APK SHA-256 93c8d639c23ca9090d8f92ab7d8eee1757ce71ba5d5d986e4e76300344fb8c36 (96,637,278 bytes, installed hash identical; supersedes withdrawn 7cf7 early-read). Guard passes on this file (100/100 + manifest entries). Evidence: tools/e2e/.runs/final-2d9b/ (MCP refs + binary PNG).

PASS: cold EN OS fallback; MM EN story 00:24/01:09 + MM VI 00:31/00:48 + DX VI 00:38/00:46 + fiction EN 00:09/00:24 with pause/stop and progress, no autoplay; locale switch preserving point; VI BM Q&A sourced; font200 clean on Prologue/AlleySelect/Home/drawer/Qa/Location/Plan/keyboard(real IME) except the known Notebook wrap and Sto clipping (both routed, fixes pending); Plan pick card complete (name/time badge/Explore) at 200; settings/permissions restored exactly; emulator stopped after evidence.
PENDING (honest): in-place locale during active playback; human listening and mic audibility; real GPS fix; QR scan; physical device/iPhone; bulk-54 human QC.
