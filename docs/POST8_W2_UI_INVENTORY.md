# Báo cáo Rà soát Giao diện & Ranh giới Song ngữ Việt/Anh (Post8 W2 UI Inventory)

- **Worker:** W2 (Antigravity · Gemini 3.8 Flash High)
- **Baseline Git:** `91ddfbd` (nhánh `valentino/post8-ui`)
- **Tài liệu tham chiếu:** `docs/CLAUDE_POST_PHASE8_STORY_EN_PROMPT.md`, `docs/UI_UX_STORY_WORLD_REVIEW.md`

---

## 1. Thống kê Chuỗi Giao diện Song ngữ (VI/EN)

Toàn bộ ứng dụng hiện dùng 100% tiếng Việt trên 10 màn hình và 7 component dùng chung. Không có trừu tượng hóa i18n hay từ điển đa ngôn ngữ nào.

| Danh mục | Số lượng | Vị trí đại diện | Mô tả & Rủi ro |
| :--- | :---: | :--- | :--- |
| **Navigation & Headers** | 18 | `navigation.ts:15-36`, `App.tsx:234-272` | Tiêu đề stack screen, header bar, thanh tiến trình |
| **Mở đầu & Khám phá ngõ** | 32 | `PrologueScreen.tsx:30-46`, `LandingScreen.tsx:98-295` | Hero quote, khẩu hiệu, passport modal |
| **Hành trình & Bản đồ ngõ** | 24 | `HomeScreen.tsx:211-516`, `AlleySelectScreen.tsx:75-130` | Nhãn trạm pin, Polaroid card, mood icon |
| **Trình đọc & Q&A cố định** | 45 | `QaScreen.tsx:350-738`, `ExpandableInputDrawer.tsx:41-147` | Thẻ người kể, câu hỏi gợi ý, xem chữ, follow-ups |
| **Voice Dock & Playback** | 35 | `VoiceInteractionDock.tsx:34-137`, `VoicePlayerBar.tsx:30-51` | Trạng thái thu/xử lý, A11y announcements, play/stop |
| **Chọn trải nghiệm (Plan)** | 28 | `PlanScreen.tsx:27-190`, `recommendation/pick.ts:19-50` | Nhãn chủ đề, chip thời gian, thông báo lỗi nhập |
| **Camera & Quét QR** | 22 | `CameraScreen.tsx:50-150`, `qr/confirmPoint.ts` | Trạng thái camera, hướng dẫn quét, chọn điểm tay |
| **Định vị & Gợi ý GPS** | 26 | `LocationScreen.tsx:23-149`, `location/nearest.ts` | Giải thích GPS yếu, ngoài cụm ngõ, cự ly ước tính |
| **Lỗi hệ thống & Nguồn** | 20 | `UnavailableScreen.tsx:14-27`, `useVoiceSession.ts:42-57` | 14 mã lỗi Voice (ASR/Mic), trạng thái Live/Demo |
| **Accessibility (A11y)** | 38 | Rải rác trên toàn bộ nút bấm, thanh tiến trình, dialog | `accessibilityLabel`, `accessibilityHint` |
| **Tổng cộng** | **~288 chuỗi** | Toàn bộ `mobile/src/` | Cần từ điển song ngữ dạng key-value nhẹ phía client |

---

## 2. Bảng Rà soát Chi tiết Màn hình & Thành phần (Reachable Inventory)

| File:Dòng | Thành phần | Nội dung chuỗi & A11y | Ghi chú & Ranh giới |
| :--- | :--- | :--- | :--- |
| `src/screens/PrologueScreen.tsx:30-46` | `PrologueScreen` | Hero intro, châm ngôn ngõ, nút bắt đầu | Mở đầu lần đầu; text italic trang trọng, cần bản dịch Anh tự nhiên |
| `src/screens/LandingScreen.tsx:98-238` | `LandingScreen` | Banner Demo/Live, Hero quote, Carousel ngõ, CTA chọn ngõ | Có modal Passport (`:243-302`); text dài cần kiểm tra fontScale 1.5–2.0x |
| `src/screens/AlleySelectScreen.tsx:75-150` | `AlleySelectScreen` | Search input, bộ lọc khu vực, danh sách ngõ | Input placeholder cần EN; bộ lọc khu vực giữ nguyên địa danh |
| `src/screens/HomeScreen.tsx:211-252` | `HomeScreen` | Header tiến trình, đổi sắc thái (mood), tên ngõ | Nút mood có `accessibilityValue` cần song ngữ hóa |
| `src/screens/HomeScreen.tsx:345-478` | `HomeScreen` | Pin trạm, nhãn Điểm 01-06, Polaroid card, nút Đọc | Thẻ Polaroid có dấu son "ĐÃ MỞ LỜI KỂ", thời lượng phút |
| `src/screens/HomeScreen.tsx:523-666` | `HomeScreen` (Modal) | Sổ tay ngõ phố, 3 công cụ (Plan, QR, GPS), Quản lý Demo/Live | Chứa disclaimer và nút thử lại kết nối Live |
| `src/screens/QaScreen.tsx:348-439` | `QaScreen` | Segment 6 điểm, Thẻ người kể, Player bar, Toggle xem chữ | Chữ ẩn mặc định; mở chữ không đụng audio playback |
| `src/screens/QaScreen.tsx:505-636` | `QaScreen` | VoiceActionCards (Plan, QR, GPS, Mixed, Reference, Notice) | Thẻ hành động động khi bot phản hồi qua voice intent |
| `src/screens/QaScreen.tsx:642-738` | `QaScreen` | Thẻ câu trả lời, trạng thái Chưa khớp, Nguồn, Đặt câu hỏi khác | Cần phân biệt rõ truyện hư cấu vs điểm có nguồn thật |
| `src/screens/PlanScreen.tsx:27-190` | `PlanScreen` | 3 chủ đề (Ăn thực, Chuyện xưa, Tự do), 4 mốc thời gian, ô nhập tay | Parser `pick.ts` nhận diện từ khóa tiếng Việt; cần từ khóa EN |
| `src/screens/CameraScreen.tsx:40-150` | `CameraScreen` | Trạng thái camera, ghi chú từ chối quyền, nút quét lại, chọn tay | Chứa thông điệp bảo vệ quyền riêng tư người dùng |
| `src/screens/LocationScreen.tsx:23-149` | `LocationScreen` | Giải thích 4 trạng thái GPS (yếu, ngoài cụm, thiếu tọa độ, chờ) | Khái niệm khoảng cách mét/km; cảnh báo không theo dõi nền |
| `src/screens/UnavailableScreen.tsx:14-27` | `UnavailableScreen` | Thông báo không có dữ liệu, nút Quay lại, Thử lại, Đổi Demo | Hiển thị khi Live API lỗi hoặc dataset rỗng |
| `src/components/VoiceInteractionDock.tsx:34-137` | `VoiceInteractionDock` | 7 trạng thái thu (idle, preparing, recording, stopping, ready, transcribing, error) | A11y announcements liên tục theo state; các nút Gửi/Hủy/Gõ/Sổ tay |
| `src/components/VoicePlayerBar.tsx:30-51` | `VoicePlayerBar` | Thanh phát âm thanh: Phát, Tạm dừng, Nghe lại, Dừng, Tiến trình | Label "Sẵn sàng" và format thời gian mm:ss |
| `src/components/ExpandableInputDrawer.tsx:41-147` | `ExpandableInputDrawer` | Ô gõ câu hỏi, nút Gửi, danh sách câu hỏi gợi ý chạm nhanh | Modal bàn phím; placeholder theo tên điểm hiện tại |
| `src/voice/useVoiceSession.ts:42-57` | `messageForError` | 14 mã lỗi thoại (`MIC_PERMISSION_DENIED`, `ASR_TIMEOUT`, ...) | Bản địa hóa error codes từ gateway/client |

---

## 3. Lỗ hổng Cấu trúc: Quan hệ Ngõ – Điểm – Truyện Hư cấu

1. **Thực trạng mã nguồn:**
   - `src/assets/photoMap.ts:60-128` định nghĩa `ALLEY_LIST` gồm 5 con ngõ: Phất Lộc, Tạm Thương, Ngõ Gạch, Cấm Chỉ, Hàng Chỉ với khoảng cách và thời lượng mô phỏng.
   - `data/demo.json` chỉ chứa duy nhất **1 bộ truyện hư cấu** *"Bức thư cuối ngõ"* gồm 6 node (`demo-01` đến `demo-06`).
2. **Lỗ hổng liên kết (Vulnerability):**
   - Khi chọn bất kỳ ngõ nào trong 5 ngõ, `HomeScreen.tsx:107` luôn nạp toàn bộ `source.dataset.nodes` từ `demo.json`. Cả 5 ngõ đều hiển thị chung một nội dung hư cấu 6 chương.
   - Metadata `storyCount` trong `ALLEY_LIST` (4–6) mâu thuẫn trực tiếp với 6 điểm hiển thị trên bản đồ.
3. **Đề xuất ranh giới (W1 & W3):**
   - Tách riêng bộ *"Bức thư cuối ngõ"* với nhãn minh bạch: **"Truyện hư cấu / Fictional story"**.
   - Tuyến ngõ thật pilot: Chỉ triển khai 1 tuyến ngõ thật có dữ liệu xác minh (ví dụ Ngõ Phất Lộc với 3 điểm thật: lịch sử, quan sát, ẩm thực). Không gán cùng bộ truyện vào nhiều ngõ rồi nhận là nội dung độc lập.

---

## 4. Công cụ, Ngôn ngữ HĐH & Lưu trữ Nhỏ nhất (Minimal Choices)

1. **Thẩm định Package & Lockfile:**
   - Không có `expo-localization`, `@react-native-async-storage/async-storage`, hay thư viện i18n ngoài.
   - Có sẵn: `expo` `~57.0.30`, `expo-file-system` `~57.0.7`, `react` `19.2.3`, `react-native` `0.86.3` (Hermes engine).
2. **Nhận diện OS Locale (Zero New Dependencies):**
   - Sử dụng chuẩn `Intl.DateTimeFormat().resolvedOptions().locale`. Nếu bắt đầu bằng `'en'` -> chọn `'en'`, còn lại fallback `'vi'`.
3. **Cơ chế Persistence Nhỏ nhất:**
   - Dùng `File` API từ `expo-file-system` (đã import tại `useVoiceSession.ts:6`) để đọc/ghi file nhỏ `settings.json` trong `FileSystem.documentDirectory`.
   - Lựa chọn thủ công của người dùng ghi đè OS locale và được giữ qua các lần khởi động app.
4. **Điểm chưa chắc chắn (Uncertainty):**
   - Thay đổi ngôn ngữ OS runtime khi app đang chạy nền chỉ cập nhật khi app active lại nếu người dùng chưa chọn thủ công. Điều này hoàn toàn phù hợp phạm vi MVP.

---

## 5. Ranh giới Kiến trúc & Hợp đồng Tích hợp

1. **`LocaleContext`:** Cung cấp `locale: 'vi' | 'en'`, `setLocale`, và hàm tra cứu `t(key)`. Đặt tại gốc `App.tsx`.
2. **Guards Vòng đời Voice:**
   - Đang phát audio: Dừng ngay `stopPlayback()`, xóa `activeTrackId`.
   - Đang thu/nhận dạng: Lập tức `abort()`, chuyển về `'idle'`, dọn file ghi âm tạm.
   - `voiceScope` bổ sung locale: `${mode}:${locale}:${datasetRevision}:${nodeId}`. Bất kỳ response nào có `result.locale !== context.locale` đều bị loại bỏ ngay.
   - Đóng Drawer gõ chữ và xóa `voiceActionCard` cũ khi đổi locale.
3. **Yêu cầu đối với W3:**
   - Gateway `/v1/transcribe` mở hỗ trợ `locale: 'en'`.
   - Bổ sung catalogue audio tiếng Anh trong `src/voice/catalog.ts` kèm `textHash` và revision riêng (hiện tại có 34 track tiếng Việt). Nếu thiếu audio tiếng Anh, client hiển thị đọc bằng chữ, không mượn audio tiếng Việt.
   - Cung cấp dataset song ngữ (`demo.en.json` hoặc cấu trúc đa ngữ tích hợp).

---

## 6. Phản biện Kỹ thuật & Rủi ro Vận hành (Critique & Edge Cases)

1. **Đổi locale khi đang trong chu trình Voice (Race Conditions):**
   - Tránh việc ASR server trả về transcript tiếng Việt khi người dùng đã chuyển sang tiếng Anh bằng cách gắn `turnId` với `locale` và tăng `requestRef.current` để hủy bỏ kết quả đến muộn.
2. **Ẩn văn bản mặc định vs. Không reset Audio:**
   - Việc mở "Xem lời kể bằng chữ" chỉ toggle layout, không chạm đến audio player. Khi đổi locale, text chuyển sang tiếng Anh mà không làm gián đoạn audio tiếng Anh đang phát tương ứng.
3. **Co giãn Font chữ 150–200%, Layout & Screen Reader:**
   - Chuỗi tiếng Anh dài hơn 20–35%; tại cỡ chữ 200% (`fontScale = 2.0`), các hàng ngang (`sectionHeaderRow`, `primaryCtaButton`) dễ tràn nếu không dùng `flexWrap` và `minHeight: 48dp`.
   - Toàn bộ nhãn `accessibilityLabel`, `accessibilityHint` phải được bản địa hóa đồng bộ khi kích hoạt English.
4. **Hộp thoại Quyền HĐH & Giới hạn Bản build Native:**
   - Chuỗi quyền (`NSCameraUsageDescription`, `NSMicrophoneUsageDescription`) nằm cố định trong native binary. App **không thể** đổi ngôn ngữ của popup cấp quyền hệ thống lúc runtime chỉ bằng nút bấm trong app. Giới hạn này cần được ghi rõ trong tài liệu bàn giao.

---

## 7. Đề xuất Kế hoạch Triển khai UI W2 (Hậu rà soát)

- **T1:** W1 chốt từ điển chuẩn và schema dữ liệu song ngữ.
- **T2:** W2 xây dựng `LocaleContext`, từ điển tĩnh nhẹ (~288 keys), nút chuyển đổi VI/EN tại Header `LandingScreen` và `HomeScreen`, cập nhật Dock/Player/Drawer.
- **T3:** Đấu nối `useVoiceSession` hỗ trợ EN (hủy request cũ, lọc transcript theo locale), kiểm thử fontScale 100%–200%, đảm bảo toàn bộ 201 tests hiện có tiếp tục pass và thêm tests cho locale switching.

---
*Báo cáo được hoàn thành độc lập bởi W2 theo đúng nguyên tắc Chỉ Đọc Source Code, không can thiệp code ứng dụng hay cài đặt dependency ngoài.*
