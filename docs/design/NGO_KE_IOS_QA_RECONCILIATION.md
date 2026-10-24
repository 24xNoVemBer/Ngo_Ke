# Ngõ Kể — iOS QA Evidence Reconciliation Report

**Ngày lập:** 2026-10-24  
**Tác nhân:** Antigravity (Mobile UX QA Lead)  
**Workspace:** `D:\ngo_ke` — Branch `valentino/logic-fix-mobile-20261020` · HEAD `4af64c49`  
**Chế độ thực thi:** Read-only Application Source + Documentation + Evidence Review  
**Tài liệu liên quan:**
- [NGO_KE_NATIVE_QA_EVIDENCE_REPORT.md](file:///d:/ngo_ke/docs/design/NGO_KE_NATIVE_QA_EVIDENCE_REPORT.md)
- [NGO_KE_UI_WAVE1_REMEDIATION_REPORT.md](file:///d:/ngo_ke/docs/reviews/NGO_KE_UI_WAVE1_REMEDIATION_REPORT.md)
- [NGO_KE_UI_WAVE2_READINESS.md](file:///d:/ngo_ke/docs/plans/NGO_KE_UI_WAVE2_READINESS.md)

---

## 1. Bối cảnh & Phản hồi Thực tế từ Người dùng trên iOS

Người dùng đã trực tiếp mở ứng dụng Ngõ Kể trên thiết bị iOS (thông qua môi trường chạy thực tế) và ghi nhận các quan sát thủ công:

1. **Về Giao diện & Luồng trải nghiệm (UI/UX):** Chưa phát hiện lỗi hiển thị hoặc lỗi tương tác rõ ràng trong các luồng chính đã thử (duyệt ngõ, mở thẻ, xem đường mòn, mở modal).
2. **Về Giọng đọc & Âm thanh (Voice):** Giọng đọc và tập tin âm thanh chưa được thay đổi, vẫn sử dụng các tập tin đã nạp từ các phase trước.
3. **Về Nội dung Kể chuyện (Storytelling Content):** Một số bài thuyết minh nghe nặng tính khảo cứu học thuật, trích dẫn nguồn, chưa mang chất giọng kể chuyện truyền miệng tự nhiên của văn hóa ngõ phố.
4. **Về Kỷ luật Nghiệm thu:** Người dùng nhấn mạnh **không được mặc định là giao diện hoàn toàn không có lỗi chỉ vì chưa quan sát thấy lỗi trong đợt thử lướt (smoke test)**.

> [!IMPORTANT]
> **Phân định ranh giới chuyên môn:**
> - **Nội dung & Giọng đọc (Narrative Quality Gate):** Do **Codex Sol Ultra** phụ trách song song tại `docs/content/`. Việc giọng đọc chưa đổi và nội dung còn tính học thuật thuộc về phạm vi kịch bản văn hóa/TTS, **không phải lỗi kỹ thuật của UI Wave 1 hay UI-04A**.
> - **Giao diện & Tương tác (UI/UX):** Do **Antigravity (QA Lead)** và **Codex Luna (Worker)** phụ trách. Báo cáo này tập trung đối soát các giả thuyết hiển thị trên iOS.

---

## 2. Rà soát Bằng chứng trong Workspace

Kiểm tra thư mục workspace `D:\ngo_ke`:
- Không có tập tin ảnh chụp màn hình (screenshot) hoặc nhật ký native (native logs) mới nào được xuất vào thư mục mã nguồn.
- Các ảnh trong `docs/` (`VOICE_UX_*.png`) là tư liệu phác thảo storyboard từ giai đoạn thiết kế 14/10/2026.
- Kết luận: Quan sát của người dùng là **bằng chứng trải nghiệm thực địa dạng người dùng quan sát (User Smoke Observation)**, chưa có hiện vật đồ họa lưu trữ trong kho lưu trữ để làm căn cứ nghiệm thu pixel tuyệt đối.

---

## 3. Bảng Đối soát 8 Giả thuyết Native QA (NQ-01 đến NQ-08)

Đối chiếu phản hồi người dùng với 8 trường hợp cần thiết bị thật đã được thiết lập tại [NGO_KE_NATIVE_QA_EVIDENCE_REPORT.md](file:///d:/ngo_ke/docs/design/NGO_KE_NATIVE_QA_EVIDENCE_REPORT.md):

| Mã ca | Hạng mục kiểm tra | Trạng thái kỹ thuật mã nguồn | Trạng thái sau đối soát iOS | Phân loại bằng chứng | Đánh giá & Rủi ro |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **NQ-01** | Đệm đáy Modal Hộ chiếu & Sổ tay với thanh Home Indicator trên iPhone (FIX-03) | `paddingBottom: 24` tĩnh tại `AlleyPassportModal.tsx:120` và `NotebookDrawerModal.tsx:227` | Người dùng mở modal bình thường, không ghi nhận hiện tượng che khuất nút đóng hay mục cuối | `USER_REPORTED_NO_OBVIOUS_DEFECT` / `NEEDS_MORE_EVIDENCE` | Smoke test cho thấy modal hoạt động ổn định. Để đóng hoàn toàn FIX-03, cần quan sát mục cuối cùng khi cuộn hết trang trên máy có Home Indicator (inset 34pt). |
| **NQ-02** | Nguy cơ tràn lề trái của nhãn trạm tại màn hình hẹp (FIX-01) | Đã sửa công thức biên động tại `HomeScreen.tsx:502–504`: mép trái $\ge 10\text{pt}$ | Trên iOS (chiều rộng tối thiểu iPhone 375–430pt), nhãn hiển thị thoáng, không chạm viền | `SOURCE_VERIFIED` + `USER_REPORTED_NO_OBVIOUS_DEFECT` | Đã kiểm chứng bằng test tự động 426/426 và xác nhận không lỗi trên màn hình iPhone thực tế. |
| **NQ-03** | Chồng lấn nhãn trạm ngõ 5 điểm khi cỡ chữ lớn (`fontScale > 1.3`) | `HomeScreen.tsx:435` tự động chuyển sang danh sách thẻ `AlleyTrailView` khi `fontScale > 1.3` | Không ghi nhận vỡ bố cục khi duyệt ngõ 5 điểm (Ngõ Gạch, Trung Yên) | `SOURCE_VERIFIED` | Cơ chế phòng hộ của mã nguồn hoạt động chính xác. |
| **NQ-04** | Độ tương phản chữ thanh tiêu đề trên ảnh bìa ngõ ngoài trời | `scrimOverlay` (`rgba(20,24,19,0.58)`) bảo vệ lớp chữ | Tiêu đề ngõ và thanh tiến trình đọc rõ trong điều kiện sử dụng thông thường | `USER_REPORTED_NO_OBVIOUS_DEFECT` | Cần lưu ý khi người dùng đi thực địa dưới ánh nắng trưa trực tiếp. |
| **NQ-05** | Thẻ chọn ngõ (`AlleySelectScreen`) dưới ánh sáng ban ngày | Nền thẻ `colors.surface` (`#FFFDF7`), chữ mực chính `#2E3028` (12:1) | Đọc rõ ràng, chuyển ngõ mượt mà | `USER_REPORTED_NO_OBVIOUS_DEFECT` | Đạt yêu cầu thẩm mỹ "Sổ tay ngõ phố". |
| **NQ-06** | Trợ năng VoiceOver đọc thông báo thẻ kết quả rỗng trong `PlanScreen` | Thuộc tính `accessibilityLiveRegion="polite"` tại `PlanScreen.tsx:323` | Người dùng kiểm thử bằng thao tác chạm/nhìn, chưa bật VoiceOver | `NATIVE_PENDING` | Giữ nguyên trạng thái chờ kiểm chứng chuyên sâu trợ thính. |
| **NQ-07** | Chuyển cảnh OLED từ nền tối điện ảnh sang nền giấy ấm | `animationType="slide"` với `colors.surface` | Không ghi nhận hiện tượng nháy trắng (flash) hay giật khung hình | `USER_REPORTED_NO_OBVIOUS_DEFECT` | Quá trình chuyển bề mặt Dual-Surface đạt cảm quan tự nhiên. |
| **NQ-08** | Bàn phím ảo có che thanh dock microphone khi nhập liệu trên `QaScreen` hay không | `KeyboardAvoidingView` với `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` | Nhập câu hỏi và lệnh gõ chữ không bị che nút | `SOURCE_VERIFIED` + `USER_REPORTED_NO_OBVIOUS_DEFECT` | Hoạt động đúng quy chuẩn iOS Keyboard avoidance. |

---

## 4. Làm rõ về Khía cạnh Âm thanh & Kể chuyện

Người dùng ghi nhận: *"Giọng đọc và nội dung vẫn chưa được thay đổi; một số nội dung nghe như đọc nghiên cứu và trích nguồn."*

Để đảm bảo tính minh bạch và tránh đánh giá sai lệch công việc kỹ thuật:
1. **Tiến độ UI Wave 1 không bao gồm sửa file âm thanh:** UI Wave 1 tập trung hoàn toàn vào Theme Tokens (`NK-UI-01A`), Schematic Trail Layout (`NK-UI-02`), và Phục hồi Kế hoạch (`NK-UI-06A`). Không có bất kỳ ticket nào của Wave 1 được phép chỉnh sửa tập tin MP3 hoặc giọng đọc.
2. **UI Wave 2 (NK-UI-04A) là Trình diễn (Presentation):** Ticket UI-04A sắp tới chỉ chuẩn hóa giao diện nút bấm Play/Pause, định dạng hiển thị phút:giây `mm:ss`, và vạch tiến độ phát. UI-04A **không thay đổi kịch bản thuyết minh, không sinh lại file audio, và không đổi giọng đọc**.
3. **Phần việc của Codex Sol Ultra:** Việc chuyển hóa các câu văn nghiên cứu thành lời kể truyền cảm, mộc mạc của người Hà Nội cổ đang được Sol thực hiện độc lập tại các gói nội dung `NGO_KE_BATCH_*_VI_EN_DRAFT.md`. Sau khi nội dung được duyệt và tạo voice mới, app sẽ tự động liên kết thông qua catalogue ID hiện có.

---

## 5. Checklist Tinh gọn cho Đợt Kiểm chứng Bổ sung trên iOS

Người dùng không cần thực hiện lại toàn bộ ma trận kiểm thử mà chỉ cần lưu ý 3 điểm chuyên sâu khi có dịp cầm máy:

1. **Kiểm tra đáy Modal Hộ chiếu (NQ-01 cho FIX-03):**
   - Mở màn hình Hộ chiếu (`AlleyPassportModal`) $\rightarrow$ Cuộn danh sách xuống tận cùng.
   - *Quan sát:* Huy hiệu hoặc trạm cuối cùng của ngõ cuối cùng có bị thanh gạch ngang Home Indicator của iPhone đè lên hay không? Nếu vẫn còn khoảng hở thoáng $\ge 10\text{pt}$, FIX-03 có thể đóng lại mà không cần sửa code.
2. **Kiểm tra cỡ chữ cực đại (Dynamic Type):**
   - Vào Cài đặt iOS $\rightarrow$ Trợ năng $\rightarrow$ Màn hình & Cỡ chữ $\rightarrow$ Kéo cỡ chữ lên mức lớn.
   - *Quan sát:* Bản đồ ngõ tự động chuyển sang dạng danh sách thẻ dọc (`AlleyTrailView`), các chữ không bị đè lên nhau.
3. **Kiểm tra chuyển đổi ngôn ngữ trên máy thật:**
   - Bấm nút `VI | EN` trên đầu màn hình chính và màn hình Kế hoạch.
   - *Quan sát:* Nhãn "Đổi lựa chọn" chuyển đổi mượt sang "Change selection" (xác nhận FIX-02).

---

## 6. Kết luận Thẩm định (Verdict)

### Verdict Native QA: `NATIVE_QA_INCOMPLETE`

**Lý do:**
- Phản hồi của người dùng cung cấp bằng chứng thực địa rất tích cực (`USER_REPORTED_NO_OBVIOUS_DEFECT`) cho các luồng chính trên iOS, củng cố độ tin cậy của bản vá Wave 1 và FIX-01/02.
- Tuy nhiên, theo đúng nguyên tắc kỷ luật kiểm thử đã cam kết: chưa có screenshot, log đo lường insets đáy màn hình, hoặc phiên kiểm thử VoiceOver chuyên biệt được lưu trữ trong kho tài liệu. Do đó, trạng thái chính thức vẫn được duy trì là **`NATIVE_QA_INCOMPLETE`** để không chủ quan.
- **Tác động tới tiến độ:** Trạng thái này **không cản trở việc chuẩn bị và phê duyệt UI Wave 2**, vì không có bất kỳ lỗi P0/P1 nào cản trở luồng sử dụng.
