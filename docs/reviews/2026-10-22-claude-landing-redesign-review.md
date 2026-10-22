# Claude — review độc lập Landing redesign (22/10/2026)

Người review: Claude (theo yêu cầu người dùng, chỉ đợt này; chỉ đọc, không sửa source/test/asset/config). Cây làm việc: `valentino/logic-fix-mobile-20261020`, HEAD `4bc7d26` + WIP chưa commit (13 mục `git status`). Căn cứ: `docs/LANDING_REDESIGN_SPEC_20261022.md`, `docs/reviews/2026-10-22-claude-landing-design-is.md`, báo cáo Anti `docs/reviews/2026-10-22-antigravity-landing-redesign.md`.

## 1. Kết luận nghiệm thu

**CHẤP NHẬN CÓ ĐIỀU KIỆN trong phạm vi môi trường hiện có.** 9/9 hạng mục spec được triển khai trong code; 7/7 nhóm test (a–g) có mặt và chạy xanh. Không có P1. Có **1 lỗi P2 source-proven** (dòng trạng thái nói sai nguồn gốc dữ liệu) cần Codex quyết định sửa hay chấp nhận, cùng vài P3. Phần native/thị giác vẫn pending (mục 5). Không có sửa tự động, không mở vòng review mới.

## 2. Lệnh đã chạy độc lập (cây làm việc hiện tại)

| Lệnh | Kết quả thật |
| --- | --- |
| `npm test --prefix mobile` | exit 0 — `tests 328, pass 328, fail 0, cancelled 0, skipped 0, todo 0` (khớp Anti; 321 cũ + 7 mới) |
| `npm run typecheck --prefix mobile` | exit 0, không lỗi |
| `npm run lint --prefix mobile` | exit 0, không cảnh báo |
| `git diff --check` | exit 0 (chỉ cảnh báo LF→CRLF của git, không lỗi khoảng trắng) |
| `curl -I` Metro 8082 bundle iOS / Android (chỉ đọc, `dev=true`) | HTTP 200 / HTTP 200 |

Không restart Metro, không ghi ngoài báo cáo này. Không chạy thiết bị native.

## 3. Phát hiện (P1/P2/P3)

### P1 — không có.

### P2-1 (source-proven): dòng trạng thái luôn nói "nội dung mô phỏng", sai với Live và với bộ sưu tập đã duyệt
- Bằng chứng: `mobile/src/screens/LandingScreen.tsx:148-152` dựng dòng chữ từ `landing.mode_status` với chỉ tham số `mode` (không đọc `effectiveSource` hay `kind`). Chuỗi cố định "Truyện chữ · nội dung mô phỏng · {mode}" / "Text stories · simulated content · {mode}" (`mobile/src/i18n/translator.ts:562`, `:962`).
- Kích hoạt: (a) demo + carousel có `old-quarter-pilot` / `old-quarter-three-lenses` (`collections.ts:86,96`, `kind: 'reviewed'`) — thẻ ghi "Đã duyệt"/"Có nguồn · chưa duyệt chính thức" (`LandingScreen.tsx:259-261`) ngay dưới dòng "mô phỏng"; (b) Live + dataset `reviewed` → Notebook ghi "LIVE · dữ liệu đã duyệt" (`NotebookDrawerModal.tsx:265-266`) còn Landing ghi "mô phỏng · Live"; (c) Live đang loading/error/empty vẫn "mô phỏng · Live".
- Tác động: vi phạm yêu cầu #4 ("nêu đúng chế độ") và tiêu chí "trạng thái Demo/Live **và nguồn gốc dữ liệu** trung thực". Lỗi này kế thừa từ banner cũ (cùng chuỗi) nên không phải hồi quy, nhưng redesign tuyên bố "nêu đúng" mà không đạt. Notebook mới là nơi tính đúng provenance — Landing nên dùng cùng logic (hoặc bỏ "mô phỏng" khỏi dòng chung và chỉ giữ chế độ).
- Gap test: không test nào dựng `mode: 'live'` hay collection `reviewed` cho dòng trạng thái (`landingRedesign.test.mjs` chỉ `mode: 'demo'`, so với đúng chuỗi cố định → test tautological với bug này).

### P3-1: key i18n chưa "đổi tên", còn alias chết
- `landing.soundscape_banner` vẫn còn ở `translator.ts:162,563,963` (alias) dù spec #4 yêu cầu đổi tên và cập nhật mọi chỗ dùng. Grep `mobile/src`, `mobile/tests`: **không còn chỗ dùng** → dead key. Anti ghi "giữ alias tương thích ngược" (có ghi trong báo cáo, nên không giấu) nhưng không có caller nào cần. Có thể xóa khi Codex duyệt.
- Dead key khác sau khi bỏ khối: `landing.featured_section_pre`, `landing.quick_section_pre`, `landing.quote_text`, `landing.quote_author`, `landing.passport_close_label` — không còn dùng trong `src` (chỉ test tham chiếu quote_* để khẳng định vắng mặt). Spec cho phép giữ; đã ghi ở đây để Codex biết.

### P3-2: thẻ `fiction-letter` dùng cover trùng ảnh nền
- `collections.ts:75` `coverPhoto: HERO_PHOTO`; hero-moss WIP đổi `HERO_PHOTO` sang `pexels_demo_06.jpg` (`photoMap.ts:4`) nên thẻ này hiển thị ảnh nét **cùng ảnh** với nền mờ, trong khi 4 ngõ còn lại có cover riêng (`ngophatloc_01`, `bach-ma`, `dinh-thanh-ha-1`, `pho-suong-1`). Đáp ứng chữ "cover riêng của collection" về mặt dữ liệu nhưng không tách biệt thị giác. Ghi nhận, chỉ thị giác/dữ liệu, không phải lỗi logic.
- Thẻ Live-ready dùng `collections[0].coverPhoto` (`LandingScreen.tsx:219`) = cover của `fiction-letter`, tức ảnh không thuộc dataset server (kế thừa từ HEAD, không phải hồi quy). Thẻ này còn `district` = chuỗi id thô (`:215`).

### P3-3: hero-moss WIP đổi attribution mặc định (ngoài phạm vi redesign nhưng nằm trong cây)
- `photoMap.ts:266` `getNodePhotographer` mặc định giờ luôn trả `'HONG SON (Pexels)'`, tham số `locale` không còn dùng. Mọi node thiếu metadata sẽ bị gán ảnh-gia này, kể cả khi ảnh khác nguồn. Đây là WIP được yêu cầu giữ nguyên nên **không** yêu cầu sửa trong đợt này; chỉ cảnh báo tính trung thực nguồn ảnh trước khi commit.

### P3-4: lệch nhỏ về ngữ nghĩa a11y / test (không chặn)
- `LandingScreen.tsx:99` `accessibilityRole="radiogroup"` bọc hai `Pressable` role `button` + `selected` (không phải `radio`+`checked`). Trình đọc màn hình có thể đọc "button, selected"; chấp nhận được nhưng không nhất quán với Notebook (`radio`+`checked`, `NotebookDrawerModal.tsx:237-239`). Native-pending.
- Hardware back trên subview Passport gọi `handleClose` (`NotebookDrawerModal.tsx:68`) → đóng cả Sổ tay, không quay về menu. Spec chỉ yêu cầu "back/close hoạt động"; nút `‹` làm đúng. Gợi ý, không phải lỗi.
- Nút Retry/Switch trong thẻ live-state (`LandingScreen.tsx:185-201`) vẫn không có `accessibilityLabel` (kế thừa, spec yêu cầu giữ nguyên).
- Test (b) chỉ khẳng định EN `selected=false` ở trạng thái mặc định; không test `selected` đổi sau khi chọn EN (test (g) kiểm callback `setLocale('en')` và chuỗi EN nhưng không kiểm tô sáng). Vùng lỗ nhỏ.

## 4. Đối chiếu từng yêu cầu spec

| # | Yêu cầu | Kết quả | Bằng chứng |
| --- | --- | --- | --- |
| 1 | Nền blur ~14, scrim `rgba(18,30,23,0.68)`, không dependency | **Đạt (code)** | `LandingScreen.tsx:66-72,426-429`; `ImageBackground` forward `blurRadius`; `git diff` không đụng `package.json`. Hiển thị blur iOS/Android: pending |
| 2 | Cover riêng, bỏ scrim 0.45, dải đáy `rgba(20,22,16,0.78)`, chữ vàng chỉ trong dải | **Đạt**, với P3-2 | `:239,247-264,598-611`; vàng `#D4AF37` chỉ ở `alleyCardDistrict` trong footer; "Xem tất cả" trắng 90% (`:555`) |
| 3 | Header VI\|EN phân đoạn + Sổ tay, giữ `locale-switch`, bỏ pill DEMO | **Đạt** | `:95-144`; `selected` theo `locale`, `onPress → setLocale` thật |
| 4 | Dòng trạng thái, bỏ banner/`· Demo`, đổi tên key | **Một phần** | Dòng + bỏ banner/`· Demo`: đạt. Provenance sai: **P2-1**. Đổi tên key: P3-1 |
| 5 | Bỏ quote, Passport vào Sổ tay, bỏ pretitle | **Đạt** | Landing không còn quote/passport/pretitle; Passport = subview trong một `Modal` (`NotebookDrawerModal.tsx:46,82-144,215-225`), không modal chồng |
| 6 | Hai ô công cụ stretch, `minHeight` 72, title 1 dòng, desc 2 dòng, giữ testID | **Đạt** | `:286-331, 647-672` |
| 7 | Chạm 44 pt | **Đạt (code)** | See all `minHeight 44` (`:541-543`); segment/notebook 44×44; close/back 44×44 (`Notebook…:359-381`); mode option 48. Đo thực: pending |
| 8 | Chữ ≥12, nhãn hoa ≥11 | **Đạt** | grep `fontSize` trong 2 file: nhỏ nhất 11 (chỉ nhãn `uppercase`: `cardThemeTagText`, `drawerPhase`, `passportPhase`, `badgeSampleText`, **và `sourceStateTag` `Notebook…:464-467` 11px — nhãn viết hoa trong nội dung, hợp lệ**) |
| 9 | Giữ live-state, điều hướng, pipeline, stacking, logo, entrance | **Đạt** | `liveStateCard` nguyên; `AlleySelect`/`Home`/`Location` giữ; `getLocalizedCollections`/`getBundledDataset` giữ; `fontScale>1.3` header, `>1.2` section/quick giữ; `useEntranceFadeSlide` ×3 |

### 7 nhóm nghiệm thu
1. **VI|EN thật:** selected + callback thật — đạt (test b, g).
2. **Demo/Live + provenance:** chế độ đúng; provenance dòng trạng thái **sai** (P2-1). Notebook đúng.
3. **Không còn DEMO giả/banner/quote:** đạt (test a; kiểm cả bằng đọc code).
4. **Cover riêng + footer:** đạt, P3-2.
5. **Passport trong một modal, back/close:** đạt (test c chạy `back`, `close` thật, đếm đúng 1 `Modal`).
6. **Callbacks mode/retry/busy/source, caller chung:** `HomeScreen.tsx` truyền `mode/source/onModeChange/liveBusy/onRetryLive` (`:600-605`), App truyền đầy đủ cho Landing (`App.tsx:271-279`); props `NotebookDrawerModalProps` không đổi → tsc xanh. Lưu ý Landing bọc `onModeChange` bằng closure `if (onModeChange)` (`:342-344`) — chỉ im lặng nếu caller không truyền, App luôn truyền. **Hệ quả không mong muốn nhỏ:** Passport tile + chạm 44/12px nay cũng xuất hiện trong Sổ tay của Home/Qa (modal dùng chung) — hợp lý với spec "một modal" nhưng là thay đổi hành vi ở màn ngoài Landing; Anti nói "không cần sửa dòng nào" là đúng về code, không đúng về hành vi hiển thị.
7. **i18n đổi tên + dùng thật:** thêm key mới dùng thật; rename chưa trọn (P3-1).

## 5. Độ chính xác test (vacuous/tautological?)
- 7 test mới **không rỗng**: dựng thật `LandingScreen`/`NotebookDrawerModal` bằng transpile + mock RN, khẳng định `blurRadius===14`, testID, `accessibilityState`, thứ tự điều hướng, 1 `Modal`, style `minHeight/width/height`, `numberOfLines`. Thất bại sẽ bắt được thay đổi thật.
- Điểm yếu: (1) chỉ `mode:'demo'`, không có ca Live/reviewed → không bắt P2-1 (chuỗi kỳ vọng lấy từ chính key, tautological với bug này); (2) `coverPhoto` mock là `1,2,3`, không có assert cover riêng từng collection; (3) `__windowDimensions` định nghĩa trong harness mới nhưng **không test mới nào dùng** — bằng chứng stacking fontScale chỉ đến từ test cũ `uiFlows.test.mjs` (~3120–3210, vẫn pass trên header mới); báo cáo Anti nói stacking được "kiểm chứng qua unit test giả lập" — đúng nhờ test cũ, không phải test mới; (4) mock `SourceState` dùng `sources.getSourceState('demo', fixture, 'vi')` thật — **không** có SourceState giả hay callback noop che lỗi (trừ `onModeChange: () => {}` ở test (c)/(f) không liên quan hành vi kiểm); (5) test (d) chỉ kiểm callback `'live'` được gọi, không kiểm retry/busy ở modal.
- Test cũ bị sửa (`landingQuickActions.test.mjs` ×2, `uiFlows.test.mjs` ×1): đổi từ "có pretitle/quote" sang "không có" — đúng spec, không hạ tiêu chuẩn; Anti đã nêu rõ trong báo cáo.

## 6. Đối chiếu tuyên bố của Anti
| Tuyên bố | Phán quyết |
| --- | --- |
| 328/328 pass, tsc/lint/diff sạch, bundle 200 | **Xác nhận** độc lập (mục 2) |
| "Hoàn thành toàn bộ 9 hạng mục và 7 nhóm" | **Phần lớn đúng**; #4 provenance sai (P2-1), rename key chưa trọn (P3-1) |
| "Tỷ lệ tương phản ~6.5:1 và >7:1" | **Không chấp nhận làm bằng chứng.** Đây là ước lượng lý thuyết do Anti tự nói chưa đo; không đo bằng ảnh chụp nên tôi không xác nhận cũng không bác bỏ số. Phải coi là *chưa kiểm* |
| Nút bánh răng xanh "là overlay của Expo Go" | **Chưa chứng minh.** Spec yêu cầu chỉ ghi nếu tìm thấy nguồn. Tôi grep `mobile/src` cho `gear`/`cog`/`⚙`/`settings`: chỉ thấy liên kết chữ "Mở cài đặt" (`VoiceInteractionDock.tsx:140-147`, `LocationScreen`, `CameraScreen`, `QaScreen`), không thấy nút tròn/biểu tượng bánh răng trên Landing; việc nó là dev overlay là suy luận hợp lý, chưa có ảnh chụp/bản build xác nhận → để ở "native-pending", không kết luận "sẽ không xuất hiện khi standalone" |
| "Không còn cỡ chữ 9/9.5/10" | **Đúng** trong 2 file đã sửa |
| Passport "bảo toàn hành vi hiện có" | Hành vi nội dung giữ; hình thức đổi từ modal riêng sang subview (có chủ đích, đã ghi) |
| "Aesthetic/thẩm mỹ cải thiện" | Không có ảnh chụp hay số đo; tôi không chấm điểm thị giác |

## 7. Chưa kiểm / native-pending (không phải blocker code)
- Blur thật trên iOS/Android (hiệu năng, độ mờ), có bị `blurRadius` 14 trông "đục" hay không.
- `fontScale` 1.3 / 2.0 trên máy thật (ngắt dòng tiếng Việt, `numberOfLines`, header 3 phần).
- Màu/tương phản thực đo bằng ảnh chụp; trình đọc màn hình thật (radiogroup/selected, subview Passport, `accessibilityViewIsModal`).
- Reduced motion trên Landing (hook `useEntranceFadeSlide` không đổi; modal dùng `reducedMotion → animationType none`, đọc code đạt, chưa chạy máy).
- Nút bánh răng xanh (nguồn gốc).
- Bundle HTTP 200 chỉ chứng minh bundle build, không chứng minh render đúng.

## 8. Hạn chế của review này
Không chạy thiết bị/emulator, không chụp màn hình, không đo tương phản. Dựa vào đọc code, chạy 4 lệnh kiểm và 2 probe Metro đọc-chỉ. Chưa rà các màn khác ngoài caller của `NotebookDrawerModal`.

## 9. Việc cần người dùng quyết / tự làm
- **Cần quyết:** chấp nhận P2-1 (sửa dòng trạng thái theo provenance) hay để theo spec chữ ví dụ. Đề xuất: sửa — dùng cùng nhánh logic với `NotebookDrawerModal.tsx:260-274`, hoặc chỉ hiển thị chế độ, không khẳng định "mô phỏng". Hệ quả nếu để: Landing tự mâu thuẫn với thẻ "Đã duyệt".
- **Tự làm (thiết bị):** chạy Expo Go trên máy thật kiểm các mục ở mục 7; chụp ảnh nếu cần số đo tương phản. Không `[ngoài plan]`.

Các mặc định (Demo/Live chỉ là nhãn, bỏ quote, Passport vào Sổ tay, nền mờ) đã được Anti ghi rõ là chưa duyệt; tôi không tạo cửa duyệt mới theo chỉ dẫn spec.
