# Ngõ Kể

App native Android/iOS (Expo + React Native) để khám phá con ngõ: nghe giới thiệu, hỏi đáp cố định có nguồn, gợi ý điểm theo chủ đề/quỹ thời gian, xác nhận điểm và xem lời người kể trên camera.

**Trạng thái:** tech demo, đang ở Phase 2. Nội dung dữ liệu hiện là **mô phỏng**, chờ người dùng duyệt trước khi thay bằng dữ liệu thật.

## Bắt đầu nhanh

```bash
cd mobile
npm ci
npm start -- --go
```

Mở bằng Expo Go hỗ trợ SDK 57 (QR của Metro). Cách chạy trên máy ảo Windows + Metro trong WSL: [`mobile/README.md`](mobile/README.md).

## Tài liệu

| Tài liệu | Nội dung |
| --- | --- |
| [docs/MVP_ROADMAP.md](docs/MVP_ROADMAP.md) | Từng phase làm gì và cần dữ liệu gì để demo MVP |
| [docs/TECH_DEMO_PLAN.md](docs/TECH_DEMO_PLAN.md) | Nguồn chuẩn về phạm vi và thứ tự phase |
| [docs/PRO-NgoKe-MVP.md](docs/PRO-NgoKe-MVP.md) | Yêu cầu và tiêu chí chấp nhận |
| [docs/DATA_COLLECTION_GUIDE.md](docs/DATA_COLLECTION_GUIDE.md) | Cần thu dữ liệu gì và cách thu |
| [AGENTS.md](AGENTS.md) | Quy tắc làm việc và ranh giới cho agent |
| [MEMORY.md](MEMORY.md) | Trạng thái, bằng chứng và bước tiếp theo |
| [REVIEW-CHECKLIST.md](REVIEW-CHECKLIST.md) | Checklist duyệt theo phase |
| [agent_docs/](agent_docs) | Ghi chú kỹ thuật, báo cáo bàn giao và bằng chứng kiểm thử |

## Kiểm tra

```bash
cd mobile
npm test          # kiểm tra logic và dữ liệu
npm run typecheck
npm run lint
```

Kết quả chi tiết: [Phase 1](agent_docs/phase_1_completion.md), [Phase 2](agent_docs/phase_2_review.md).

## Phạm vi

Không có chatbot AI sinh câu trả lời, không chỉ đường, không theo dõi vị trí nền, không web/PWA, không AR/3D. Voice (TTS/STT) là phase riêng và phải được duyệt trước khi làm.
