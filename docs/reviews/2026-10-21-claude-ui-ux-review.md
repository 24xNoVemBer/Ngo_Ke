# Review độc lập UI/UX Ngõ Kể — working tree hiện tại (21/10/2026)

- Reviewer: Claude (theo yêu cầu rõ ràng của người dùng, task `task_a505a1aff676`). Chỉ đọc; file duy nhất được tạo là báo cáo này.
- Đối tượng: working tree `logic-fix-mobile-20261020` gồm cả WIP chưa commit (HEAD `cca8c95` **không** phải toàn bộ source hiện tại). Chỉ đọc source `mobile/`; không dựa trên audit lịch sử.
- Ký hiệu độ tin cậy: **[XÁC NHẬN-CODE]** thấy trực tiếp trong code (có file:line) · **[GỢI Ý]** nhận định thiết kế chủ quan · **[GIẢ THUYẾT]** cần kiểm trên thiết bị.

## 0. Phạm vi & giới hạn (đọc trước)

**Đã đọc nguyên văn:** `App.tsx`, `PrologueScreen`, `LandingScreen`, `NotebookDrawerModal`, `HomeScreen`, `UnavailableScreen`, `LocationScreen` (JSX), `CameraScreen` (JSX), `PlanScreen` (JSX), `VoiceInteractionDock`, `MotionPreferences`, phần JSX/style của `QaScreen` (dòng ~490–1140), các phần liên quan của `AlleySelectScreen`, key i18n liên quan, `theme.ts`.
**Chưa đọc / đọc lướt:** logic nội bộ `QaScreen` trước dòng 490 (voice session), `ExpandableInputDrawer`, `PostcardCard`, `AlleyTrailView`, `ClickableSources`, phần style cuối `Camera/Plan`, copy EN/VI ngoài các key đã grep.
**Không làm được:** không có `adb`/simulator trên máy này; không mở Metro 8082, không chạy web/PWA. **Không có phát hiện nào dưới đây được xác nhận bằng ảnh chụp, thiết bị, âm thanh hay độ tương phản đo thật.** Không chạy `npm test`/lint/typecheck (báo cáo bàn giao ghi 296/296 pass — tôi không tái kiểm). Mọi số liệu tương phản/kích thước là **tính từ giá trị style** (nền giả định #FFFDF7).

## 1. Tóm tắt

Luồng chính mạch lạc và đúng ý người dùng: **không có GPS tự động, không xếp hạng "gần nhất"** ở Landing; GPS chỉ chạm-để-đọc một lần (`LocationScreen.tsx:66-99`) và luôn có chọn tay. Vấn đề lớn nhất không phải hiển thị mà là **luồng bị "cụt" sau thao tác** (xác nhận GPS/QR không dẫn đi đâu), **tên gọi/biểu tượng không nhất quán** cho cùng một chức năng, và **vài nút nhỏ / pill giống nút nhưng không bấm được ở Landing**. 3 việc đáng làm trước: F1, F2, F3.

## 2. Phát hiện xếp theo mức ưu tiên

### P1 — ảnh hưởng người dùng rõ ràng

**F1. Xác nhận GPS/QR là ngõ cụt, không phản hồi, không đưa người dùng vào câu chuyện [XÁC NHẬN-CODE]**
- `LocationScreen.tsx:108-112`: `confirm()` chỉ gọi `onConfirmNode`; không điều hướng, không toast. Thẻ "Điểm hiện tại" nằm **trên** thẻ ứng viên (`:132` so với `:194`) → người dùng đã cuộn xuống bấm Xác nhận sẽ không thấy gì đổi. `CameraScreen.tsx:96-116` hiện story ngay trong màn Camera, không có nút sang `Qa`.
- Với lối tắt mới: Landing → GPS → xác nhận → Back → Landing **không có dấu hiệu nào** điểm đã đổi (Landing không đọc `confirmedNodeId`; chỉ Home/Qa dùng, `App.tsx:191-196`).
- Sửa nhỏ nhất: sau xác nhận hiện nút chính "Mở câu chuyện tại {tên điểm}" → `navigation.navigate('Qa')` (App đã có `selectNode`); tối thiểu cuộn lên + thông báo `accessibilityLiveRegion` "Đã chọn …".

**F2. Cùng một chức năng, nhiều tên + icon ngược nghĩa; "Sổ tay" trỏ tới hai đích khác nhau [XÁC NHẬN-CODE]**
- GPS được gọi: "Vị trí GPS / Xác nhận tọa độ ngõ phố" (Landing, key `landing.quick_gps_*`), "GPS" (Home dock `HomeScreen.tsx:569`), "Tìm bằng GPS — Gợi ý điểm ngõ gần nhất theo tọa độ thiết bị" (drawer, `home.tool_gps_*`), "Xác nhận điểm GPS" (nhãn dock `home.gps_dock_label`), tiêu đề màn "Xác nhận điểm chạm" + "Xác nhận điểm GPS" (`LocationScreen.tsx:122,161`). Mô tả drawer vẫn nói "điểm gần nhất" — trái ý "thủ công, không nearby"; mô tả Landing "Xác nhận tọa độ" sai nghĩa (app xác nhận **điểm**, không xác nhận tọa độ).
- Icon `compass` = **GPS** ở Landing (`LandingScreen.tsx:235`) và Home dock (`HomeScreen.tsx:568`) nhưng = **Chọn trải nghiệm/Plan** trong drawer (`NotebookDrawerModal.tsx:108`); GPS trong drawer dùng `pin` (`:138`).
- "Sổ tay": Landing/Home mở **drawer công cụ + nguồn dữ liệu** (`LandingScreen.tsx:251`), nhưng nút "Sổ tay" ở dock Qa (`QaScreen.tsx:1076-1077` → `App.tsx:342-345`) **điều hướng sang màn Plan**. Drawer mang tên "Sổ tay / Hành trình & Công cụ" nhưng không chứa hành trình hay ghi chú nào.
- Sửa nhỏ nhất: chốt 1 tên + 1 icon cho GPS (đề xuất `pin`), `compass` cho Plan; đổi nhãn nút ở Qa thành "Chọn trải nghiệm" hoặc mở cùng drawer; sửa 2 mô tả GPS (bỏ "gần nhất", "tọa độ"). Cần người dùng chốt thuật ngữ (§5).

**F3. Pill ngôn ngữ trên Landing nhỏ, khác kiểu với Prologue/Home, và giống hệt pill DEMO/LIVE không bấm được [XÁC NHẬN-CODE]**
- `LandingScreen.tsx:102-113, 442-457`: hai pill cùng style; pill ngôn ngữ cao ≈ 14 (chữ 11px) + 10 padding ≈ **25dp**, không `minHeight`/`hitSlop` (các màn khác tự đặt 44–48dp, ví dụ `HomeScreen.tsx:687-689`). Pill DEMO/LIVE trông như nút nhưng không có `onPress` → người dùng sẽ chạm thử mà không có gì xảy ra.
- Hai cơ chế đổi ngôn ngữ: Prologue = modal chọn, hiện **ngôn ngữ hiện tại** (`PrologueScreen.tsx:383-399`); Landing/Home = nút toggle hiện ngôn ngữ **đích** ("EN" khi đang VI, `LandingScreen.tsx:109`, `HomeScreen.tsx:314`). Không rõ "EN" nghĩa là đang ở EN hay sẽ sang EN. (Yêu cầu "một pill + modal chọn" mới đạt ở Prologue.)
- Sửa nhỏ nhất: dùng cùng component pill+picker ở Landing/Home (hoặc tối thiểu `minHeight: 44` + hiện tên ngôn ngữ hiện tại); biến DEMO/LIVE thành text thường hoặc cho nó mở drawer nguồn dữ liệu.

**F4. Màn không dữ liệu (Plan/Camera/Location) không có hành động; Landing cho phép vào chúng khi Live lỗi [XÁC NHẬN-CODE]**
- `App.tsx:371, 385, 400` gọi `<UnavailableScreen detail=… />` **không truyền `onRetry/onSwitchToDemo`**. Drawer vẫn cho chạm Plan/QR/GPS bất kể trạng thái nguồn (`NotebookDrawerModal.tsx:98-141` không dùng `source.status`), và Landing truyền `effectiveSource` Live (`LandingScreen.tsx:57-61`). Kịch bản: Live lỗi → mở Sổ tay → chạm "Quét QR" → màn Unavailable chỉ có nút back của header.
- `UnavailableScreen.tsx:24-26, 65-69`: cả 3 nút (Quay lại / Thử lại / Chuyển Demo) cùng nền xám-ấm, chữ `body` màu `muted` → không có hành động chính; Thử lại (hợp lý nhất khi Live lỗi) không nổi bật.
- Sửa nhỏ nhất: vô hiệu hóa (kèm lý do) 3 công cụ trong drawer khi `source.status !== 'ready'`, hoặc truyền `onRetry/onSwitchToDemo` ở 3 route; tô nút chính bằng `colors.accent`.

### P2 — đáng sửa, tác động vừa

**F5. Quyền bị từ chối: không có lối đến Cài đặt; thông báo GPS gộp nhiều nguyên nhân [XÁC NHẬN-CODE]**
- `Linking.openSettings` chỉ có ở Qa (`QaScreen.tsx:1075`). Camera: `permission_blocked` chỉ nhắc "chọn tay" (`CameraScreen.tsx:60-64`). Location: từ chối quyền, lỗi lấy vị trí, timeout đều rơi vào `needs-position` "bấm thử lại" (`LocationScreen.tsx:75-77, 94-95`) → người bị từ chối vĩnh viễn sẽ bấm thử lại vô ích. Chọn tay vẫn có (tốt).
- Sửa nhỏ nhất: tách `denied` khỏi `error`, thêm nút "Mở cài đặt" khi `canAskAgain === false`.

**F6. Mục tiêu chạm nhỏ còn sót [XÁC NHẬN-CODE]**
- `QaScreen.tsx:1393-1401` `resetButton` ("← Hỏi câu khác"): không `minHeight`, chữ 12px → ~16dp; đây là hành động chính sau khi nhận đáp án.
- `HomeScreen.tsx:624-626` nút back 38dp (Qa/AlleySelect dùng 48).
- `AlleySelectScreen.tsx:331` + `:669-673` nút "Thử lại" Live chỉ là chữ 12.5px không padding.
- Pill Landing (F3).

**F7. Home: nhãn điểm bị đôi đích thiếu vai trò; bản đồ cứng 6 pin [XÁC NHẬN-CODE]**
- `HomeScreen.tsx:438, 461`: nhãn tên điểm là `Pressable` không `accessibilityRole/Label`, cạnh `Pressable` pin đã có nhãn (`:414-417`) → trình đọc màn hình gặp hai đích cho một điểm, một đích không rõ vai trò.
- `HomeScreen.tsx:136-139` + `PIN_CONFIG` (`:49-56`) cố định **6** vị trí; điểm thứ 7+ (nếu dataset có) **không có pin** (chỉ nhánh `fontScale > 1.3` dùng `AlleyTrailView`). **[GIẢ THUYẾT]** chưa biết dataset thật có >6 điểm không.

**F8. Chữ pháp lý/nguồn tương phản thấp và nhỏ [XÁC NHẬN-CODE, tính từ style]**
- `NotebookDrawerModal.tsx:403-408` `disclaimerNote` #8C7D70 12px trên #FFFDF8 ≈ 3,9:1 (<4,5:1); đây là câu miễn trừ "dữ liệu mô phỏng". Cùng màu ở `LandingScreen.tsx:851-854, 882-886` (11px / 9,5px). Nhiều chữ phụ 10–11px (`NotebookDrawerModal.tsx:372-387, 398-402`, `LandingScreen.tsx:487-493, 662-666`); không thấy `maxFontSizeMultiplier` trong repo.
- Sửa nhỏ nhất: đổi sang `#6E5D4F`/`colors.muted` (≈6:1), tối thiểu 12–13px cho disclaimer.

**F9. Mode (DEMO/LIVE) lặp 4 lần trên Landing; nhãn LIVE gắn lên dữ liệu đóng gói sẵn [XÁC NHẬN-CODE]**
- `LandingScreen.tsx:111-113` (pill), `:118-122` (banner), `:175-177` (badge thẻ, style tên `cardDistanceBadge` — dấu vết khoảng cách), `:187-189` (meta). Khi Live, carousel vẫn liệt kê bộ sưu tập đóng gói (`:49`) kèm nhãn LIVE và số điểm gói sẵn, trong khi Home ở Live bỏ qua `alleyId` (`HomeScreen.tsx:109-116`). **[GIẢ THUYẾT]** mức gây nhầm cần xem khi Live bật.
- Banner (`:118`) chiếm một hàng ngay dưới logo; key `soundscape_banner` còn nghĩa cũ ("âm thanh không gian") trong khi nội dung là "Lời kể bằng chữ · nội dung mô phỏng".
- Sửa nhỏ nhất: giữ 1 chỗ hiển thị mode, bỏ badge trên thẻ; khi Live thì ẩn/đánh dấu thẻ gói sẵn.

**F10. Pill "✨ Chọn bìa ngõ…" ở AlleySelect nhãn một đằng làm một nẻo [XÁC NHẬN-CODE]**
- `AlleySelectScreen.tsx:240-258`: trông như hành động (✨ + ›) và đọc nhãn "Chọn bìa ngõ bên dưới…" (hướng dẫn), nhưng bấm sẽ **mở thẳng** `'old-quarter-pilot'` (hard-code) hoặc mục Live. Comment gốc "Gợi ý ngõ gần nhất theo GPS" → dấu vết nearby cũ mà người dùng đã loại.
- Sửa nhỏ nhất: biến thành dòng hướng dẫn không bấm được, hoặc đổi nhãn thành tên hành động thật.

### P3 — cải thiện, chi phí thấp

**F11. Âm giọt nước Prologue có thể không phát khi giảm chuyển động [luồng: XÁC NHẬN-CODE; nghe thực tế: GIẢ THUYẾT]**
- `PrologueScreen.tsx:224-249`: `seekTo(0)` trả Promise → `playSafe` chạy ở `.then`, nhưng nhánh giảm chuyển động gọi `navigateOnce` ngay (`:246-249`) đặt `navigated=true` → `playSafe` (`:207-213`) bị chặn; unmount còn `pause()` (`:144-146`). Kết luận: người bật Reduce Motion có khả năng cao **không nghe thấy** âm (tệp 0,52 s, đo từ header WAV). `reducedMotion` mặc định `true` đến khi OS trả lời (`MotionPreferences.tsx:10`) nên chạm rất sớm cũng đi nhánh này.
- `setAudioModeAsync({ playsInSilentMode: true })` (`:133, 195`) phát âm **kể cả khi iPhone gạt im lặng** — **[GỢI Ý]** cân nhắc chính sách (bối cảnh ngoài phố/bảo tàng). Cần thiết bị để xác nhận cả hai.

**F12. Hộp thoại/drawer: thiếu tín hiệu modal, affordance giả [XÁC NHẬN-CODE]**
- `NotebookDrawerModal.tsx:58-71` và passport modal (`LandingScreen.tsx:334-346`) không có `accessibilityViewIsModal` (picker Prologue có, `PrologueScreen.tsx:601`); backdrop `Pressable` chỉ có label, không role.
- Thanh "handle" (`NotebookDrawerModal.tsx:246-254`, `LandingScreen.tsx:773-781`) gợi vuốt xuống nhưng là `View` tĩnh; đóng bằng ✕ 36dp (hitSlop 8) hoặc chạm nền.
- `NotebookDrawerModal.tsx:102-105`: `onClose()` rồi `navigate()` cùng nhịp — **[GIẢ THUYẾT iOS]** điều hướng khi Modal đang đóng đôi khi bị bỏ/nháy; cần kiểm iPhone/Expo Go.

**F13. Location nặng chữ trước nút chính; Camera lộ id nội bộ [GỢI Ý + XÁC NHẬN-CODE]**
- Từ trên xuống: tiêu đề native + `phase` + `mainTitle` + `subtitle` (2 câu) + thẻ điểm hiện tại + 1 câu ghi chú + tiêu đề thẻ (lặp `location.title`) + 1 câu hướng dẫn rồi mới tới nút "Lấy vị trí" (`LocationScreen.tsx:117-179`). Người vào từ lối tắt Landing chỉ muốn một việc; **[GIẢ THUYẾT]** trên màn ~640dp nút nằm sát/dưới mép gập. Khuyến nghị: đưa nút lên ngay dưới tiêu đề, gom mô tả thành 1 câu.
- `CameraScreen.tsx:292` hiển thị `{active.id} · ĐIỂM ĐÃ XÁC NHẬN` (ví dụ `demo-03`); chữ "Kể" hard-code (`:229`).

**F14. i18n không đi qua translator [XÁC NHẬN-CODE]**
- Chuỗi VI/EN viết thẳng bằng `locale === 'en' ? … : …` ở Landing (`:192`), drawer (`NotebookDrawerModal.tsx:177-199`), `LocationScreen`/`PlanScreen`/Qa (`QaScreen.tsx:607-624`), và nhãn truy cập nút đổi ngôn ngữ (`LandingScreen.tsx:105`). `QaScreen.tsx:771, 786` quyết định có hiện chip chủ đề/thời lượng bằng `message?.includes('chủ đề' | 'topic' | 'thời lượng' …)` → dễ vỡ khi sửa câu chữ. Chưa gây lỗi người dùng ngay nhưng dễ làm EN/VI lệch.

**F15. Landing: mật độ và nhịp [GỢI Ý / GIẢ THUYẾT]**
- Thẻ carousel cao cố định 310 (`LandingScreen.tsx:520-522`), không phụ thuộc `fontScale` (chỉ header/section đổi bố cục) → **[GIẢ THUYẾT]** ở font 1,5–2× phần đáy thẻ (quận, tên, 2 dòng tagline, meta) có thể chồng/cắt dưới tag phía trên.
- Tiêu đề khối lối tắt "TIỆN ÍCH TRỰC TIẾP / Khám phá ngõ phố" (`landing.quick_section_*`) gần như lặp tiêu đề carousel và không nói nội dung; khối chỉ có 2 thẻ. **[GỢI Ý]** bỏ hàng tiêu đề (hoặc "Công cụ nhanh"). Quét QR (tính năng quan trọng tại hiện trường) chỉ vào được qua drawer 2 chạm — **cần người dùng quyết** vì họ chỉ yêu cầu GPS và Sổ tay.
- Ước lượng từ style: khối lối tắt nằm khoảng y 520–630dp trên màn 360×640 → thẻ có thể sát/dưới mép gập **[GIẢ THUYẾT]**; chữ trên ảnh nền (`sectionPreTitle` alpha 0,7, banner xanh alpha 0,45) phụ thuộc ảnh → cần đo trên thiết bị.

**F16. Chrome không nhất quán giữa màn [GỢI Ý]**
- Prologue/Landing/Home/Qa/AlleySelect tự vẽ header tối trên ảnh (nút back 38 hoặc 48dp); Plan/Camera/Location dùng header native nền giấy (`App.tsx:355, 375, 389`). Chuyển từ Home (ảnh toàn màn) sang Camera/Location (giấy sáng) là cú đổi giọng lớn; không phải lỗi.

## 3. Điểm làm tốt (giữ nguyên)
- Không GPS tự động/không nearby ở Landing; GPS một lần chạm, có hủy, luôn có chọn tay (`LocationScreen.tsx:66-110, 256-310`); camera chỉ bật khi chạm và tắt khi rời màn (`CameraScreen.tsx:36-46`).
- Thẻ lối tắt có `minHeight 56`, role/label, xếp dọc khi `fontScale > 1.2` hoặc <360dp (`LandingScreen.tsx:220-225, 637`); drawer chịu font lớn (`NotebookDrawerModal.tsx:76, 146, 264-269`), nút chế độ 48dp.
- Reduce Motion được tôn trọng ở điều hướng, modal (`animationType`), ripple, pulse (`App.tsx:240`, `LandingScreen.tsx:336`, `PrologueScreen.tsx:246`).
- Picker ngôn ngữ Prologue: vùng chạm ≥48dp, `accessibilityViewIsModal`, trạng thái chọn.
- Q&A: nguồn/disclaimer luôn hiện, `accessibilityLiveRegion` cho đáp án/lỗi, chip và nút bước ≥48dp (`QaScreen.tsx:1245-1285, 1418-1429`).

## 4. Quick wins (mỗi việc nhỏ, không đổi chức năng)
1. `LandingScreen.tsx:442-457`: `minHeight: 44` + `hitSlop` cho pill ngôn ngữ; bỏ style "giống nút" của pill DEMO/LIVE (F3).
2. `QaScreen.tsx:1393`: `minHeight: 48`, `paddingVertical`, chữ ≥14px cho "Hỏi câu khác" (F6).
3. `NotebookDrawerModal.tsx:403-408`: màu `#6E5D4F`, 12–13px cho disclaimer (F8).
4. Sửa 2 mô tả GPS + thống nhất icon `pin`=GPS / `compass`=Plan (F2).
5. `HomeScreen.tsx:438, 461`: thêm role/label cho nhãn tên điểm hoặc `accessible={false}` (F7).
6. `CameraScreen.tsx:292`: bỏ `{active.id}` khỏi chữ hiển thị (F13).
7. `UnavailableScreen.tsx`: nút Thử lại dùng nền `colors.accent` + chữ sáng (F4).
8. Thêm `accessibilityViewIsModal` cho drawer/passport modal (F12).

## 5. Việc cần người dùng quyết
1. Thuật ngữ chuẩn: "Xác nhận điểm bằng GPS" hay "Vị trí GPS"? "Sổ tay" là drawer công cụ hay màn Plan? (đề xuất: GPS = "Xác nhận điểm bằng GPS" icon `pin`; Plan = "Chọn trải nghiệm"; drawer = "Công cụ" hoặc giữ "Sổ tay" cho cả Landing/Home/Qa). Chưa chốt thì F2 vẫn tồn tại.
2. Có thêm thẻ Quét QR ở Landing không (đề xuất: có thể, nhưng chưa làm khi chưa được yêu cầu).
3. Sau xác nhận GPS/QR: tự mở câu chuyện hay hiện nút "Mở câu chuyện" (đề xuất: nút, không tự chuyển).
4. Âm giọt nước có phát khi iPhone im lặng / khi Reduce Motion không.

## 6. Kiểm tra thiết bị còn pending (chưa thực hiện được)
- Android 360×640 và máy ≤340dp: vị trí khối lối tắt so với mép gập; nhãn trái pin Home bị cắt (tính: mép trái nhãn = 0,45W − 155dp, âm khi W < ~344dp); thanh tiến trình 170dp ở header Home.
- Font scale 1,3/1,5/2,0 trên Landing (thẻ carousel 310dp), drawer, top bar Qa (6 đoạn × tối thiểu 44dp).
- TalkBack/VoiceOver: thứ tự focus Landing, hai đích pin Home, modal (F12), nhãn pill ngôn ngữ.
- Reduce Motion bật: có nghe âm giọt nước không (F11); iPhone gạt im lặng.
- iOS: `onClose()` + `navigate()` trong drawer (F12); quyền vị trí/camera bị từ chối vĩnh viễn (F5).
- Tương phản chữ trên ảnh nền (Landing section pre-title, banner, badge) với các ảnh hero/cover.
- Live thật: Landing khi Live tải/lỗi/rỗng; vào Plan/Camera/Location từ drawer (F4); dataset >6 điểm (F7).

## 7. Không thuộc phạm vi / không đụng tới
Không sửa code/test/asset, không commit/push/deploy, không khởi động lại Metro, không gọi agent khác. Ownership giữ nguyên: FE Antigravity, điều phối Codex.
