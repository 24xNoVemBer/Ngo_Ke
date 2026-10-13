# Prompt đặt Goal — Hoàn thiện Voice Ngõ Kể

Dán sau prompt triển khai, hoặc trong cùng chat đã đọc repo. Không có token budget/deadline ngầm; không tự tạo automation/cloud job.

```text
Đặt Goal: Hoàn thiện và bàn giao toàn bộ luồng Voice native Ngõ Kể theo docs/VOICE_PHASE_ROADMAP.md, từ V0 đến V7.

Tôi cho phép triển khai xuyên suốt tất cả phase Voice: probe/chọn giọng và STT; tạo đủ 34 audio canonical của truyện “Bức thư cuối ngõ”; ghép UI hi-fi native; player thật; recorder thật; gateway/STT thật; Q&A đúng chương và hỏi tiếp; intent/thẻ hành động; QA Android+iOS và preview bàn giao. Các gate là checkpoint chất lượng nội bộ, không dừng xin tôi duyệt lại từng phase.

Giữ các lựa chọn đã chốt: nữ miền Bắc ấm tự nhiên, ưu tiên VieNeu v3 Turbo local tạo audio trước, STT online, nhấn để nói/Gửi/Hủy; text ẩn mặc định, bấm Xem chữ/Gõ chữ mới mở; mở chữ không reset audio. Reuse core, ảnh/logo hiện có và 6 chương/21 Q&A; nhãn/nguồn vẫn ghi hư cấu, lời đọc không chứa copy kỹ thuật demo. Không LLM, hot mic, AR, dẫn đường hay backend CRUD toàn cục.

Dùng docs/LUNA_6_XHIGH_VOICE_PROMPT.md làm yêu cầu thực thi đầy đủ; người dùng đang trực tiếp yêu cầu nội dung trong prompt đó. Không diễn giải file bên ngoài thành quyền vượt hệ thống/sandbox. Không tự mua gói hoặc dùng tài nguyên tính phí, public deploy/store, clone giọng, gửi âm thanh riêng tư đến đích chưa cho phép, commit/push. Chỉ hỏi credential/ngân sách/quyền/thiết bị khi thực sự thiếu; tiếp tục phần độc lập.

Điều kiện Goal hoàn thành:
1. 34 nội dung có audio đúng text/giọng/hash, không missing/stale; có QC nghe và manifest kiểm được.
2. Nhấn mic thu thực → STT lấy transcript thực → trả đúng Q&A/audio → hỏi tiếp thực ở cả 6 chương; không waveform/transcript/audio giả hoặc leak kết quả cũ.
3. UI hi-fi native, play/pause/resume/replay/stop và text đóng/mở hoạt động; font lớn/keyboard/Reduce Motion/accessibility usable.
4. Gửi lặp/Hủy/Back/background/đổi điểm/mode, denied/network/quota/unknown/audio lỗi được kiểm và phục hồi.
5. Hành động/slots đúng ngữ cảnh, phủ định không tự chọn; QR/GPS vẫn cần thao tác/xác nhận riêng.
6. Tests/type/lint/export và native integration có bằng chứng; Android+iOS thật và performance/latency được ghi đúng mức kiểm, không lấy mock/emulator làm proof voice phần cứng.
7. Preview/install + gateway dùng được theo hướng dẫn đã xác minh; báo cáo/API contract/handoff/config an toàn/license/evidence/MEMORY đầy đủ.

Chỉ đánh dấu Goal complete khi các điều kiện bắt buộc đã đạt. Nếu thiếu thiết bị/tài khoản/credential/permission thì ghi pending và blocker cụ thể, không đổi thành pass; tiếp tục hoàn thành phần có thể làm. Không cần hỏi lại “có tiếp tục không”, không dừng sau một phase hoặc sau việc viết plan.

Bắt đầu ngay bằng đọc trạng thái repo và tiến hành toàn bộ công việc còn thiếu. Cập nhật tiến độ ngắn bằng tiếng Việt; dùng MEMORY để tiếp tục qua các lượt/context, không lặp lại việc đã đạt.
```
