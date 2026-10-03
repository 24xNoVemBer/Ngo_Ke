# TEST REPORT — Ngõ Kể (core demo)

**Cập nhật:** 03/10/2026, sau Phase 7. Nguồn bằng chứng: `agent_docs/evidence/phase-1/` đến `phase-7/`, mỗi phase có `checks.json` hoặc `interaction-checks*.json` kèm log lệnh.

## 1. Thiết bị và môi trường đã thử

| Môi trường | Dùng để | Kết quả |
| --- | --- | --- |
| **Android emulator** Medium_Phone, Android 17 / API 37, Expo Go 57.0.9 | Toàn bộ phase 1–7 | Đạt, có ảnh và log |
| Android emulator + chế độ máy bay, bundle qua `adb reverse` | Thử offline thật | **Không đạt — xem mục 3** |
| Node **24.19.0**, npm **11.17.0** | Test, lint, typecheck, build | Đạt |

## 2. Những gì **đã** kiểm chứng

| Hạng mục | Kết quả | Bằng chứng |
| --- | --- | --- |
| Unit/integration test | **90/90** ca | `agent_docs/evidence/phase-6/tests.log` |
| Typecheck, lint, dependency check | Exit 0 | cùng thư mục, `*.log` |
| Expo Doctor | **21/21** | `agent_docs/evidence/phase-6/doctor.log` |
| Xuất bundle Android và iOS | Exit 0 (xuất bundle, **không** phải chạy thật trên iOS) | `build-android.log`, `build-ios.log` |
| Kịch bản demo trọn vẹn × 3 lần | **45/45 bước, cả 3 lần giống nhau** | `agent_docs/evidence/phase-7/scenario-runs.json` |
| Kiểm tra fallback, chuyển mode, cỡ chữ, nhãn accessibility | **17/17** | `agent_docs/evidence/phase-7/phase7-checks.json` |
| Sáu trạng thái live (không cấu hình, rỗng, sai shape, HTTP lỗi, timeout, có dữ liệu) | **27/27** | `agent_docs/evidence/phase-6/interaction-checks.json` |
| Fallback camera khi từ chối quyền | Đạt | `phase-4/`, `phase-7/` |
| Fallback vị trí khi từ chối quyền | Đạt | `phase-5/`, `phase-7/` |
| QR lạ / sai định dạng không đổi điểm | Đạt (unit test) | `phase-4/cameraQr` trong `tests/` |
| Cỡ chữ hệ thống 1.3 | Màn vẫn cuộn và bấm được | `phase-7/font-scale-130.png` |
| Nhãn accessibility cho mọi nút bấm | Đạt (kiểm cấu trúc, **không** đặt chuẩn điểm số) | `phase-7/accessibility-*.xml` |
| `npm audit` | 23 cảnh báo: 7 moderate, 16 high | `phase-6/audit.json` |

## 3. Những gì **chưa** kiểm chứng — ghi rõ chưa hoàn tất

| Hạng mục | Lý do | Cần gì để kiểm |
| --- | --- | --- |
| **Offline thật** (chế độ máy bay) | Expo Go tải “remote update” trước khi đọc dev server nên hỏng khi mất mạng: `Uncaught Error: java.io.IOException: Failed to download remote update` | Bản build standalone (`expo run:android` hoặc development build) — là quyết định phạm vi của người dùng |
| **Quét QR thật** | Máy ảo không đưa được mã QR vào khung hình camera | Điện thoại thật + in mã `ngo-ke://node/<id>` |
| **GPS candidate / ngoài cụm** | Máy ảo không cấp fix GPS (`geo fix` trả OK nhưng provider không nhận) | Điện thoại thật ngoài trời |
| **iOS / iPhone** | Chưa có thiết bị | iPhone + Expo Go |
| **Bàn phím mềm** | Emulator này không bật được bàn phím mềm (`mInputShown=false`), nên chưa kiểm được nút gửi khi bàn phím đang mở | Kiểm trên điện thoại thật |
| **Screen reader (TalkBack/VoiceOver)** | Chưa cài và đo trên thiết bị | Thiết bị thật + hướng dẫn người dùng đọc |
| **Dữ liệu thật, backend thật, voice** | Chưa có; backend sẽ ở phase sau | Xem `HANDOFF_API.md`, `HANDOFF_VOICE.md` |

## 4. Cách chạy lại kiểm thử

```bash
cd mobile
npm test                 # 90 ca, không cần mạng
npm run typecheck && npm run lint
npx expo-doctor

# kịch bản demo × N lần và bộ kiểm tra Phase 7 (cần emulator + Metro)
node tools/e2e/demo-scenario.mjs --runs 3
node tools/e2e/phase7-checks.mjs
node tools/mock-api/server.mjs 8086    # máy chủ kiểm chứng live, không phải backend
```

## 5. Mức độ hoàn tất

Core demo **đủ để review trên một máy Android** và đủ để bàn giao kỹ thuật. Chưa hoàn tất: offline thật, QR thật, GPS thật, iOS, bàn phím mềm, screen reader, dữ liệu thật, backend thật, voice. Không mục nào trong danh sách này được ghi là đạt.