# Báo cáo Triển khai FE Bốn Ngõ Phố Cổ (Tasks 3, 5, 7) — 22/10/2026

**Người thực hiện:** Antigravity (FE Worker / W2)
**Tài liệu cơ sở:** `docs/superpowers/plans/2026-10-22-four-alley-content.md`
**Quyết định áp dụng:** D1, D2, D3, D4, D5, D6
**Trạng thái kiểm thử:** 358/358 tests đạt (100%), typecheck sạch, lint sạch, git diff --check sạch

---

## 1. Tóm tắt công việc đã thực hiện

Đã hoàn thành toàn bộ 3 nhiệm vụ FE được phân công (Tasks 3, 5, 7) tuân thủ nghiêm ngặt ranh giới sở hữu và quyết định người dùng:
1. **Task 3 — Đăng ký Collection & Đa ngôn ngữ (`mobile/src/data/collections.ts`, `mobile/src/i18n/translator.ts`):**
   - Đăng ký 3 ID mới vào `CollectionId`, `isCollectionId`, `AVAILABLE_COLLECTIONS`, `COLLECTION_REVISIONS`, `getBundledDataset`, `getLocalizedCollections`:
     - `ngo-tam-thuong`: 2 điểm dừng, bìa ảnh thay thế có sẵn (`ngochieusau_05.jpg`), `kind: 'simulated'`.
     - `ngo-cam-chi`: 3 điểm dừng, bìa ảnh thay thế có sẵn (`ngocamchi_03.jpg`), `kind: 'simulated'`.
     - `ngo-phat-loc`: 2 điểm dừng, bìa ảnh có sẵn (`ngophatloc_01.jpg`), `kind: 'simulated'`.
   - Cập nhật hash canonical SHA-256 nhất quán với repo sau khi root chỉnh sửa thẻ món phở gà:
     - `ngo-trung-yen`: VI `1291ae869a7d66b684d3bd764f87fe99817d250d19c544da0938e30f8ec5ae19`, EN `ca2ff890877c351d3b9d82da3b9178afb5b38a09c2ff51a4d264af75874a6c27`
     - `ngo-tam-thuong`: VI `3086e80f2dda45e2354289882cb89a6526574fa98b5cfe4f2f17f02d092745e9`, EN `unavailable`
     - `ngo-cam-chi`: VI `b7898f698efc6b8db0a137d151bfc622fef52082bdfc2f8d97c44b1b2e08b48c`, EN `unavailable`
     - `ngo-phat-loc`: VI `d6e9fc6d93f4f0961dd20bdd0128df35229f33e0e89caf2071dccc9f46aff195`, EN `unavailable`
   - Tuân thủ D3: `getLocalizedCollections('en')` ẩn hoàn toàn 3 collection mới; `getBundledDataset(id, 'en')` trả về kiểu rõ ràng `AnyDemoDataset | undefined` (trả về `undefined` không qua ép kiểu giả mạo `undefined as unknown as DemoDatasetV2`), không bao giờ fallback âm thầm sang tiếng Việt hoặc fiction mặc định.
   - Bổ sung luồng unavailable tường minh trên Home và các màn hình: khi người dùng chuyển ngôn ngữ sang EN lúc đang chọn collection chỉ có tiếng Việt (hoặc khôi phục trạng thái EN với ngõ VI-only), app hiển thị `UnavailableScreen` với thông báo trung thực và điều khiển phục hồi (chọn collection hỗ trợ hoặc quay lại tiếng Việt), không mượn metadata của fiction mặc định và không crash trên `nodes` hay `intro`.
   - Bổ sung đầy đủ translation keys cho collection mới, câu chuyện ngõ, và mục Khám phá thêm (Sổ tay) trong `translator.ts`.

2. **Task 5 — Thẻ "Câu chuyện ngõ" trên Home (`mobile/src/components/AlleyStoryCard.tsx`, `mobile/src/screens/HomeScreen.tsx`):**
   - Tạo linh kiện `AlleyStoryCard`: hiển thị tiêu đề ngõ và toàn bộ các đoạn văn kể chuyện trong khung cuộn; cỡ chữ tối thiểu ≥ 12px; nút đóng có kích thước chạm tối thiểu ≥ 44pt. Test cấu trúc dùng `fontScale` 2.0, chưa chứng minh không tràn/cắt chữ trên thiết bị. Không hiển thị metadata/nguồn APA (`evidence`).
   - Tích hợp vào `HomeScreen`: nút `testID="home-alley-story"` (với nhãn "Câu chuyện ngõ", vùng chạm ≥ 44pt, chiều cao tối thiểu 44pt) xuất hiện khi dataset hiện tại có trường `alleyStory`. Nhấn nút sẽ mở thẻ đọc câu chuyện. Đối với dataset cũ không có `alleyStory` (`fiction-letter`, `ngo-gach`), nút hoàn toàn không hiển thị.

3. **Task 7 — Mục "Khám phá thêm" trong Sổ tay (`mobile/src/components/AlleyGuideSection.tsx`, `mobile/src/components/NotebookDrawerModal.tsx`):**
   - Tạo linh kiện `AlleyGuideSection`: bố cục dạng card hẹp cho thiết bị di động (không dùng bảng 4 cột); toàn bộ text đảm bảo cỡ chữ tối thiểu ≥ 12px; hiển thị rõ 3 nhóm nội dung:
     - **Quán nên thử:** tên quán, địa chỉ (nếu có), món nổi bật, giờ mở cửa (nếu `hours: null` tự động hiển thị `"Chưa xác minh giờ"`), ghi chú quán (nếu có). Không thêm các nút gọi/đặt chỗ/mở bản đồ ngoài app.
     - **Nên ghé thăm:** tên di tích, địa chỉ (nếu có), các điểm lưu ý (bảo toàn đầy đủ sự mơ hồ từ tài liệu gốc, ví dụ đền Tiên Hạ số "46 hoặc 48", Đình Trung Yên chưa rõ lịch mở cửa).
     - **Hành trình đề xuất:** danh sách các chặng nối tiếp nhau theo tài liệu.
     - **Lưu ý trải nghiệm:** hiển thị trung thực toàn bộ các lưu ý từ doc (ý kiến người viết, giá món cũ 2020 không dùng làm giá hiện hành, quy tắc không vào nhà dân). Không in danh mục tài liệu tham khảo APA.
   - Tích hợp vào `NotebookDrawerModal`: đọc `guide` từ nguồn dataset thực tế (`source.dataset` khi ready hoặc bundled dataset tương ứng); nhúng trực tiếp vào ScrollView duy nhất của modal Sổ tay (không mở modal lồng nhau); nếu collection không có guide thì hoàn toàn không hiển thị khung trống.

---

## 2. Kết quả kiểm tra chi tiết

| Kiểm tra | Kết quả | Ghi chú |
| --- | --- | --- |
| `npm test --prefix mobile` | **358/358 PASS** (0 fail) | Gồm 349 bài test cơ sở + 4 bài test `alleyStoryCard.test.mjs` + 4 bài test `alleyGuideSection.test.mjs` + 1 bài test tích hợp chuyển ngôn ngữ App.tsx trong `uiFlows.test.mjs`. |
| `npm run typecheck --prefix mobile` | **PASS (0 errors)** | `tsc --noEmit` hoàn toàn sạch. |
| `npm run lint --prefix mobile` | **PASS (0 errors)** | `eslint .` đạt 0 lỗi, 0 cảnh báo. |
| `git diff --check` | **PASS (0 whitespace errors)** | Toàn bộ diff sạch khoảng trắng. |
| Metro 8082 read-only bundle check | **Metro offline (000)** | Port 8082 không mở tiến trình Metro; không tự ý khởi chạy/restart Metro theo quy tắc đóng băng runtime. |

---

## 3. Danh sách file thay đổi

- **File tạo mới:**
  - `mobile/src/components/AlleyStoryCard.tsx`: Linh kiện thẻ đọc câu chuyện ngõ (min text 12px, touch target 44pt).
  - `mobile/src/components/AlleyGuideSection.tsx`: Linh kiện mục Khám phá thêm (Quán nên thử, Nên ghé thăm, Hành trình đề xuất, Lưu ý; min text 12px).
  - `mobile/tests/alleyStoryCard.test.mjs`: Test tương tác thẻ câu chuyện Home, vùng chạm ≥ 44pt, `fontScale: 2.0`, ẩn đối với dataset không có story.
  - `mobile/tests/alleyGuideSection.test.mjs`: Test hiển thị 3 nhóm hướng dẫn, xử lý giờ null, bảo toàn rào đón doc, ẩn đối với dataset không có guide, ẩn EN đối với 3 ngõ mới.
  - `docs/reviews/2026-10-22-four-alley-fe.md`: Báo cáo nghiệm thu FE.

- **File chỉnh sửa:**
  - `mobile/src/data/collections.ts`: Đăng ký 3 collection mới, hash canonical 4 VI + Trung Yên EN (VI `1291ae86...`, EN `ca2ff890...`), kiểu trả về `AnyDemoDataset | undefined`, lọc EN theo D3.
  - `mobile/src/i18n/translator.ts`: Bổ sung key bản dịch VI và EN cho 3 ngõ mới, Home story, và Guide sections.
  - `mobile/src/screens/HomeScreen.tsx`: Tích hợp nút `home-alley-story`, modal `AlleyStoryCard`, luồng unavailable cho ngõ VI-only trong EN với tùy chọn chuyển lại tiếng Việt hoặc chọn ngõ khác.
  - `mobile/src/screens/UnavailableScreen.tsx`: Hỗ trợ tùy chỉnh nhãn nút khôi phục (actionLabel, secondaryActionLabel) giữ tương thích hoàn toàn.
  - `mobile/src/components/NotebookDrawerModal.tsx`: Tích hợp `AlleyGuideSection` từ dataset đang chọn.
  - `mobile/tests/alleyIntegration.test.mjs`: Cập nhật điểm dừng mới của Ngõ Trung Yên và hash canonical theo chỉ dẫn điều phối.
  - `mobile/tests/uiFlows.test.mjs`: Bổ sung test kiểm thử chuyển ngôn ngữ App.tsx thực tế với collection VI-only và khôi phục ngôn ngữ.
  - `mobile/tests/landingQuickActions.test.mjs`, `landingRedesign.test.mjs`, `provenanceUiCleanup.test.mjs`, `remediationIntegration.test.mjs`: Cập nhật scoped mock loader cho module mới.

---

## 4. Những phần chưa kiểm tra & Việc cần người dùng tự làm

### Phần chưa kiểm tra (Native Pending)
1. Chưa kiểm thử end-to-end trên thiết bị thật iOS / Android (môi trường CI/Node test runner).
2. Kiểm tra `fontScale` 1.3 và 2.0 hiện tại mới là kiểm thử cấu trúc (structural tests) trong Node test runner, chưa phải bằng chứng thiết bị thật (not device proof).
3. Chưa kiểm thử hiển thị thực tế khi đổi hướng màn hình ngang (landscape) hoặc dynamic type hệ thống vượt mức fontScale 2.0 trên thiết bị thật.

### Việc cần người dùng tự làm (đã nằm trong kế hoạch `docs/TECH_DEMO_PLAN.md` / `four-alley-content.md`)
1. **Khảo sát thực địa:** Kiểm tra giờ mở cửa, địa chỉ và hoạt động thực tế của các quán ăn/di tích (Đình Trung Yên, đền Tiên Hạ 46 hay 48, Xôi Hồng, Bún đậu Trung Hương).
2. **Ảnh thật cho 2 ngõ mới:** Chọn ảnh chụp thực tế cho Ngõ Tạm Thương và Ngõ Cấm Chỉ (hiện đang dùng ảnh thay thế có sẵn trong app).

> [!NOTE]
> **Quyết định D6 đã chốt đóng:** Không sinh audio, không commit audio mới, không chạy script sinh audio và không yêu cầu API key ElevenLabs. Bốn slot intro VI chỉ là cấu trúc chờ trong catalogue để người khác sinh sau theo `docs/VOICE_GUIDE_FOUR_ALLEYS_20261022.md`.
