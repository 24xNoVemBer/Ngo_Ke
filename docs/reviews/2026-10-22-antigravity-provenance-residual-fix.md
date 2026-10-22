# Báo cáo: Xử lý Triệt để Ba Phát hiện P2 về Giao diện Nguồn/Mô phỏng (Residual Provenance Cleanup)

- **Thời gian thực hiện:** 22/10/2026
- **Worker:** Antigravity (W2)
- **Dispatch ID:** `ctx_0b81e48b15cb`
- **Task ID:** `task_795f95700239`
- **Baseline Git HEAD:** `4bc7d26` + WIP
- **Tài liệu đối chiếu:** `docs/reviews/2026-10-22-claude-provenance-ui-cleanup-review.md`

---

## 1. Tóm tắt nội dung thực hiện (Executive Summary)

Đã giải quyết triệt để và chính xác 3 phát hiện P2 còn sót và mục P3-c theo đánh giá độc lập của Claude và chỉ thị dứt khoát của người dùng ("toàn bộ giao diện nguồn/mô phỏng phải biến mất ở cả VI và EN"):
1. **P2-1 (Sổ tay):** Ẩn hoàn toàn khối trạng thái nguồn (`sourceTitle` và `sourceBody`) khi ở trạng thái sẵn sàng (`source.status === 'ready' && !liveBusy`), không để lộ các chuỗi `Đã nạp N điểm mô phỏng`, `Live · N điểm đã duyệt`, `Nguồn: ...` vào giao diện nhìn thấy. Giữ nguyên bộ điều khiển radio Demo/Live, nút Thử lại (Retry), thông báo đang tải (busy/connecting), thông báo vận hành khi rỗng/lỗi (empty/error), và các điều hướng tiện ích/Hộ chiếu. Giữ nguyên vẹn adapter dữ liệu và validator của `sourceState.ts` và `live.ts`.
2. **P2-2 (Chọn ngõ AlleySelectScreen):** Gỡ bỏ toàn bộ nhãn nguồn, chữ "Bìa minh họa", "Nguồn máy chủ Live", và fallback `liveSource.title`. Giữ số lượng điểm dừng, chế độ thuần (`DEMO`/`LIVE`), tên vị trí GPS thực tế (`district`), cùng trạng thái vận hành loading, rỗng, lỗi và nút Thử lại. Cập nhật đồng bộ từ điển dịch thuật ở cả hai ngôn ngữ VI và EN.
3. **P2-3 (Hai chuỗi Qa):** Viết lại `qa.voice_plan_empty` và `qa.voice_gps_body` súc tích, giữ trọn vẹn hành vi vị trí đọc một lần khi chạm GPS và thông báo chưa có điểm phù hợp, loại bỏ hoàn toàn các mệnh đề `mô phỏng` / `simulated`.
4. **P3-c (Tiền tố tác quyền ảnh):** Chuyển đổi `qa.photo_credit` và `home.photo_credit` từ "Ảnh minh họa" / "Illustration photo" thành "Ảnh" / "Photo" trung tính, bảo toàn tên tác giả và metadata tác quyền.

---

## 2. Chi tiết các thay đổi theo từng phát hiện

### 2.1. P2-1: `NotebookDrawerModal.tsx` & Kiểm thử Component Chuyên biệt
- **Sửa giao diện tối thiểu:** Bọc khối `<Text style={styles.sourceTitle}>` và `<Text style={styles.sourceBody}>` bằng điều kiện `(liveBusy || source.status !== 'ready')`.
  - Khi `status === 'ready'` và `!liveBusy`: Khối chữ trạng thái bị ẩn hoàn toàn khỏi view. Người dùng chỉ thấy phần chuyển chế độ `[Demo] [Live]` gọn gàng và nút "Thử lại" (khi ở Live).
  - Khi `liveBusy === true`: Hiển thị "Đang lấy dữ liệu live…" / "Đang kết nối để tải dữ liệu trực tiếp…" (hoặc tiếng Anh tương ứng), nút "Thử lại" bị vô hiệu hóa (`disabled`).
  - Khi `status === 'error'` hoặc `'empty'`: Hiển thị tiêu đề và chi tiết lỗi/hướng dẫn cấu hình thực tế (ví dụ: "Live chưa được cấu hình", "Máy chủ live trả lỗi").
- **Dữ liệu & Adapter:** Không chỉnh sửa `sourceState.ts`, `live.ts` hay các hàm parse/validate schema. Metadata gốc được giữ nguyên vẹn.
- **Kiểm thử tự động:**
  - Sử dụng trực tiếp `sources.getSourceState('demo', fixture, 'vi')` và `('en')` thật (chứa `Đã nạp 6 điểm mô phỏng` / `Loaded 6 simulated points`).
  - Sử dụng trực tiếp `live.loadLiveSource` thật với fetch mock trả về payload `reviewed` thật (chứa `Live · 6 điểm đã duyệt` và `Nguồn: http://...`) và `simulated` thật (chứa `Live · 6 điểm mô phỏng (chưa xác minh)`).
  - Trích xuất toàn bộ text nhìn thấy từ các phần tử `<Text>` đã mount (thay vì kiểm tra props/JSON thô) và khẳng định không có sự xuất hiện của `mô phỏng`, `simulated`, `đã duyệt`, `reviewed`, `Nguồn:`, `Source:`, `Đã nạp`, `Loaded`.
  - Xác minh radio mode tương tác gọi `onModeChange`, nút Thử lại gọi `onRetryLive`, và các nhánh busy/empty/error hiển thị đúng thông tin vận hành.

### 2.2. P2-2: `AlleySelectScreen.tsx` & Bản dịch `translator.ts`
- **Giao diện AlleySelect:**
  - Vị trí GPS hiện tại (`gpsLocationName`): Trong chế độ Live khi đã sẵn sàng, chỉ hiển thị tên khu vực thực tế `liveCollectionItem.district` (ví dụ: "Phố cổ Hà Nội" hoặc "Hoàn Kiếm"), loại bỏ hậu tố `· Nguồn máy chủ Live`. Khi loading hiển thị `t('alley_select.live_loading')`. Khi error/empty hiển thị thông báo lỗi/rỗng súc tích, không fallback vào `liveSource.title` cũ.
  - Phụ đề danh sách (`sectionSubtitle`): Chế độ Live hiển thị nhãn chế độ thuần `'Live'` (thay vì `'Nguồn máy chủ Live'`), chế độ Demo hiển thị `t('alley_select.sample_list')`.
  - Thẻ con ngõ: Thẻ meta chân trang hiển thị `t('alley_select.meta_info')` (`{count} điểm · {mode}`) và `t('alley_select.live_meta_info')` (`{count} điểm · Live`), loại bỏ chữ "Bìa minh họa" và "Nguồn máy chủ".
  - Thẻ định vị trên ảnh: Giữ nguyên badge chế độ gọn `DEMO` / `LIVE`.
  - Tagline fallback: Đổi từ "Verified live collection" / "Bộ sưu tập máy chủ xác minh" thành "Live collection" / "Bộ sưu tập Live".
  - Bảo toàn khối rỗng/lỗi Live (`!liveReady`) với biểu tượng, thông báo lỗi, chi tiết và nút Thử lại.
- **Từ điển `translator.ts` cập nhật cả 2 ngôn ngữ (VI & EN):**
  - `alley_select.meta_info`: `'{count} điểm · {mode}'` / `'{count} stops · {mode}'`
  - `alley_select.hint`: `'Chọn con ngõ bên dưới để mở các điểm khám phá · {mode}'` / `'Select an alley below to explore stops · {mode}'`
  - `alley_select.live_meta_info`: `'{count} điểm · Live'` / `'{count} stops · Live'`
  - `alley_select.live_source_badge`: `'Live'` / `'Live'`
  - `alley_select.live_subtext`: `'{name} · Live'` / `'{name} · Live'`
  - `alley_select.server_catalog`: `'Bộ sưu tập Live'` / `'Live collection'`

### 2.3. P2-3: Viết lại Hai Chuỗi Trạng thái trong `translator.ts`
- `qa.voice_plan_empty`:
  - VI: `'Chưa có điểm phù hợp. Anh có thể đổi chủ đề hoặc thời gian.'`
  - EN: `'No matching stops found. You can change topic or duration.'`
  - Loại bỏ hoàn toàn cụm `trong dữ liệu mô phỏng` / `in the demo dataset`.
- `qa.voice_gps_body`:
  - VI: `'Vị trí chỉ được đọc một lần sau khi anh chạm nút Dùng GPS.'`
  - EN: `'Location is read only once after tapping Use GPS.'`
  - Loại bỏ hoàn toàn mệnh đề `Điểm mô phỏng chưa xác nhận vị trí thật.` / `Simulated stops do not confirm physical location.`, giữ nguyên vẹn hành vi và giải thích quyền vị trí.

### 2.4. P3-c: Chuẩn hóa Tiền tố Tác quyền Ảnh
- `qa.photo_credit`: Chuyển thành `'Ảnh'` (VI) / `'Photo'` (EN).
- `home.photo_credit`: Chuyển thành `'Ảnh'` (VI) / `'Photo'` (EN).
- Giữ nguyên hiển thị tên tác giả chụp ảnh trên thẻ xem trước `HomeScreen` và `QaScreen` (`Ảnh: {tên tác giả}`).

---

## 3. Ranh giới Triển khai & Bảo toàn Scope

- **Không xóa 25 khóa dịch mồ côi ngoài luồng** (`common.simulated`, `qa.disclaimer_*`, v.v.) và không can thiệp thuộc tính `collectionKind` không sử dụng.
- **Không chạm vào:** `docs/IMAGE_SOURCES.md`, `mobile/src/assets/photoMap.ts`, `mobile/src/screens/PrologueScreen.tsx`, assets hình ảnh/âm thanh, backend, voice gateway, fixture `data/`, package dependencies hay lockfile.
- **Không commit, push, stash, checkout, restart Metro, hay ghi vào workspace `E:`.**
- Giữ nguyên 100% độ phủ kiểm thử hiện có (335 test cũ đều pass, cập nhật 3 điểm kiểm tra tương ứng với UI đã chủ đích loại bỏ).

---

## 4. Bằng chứng Kiểm thử & Xác minh (Verification Evidence)

| Lệnh | Thư mục thực thi | Kết quả | Ghi chú |
| :--- | :--- | :--- | :--- |
| `npm test` | `mobile` | **exit 0** — tests 340, pass 340, fail 0 | Toàn bộ 335 test cũ + 5 test mới đều pass |
| `npm run typecheck` | `mobile` | **exit 0** | `tsc --noEmit` sạch 100% |
| `npm run lint` | `mobile` | **exit 0** | `eslint .` sạch 100%, 0 lỗi, 0 cảnh báo |
| `git diff --check` | Root | **exit 0** | Không có lỗi khoảng trắng |

### Chi tiết các ca kiểm thử mới trong `mobile/tests/provenanceUiCleanup.test.mjs`:
1. `P2-1: NotebookDrawerModal with real getSourceState demo in VI and EN omits redundant status while preserving mode controls`: Kiểm tra nguồn demo thật ở VI và EN, khẳng định vắng mặt chữ mô phỏng/nguồn trong visible text và radio mode hoạt động bình thường.
2. `P2-1: NotebookDrawerModal with real loadLiveSource reviewed and simulated payloads in VI and EN`: Kiểm tra nguồn live thật trả về từ `loadLiveSource` (mock reviewed và simulated payload), khẳng định vắng mặt tiêu đề/chi tiết nguồn và các nhãn `đã duyệt`/`mô phỏng`, nút Thử lại tương tác tốt.
3. `P2-1: NotebookDrawerModal loading/busy, empty and error functionality`: Kiểm tra các trạng thái vận hành Live busy (hiển thị thông báo kết nối, nút Thử lại bị disable), Live empty (hiển thị thông báo chưa cấu hình), Live error (hiển thị thông báo lỗi và nút Thử lại).
4. `P2-2: AlleySelectScreen removes source badges, Bia minh hoa, and unclutters hint and meta info`: Kiểm tra màn hình chọn ngõ ở Demo và Live (reviewed), xác minh sự biến mất của "Bìa minh họa", "Nguồn máy chủ", khẳng định hiển thị số điểm và mode thuần túy (`6 điểm · Demo`, `6 điểm · Live`), vị trí GPS hiện tại sạch, luồng retry khi gặp lỗi Live.
5. `P2-3 and P3-c: i18n copy rewrites for voice plan, voice gps, and photo credit in VI and EN`: Kiểm tra 4 chuỗi dịch ở cả hai thứ tiếng, xác minh không còn từ ngữ mô phỏng/nguồn và tiền tố ảnh trung tính.

---

## 5. Giới hạn Kiểm chứng Trực quan trên Thiết bị Thật (Pending Limits)

- Giao diện thực tế trên thiết bị vật lý thật (iOS/Android), đo đạc tương phản màu nền, render font đa tỷ lệ (`fontScale` 1.3 / 2.0) và trình đọc màn hình native chưa được đo đạc trực tiếp trên phần cứng thật trong phiên này (kiểm thử native runner và Metro bundle compilations đã xác nhận xanh).
- Digest 451 file không tự sinh lại; cây code chỉ thay đổi tối thiểu đúng 3 file component/i18n và các test liên quan.
