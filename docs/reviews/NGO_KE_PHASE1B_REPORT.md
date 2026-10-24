# Ngõ Kể — Phase 1B Application Logic Remediation

Ngày: 23/10/2026 (Asia/Saigon)

Verdict: **READY_FOR_PHASE2** trong phạm vi bắt đầu planning/content verification. Phase 1B không còn technical blocker được phát hiện trong ba ticket đã mở. Chưa thực hiện Phase 2; verdict không duyệt nội dung, tạo voice, nghiệm thu thiết bị hoặc phát hành.

## 1. Baseline đã kiểm lại

- Workspace `D:/ngo_ke`, branch `valentino/logic-fix-mobile-20261020`.
- HEAD trước và sau: `4af64c49a4ada47f952ddf76c35adfb90f826224`, trùng baseline Phase 0.5/1A.
- Đã đọc AGENTS, backlog NK-002/003/004, báo cáo Phase 1A và source/tests liên quan. Yêu cầu Phase 1B của người dùng mở chính xác ba ticket này, không đổi ownership lâu dài trong AGENTS.
- Worktree ban đầu có bốn tracked modifications của Phase 1A: `mobile/tests/nodeStoryVoiceCatalogue.test.mjs`, `tools/e2e/phase8-http.test.mjs`, `tools/voice/generate_node_stories.py`, `tools/voice/test_node_story_voice.py`. Patch thực sự có trong worktree: normalized/raw hash contract, generator tests và HTTP temp cleanup. Bốn file được giữ nguyên trong Phase 1B; regression Python/catalogue/backend cũng xác minh hành vi hiện hành.
- Untracked đã có: `.agents/`, `docs/audits/`, `docs/plans/`, `docs/reviews/NGO_KE_PHASE1A_REPORT.md`, `mobile/.cache/`. Không xóa hoặc ghi đè chúng. Không đọc `.env.local` đang mở trong IDE.
- Ba application files của Phase 1B sạch so với HEAD trước khi chỉnh; không có overlap với patch Phase 1A. Không reset, stash, checkout, pull, đổi branch, commit, push, merge hoặc deploy.

## 2. NK-002 — Demo/Live guide isolation

Root cause: `NotebookDrawerModal` chọn source ready bất kể mode; với non-ready lại lấy bundle theo collection. Vì thế Live no-config/empty/error có thể hiển thị guide Demo.

Patch tại `mobile/src/components/NotebookDrawerModal.tsx`:

- Demo lấy bundle đúng collection/locale; nếu không có collection prop, chỉ dùng ready source mang mode Demo.
- Live chỉ lấy dataset từ ready source mang mode Live. Non-ready và source từ mode cũ không có guide fallback.
- Live ready không có guide vẫn không render section/wrapper guide rỗng.
- Giữ nguyên tools, Retry, mode controls và navigation callbacks.

Regression mới ở `alleyGuideSection.test.mjs`: VI/EN; Demo hợp lệ; Live ready guide với sentinel riêng khác bundle; ready không guide; no-config/no-data/error; loading theo contract thật `status=empty` + `liveBusy=true`; chuyển mode khi drawer mở; stale source của mode trước; retry callback và ready sau retry. Các App tests hiện có tiếp tục kiểm retry và late network result không thay Demo. Component test inject trạng thái, không tự chứng minh transport request identity; transport identity được kiểm riêng trong App regression.

## 3. NK-003 — Home intro async playback

Root cause: callback Play tiếp tục sau `await setAudioModeAsync`; blur chỉ pause tức thời nên callback cũ vẫn có thể replace/play sau đó.

Patch tại `mobile/src/screens/HomeScreen.tsx`:

- Mỗi yêu cầu Play có generation; pending request được giữ riêng để coalesce double tap.
- Recheck mounted/focus, navigation focus, scope và generation sau async preparation, trước replace/play.
- Scope gồm mode, collection, locale, dataset revision, source status và foreground. Blur, unmount hoặc scope change vô hiệu hóa yêu cầu cũ và pause; completion cũ không được xóa pending request mới.
- Đăng ký focus/blur listeners và unsubscribe cả hai khi cleanup. Quay lại Home chỉ cho phép Play mới theo thao tác người dùng, không tự resume.
- Background dùng `foreground`, độc lập với `motion.active` vì reduced-motion cũng làm `active=false`; lựa chọn giảm chuyển động không được vô hiệu hóa audio.

Regression mới ở `homeIntroPlay.test.mjs`: pending → blur/unmount/locale/collection/mode/background → resolve; không replace/play track cũ; reenter rồi explicit Play hoạt động; không autoplay khi quay lại; listener cleanup; double tap; reduced motion; completion cũ trong lúc request mới còn pending. Các catalogue và Q&A playback tests cũ tiếp tục đạt.

Skill `voice-tts-quality` được dùng để rà focus/foreground/cancel và giữ technical evidence riêng với human listening/native evidence. Không chạy TTS, gateway, upload microphone hoặc API trả phí.

## 4. NK-004 — Intentional empty Q&A

Root cause: JSX render notice vô điều kiện cho `nodeQa.length===0`; hai assertions cũ cố định hành vi trước yêu cầu sản phẩm mới.

Patch tại `mobile/src/screens/QaScreen.tsx`: bỏ đúng khối JSX empty notice và wrapper của nó. Giữ story/player, điều hướng, microphone, voice commands, matcher, answer card, unknown feedback và source recovery.

Regression:

- Kiểm đủ **17 node × 2 locale**, không có notice và vẫn có story player/voice dock.
- Typed unknown và voice unknown vẫn có feedback đúng locale; locale switch không phục hồi notice.
- Existing Q&A, câu trả lời/follow-ups, chọn node và audio vẫn được suite cũ kiểm.
- Cập nhật expectation cũ trong `qaNodeStoryVoice.test.mjs` và `uiFlows.test.mjs` theo yêu cầu mới; bổ sung unknown negative test sau khi qa trở thành rỗng và error source vẫn có Retry callback.
- Missing source/Unavailable escape actions và retry/late response tests vẫn được giữ nguyên.

## 5. Files thực tế sửa trong Phase 1B

| File | Mục đích |
| --- | --- |
| `mobile/src/components/NotebookDrawerModal.tsx` | NK-002 source resolution |
| `mobile/tests/alleyGuideSection.test.mjs` | NK-002 VI/EN/state transitions |
| `mobile/src/screens/HomeScreen.tsx` | NK-003 generation, scope, focus/foreground guards |
| `mobile/tests/homeIntroPlay.test.mjs` | NK-003 deferred lifecycle và mock merge |
| `mobile/src/screens/QaScreen.tsx` | NK-004 bỏ empty notice wrapper |
| `mobile/tests/qaNodeStoryVoice.test.mjs` | NK-004 34 node/locale cases, unknown và Q&A preservation |
| `mobile/tests/uiFlows.test.mjs` | NK-004 expectation, unknown và source-error Retry |
| `docs/reviews/NGO_KE_PHASE1B_REPORT.md` | Báo cáo này |

Các file đều trong allowlist của ba ticket hoặc deliverable được người dùng yêu cầu. Bốn file Phase 1A vẫn là diff có sẵn, không phải thay đổi mới của lượt này. MEMORY/AGENTS và các ticket khác không được chỉnh trong patch này.

## 6. Kết quả kiểm thử

| Lệnh | PASS | FAIL | SKIP | Exit |
| --- | ---: | ---: | ---: | ---: |
| `npm test` tại `mobile/` | 405 | 0 | 0 | 0 |
| `npm test` tại `backend/` | 32 | 0 | 0 | 0 |
| `node --test tools/e2e/phase8-http.test.mjs` | 15 | 0 | 0 | 0 |
| `python -m unittest tools.voice.test_node_story_voice -v` | 7 | 0 | 0 | 0 |
| `npm run typecheck` tại `mobile/` | noEmit đạt | — | — | 0 |
| `npm run lint -- --no-cache` tại `mobile/` | đạt | — | — | 0 |
| `git diff --check` | đạt | — | — | 0 |

Mobile tăng **14 tests** từ 391 của Phase 1A: 2 Notebook, 8 Home lifecycle, 4 Q&A. Hai Q&A tests theo locale kiểm 17 node mỗi test. Sau full run, matrix loading trong guide test được diễn đạt lại bằng state thật `empty + liveBusy`, focused guide suite chạy lại **6/6**, không đổi application code.

Các failure giữa chừng đã giải quyết:

- Focused Home tests ban đầu 7 fail vì test harness ghi đè toàn bộ module `expo-audio` sau bước merge, làm mất `useAudioPlayer`; sửa harness merge để chỉ override hàm preparation.
- Full run đầu **403 PASS / 1 FAIL / 0 SKIP (404 tests)** do assertion uiFlows vẫn yêu cầu notice cũ. Đổi expectation đúng product requirement, đồng thời thêm unknown/error guards; sau thêm kiểm tra stale request mới, full run cuối đạt 405/405.

Không skip assertion source/audio hash và không sửa expected content, dataset hoặc manifest để làm suite xanh. Backend/HTTP tests dùng temp SQLite, loopback và port tạm như Phase 1A; không dùng database dự án.

## 7. Integrity, risks và giới hạn

- `git diff --quiet -- data mobile/assets mobile/src/voice` đạt exit 0. Story, ảnh, coordinates, node IDs/order, Q&A/follow-ups, MP3, voice catalogue, textHash/datasetRevision và manifest vẫn nguyên so với HEAD.
- 8 collections và locale dataset/voice bindings được suite registry/content/catalogue kiểm lại. Không thêm collection hoặc đổi schema/backend.
- Cần duy trì hai điều kiện khi thay Notebook về sau: Demo resolution theo collection/locale, Live resolution theo ready Live source. Không dùng bundle để lấp source lỗi.
- Home listeners và generation đã được host mocks kiểm; native Expo audio session timing và navigation lifecycle vẫn cần kiểm trên Android/iPhone. Host tests không chứng minh âm thanh nghe được hay microphone thật.
- Native pending: Play đang chuẩn bị rồi Back/background; quay lại và Play mới; chuyển locale/ngõ/mode; permissions và real microphone; audio routes/calls; device layout/accessibility. Không đánh dấu native PASS trong đợt này.
- Các vấn đề historical content, quyền ảnh, voice delta và native QA ngoài ba ticket vẫn nằm trong backlog. Phase 1B không xử lý hoặc nâng approval của chúng.

## 8. Điều kiện Phase 2 và việc người dùng quyết/tự làm

**READY_FOR_PHASE2** cho planning/content verification vì ba ticket không còn technical blocker trong scope đã kiểm. Đây là kết luận kỹ thuật về candidate worktree chưa commit, không phải tự mở phase tiếp theo.

**Cần anh quyết:** khi muốn bắt đầu Phase 2, mở rõ scope nguồn/claim ledger NK-005, chỉ định người duyệt claim và vai trò các waypoint thiếu nguồn; đề xuất chốt ledger trước sửa VI/EN theo NK-006. Nếu chưa mở, giữ nguyên candidate hiện tại và backlog nội dung. Quyền tạo voice hoặc phát hành cần scope riêng như ràng buộc đã có.

**Cần anh tự làm:** không có thao tác bắt buộc để hoàn tất ba ticket Phase 1B. Human listening và native checks ở mục 7 còn pending trước nghiệm thu thiết bị/audio; chúng không được thay bằng kết quả host tests.
