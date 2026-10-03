# Phase 7 — Offline, kiểm thử end-to-end và bàn giao demo: bàn giao

**Ngày:** 03/10/2026. **Phạm vi:** R7.01–R7.03. **Trạng thái:** kiểm thử và bàn giao đã xong trên **một máy Android**; các phần chưa kiểm được ghi rõ, **không** ghi pass. Core demo **đóng băng phạm vi**; backend và voice là hai phase riêng.

## Quyền thực hiện và quyết định liên quan

- Người dùng duyệt Phase 6 và yêu cầu triển khai Phase 7.
- Trong lúc Phase 6 chờ duyệt, người dùng đã chốt (03/10/2026): **backend do dự án tự viết** (Node 24 + JSON API + SQLite), **phạm vi toàn cục**, và **dữ liệu MVP do dự án sinh** là mô phỏng, sau thay bằng data thật.
- Người dùng chọn thứ tự: **xong Phase 7 rồi mới mở phase backend**.
- Spec: [`2026-10-03-phase-7-offline-e2e-design.md`](../docs/superpowers/specs/2026-10-03-phase-7-offline-e2e-design.md).

## Kịch bản demo lặp lại (R7.01)

`tools/e2e/demo-scenario.mjs` chạy trên emulator: `giới thiệu → hỏi → chọn chủ đề → nhận điểm → xác nhận → xem lời kể → hỏi tiếp`.

| Kết quả | Số bước |
| --- | --- |
| Chạy **3 lần**, mỗi lần 15 bước | **45/45 đạt**, cả 3 lần cho cùng kết quả |

Log: [`evidence/phase-7/scenario-runs.json`](evidence/phase-7/scenario-runs.json). Ảnh từng bước: `r1-*` đến `r3-*` trong cùng thư mục.

## Kiểm tra fallback, mode, thao tác (R7.02)

`tools/e2e/phase7-checks.mjs`: **17/17 đạt**. Log: [`evidence/phase-7/phase7-checks.json`](evidence/phase-7/phase7-checks.json).

| Nhóm | Kết quả |
| --- | --- |
| Câu hỏi ngoài bộ Q&A | Báo “Chưa có dữ liệu”, không bịa đáp án |
| Từ chối quyền camera | Camera vẫn tắt, chọn tay được, đọc lời kể bằng chữ |
| Từ chối quyền vị trí | Báo đúng tình huống, **không** có “Có thể là…”, chọn tay được |
| Live không có URL | `empty`, không hiện điểm demo; quay lại Demo vẫn chạy |
| Nhãn accessibility | Mọi nút bấm đều có nhãn (kiểm cấu trúc, **không** đặt chuẩn điểm số) |
| Cỡ chữ hệ thống 1.3 | Các màn vẫn cuộn được, chip vẫn bấm được; đã trả lại 1.0 |

## Offline — thử và ghi kết quả thật

Em thử chứng minh demo chạy **không có mạng**: `adb reverse tcp:8085 tcp:8085` để app lấy bundle qua USB, rồi bật **chế độ máy bay** (Wi-Fi tắt).

**Kết quả: không đạt, và em không ghi pass.** Expo Go tải “remote update” trước khi đọc dev server, nên với mạng tắt nó báo:

```
Uncaught Error: java.io.IOException: Failed to download remote update
```

Nghĩa là **Expo Go vốn cần mạng để khởi động**, không phải app cần mạng. Muốn chứng minh offline thật thì phải có bản build standalone (`expo run:android` hoặc development build) — đó là quyết định phạm vi của người dùng.

Điều **đã** chứng minh được: demo đọc dữ liệu từ bundle, không cần API/server/key, và vẫn chạy khi máy chủ kiểm chứng đã tắt. Bằng chứng giới hạn: [`evidence/phase-7/offline-limitation.txt`](evidence/phase-7/offline-limitation.txt).

## Kiểm tra tĩnh

| Lệnh | Kết quả |
| --- | --- |
| `npm test` | **90/90 đạt** |
| `npm run typecheck`, `npm run lint`, `npm run check:dependencies` | Exit 0 |
| `npx --yes expo-doctor` | **21/21** |
| `npm run build:android` / `build:ios` | Exit 0 (xuất bundle, **không** phải chạy thật trên iOS) |

## Lỗi tìm được trong lúc làm

Các lỗi dưới đây đều ở **script kiểm thử**, không phải trong app; em sửa script và chạy lại, không sửa app để cho kiểm tra xanh:

- Script tìm nhãn rồi mới cuộn, nên bấm trúng nút khi nút chưa nằm trọn vùng nhìn.
- Regex đọc cây accessibility phụ thuộc thứ tự thuộc tính XML, nhiều lần đọc ra danh sách rỗng và mọi kiểm tra sau đó đều fail giả. Đã viết lại parser đọc từng thuộc tính độc lập.
- Dùng nhầm nhãn: ô nhập là “Nhập câu hỏi của bạn”, nút đầu vào Q&A khác, chip hỏi tiếp là câu hỏi thật trong dữ liệu.
- Kiểm tra “bàn phím không che nút gửi” **không** kiểm được vì emulator không bật bàn phím mềm (`mInputShown=false`). Em ghi rõ là **chưa kiểm**, không ghi pass; vẫn kiểm nút gửi nằm trên màn hình và đường gửi bằng phím Enter.
- Metro chạy ở chế độ CI nên không nhận code mới; phải khởi động lại Metro và mở lại app, nếu không sẽ kiểm nhầm bundle cũ.

## Bàn giao (R7.03)

| File | Nội dung |
| --- | --- |
| [`docs/TEST_REPORT.md`](../docs/TEST_REPORT.md) | Ma trận thiết bị, đã thử gì, **chưa** thử gì, cách chạy lại |
| [`docs/HANDOFF_API.md`](../docs/HANDOFF_API.md) | Hợp đồng endpoint app chờ, cách chạy, 5 câu cần chốt trước khi viết backend |
| [`docs/HANDOFF_DATA.md`](../docs/HANDOFF_DATA.md) | Quy tắc dữ liệu; ghi rõ dữ liệu MVP do dự án sinh là mô phỏng |
| [`docs/HANDOFF_VOICE.md`](../docs/HANDOFF_VOICE.md) | Ràng buộc phase voice, chưa có code |
| [`docs/HANDOFF_UI.md`](../docs/HANDOFF_UI.md) | Vùng UI được đổi và file **không được** sửa |
| `mobile/README.md` | Thêm mục “Mở demo nhanh”, cập nhật kết quả Phase 7 |

## Đóng băng scope

Ghi trong `AGENTS.md`: sau Phase 7 **không** mở thêm tính năng vào core demo khi chưa có phase mới được duyệt. Backend và voice là hai phase riêng.

---

## Việc cần anh quyết

1. **Phạm vi “toàn cục” của backend** gồm gì: chỉ đọc dataset, hay thêm ghi/duyệt bản ghi, thống kê, quản lý nội dung? Em sẽ trình spec phase backend để anh duyệt trước khi code.
2. **Backend có cần xác thực (token/API key) không**, và lưu ở đâu để không lọt vào repo.
3. **Có cần deploy backend không**, hay chỉ chạy nội bộ để demo.
4. **Có làm bản build standalone (`expo run:android` / development build) không** để chứng minh offline thật? Hiện Expo Go không cho phép; đây là cách duy nhất em thấy để đạt R7.01 đúng nghĩa.
5. **Giữ hay bỏ `tools/mock-api/`** khi backend thật đã có? Nó đang là công cụ kiểm chứng từng trạng thái live.
6. **Có giữ số điểm cố định 6** trong validator không, hay mở để dataset thật có nhiều hơn?

## Việc anh tự làm

1. **Xem demo hoàn chỉnh trên máy thật** (Android và nếu có iPhone) trước khi chốt tech demo. `[ngoài plan]` — plan yêu cầu người dùng xem bản demo hoàn chỉnh; hệ quả nếu chưa làm: các giới hạn ghi ở `TEST_REPORT.md` vẫn chưa có bằng chứng thiết bị thật.
2. **Thử QR thật** bằng cách in mã `ngo-ke://node/demo-03` dán thử. `[ngoài plan]`; hệ quả nếu chưa làm: nhánh quét QR vẫn chưa end-to-end.
3. **Thử GPS ngoài trời** trên điện thoại thật để kiểm candidate/outside-cluster. `[ngoài plan]`; hệ quả nếu chưa làm: hai nhánh đó chỉ được tin qua unit test.
4. **Chốt danh sách handoff gửi cho nhóm nào** (data/UI/voice). `[ngoài plan]` — R7.03 yêu cầu handoff cho A/B/C nhưng không chỉ định người nhận; hệ quả nếu chưa làm: tài liệu handoff nằm trong repo mà chưa tới đúng người.