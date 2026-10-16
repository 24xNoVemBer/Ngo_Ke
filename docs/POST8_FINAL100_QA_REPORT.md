# Post-8 Final-100 QA report (standalone, current)

## 0. CURRENT verdict — final native follow-up on 66c5 (2026-10-17, task_5b02f937e121, Muse Spark 1.3 Free, branch `valentino/post8-qa`)

Final source `66c5fc4278aa5585a02dfc2be60c3d472bb16e44`; stable APK
`Temp/ngoke-post8-66c5-6c0623d6f226-final.apk`, SHA-256
`6c0623d6f226b9c5f307444789fafe011e441346741f566e3bbf1b7e38c677be`,
96,638,626 bytes, ARM64+x86_64 (local hash = installed `base.apk` hash after
`install -r` on emulator-5554 only; never iPhone). Fresh ignored evidence:
`tools/e2e/.runs/final-66c/` (13 PNGs + 3 raw element dumps + pre-task
config backup). Prior d704 proof retained only for unchanged cases; §§1–9
below are an explicitly superseded historical ledger (§8 WITHDRAWN, §9
corrected, §§10–11 stand with their stated limits).

PASS on 66c5: Plan EN Food45 — heading "Alley food · 45 min", reason "Matches
Alley food · …", "Here is 1 stop selected…" grammar, reviewed photo badge +
full title + Explore readable (topics 2/3 smoke: "Old stories & heritage ·
45 min / Here are 2 stops…", "Free exploration · 45 min / Here are 3
stops…"); Plan VI — "Ẩm thực ngõ · 45 phút", "Chợ Đồng Xuân", proper names
preserved; pilot Home Notes → AlleyNotebook/JourneyTools modal with source
tag "DEMO · reviewed heritage" (EN) / "DEMO · di sản đã duyệt" (VI) from
actual dataset kind (fiction still simulated per contract); Qa dock notebook
a11y "Open alley notebook" (EN) / "Mở sổ tay ngõ phố" (VI) via MCP elements
(raw dumps persisted); Camera manual BM → active card "CONFIRMED STOP" with
"Illustration photo · reviewed stops" readable at 200;
keyboard — expanded FLOATING Gboard emoji panel with
approved "Where are we?" typed, enabled Send and chips in one shot
(`qa-ime-panel-text-200.png`; earlier `qa-ime-panel-200.png` had empty
input). The panel's close X is visible; the application drawer header/cancel X
is behind the floating panel and is NOT verified unobscured in this combined
state. This does not exercise bottom-docked keyboard resizing. After dismissing
the panel, canonical submit → correct Answer 00:12 + source (alphabet/QWERTY
keys NOT VERIFIED, no QWERTY user gate). No new FAIL; typed-Qa food-reason is NOT tested as ordinary question
per root (voice-callback path is unit/source-covered). NOT VERIFIED (unchanged
scope): full-QWERTY layer, spoken TalkBack/focus order, animation timing,
human listening/naturalness, mic audibility, real GPS fix, QR scan, physical
device/iPhone, bulk/66-new-audio human QC, 18/36 unknown ASR. Restore: runtime
font 1.0, all 3 animation scales 1, network on, show_ime key deleted (was
NULL), a11y services null. W4 observed accessibility_enabled=1 after its
additional boot; its cause/default was not established. Coordinator's subsequent
headless cleanup boot independently read 0 before and after an idempotent
restore to the recorded baseline 0, with enabled services null, then shut down
the emulator again. Actual owned qemu
39048 (this round; prior 41588) stopped via `adb emu kill` (process gone,
device gone); config.ini SHA equals pre-task `0CE6D3D5…0375`, backup
preserved at `final-66c/config.ini.pre-task-backup` (never deleted). Preserved db02248 audit: old backup was deleted with hash
never recorded, prior cold-boot attempt not proven, prior camera photo
caption was NOT VERIFIED, TalkBack was service-exercise only.

Historical report-only baseline: task `task_5aee15b7bf27`, model Muse Spark
1.3 Free, branch `valentino/post8-qa`; that earlier task made no product edits
or native runs. It does not describe the current native follow-up above.
Older `POST8_CONTENT_TEST_REPORT.md` sections remain history.

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

**SUPERSEDED — blanket font-PASS sentence in the paragraph below is WITHDRAWN
(see §9–§10 for file-by-file corrections and the d704 retest).** Only the
exact historical progress evidence (timestamps/positions) is kept; no
screen-identity claim from §8 survives unqualified.

Build: candidate 2d9b210, APK SHA-256 93c8d639c23ca9090d8f92ab7d8eee1757ce71ba5d5d986e4e76300344fb8c36 (96,637,278 bytes, installed hash identical; supersedes withdrawn 7cf7 early-read). Guard passes on this file (100/100 + manifest entries). Evidence: tools/e2e/.runs/final-2d9b/ (MCP refs + binary PNG).

PASS: cold EN OS fallback; MM EN story 00:24/01:09 + MM VI 00:31/00:48 + DX VI 00:38/00:46 + fiction EN 00:09/00:24 with pause/stop and progress, no autoplay; locale switch preserving point; VI BM Q&A sourced; font200 clean on Prologue/AlleySelect/Home/drawer/Qa/Location/Plan/keyboard(real IME) except the known Notebook wrap and Sto clipping (both routed, fixes pending); Plan pick card complete (name/time badge/Explore) at 200; settings/permissions restored exactly; emulator stopped after evidence.
PENDING (honest): in-place locale during active playback; human listening and mic audibility; real GPS fix; QR scan; physical device/iPhone; bulk-54 human QC.

## 9. W4 recovery reconciliation (2026-10-17, task_2ee18d22fba9, model Muse Spark 1.3 Free)

Report-only recovery. No product edits, no devices booted, no services started, no native runs in this task. Branch `valentino/post8-qa`, status clean, WIP preserved. Old task task_b1eb765424e4 abandoned; this supersedes it. Evidence folder located: `tools/e2e/.runs/final-2d9b/` (24 PNGs, timestamps 10:51–11:16 on 2026-10-16) re-read in this task; findings below are what the pixels actually show.

Mislabeled files — NOT Qa/Home proof (CORRECTED per root 2026-10-16T17:31Z:
`font200-home-en.png` is LandingScreen — logo, VI/DEMO, quote, FEATURED
JOURNEYS, "Choose an alley", "Explore Hanoi Alleys" — NOT Home; the §9 claim
below that it was "actual Home proof" is WITHDRAWN. No actual Home proof
exists in final-2d9b at all): `font200-fiction-qa-en.png` is Landing/Prologue EN (START JOURNEY + language selector), not Fiction Qa. `f200-qa-vi.png` is Landing/Prologue VI, not Qa. `f200-home-vi.png` is AlleySelect VI (collection list), not Home. `font200-pilot-home-en.png` is AlleySelect/pilot-select, not Home. `font200-home-en.png` is Landing, not Home. None of the five counts as actual Qa/Home proof. Actual HomeScreen is only the screen after collection selection (trail/pins/postcard/dock), captured fresh on d704 in §10.

Actual FAIL (on build 2d9b210, before W2 candidate): Landing subtitle/header collision at 200 and Plan `f200-plan-pick5.png` blank Postcard title area with clipped header plus simulated photo caption ("Anh minh hoa · Nguon mo phong") on reviewed/pilot surface where the reviewed/editorial/unmeasured contract forbids simulated-minutes presentation. Both routed to W2. W2 patches `43209f4` + `68d3450` + `2b95a16` are now consolidated in candidate `d0ff054` (coordinator-reported: 255 app/type/lint pass); native build verification of the fixes was pending at report time.

Playback honesty: `mm-en-play` 01:04/01:09, `mm-vi-play` 00:34/00:48, `dx-vi-play` 00:26/00:46, `dx-vi-answer` 00:11/00:15, `fiction-en-play` early-progress/00:24 all show UI progress with pause/stop and no autoplay only. No human listening, no naturalness QC, no mic audibility (AVD has no audio path). `f200-keyboard-vi.png` shows a real IME (Gboard) with free-typed "test cau hoi" — not an approved EN typed question, so approved-EN-typed remains NOT VERIFIED. `live-map-en.png` shows Live 3 reviewed points (10.0.2.2:18886); offline EN remains NOT VERIFIED. TalkBack, reduced motion, real GPS fix, QR scan, physical device/iPhone, bulk-54 human QC: NOT VERIFIED.

Cleanup (read-only): working tree clean, no emulator/service/native process started here, settings/permissions untouched by this task, no model change (Muse Spark 1.3 Free throughout; no invalid-parameters quota issue encountered).

Stable artifact (coordinator-reported 2026-10-16T17:29Z, NOT re-verified in this report-only task): candidate `d0ff054` built exit 0, `C:/Users/LEGION/AppData/Local/Temp/ngoke-post8-d0ff-d704-final.apk`, SHA-256 `d7045a875c441fffaf544e07fb548888bc4cba676db62375aeb682875bac9a3c`, 96,637,958 bytes, ARM64+x86_64, guard 132 assets / 100 mapping / 100 MP3 PASS, embedded data :18886 / voice :18787, 46 protected bytes unchanged. Native QA of this artifact is a separate focused task reusing this terminal after this report.

## 10. Focused native QA on d704 (2026-10-17, task_78292a9b4640, model Muse Spark 1.3 Free)

Frozen source `d0ff054d5834ae570122c5186216469c48ed9c03` verified in
`../post8-integration` (clean). APK hash re-verified locally
(`D7045A87…BAC9A3C`, 96,637,958 bytes) and installed `base.apk` pulled back
with identical hash, package `com.valentino241.ngokedemo`, installed with
`mobile_install_app` on emulator ONLY (never iPhone). Emulator
`Medium_Phone_API_37.0` (sdk_gphone64_x86_64, Android 17) launched by this
task (owned PIDs 41708, then 4100 after config cold boot); left running for
follow-up. Fresh evidence (ignored): `tools/e2e/.runs/final-d0ff/` (25 PNGs).
Originals recorded and restored: font_scale 1.0, animator/transition scale 1,
no accessibility services, network on, AVD `hw.keyboard=yes` restored.

PASS: Prologue VI/EN at 200 (subtitle/logo/quote/START JOURNEY, locale buttons
no overlap); actual changed Landing VI/EN at 200 — header "NGÕ KỂ" + localized
subtitle ("Sổ tay di sản phố ngõ" / "Alley heritage notebook") with EN/VI +
DEMO controls, no collision; AlleySelect EN at 200 — All/Hàng Buồm/Hàng Gai
filters + full "HOAN KIEM, HANOI" area text; actual pilot Home VI/EN at 200
(AlleyTrailView) — full titles, "Suggested visit … (unmeasured)" /
"Gợi ý tham quan … (chưa đo)" badges; fiction Home EN — "5 simulated min"
badge correctly stays simulated; fiction demo-01 EN typed "Where are we?"
(canonical) → Answer 00:12 + source + follow-up, unknown text → "No story for
this question"; pilot BM chip "Why is the temple called Bạch Mã?" → SOURCED
CONTENT answer 00:15 + 2 checked URLs; offline (wifi+data disabled, wifi icon
gone) fiction story 00:24 / BM story 01:01 / Mã Mây story 01:09 / BM answer
00:15 all progress with pause/resume/stop, text toggle keeps position,
stop→Ready 0%, navigation and EN↔VI locale switch stop audio with no autoplay;
Plan reviewed pick Đồng Xuân at 200 — full title, "Suggested visit: 20 min
(unmeasured)", "Illustration photo · reviewed stops", "Photo: Dự án Ngõ Kể",
Explore button; Camera manual rows carry reviewed caption (unmeasured + project
credit), camera stays off until tapped; reduced-motion OS setting honored
(drawer fully functional, Modal/pulse code path source-verified); TalkBack
service enabled without crash, all controls expose labels/roles (spoken output
not verifiable — no audio path).

NOT VERIFIED (honest): full-QWERTY soft keyboard — AVD keeps built-in qwerty2
even after `hw.keyboard=no` cold boot, so Gboard stays in toolbar-strip mode;
real IME proven instead (LatinIME default, focused field + cursor, typed text,
Send/X usable, full emoji board rendered), see `qa-en-realkb*.png`. Human
listening/naturalness, mic audibility, real GPS fix, QR scan, physical
device/iPhone, bulk-54 human QC, and original 66-new-audio human QC stay
pending. Unknown ASR 18/36 unchanged (not rerun).

Corrections/observations for W2 (no product edits): `offline-mm-en-play.png`
actually shows Bạch Mã 01:01 — renamed `offline-bachma-en-play.png`; true Mã
Mây is `offline-mamay-en-play.png` (00:49/01:09 progressing; later read showed
00:10/16% still playing — unexplained offset, possibly track-end behavior, not
a blocker). Plan EN summary echoes "ẩm thực · 45 min" (VI topic word in EN
UI). Qa EN dock notebook a11y label reads "Sổ tay" (visual button icon-only).
`mobile_type_keys` drops the first keystroke on fresh focus (typed "blabla…"
landed as "labla…") — harness artifact, result still unknown-text.

## 11. Bounded report/cleanup reconciliation (2026-10-17, task_3adfd725e9de, same session/model)

No new native run, no product edits, no broad source/history reread, no
waiting on a new APK. Root has not accepted blanket claims or
`50eab32`/`16e1ab6`/`fb2368a`; §8 WITHDRAWN stands, §9 corrected, §10 is the
evidence record below as corrected here.

(1) Notes/drawer correction (root): the Notes dock button opens the app's own
AlleyNotebook/JourneyTools Modal (`HomeScreen.tsx` Modal block at line 586,
notebook button at 575), NOT a direct jump to Plan — the prior message
claiming Notes→Plan was wrong. `reduced-motion-drawer.png` is therefore a
legitimate native-modal exercise. Claim stays bounded: OS
`transition_animation_scale=0` + drawer fully functional on cold-started app +
Modal/pulse code path source-verified; full animation-timing delta is NOT
claimed from stills.

(2) Actual translation FAILs on d704 (routed W2; layout/title/caption PASS is
separate): `reduced-motion-drawer.png` / `talkback-drawer.png` show reviewed
Old Quarter Pilot while the drawer tag reads "DEMO · simulated content" —
`HomeScreen.tsx:705` hardcodes the demo string instead of using the actual
`collectionKind` (derived line 118). Plan EN echoes VI ("ẩm thực · 45 min"
topic, "Hợp chủ đề ẩm thực · …" reason) and the Qa EN dock notebook a11y label
reads "Sổ tay". Title/caption/layout verdicts in §10 (full titles, unmeasured
badges, reviewed photo labels, no collisions) stand; these remaining
translation strings are FAIL, not PASS.

(3) Camera caption scope correction: `camera-manual-200.png` proves only the
manual rows (unmeasured badge + project credit) with camera off. It does NOT
exercise the active-card photo disclaimer branch (`CameraScreen.tsx:267–279`,
`photo_disclaimer_reviewed` vs `photo_disclaimer`). Actual photo-caption
native verdict is NOT VERIFIED until the next focused task (scan/activate a
stop and capture the active card).

(4) TalkBack/keyboard scope correction: enabling the TalkBack service with no
crash is a service exercise only; `talkback-drawer.png` shows no focus ring,
so spoken output and focus order are NOT claimed. Full-QWERTY keyboard stays
NOT VERIFIED with no causal claim and no new user gate: the Gboard
toolbar-strip observation is unattributed (see (6)). Proven only: real IME
(LatinIME default), focused field + cursor, typed text, usable Send/X. The
expanded emoji board was observed live in an unsaved preview only — no
expanded-IME PNG exists in final-d0ff, so it is excluded from evidence; the
next native task captures one actual full IME panel.

(5) Restore audit (exact, no invention): AVD config change was
`hw.keyboard=yes→no` in `D:/Android/avd/Medium_Phone.avd/config.ini`, via
`Copy-Item config.ini → config.ini.bak-w4` (backup), edit, cold boot, then
`Copy-Item config.ini.bak-w4 → config.ini -Force` (restore) and `Remove-Item
config.ini.bak-w4` (backup deleted by me — no neighboring backup exists, and
the original hash was never recorded so it cannot be reconstructed). Restored
bytes verified, not values: current
SHA-256 `0CE6D3D57792FEACF6DC747EF6706423856844197660E4A8D7DE3C3339DC0375`
matches root's finding, `hw.keyboard=yes` at line 28. Runtime baselines
verified read-only on emulator-5554: font_scale 1.0, animator/transition/
window scales 1, `show_ime_with_hard_keyboard` key deleted (get → null, not a
null value), accessibility services null, accessibility_enabled 0, wifi_on 1.
Own AVD kept running for imminent final QA (launcher child PID 41588, AVD up
since 00:32; earlier parent PID 4100 exited); no personal device touched, no
services started. Nothing deleted in this task.

(6) Cold-boot correction (root audit, honest): the `hw.keyboard=no` edit was
only ever an ATTEMPT, never a proven test. Stop-Process on launcher PID 41708
plus relaunch with `-no-snapshot-load` is not reboot proof: the actual
`qemu-system-x86_64` PID 41588 has host StartTime 00:32:14 (predating the
kill), and guest `uptime` at 01:15:51 reads 1:10. No guest reboot is
demonstrated, so the config change cannot be claimed tested and no
qwerty2-causes-strip inference is made. Continuation resource: actual owned
qemu is PID 41588 — the final native task must stop that qemu process, not
just a launcher PID.
