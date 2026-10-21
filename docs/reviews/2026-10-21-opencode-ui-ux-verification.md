# OpenCode — kiểm chứng độc lập UI/UX remediation F1–F16 (21/10/2026)

- **Task:** `task_94ea9c1b89e2` / Dispatch `ctx_72f4d3b29a32`. Reviewer: OpenCode. Chỉ đọc source/test/asset; file duy nhất được tạo là báo cáo này.
- **Đối tượng:** đúng working tree `C:/Users/LEGION/orca/workspaces/ngoke/logic-fix-mobile-20261020`, gồm toàn bộ WIP chưa commit; HEAD `cca8c95` **không** phải toàn bộ source hiện tại.
- **Model thực tế của phiên:** `opencode/deepseek-v4.1-flash-free` (DeepSeek V4.1 Flash Free), theo cấu hình phiên do harness cung cấp. Không có cờ model cưỡng bức, không xảy ra quota exhaustion, không xoay model, không dùng model trả phí.
- **Giới hạn:** không có thiết bị/emulator trong phiên này; không mở web preview, không gọi Metro 8082, không đo ảnh/âm thanh/tương phản thực tế. Mọi kết luận dưới đây là **source-proven** hoặc được đánh dấu **device-pending**. Không dùng HTTP 200 bundle làm bằng chứng UI native.
- **Không đụng tới:** không sửa source/test/asset, không cài dependency, không commit/push/deploy, không khởi động lại Metro, không ghi/stash/checkout ổ E, không gọi agent khác.

## 1. Kết quả kiểm tra thực thi (source đã ổn định)

| Lệnh | Kết quả | Ghi chú |
|---|---|---|
| `npm test` trong `mobile/` | **295 tests / 295 pass / 0 fail / 0 skipped**, ~5,88 s | 25 file test; gồm 5 test mới của `landingQuickActions.test.mjs` |
| `node --test tests/landingQuickActions.test.mjs` | **5/5 pass** | Chỉ kiểm Landing quick actions + drawer độc lập, không kiểm App→Qa |
| `npm run typecheck` trong `mobile/` | **exit 0**, 0 lỗi | `tsc --noEmit` |
| `npm run lint` trong `mobile/` | **exit 0**, 0 lỗi/0 cảnh báo | `eslint .` |
| `npm test` trong `backend/` | **32/32 pass, 0 fail**, ~4,15 s | Chỉ cảnh báo `node:sqlite` experimental |
| `git diff --check` | **exit 0** | Chỉ warning LF→CRLF của Git, không có whitespace error |
| `git status backend` | **sạch** | Luna không sửa backend; đúng báo cáo |

**Không chạy:** native render, GPS/QR thật, TalkBack/VoiceOver, audio thật, iPhone, Metro/Expo Go. Các mục này vẫn pending.

### 1.1. Chênh lệch 295 so với baseline 296

- Cây hiện tại có **295** test chạy được; báo cáo Anti ghi 295, còn MEMORY của đợt Landing ghi 296.
- `git diff` của `mobile/tests/uiFlows.test.mjs` giữ **74 khai báo `test(` trước và sau**; khác biệt tên duy nhất là lỗi encoding ở tên test `NgoKeLogo…`. Không thấy test bị xoá trong phần tracked.
- Tuy nhiên **WIP trước Anti không nằm trong Git** (HEAD cũng có 74 test), nên không thể loại trừ việc Anti đã xoá một test khỏi WIP mà diff HEAD→WIP không thể hiện. Không tìm thấy bản backup pre-Anti trong Temp để đối chiếu.
- Kết luận: **không có bằng chứng test bị làm yếu trong diff tracked** (các assertion `JSON.stringify` được thay bằng kiểm tra `Text` chính xác hơn), nhưng **không thể tái lập con số 296**; coordinator nên yêu cầu Anti đối chiếu lại thay vì coi 295 là tương đương 296.

### 1.2. Chất lượng test của đợt remediation

- Test mới duy nhất là `landingQuickActions.test.mjs` (5 test), kiểm một tính năng WIP có trước remediation (nút GPS/Sổ tay ở Landing) — **không** kiểm F1/F5/F7/F10/F11/F14.
- `uiFlows.test.mjs` thay `NotebookDrawerModal` bằng **mock tự dựng tag DEMO/LIVE**, nên không phát hiện được lỗi tích hợp App→Qa (xem R2/R3). Đây là lỗ hổng coverage trực tiếp.
- Spec yêu cầu “thêm test cho nhánh logic thật (xác nhận GPS/QR, unavailable recovery, quyền, state)”: **không có test nào** cho `location-confirmed-card`/`open-story`, `canAskAgain === false`, `UnavailableScreen` ở Plan/Camera/Location, hoặc dataset >6.

## 2. Disposition F1–F16 (đối chiếu code hiện tại)

| Mã | Kết luận | Bằng chứng và lý do |
|---|---|---|
| **F1** | **Partial / device-pending** | `LocationScreen.tsx:141-171` có card xác nhận + nút `location-open-story-btn` → `navigate('Qa')`; `CameraScreen.tsx:312-337` bỏ `{active.id}` và thêm `camera-open-qa-btn` → `navigate('Qa')`. Chuỗi xác nhận đúng điểm: `App.tsx:191-196` set cả `confirmedNodeId` và `currentNodeId`; `activeNodeId` ưu tiên `currentNodeId` (`App.tsx:181-185`) nên Qa mở đúng story. **Nhưng** card nằm phía trên `currentCard` (`:141` so với `:174`), còn nút xác nhận nằm dưới candidate (`:264-287`) hoặc danh sách chọn tay (`:324-366`); không có scroll-to-top, nên người bấm ở dưới có thể vẫn không thấy phản hồi (chỉ có `accessibilityLiveRegion`, không có thông báo hình ảnh). Cần kiểm trên máy thật. |
| **F2** | **Partial — claim “GPS thống nhất pin” sai** | Drawer dùng chung đã có (`NotebookDrawerModal.tsx`), Qa dock mở drawer (`QaScreen.tsx:1093`) thay vì Plan; mô tả GPS đã bỏ “gần nhất/tọa độ” (`translator.ts:699-704`). **Nhưng** dock Home vẫn dùng `AppIcon name="compass"` cho GPS (`HomeScreen.tsx:568`), trong khi Landing/drawer dùng `pin` (`LandingScreen.tsx:239`, `NotebookDrawerModal.tsx:140`); Plan dùng `compass` (`NotebookDrawerModal.tsx:110`). Cùng chức năng vẫn hai icon. |
| **F3** | **Partial — claim “picker Landing/Home” sai** | Landing pill đạt `minHeight/minWidth 44` (`LandingScreen.tsx:448-459`), hiện ngôn ngữ hiện tại (`locale.toUpperCase()`) và pill DEMO/LIVE mở Sổ tay (`:112-120`) — tốt. **Nhưng** Landing vẫn **toggle** khi bấm (`:107`), không mở picker; Home vẫn toggle và hiện **ngôn ngữ đích** (`EN` khi đang VI, `HomeScreen.tsx:306-315`), dù vùng chạm 48×48 (`:687-690`). Chỉ Prologue có picker modal. Ba màn chưa nhất quán. |
| **F4** | **NOT FIXED (P1)** | `App.tsx:371, 385, 400` vẫn là `<UnavailableScreen detail={source.detail} />` cho Plan/Camera/Location — **không** `onBack`, `onRetry`, `onSwitchToDemo`, `busy`. Chỉ Qa (`:351`) và Home (`HomeScreen.tsx:217-229`) có recovery. `UnavailableScreen.tsx:24-26` vẫn dùng `styles.action` cho cả ba nút; các style `primaryAction`/`secondaryAction` (`:35-68`) **không được dùng ở đâu** (dead code). Kịch bản review — Live lỗi → Sổ tay → QR/GPS/Plan → màn chỉ có back native — vẫn còn nguyên. |
| **F5** | **Fixed (source)** | Camera phát hiện `canAskAgain === false`, hiện nút mở Settings (`CameraScreen.tsx:55-70, 186-207`); Location tương tự (`LocationScreen.tsx:78-88, 297-310`). Chọn tay vẫn còn. Chưa kiểm runtime khi quyền bị từ chối vĩnh viễn trên iOS/Android. |
| **F6** | **NOT FIXED (P2)** | Các mục chạm review nêu vẫn nguyên: `QaScreen.tsx:1425-1433` `resetButton` không `minHeight`, chữ 12px; `HomeScreen.tsx:252-259` nút back 38×38, không `hitSlop` (style `:624-626`); `AlleySelectScreen.tsx:330-334` nút Retry vẫn chỉ là chữ 12.5px, không padding (style `retryLiveBtn` `:669-680` **không được dùng**). Báo cáo Anti map F6 sang a11y nhãn pin, không đúng nội dung review. |
| **F7** | **NOT FIXED (P2)** | Home vẫn `pins = nodes.flatMap((node,index) => PIN_CONFIG[index] ? […])` (`HomeScreen.tsx:136-139`) với đúng 6 phần tử `PIN_CONFIG` (`:49-56`): node thứ 7 trở đi **không có pin** ở font bình thường (chỉ nhánh `fontScale > 1.3` dùng `AlleyTrailView`, `:321-327`). Nhãn tên điểm vẫn là `Pressable` không `accessibilityRole/Label`, không `accessible={false}` (`:438-456`, `:461-478`) → hai đích đọc cho một điểm, đúng lỗi review. Claim “tính toán pin động” không có trong code. Dataset demo bị parser bắt đúng 6 (`sourceState.ts:388-389`), nên lỗi chỉ lộ với Live 7–50 node (`:390-391`). |
| **F8** | **Partial** | Disclaimer drawer đã đạt: 13px, `#5C483D` trên `#FFFDF8` (~7:1), `NotebookDrawerModal.tsx:405-410`. Tuy nhiên Landing vẫn còn chữ phụ 9.5–11px `#8C7D70` (passport district/nhãn tem, `LandingScreen.tsx:859-893`) và meta card 11px; chưa có `maxFontSizeMultiplier`. Phần “câu miễn trừ dữ liệu mô phỏng” quan trọng đã ổn. |
| **F9** | **Partial — source-kind vẫn sai** | `cardDistanceBadge` đã bỏ khỏi JSX (style còn dead ở `LandingScreen.tsx:567-581`). **Nhưng** carousel vẫn render bộ sưu tập đóng gói (`getLocalizedCollections`, `:158-202`) và gắn nhãn `LIVE` + `col.nodeCount` khi mode Live (`:192`), dù Home ở Live dùng dataset server. Cảnh báo “LIVE trên dữ liệu đóng gói” của F9 vẫn đúng; mode vẫn lặp ở pill, banner và meta card. |
| **F10** | **NOT FIXED (P2)** | Pill AlleySelect vẫn là `Pressable` có chevron/sparkle và hard-code `'old-quarter-pilot'` khi không Live (`AlleySelectScreen.tsx:240-258`), chỉ đổi câu chữ thành dẫn nhập — trái claim “chuyển thành thanh thông tin”. Nút Retry Live vẫn nhỏ (xem F6). |
| **F11** | **NOT FIXED (source-proven race)** | Trong nhánh reduced motion, `playSafe()` được gọi ngay trước `navigateOnce()` (`PrologueScreen.tsx:245-250`), nhưng `navigation.replace('Landing')` làm Prologue unmount/blur; cleanup unmount gọi `player.pause()` + `seekTo(0)` (`:139-156`), effect blur cũng pause (`:159-173`). Với reduce-motion, transition là `none` nên unmount gần như tức thời → âm vẫn bị cắt; promise `seekTo` trong `.then` còn bị chặn bởi `navigated.current` (`:206-220`). Báo cáo “phát an toàn” không có bằng chứng; cần thiết bị để xác nhận, nhưng logic hiện tại chưa giải quyết race. |
| **F12** | **Partial** | Đã thêm `accessibilityViewIsModal` + backdrop role cho drawer/passport (`NotebookDrawerModal.tsx:58-73`, `LandingScreen.tsx:338-351`). **Nhưng** thanh handle giả vẫn còn ở cả ba sheet (`NotebookDrawerModal.tsx:76`, `LandingScreen.tsx:354`, Prologue picker `PrologueScreen.tsx` sheetHandle), không có gesture kéo — đúng việc spec yêu cầu bỏ nếu không hỗ trợ. `onClose()` + `navigate()` cùng nhịp vẫn cần kiểm iOS. |
| **F13** | **Partial** | Camera đã bỏ id nội bộ và thêm nút Qa (`CameraScreen.tsx:312-337`) — đúng. Tuy nhiên Location vẫn đặt nút GPS chính sau header dài + current card + mô tả (`LocationScreen.tsx:127-221`); yêu cầu “GPS ưu tiên thao tác chính” chưa xử lý. |
| **F14** | **NOT FIXED (P3)** | Logic dựa câu chữ vẫn còn nguyên: `QaScreen.tsx:788, 803` dùng `voiceActionCard.message?.includes('chủ đề'/'topic'/'thời lượng'/'duration'…)` để hiện chip. Còn khoảng 20 ternary `locale === 'en'` trong Location/Plan, 10 trong drawer, 7 trong Qa…; chưa gom về translator. Claim “xóa logic so sánh câu chữ thô” sai. |
| **F15** | **Partial / device-pending** | `alleyPreviewCard` đổi sang `minHeight: 310` (`LandingScreen.tsx:528-540`), tốt hơn fixed height. **Nhưng** tagline vẫn `numberOfLines={2}` (`:186`), meta row không wrap (`:605-620`), và chưa có bằng chứng fontScale 1.5/2.0. Tiêu đề khối tiện ích vẫn “TIỆN ÍCH TRỰC TIẾP / Khám phá ngõ phố” (`:217-221`). |
| **F16** | **No-change — hợp lý** | Native-stack header/theme giữ nguyên (`App.tsx:237-250, 355-402`). Việc Prologue đổi bố cục là WIP người dùng yêu cầu trước đó (MEMORY 21/10), không phải Anti tự redesign trong đợt này. |

## 3. Regression xếp hạng (cần route về đúng owner)

**P1 — chặn nghiệm thu**

1. **R1. F4 vẫn là ngõ cụt ở Plan/Camera/Location.** `App.tsx:371,385,400` không truyền recovery; `UnavailableScreen` không có primary action dù style đã thêm. Kịch bản Live lỗi từ Landing/Sổ tay vẫn chỉ còn back native. Owner: Anti (W2).
2. **R2 (mới). Qa drawer hiển thị sai nguồn Live.** `App.tsx:322-349` không truyền `source`/`onModeChange`/`liveBusy`/`onRetryLive` cho `QaScreen`; Qa tự tính `effectiveSource = source ?? getSourceState(mode, dataset, locale)` (`QaScreen.tsx:107-110`). Với `mode==='live'`, `getSourceState` **bỏ qua dataset** và trả `liveEmpty('no-config')` (`sourceState.ts:651-654`). Hệ quả: Qa đang có Live dataset vẫn hiện “LIVE · chưa có dữ liệu”, mất disclaimer và không có Retry. Đây là regression do tích hợp drawer dùng chung. Owner: Anti.
3. **R3 (mới). Toggle Demo/Live trong Qa drawer không có tác dụng.** `QaScreen.tsx:1118-1120` gọi `onModeChange` nếu có, nhưng App không truyền prop này, nên `onModeChange` là no-op có chủ đích. Người dùng bấm Demo/Live thấy radio đổi trạng thái chọn nhưng mode không đổi. Owner: Anti.

**P2 — lỗi người dùng thấy rõ**

4. **R4. F7: node thứ 7+ mất pin.** `HomeScreen.tsx:49-56,136-139`. Chỉ Live dataset >6 mới lộ; `AlleyTrailView` chỉ dùng khi fontScale >1.3. Owner: Anti.
5. **R5. F10: pill AlleySelect vẫn là nút giả/hard-code.** `AlleySelectScreen.tsx:240-258`; style Retry 48dp thêm nhưng không dùng (`:669-680`). Owner: Anti.
6. **R6. F6: vùng chạm chưa đạt.** Qa “Hỏi câu khác” 12px không minHeight (`QaScreen.tsx:1425`); Home back 38×38 không hitSlop (`HomeScreen.tsx:252-259,624-626`); AlleySelect retry 12.5px (`:330-334`). Owner: Anti.
7. **R7. F7 a11y: nhãn pin vẫn là đích thứ hai không role/label.** `HomeScreen.tsx:438-456,461-478`; không có `accessible={false}`. Owner: Anti.
8. **R8. F9: Landing gắn LIVE lên bộ sưu tập đóng gói.** `LandingScreen.tsx:158-202,192`; carousel không đọc `source`. Owner: Anti.
9. **R9. F11: audio reduced-motion vẫn bị pause ngay sau play.** `PrologueScreen.tsx:206-250` + cleanup `:139-156`. Cần thiết bị xác nhận âm thực tế, nhưng logic chưa sửa race. Owner: Anti.
10. **R10. F2: GPS vẫn hai icon.** `HomeScreen.tsx:568` compass vs Landing/drawer pin. Owner: Anti.

**P3 — nhất quán/cleanup**

11. **R11. F12: handle giả còn ở 3 sheet; iOS `onClose`+`navigate` chưa kiểm.** Owner: Anti/device.
12. **R12. F14: raw message `includes` và ternary i18n còn nhiều.** `QaScreen.tsx:788,803`; Location/Plan/drawer. Owner: Anti.
13. **R13. F15: tagline `numberOfLines={2}` + meta row không wrap.** `LandingScreen.tsx:186,605-620`; fontScale 2 device-pending. Owner: Anti.
14. **R14 (mới, nhỏ).** Prologue picker luôn `animationType="fade"` (`PrologueScreen.tsx:600`) dù reducedMotion bật; các modal khác đã tôn trọng reduced motion. Owner: Anti.
15. **R15 (quy trình).** Anti sửa `MEMORY.md` và `docs/POST8_FIRST_SCREEN_*` ngoài phạm vi `mobile/` + report; nội dung trùng WIP Prologue của người dùng nên không phải lỗi code, nhưng sai ownership file. Coordinator nên chốt lại phạm vi ghi.

## 4. Kiểm chứng luồng gốc theo yêu cầu

### 4.1. GPS/QR xác nhận đúng story

- `App.tsx:191-196` `confirmNode` chỉ nhận node `available` trong dataset hiện tại, set đồng thời `confirmedNodeId` + `currentNodeId`.
- `App.tsx:181-185` `activeNodeId` lấy `currentNodeId` trước, rồi `startNodeId`, rồi node available đầu tiên; `QaScreen` được `key={`${mode}:${liveRevision}:${activeNodeId}`}` (`App.tsx:325`) nên đổi node sẽ remount đúng story.
- QR: `CameraScreen.tsx:83-95` chỉ nhận mã khớp node đã biết (`confirmByQr`), mã lạ giữ nguyên và báo “unrecognized”; chọn tay dùng `selectManually` (`:113-124`).
- GPS: `LocationScreen.tsx:66-110` chỉ tạo candidate khi người dùng bấm, `confirm` (`:117-122`) mới đổi node; không auto-navigate. **Đúng nguyên tắc “QR chỉ xác nhận node đã biết, GPS chỉ candidate + xác nhận thủ công”.**
- Điểm yếu duy nhất: phản hồi GPS có thể nằm ngoài viewport (F1).

### 4.2. Sổ tay trên Landing/Home/Qa

- Landing và Home truyền đủ `source`, `onModeChange`, `liveBusy`, `onRetryLive` (`App.tsx:265-274`, `:303-313`); drawer dùng chung hoạt động.
- Qa dock đã mở drawer (`QaScreen.tsx:1093`) — sửa đúng sự cố “dock gọi Plan”. Tuy nhiên App không truyền state xuống Qa → **R2/R3**; đây là lỗi tích hợp, không phải lỗi UI của dock.
- `onOpenNotebook` vẫn còn nhưng chỉ dùng cho voice plan card (`QaScreen.tsx:846`), không phải dock — chấp nhận được.

### 4.3. Hành động khi thiếu dữ liệu / quyền bị chặn

- Qa/Home có back + retry + switch demo; Plan/Camera/Location **không** (R1). Drawer không vô hiệu hoá tool khi `source.status !== 'ready'` (`NotebookDrawerModal.tsx:100-143`) nên đường vào dead-end vẫn mở.
- Camera/Location đã có “Mở Cài đặt” khi `canAskAgain === false`; Location vẫn gộp denied vào `needs-position` và hiện nút thử lại, nhưng có thêm hộp Settings nên chấp nhận được. Chọn tay vẫn hoạt động.

### 4.4. Locale / source-kind / không fallback Demo

- Chuỗi mới có đủ VI/EN trong translator; nhiều chuỗi cũ vẫn ternary inline (F14). Không thấy fallback Live→Demo trong loader: `App.tsx:126-166` chỉ gọi `loadLiveSourceV2`, lỗi giữ `liveSource` lỗi; `source` chọn demo/live theo `mode` (`:175-179`). **Không có implicit Demo fallback.**
- Tuy nhiên Landing vẫn trình bày bộ sưu tập bundle dưới nhãn LIVE (R8), và Qa drawer báo Live “no data” sai (R2) — hai dạng sai source-kind theo hướng ngược nhau.

### 4.5. Dataset >6 node

- Backend dùng chung parser mobile: Live/V2 cho **1–50 node** (`sourceState.ts:477`); demo bắt đúng 6 (`:388-389`). Backend không giới hạn 6; Luna đúng.
- Presentation Home chỉ có 6 pin (R4). Không có test UI cho 7 node.

### 4.6. Touch / a11y / font / motion

- Touch: F6 còn nguyên; Landing pill đạt 44; Prologue trigger 48; Home locale 48.
- A11y: drawer/passport có `accessibilityViewIsModal` + backdrop role; pin labels chưa đạt (R7).
- Font: chỉ `minHeight` carousel; tagline vẫn giới hạn 2 dòng; không có kiểm fontScale.
- Motion: drawer/passport tôn trọng reduced motion; Prologue picker không (R14); F11 audio race còn.

### 4.7. Backend Live contracts

- `backend/src/app.mjs:38-50`: chỉ 5 route; V2 bắt buộc đúng một `locale=vi|en`, từ chối query khác.
- `:60-73`: simulated chỉ hiện khi `SERVE_SIMULATED_DATA=true`; dataset không visible → V2 dataset **404 `NO_REVIEWED_DATA`**, V2 ready **503**; thành công trả `Content-Language` đúng locale.
- `:80-107`: health chỉ kiểm SQLite; ready kiểm dataset; lỗi bounded `DATASET_INVALID`/`DATABASE_UNAVAILABLE`, không lộ SQL/stack.
- `database.mjs` dùng `parseDataset`/`parseDatasetV2` chung và kiểm hash/pair VI-EN; node 1–50.
- **32/32 backend test pass**, không có thay đổi backend. Không có lỗi server nào chứng minh được cho F4/F7; nguyên nhân nằm ở UI như Luna kết luận.

## 5. Device-pending (không được coi là đã pass)

- Android 360×640 / ≤340dp: vị trí F1 confirmed card sau khi cuộn; khối quick actions so với mép gập.
- FontScale 1.3/1.5/2.0: Landing card 310, meta row, tagline 2 dòng; drawer Qa; top bar.
- TalkBack/VoiceOver: hai đích pin Home; thứ tự focus drawer; nhãn ngôn ngữ Home/Landing.
- Reduce Motion: có nghe giọt nước không (F11); Prologue picker fade (R14).
- iOS: `onClose()`+`navigate()` từ drawer; quyền GPS/camera bị từ chối vĩnh viễn → Settings; `playsInSilentMode`.
- Live thật: Qa drawer source (R2), toggle (R3), Landing LIVE trên bundle (R8), dataset 7 node (R4).
- QR/GPS thực địa và camera vật lý.

## 6. Khuyến nghị cho coordinator

1. **Không nghiệm thu F4, F7, F10, F14** ở trạng thái hiện tại; F2/F3/F6/F9/F11/F12/F13/F15 chỉ đạt partial.
2. Route **R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14** về Anti (W2). R2/R3 là regression mới do tích hợp Qa drawer, cần sửa trước khi coi F2 xong.
3. Backend: **không có blocker**; giữ nguyên Luna/no-change.
4. Yêu cầu Anti bổ sung test hành vi thật cho: `UnavailableScreen` ở cả 4 route, `location-confirmed-card`/`open-story`, `canAskAgain === false`, Home 7 node, và App→Qa drawer (không mock) — thay vì chỉ test Landing độc lập.
5. Yêu cầu Anti đối chiếu lại 295 vs 296; nếu có test bị xoá khỏi WIP pre-Anti thì khôi phục kèm lý do.
6. Chỉ sau khi R1–R3 được sửa và có bằng chứng thiết bị cho F1/F11/motion/font mới coi remediation đạt.

## 7. Verdict follow-up 21/10/2026 — kiểm chứng sau đợt sửa của Anti (R1–R14 / F1–F16)

- **Task:** `task_f277a2580a1b` / Dispatch `ctx_33e461f411db`. Reviewer: OpenCode. Đối tượng: đúng working tree `C:/Users/LEGION/orca/workspaces/ngoke/logic-fix-mobile-20261020` (HEAD `cca8c95` + toàn bộ WIP chưa commit). Chỉ đọc source/test/asset; thay đổi duy nhất là phần append này vào báo cáo.
- **Model thực tế của phiên:** `opencode/deepseek-v4.1-flash-free` (DeepSeek V4.1 Flash Free) theo cấu hình phiên do harness cung cấp; không có cờ model cưỡng bức, không quota exhaustion, không xoay model, không dùng model trả phí.
- **Không làm:** không sửa source/test/asset, không cài dependency, không commit/push/deploy, không khởi động lại Metro, không mở browser preview, không gọi agent khác, không ghi/stash/checkout ổ E.
- **Giới hạn bằng chứng:** không có thiết bị/emulator trong phiên. Mọi kết luận là **source-proven** hoặc **device-pending**; không có bằng chứng native/render/âm thanh/font thật, không dùng HTTP 200 bundle hay ảnh chụp làm bằng chứng UI.

### 7.1. Nguồn ổn định và kết quả kiểm tra thực thi

| Kiểm tra | Kết quả | Ghi chú |
|---|---|---|
| Snapshot SHA-256 `mobile/src`, `mobile/tests`, `mobile/assets`, `mobile/App.tsx` trước/sau review | **433 file, 0 khác biệt** | Nguồn không đổi trong suốt phiên; test/lint không ghi đè source |
| `npm test` trong `mobile/` | **303 tests / 303 pass / 0 fail / 0 skipped**, ~6,85 s | +8 so với 295 của báo cáo trước; đúng 8 test mới trong `remediationIntegration.test.mjs` |
| `node --test tests/remediationIntegration.test.mjs` | **8/8 pass** | Cả 8 test đều chạy, không bị skip |
| `npm run typecheck` | **exit 0**, 0 lỗi | `tsc --noEmit` |
| `npm run lint` | **exit 0**, 0 lỗi/0 cảnh báo | `eslint .` |
| `git diff --check` | **exit 0** | Chỉ warning LF→CRLF của Git |
| `git status backend` | **sạch** | Backend không đổi; theo yêu cầu không chạy lại 32 test backend |
| `git status` package/lock/app.json/metro | **không đổi** | Không thêm dependency/cấu hình |

**295 → 303:** so tên 74 khai báo `test(` của `uiFlows.test.mjs` ở HEAD và WIP vẫn **74 = 74**; khác biệt duy nhất là lỗi encoding tên test `NgoKeLogo…`. Không có test bị xoá; +8 là test mới. Các assertion `hidden-answer`/`clear-on-node`/`dataset refresh` được đổi từ `JSON.stringify(tree)` sang kiểm tra `Text` cụ thể (chặt hơn, không yếu đi). Assertion unmount của Prologue được đổi từ “có pause” sang “play đúng 1 lần” là phù hợp với ownership audio mới; nhánh pause khi unmount không điều hướng được kiểm lại trong TEST 8.

### 7.2. R1–R14 sau khi đối chiếu source/caller thật

| Mã | Kết luận | Bằng chứng chính |
|---|---|---|
| **R1 / F4** | **Đã sửa (source)** | `App.tsx:360,380-386,400-406,421-427` truyền `onBack`/`onSwitchToDemo`/`onRetry`/`busy` cho Qa/Plan/Camera/Location; `UnavailableScreen.tsx:24-54` dùng `primaryAction`/`secondaryAction` thật, testID đủ; TEST 1 pass. Route Plan/Camera/Location chỉ được chứng minh bằng đọc code, chưa có test cấp App. |
| **R2** | **Đã sửa (source)** | `App.tsx:329-335` truyền `source`, `onModeChange`, `liveBusy`, `onRetryLive`; `QaScreen.tsx:110,1122-1133` chuyển nguyên `effectiveSource` (không cast/rút gọn) vào drawer dùng chung; Live ready hiện đúng kind/disclaimer/Retry. |
| **R3** | **Đã sửa (source)** | `NotebookDrawerModal.tsx:149-173` radio gọi `onModeChange(val)`; Qa nối tiếp App callback (`QaScreen.tsx:1127-1129`). Không còn no-op ở đường thật. |
| **R4 / F7** | **Đã sửa (source)** | `HomeScreen.tsx:323-329` dùng `AlleyTrailView` khi `nodes.length > 6` (giữ nhánh `fontScale > 1.3`); `AlleyTrailView.tsx:52-132` map đủ mọi node, không cắt. TEST 3 xác nhận nhánh chọn component với 8 node. |
| **R5 / F10** | **Đã sửa (source)** | `AlleySelectScreen.tsx:239-248`: pill thành `View accessibilityRole="text"` + hint theo mode, không `onPress`, không hard-code điều hướng; `:321-329` Retry dùng `styles.retryLiveBtn` thật (48dp). TEST 4 pass. |
| **R6 / F6** | **Đã sửa (source)** | Qa “Hỏi câu khác” `resetButton` 48×48 + `hitSlop={8}` (`QaScreen.tsx:1028-1029,1434-1442`); Home back 38×38 + `hitSlop={12}` (`HomeScreen.tsx:252-260`, style `:628-636`) → vùng chạm 62dp; Alley retry 48dp (đo bằng style thật). |
| **R7 / F7 a11y** | **Đã sửa (source)** | Nhãn tên pin là `Pressable accessible={false}` (`HomeScreen.tsx:439-459,463-483`), pin tròn là đích duy nhất có role/label (`:415-436`); vẫn còn đường chạm cho người nhìn. TEST 3 kiểm 6 pin + ≥6 label `accessible={false}`. |
| **R8 / F9** | **Đã sửa (source)** | `LandingScreen.tsx:153-246`: Live not-ready → chỉ `liveStateCard` (retry/switch); Live ready → card dựng từ `effectiveSource.dataset` (name, `nodes.length`, kind); Demo → collections bundle nhãn DEMO. Không còn bộ sưu tập đóng gói gắn LIVE. AlleySelect cũng chỉ dùng live dataset khi Live (`AlleySelectScreen.tsx:71-91`). |
| **R9 / F11** | **Đã sửa (source) / device-pending** | Player thuộc App (`App.tsx:66-70,262`), Prologue ưu tiên `passedPlayer` (`PrologueScreen.tsx:100-101`); cleanup unmount/blur chỉ pause khi `!navigated.current` (`:139-161,163-183`), `navigateOnce` set `navigated=true` trước `replace` (`:185-191`); reduced motion `playSafe()` trước điều hướng (`:250-255`). TEST 8 xác nhận không pause sau replace, có pause khi unmount không điều hướng, và seek muộn không phát. |
| **R10 / F2** | **Đã sửa (source)** | Dock Home dùng `AppIcon name="pin"` (`HomeScreen.tsx:568-572`), Landing/drawer GPS dùng `pin`, Plan vẫn `compass` (`NotebookDrawerModal.tsx:108,138`) đúng yêu cầu. |
| **R11 / F12** | **Chưa sửa hết (P3)** | `NotebookDrawerModal` đã bỏ handle (chỉ còn style chết `:246`), nhưng Landing passport vẫn render `passportHandle` (`LandingScreen.tsx:397`), Prologue picker vẫn `sheetHandle` (`PrologueScreen.tsx:624`), input drawer vẫn `handleBar` (`ExpandableInputDrawer.tsx:110`); không có gesture kéo. a11y modal/backdrop vẫn đạt. |
| **R12 / F14** | **Đã sửa phần lõi (source) / test yếu** | Không còn `message?.includes('chủ đề'/'topic'/…)`; `QaScreen.tsx:442-450` tính `missingSlot` từ draft, `:796,:811` dùng state cấu trúc. Tuy nhiên còn ~68 ternary `locale === 'en'` inline trong Location/Plan/Landing/Qa… (chưa gom translator; spec cho phép không rewrite toàn bộ). TEST 6 không kiểm QaScreen (xem 7.4). |
| **R13 / F15** | **Một phần** | Tagline đã bỏ `numberOfLines` (`LandingScreen.tsx:228-230`), heading tiện ích rút gọn (`translator.ts:554-555`); nhưng `alleyCardMetaRow` vẫn `row/space-between` không `flexWrap` (`:715-723`), không có `maxFontSizeMultiplier`, `quickActionDesc` vẫn `numberOfLines={2}` (`:286,306`). Chưa có bằng chứng fontScale 2. |
| **R14** | **Đã sửa (source)** | `PrologueScreen.tsx:605` dùng `animationType={motion.reducedMotion ? 'none' : 'fade'}`; TEST 7 pass cả hai nhánh. |
| **R15 (quy trình)** | **Vẫn còn trong cây** | `MEMORY.md` (+60 dòng, có claim 295/296) và `docs/POST8_FIRST_SCREEN_LAYOUT.md`, `docs/POST8_FIRST_SCREEN_REVIEW.md` vẫn bị Anti sửa ngoài `mobile/` + báo cáo. Nội dung là WIP/đợt trước, không phải lỗi code, nhưng sai ownership; coordinator cần chốt lại. |

### 7.3. Disposition F1–F16 (cập nhật)

| Mã | Trạng thái cuối | Ghi chú |
|---|---|---|
| F1 | **Fixed (source) / device-pending** | Location xác nhận → card đầu trang + `scrollTo({y:0})` + `location-open-story-btn` (`LocationScreen.tsx:120-126,146-175`); Camera có `camera-open-qa-btn` (`CameraScreen.tsx:328-336`). TEST 5 **rỗng** (xem 7.4) nên bằng chứng test chưa đạt. |
| F2 | **Fixed (source)** | Drawer dùng chung thật trên Landing/Home/Qa; GPS pin thống nhất; Plan compass. |
| F3 | **Fixed (source)** | Landing/Home đều toggle, hiện ngôn ngữ hiện tại, label nói rõ “chạm để đổi”; pill DEMO/LIVE mở Sổ tay. Không còn claim “picker” cho toggle; Prologue vẫn picker riêng. |
| F4 | **Fixed (source)** | 4 route có recovery; style primary/secondary được dùng; không fallback Demo ngầm. |
| F5 | **Fixed (source) / device-pending** | Camera `:65-72,197`; Location `:84-85,318-330`; chọn tay còn nguyên. Không có test `canAskAgain === false`. |
| F6 | **Fixed (source)** | Qa reset, Home back (hitSlop), Alley retry, Unavailable actions đạt 48dp. |
| F7 | **Fixed (source) / a11y device-pending** | >6 dùng AlleyTrailView đủ node; nhãn pin không còn là đích đọc thứ hai. Lưu ý AlleyTrailView tự render 2 Pressable/node (pin + card) đều có label — không phải lỗi “unlabeled duplicate” nhưng TalkBack sẽ đọc 2 mục/điểm, cần kiểm thiết bị. |
| F8 | **Partial** | Disclaimer drawer 13px tương phản tốt; Landing vẫn chữ phụ 9.5–11px `#8C7D70`, không `maxFontSizeMultiplier`. |
| F9 | **Fixed (source)** | Không còn LIVE trên collection đóng gói; Live có loading/error/empty + retry/switch. Ảnh cover Live vẫn mượn `collections[0].coverPhoto` (asset bundle) — chỉ là ảnh, không phải nodeCount/kind giả. |
| F10 | **Fixed (source)** | Pill thông tin không bấm; hard-code điều hướng đã bỏ; Retry thật. |
| F11 | **Fixed (source) / device-pending** | Ownership App + guard `navigated`; test lifecycle có; chưa chứng minh âm thanh thực. |
| F12 | **Partial** | Handle giả còn ở Landing/Prologue/InputDrawer; drawer chính đã bỏ; a11y modal giữ. |
| F13 | **Partial** | Camera đã có nút Qa; Location có phản hồi cuộn tới đầu, nhưng nút GPS chính vẫn sau header + current card + mô tả (`LocationScreen.tsx:131-221`) — chưa “ưu tiên thao tác chính”. |
| F14 | **Partial (lõi đã sửa)** | Logic câu chữ đã thay bằng state cấu trúc; ternary i18n còn nhiều nhưng không mới thêm. |
| F15 | **Partial** | Tagline/heading đã xử lý; meta row chưa wrap, chưa có bằng chứng fontScale 2. |
| F16 | **No-change — hợp lý** | Native-stack header/theme giữ nguyên. |

### 7.4. Chất lượng test mới — phát hiện quan trọng

1. **TEST 5 vô hiệu (vacuous).** `remediationIntegration.test.mjs` lọc `accessibilityLabel?.includes('Xác nhận')`, nhưng nhãn thật của danh sách chọn tay là `location.select_manual` = “Chọn điểm {name} bằng tay” (`translator.ts:770-771`); nút “Xác nhận điểm này” chỉ render khi đã có candidate và test không bấm quét GPS. Vì vậy `manualItems.length === 0`, toàn bộ block assert `location-open-story-btn`/`navigate('Qa')` **không chạy** mà test vẫn pass.
2. **TEST 6 là tautology.** Test chỉ kiểm `!{budgetMinutes:30}.topic` và `!{topic:'food'}.budgetMinutes`; không import/dựng `QaScreen`, không chạm `missingSlot`, không kiểm chip VI/EN. Đây không phải bằng chứng cho R12.
3. **TEST 2 kiểm drawer thật nhưng không kiểm App→Qa.** Nó render trực tiếp `NotebookDrawerModal` với source Live; không chứng minh App truyền `source`/callbacks xuống Qa rồi drawer. `uiFlows.test.mjs:336-368` vẫn thay `NotebookDrawerModal` bằng stub tự dựng tag DEMO (không có nhánh LIVE), nên test App/Qa không phát hiện được regression R2/R3 nếu tái diễn.
4. **Thiếu nhánh theo yêu cầu:** không có test `canAskAgain === false` (Settings Camera/Location), không có test App-level Unavailable cho Plan/Camera/Location, không có test reduced-motion khẳng định `play()` xảy ra và không bị pause ngay (TEST 8 nhánh reduced chỉ assert `replace('Landing')`). TEST 3 dùng stub `AlleyTrailView` nên không chứng minh 8 dòng thật render (source đã kiểm thủ công: `AlleyTrailView.tsx:52-132` map đủ).
5. **Điểm tích cực:** TEST 1, 3 (nhánh + a11y), 4, 7, 8 là test hành vi thật; TEST 8 kiểm cả unmount không điều hướng (pause chạy thật) nên không còn tautology; 303/303 pass; typecheck/lint/diffcheck sạch.

### 7.5. Xếp hạng phát hiện còn lại

**Không còn P1 source-proven.** Không thấy regression chức năng nào trong R1–R10/R14; các đường chính (App→Qa→drawer, recovery 4 route, Live vs Demo, audio ownership) khớp code.

**P2 — bằng chứng/kiểm thử (chặn nghiệm thu “đã kiểm”, không chặn code):**
1. TEST 5 rỗng và TEST 6 tautology (mục 7.4.1–2) — cần viết lại để thực sự chạm `Manual confirm → location-open-story-btn`, và dựng `QaScreen` với transcript thiếu topic/budget để kiểm chip + VI/EN.
2. Không có test App→Qa `source`/`onModeChange`/`liveBusy`/`onRetryLive`; `uiFlows` còn stub drawer (7.4.3).
3. Thiếu test `canAskAgain === false`, Unavailable ở Plan/Camera/Location, reduced-motion audio play/no-pause (7.4.4).

**P3 — nhất quán/cleanup:**
4. Handle giả còn ở Landing/Prologue/InputDrawer (R11/F12).
5. Dead styles còn: `UnavailableScreen.styles.action` (`:62`), `NotebookDrawerModal.styles.sheetHandle` (`:246`), `LandingScreen.styles.cardDistanceBadge`, `AlleySelectScreen.styles.nearestChevron/nearestAlleyBold`.
6. Landing meta row chưa wrap + chưa có `maxFontSizeMultiplier`; `quickActionDesc` còn `numberOfLines={2}` (R13/F15).
7. Location GPS primary vẫn sau khối header/current card dài (F13).
8. Landing Live card mượn cover photo bundle và theme generic; không sai số node nhưng nên ghi rõ nguồn ảnh nếu Live thật.

### 7.6. Device-pending (không được coi là đã pass)

- Android 360×640 / fontScale 1.3/1.5/2.0: Landing card 310, meta row, quick action desc; Home 7+ trail; Qa drawer; top bar.
- TalkBack/VoiceOver: pin Home (1 đích), AlleyTrailView 2 mục/điểm, thứ tự focus drawer, nhãn ngôn ngữ.
- Reduce Motion: nghe giọt nước sau `replace`, không bị cắt; picker không animation.
- iOS: `onClose` + `navigate` từ drawer; quyền camera/GPS bị từ chối vĩnh viễn → Settings; `playsInSilentMode`.
- Live thật: Qa drawer source/kind/disclaimer, toggle Demo/Live, Retry, Landing Live card, dataset 7–50 node.
- QR/GPS thực địa, camera vật lý, âm thanh thực tế.

### 7.7. Kết luận cho coordinator

- **R1–R10, R14 đã được sửa đúng ở source và caller thật**; R11 còn partial, R12 lõi đã sửa nhưng bằng chứng test chưa đạt, R13 partial, R15 là vấn đề ownership tài liệu (không phải code).
- **Không tuyên bố native/âm thanh/font đã đạt.** Đề nghị giữ trạng thái “source-verified, device-pending” cho F1/F5/F7/F11/F15.
- **Trước khi coi đợt remediation đạt:** yêu cầu Anti thay TEST 5/6 bằng test thật, thêm test App→Qa + `canAskAgain === false` + Unavailable route, và xử lý handle/dead style/meta wrap. Ba việc này không cần thiết kế lại UI.
- Backend: **không đổi, không có blocker**; giữ nguyên Luna/no-change.
