# Ngõ Kể — UI Wave 2 Scope & Handoff Refinement

**Ngày lập:** 2026-10-24  
**Tác nhân:** Antigravity (Mobile UX QA Lead)  
**Workspace:** `D:\ngo_ke` — Branch `valentino/logic-fix-mobile-20261020` · HEAD `4af64c49`  
**Chế độ thực thi:** Documentation Only · Handoff Preparation  
**Tài liệu mẹ:**
- [NGO_KE_UI_SPEC_V1_1.md](file:///d:/ngo_ke/docs/design/NGO_KE_UI_SPEC_V1_1.md)
- [NGO_KE_UI_APPROVED_TICKETS.md](file:///d:/ngo_ke/docs/plans/NGO_KE_UI_APPROVED_TICKETS.md)
- [NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md](file:///d:/ngo_ke/docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md)
- [NGO_KE_IOS_QA_RECONCILIATION.md](file:///d:/ngo_ke/docs/design/NGO_KE_IOS_QA_RECONCILIATION.md)

---

## 1. Mục tiêu & Nguyên tắc Tinh giản Phạm vi (Scope Refinement)

Nhằm đảm bảo **tiết kiệm công sức kỹ thuật, tránh viết mã thừa (redundant code), và ngăn ngừa xung đột file giữa các worker**, đợt chuyển giao UI Wave 2 được rà soát đối chiếu chặt chẽ với hiện trạng mã nguồn thực tế sau Phase 1B và Wave 1.

### Các nguyên tắc bắt buộc:
1. **Không code lại những gì mã nguồn đã có sẵn:** Nếu một tính năng hoặc rào chắn bảo vệ đã được cài đặt trong Phase 1B / Wave 1, thu hẹp ticket đó về đúng phần vi sai còn thiếu.
2. **Quy tắc Một tác giả trên tệp dùng chung (Single-writer rule):** Các tệp `QaScreen.tsx`, `HomeScreen.tsx`, và `translator.ts` không được phân công cho hai ticket chạy đồng thời.
3. **Phân định rạch ròi Presentation vs Lifecycle:** Tuyệt đối không đưa tua âm thanh (seek), kéo trượt (scrub), hay thanh nghe nổi (mini-player) vào Wave 2.
4. **Không tự động phê duyệt:** Antigravity hoàn thiện hồ sơ bàn giao kỹ thuật ở trạng thái `READY_FOR_HUMAN_APPROVAL`; quyền mở code thực tế hoàn toàn thuộc về Người dùng.

---

## 2. Đặc tả Tinh giản Từng Ticket Thuộc UI Wave 2

---

### 2.1. Ticket NK-UI-03 — Adaptive Story UX (Affordance Đúng Khả Năng)

#### A. Rà soát hiện trạng mã nguồn thực tế (Current vs Expected)
Qua kiểm tra tệp [`mobile/src/screens/QaScreen.tsx`](file:///d:/ngo_ke/mobile/src/screens/QaScreen.tsx):
- **Phần mã nguồn ĐÃ CÓ SẴN (Không cần viết lại):**
  - Dòng 1023: `{entry === null && displayedQa.length > 0 && (` $\rightarrow$ Khung câu hỏi gợi ý chạm nhanh (`chipsSection`) **đã có sẵn điều kiện bảo vệ `displayedQa.length > 0`**. Với 17 điểm dừng mới không có Q&A (`qa=[]`), khung này đã tự động ẩn, không bị render rỗng.
  - Dòng 1055–1070: `VoiceInteractionDock` được render hoàn toàn độc lập, không bị ẩn hay vô hiệu hóa khi `qa=[]`.
  - Dòng 473–520: Các voice intents như `listen`, `replay`, `stop`, `next`, `plan`, `open-qr`, `open-gps` đã được hỗ trợ xử lý đầy đủ qua `useVoiceSession` và `intent.ts`.
- **Phần THỰC SỰ CÒN THIẾU (Phạm vi tinh hẹp của NK-UI-03):**
  1. **Nhãn thanh Dock Microphone:** Hiện tại luôn hiển thị nhãn mặc định `t('qa.voice_placeholder')` (*"Hỏi câu hỏi về điểm dừng này..."*). Với điểm không có Q&A, nhãn này gây hiểu lầm là app sẽ trả lời kiến thức. Cần chuyển nhãn thành:
     - VI: *"Điều khiển bằng giọng nói"* (subtext: *"Nói: 'nghe lại', 'tiếp theo', 'mở sổ tay'..."*)
     - EN: *"Voice controls"* (subtext: *"Say: 'replay', 'next', 'open notebook'..."*)
  2. **Placeholder của Ô nhập chữ (`ExpandableInputDrawer`):** Khi người dùng bấm nút bàn phím trên dock, placeholder cần thích ứng nếu `nodeQa.length === 0`:
     - VI: *"Gõ lệnh điều khiển (nghe, dừng, kế tiếp)..."*
     - EN: *"Type a command (listen, stop, next)..."*
  3. **Thông báo Thẻ Unknown nhã nhặn:** Khi người dùng hỏi câu hỏi nội dung tại trạm không có Q&A, thông báo cần hướng dẫn người dùng tập trung nghe câu chuyện hoặc dùng giọng nói để ra lệnh, thay vì chỉ báo lỗi "chưa có dữ liệu" khô khan.

#### B. Danh mục tệp đề xuất (Allowlist Files)
- **Tệp sửa đổi:**
  - `mobile/src/screens/QaScreen.tsx`
  - `mobile/src/components/VoiceInteractionDock.tsx`
  - `mobile/src/components/ExpandableInputDrawer.tsx`
  - `mobile/src/i18n/translator.ts`
- **Tệp kiểm thử mới:**
  - `mobile/tests/qaStoryMode.test.mjs` (Kiểm tra nhãn dock, placeholder drawer, và thông báo câu hỏi lạ trên trạm không có Q&A).
- **Tệp kiểm thử hồi quy:**
  - `mobile/tests/qaNodeStoryVoice.test.mjs`
  - `mobile/tests/uiFlows.test.mjs`

#### C. Rào chắn hồi quy bắt buộc duy trì (Regression Guards)
- Tuyệt đối không ẩn nút Micro hoặc ô nhập chữ khi `qa=[]`.
- Giữ nguyên toàn bộ 21/9/16 câu Q&A và follow-ups của các bộ sưu tập cũ (`demo.json`, `old-quarter.*.json`, `three-lenses.*.json`).
- Không sinh câu trả lời AI tự do (No LLM/hallucination).

---

### 2.2. Ticket NK-UI-04A — Audio Presentation (Compact Audio Player)

#### A. Rà soát hiện trạng mã nguồn thực tế
- Tại [`mobile/src/screens/HomeScreen.tsx:411–431`](file:///d:/ngo_ke/mobile/src/screens/HomeScreen.tsx#L411-L431): Nút nghe giới thiệu ngõ (`introPlayBtn`) đang dùng style inline trực tiếp với màu `#F2C56B`, `#24392E` và icon vector cơ bản.
- Tại `mobile/src/components/AlleyStoryCard.tsx`: Thẻ đọc văn bản chuyện ngõ chưa có nút nghe âm thanh đồng bộ trên thanh header.
- Tại `mobile/src/components/VoicePlayerBar.tsx`: Hoạt động ổn định trên `QaScreen.tsx` với đầy đủ vòng đời audio Phase 1B.

#### B. Phạm vi kỹ thuật chính xác của NK-UI-04A
1. **Xây dựng component mới:** `mobile/src/components/CompactAudioPlayer.tsx`
   - Component thuần trình diễn (Stateless Component), chỉ nhận props:
     ```ts
     interface CompactAudioPlayerProps {
       label: string;
       isPlaying: boolean;
       onTogglePlay: () => void;
       currentTime?: number;
       duration?: number;
       measuredDuration?: number;
       disabled?: boolean;
     }
     ```
   - Định dạng thời lượng trực quan `mm:ss` chuẩn xác, chặn số âm (`Math.max(0, ...)`). Nếu không có số liệu thời lượng, chỉ hiện nhãn *"Nghe giới thiệu ngõ"*, tuyệt đối không hiển thị `NaN:NaN` hay thời lượng giả định.
   - Sử dụng vector `AppIcon` (`play` / `pause`) và màu ngữ nghĩa `colors.amberAction` (`#F2C56B`).
2. **Tích hợp vào các màn hình:**
   - Thay thế nút `introPlayBtn` trong `HomeScreen.tsx` bằng `CompactAudioPlayer`.
   - Bổ sung nút nghe gọn trên thanh tiêu đề của `AlleyStoryCard.tsx`.
3. **Phạm vi BỊ CẤM trong 04A (Hoãn ở 04B):**
   - CẤM: Thêm tính năng tua âm thanh (seek $\pm 5\text{s}$), kéo thanh trượt (interactive scrub).
   - CẤM: Tạo mini-player toàn app chạy ngầm khi rời màn hình.
   - CẤM: Can thiệp vào hook `useVoiceSession.ts` hoặc logic ngắt âm thanh khi blur màn hình (`NK-003`).

#### C. Danh mục tệp đề xuất
- **Tệp mới:**
  - `mobile/src/components/CompactAudioPlayer.tsx`
  - `mobile/tests/voicePlayerBar.test.mjs`
- **Tệp sửa đổi:**
  - `mobile/src/components/AlleyStoryCard.tsx`
  - `mobile/src/screens/HomeScreen.tsx` (gộp thay thế hex token `FIX-04` vào đây)
  - `mobile/src/components/VoicePlayerBar.tsx` (chỉ đồng bộ kích thước icon và nhãn a11y)

---

### 2.3. Ticket NK-UI-05A — Image Rights Ledger (ĐÃ HOÀN TẤT)

- **Trạng thái:** **`COMPLETED`** (Đã tạo thành công tại [`docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md`](file:///d:/ngo_ke/docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md)).
- Toàn bộ 24 file ảnh và 29 node đã được phân loại chi tiết, sẵn sàng làm cơ sở pháp lý và kỹ thuật cho bước tiếp theo.

---

### 2.4. Ticket NK-UI-05B — Heritage Sketch Placeholder (Component & Mapping)

#### A. Trạng thái hiện tại: `BLOCKED`
- **Lý do chặn:**
  1. Cần Người dùng đưa ra quyết định chính sách đối với 4 file ảnh Google Maps (giữ hiển thị trong demo hay gỡ bỏ để dùng placeholder).
  2. Cần hoàn tất thẩm định hợp đồng giao diện `nodeVisual.ts`.
- **Nội dung khi được mở khóa (Future Scope):**
  - Tạo `mobile/src/assets/nodeVisual.ts` với hàm `resolveNodeVisual()` trả về kiểu Discriminated Union:
    `kind: 'photo'` | `kind: 'placeholder'`.
  - Tạo component `mobile/src/components/HeritageSketchPlaceholder.tsx` mang họa tiết mái ngói ngõ phố trang nhã, viền dấu mộc di sản, và dòng chữ trung thực: *"📍 Đang cập nhật tư liệu ảnh thực địa"*.
  - Áp dụng hiển thị cho 9 trạm chưa có ảnh riêng tại 5 ngõ mới.

---

## 3. Thứ tự Triển khai Đề xuất cho Worker (Codex Luna)

Để tránh xung đột tệp và đảm bảo test luôn pass qua từng commit:

```
[UI Wave 2 Implementation Pipeline]

  ĐỢT 1: QaScreen Story Affordance (Ưu tiên số 1)
  └── NK-UI-03: Sửa microcopy & drawer placeholder
      Files: QaScreen.tsx, VoiceInteractionDock.tsx, ExpandableInputDrawer.tsx, translator.ts
      Test:  qaStoryMode.test.mjs
      (Hoàn tất và kiểm thử 426+ tests trước khi chuyển sang Đợt 2)

  ĐỢT 2: Audio Presentation Suite (Ưu tiên số 2)
  └── NK-UI-04A: Tạo CompactAudioPlayer & tích hợp Home / Story Card
      Files: CompactAudioPlayer.tsx (mới), AlleyStoryCard.tsx, HomeScreen.tsx
      Test:  voicePlayerBar.test.mjs
      (Gộp dọn dẹp các token hex HomeScreen FIX-04 vào cùng lượt sửa HomeScreen)

  ĐỢT 3: Thẻ Ký Họa Di Sản (Chờ Người dùng quyết định bản quyền)
  └── NK-UI-05B: Tạo HeritageSketchPlaceholder & NodeVisual Resolver
      (Tạm thời GIỮ NGUYÊN trạng thái BLOCKED)
```

---

## 4. Bảng Phân công & Ranh giới Tệp (Single-Writer Matrix)

| Đường dẫn tệp | NK-UI-03 (Đợt 1) | NK-UI-04A (Đợt 2) | NK-UI-05B (Đợt 3 - Sau này) |
| :--- | :---: | :---: | :---: |
| `mobile/src/screens/QaScreen.tsx` | ✍️ **Chính** | ❌ (Không chạm) | 👁️ (Chỉ thay photo prop) |
| `mobile/src/screens/HomeScreen.tsx` | ❌ (Không chạm) | ✍️ **Chính** | 👁️ (Chỉ thay photo prop) |
| `mobile/src/components/VoiceInteractionDock.tsx` | ✍️ **Chính** | ❌ | ❌ |
| `mobile/src/components/ExpandableInputDrawer.tsx` | ✍️ **Chính** | ❌ | ❌ |
| `mobile/src/components/CompactAudioPlayer.tsx` | ❌ | ✍️ **Tạo mới** | ❌ |
| `mobile/src/components/AlleyStoryCard.tsx` | ❌ | ✍️ **Chính** | ❌ |
| `mobile/src/i18n/translator.ts` | ✍️ (Thêm copy) | ❌ | ✍️ (Thêm placeholder copy) |
| `mobile/src/assets/photoMap.ts` | ❌ | ❌ | ✍️ **Chính** |

---

## 5. Kết luận Phê duyệt Wave 2 (Handoff Verdict)

### Verdict Wave 2: `READY_FOR_HUMAN_APPROVAL`

**Căn cứ kết luận:**
1. Hạng mục `NK-UI-05A` đã hoàn thành 100% trong phiên này dưới dạng tài liệu Sổ cái Bản quyền Hình ảnh độc lập.
2. Hạng mục `NK-UI-03` đã được tinh giảm phạm vi tối đa, loại bỏ các đề xuất mã thừa, tập trung vào hoàn thiện nhãn microcopy của thanh dock và ô nhập lệnh.
3. Hạng mục `NK-UI-04A` được tách biệt hoàn toàn khỏi logic lifecycle phức tạp, có ranh giới file rõ ràng với NK-UI-03.
4. Rào chắn đơn tác giả (Single-writer rule) được thiết lập chặt chẽ, bảo đảm không gây xung đột trên working copy 426 tests hiện hành.

**Dừng lại tại Human Wave 2 Approval Gate để chờ Người dùng phê duyệt mở lệnh cho Codex Luna.**
