# Ngõ Kể — UI Wave 2 Readiness Assessment

**Ngày lập:** 2026-10-24  
**Tác nhân:** Antigravity (Mobile UX QA Lead)  
**Workspace:** `D:\ngo_ke`  
**Nguồn gốc:** Yêu cầu từ `NGO_KE_NATIVE_QA_EVIDENCE_REPORT.md` + `NGO_KE_UI_APPROVED_TICKETS.md` + `NGO_KE_UI_SPEC_V1_1.md`  

> [!IMPORTANT] Tài liệu này chỉ đánh giá readiness kỹ thuật và chuẩn bị approval gate. Không ticket nào bên dưới được triển khai cho đến khi người dùng cấp quyền rõ ràng.

---

## 1. Trạng thái Cuối Wave 1

| Hạng mục | Trạng thái |
|:---|:---|
| Host regression (426 tests) | ✅ PASS |
| TypeScript typecheck | ✅ PASS |
| ESLint (no-cache) | ✅ PASS |
| FIX-01 (nhãn trái tràn 320dp) | ✅ SOURCE_VERIFIED fixed |
| FIX-02 (translation key "Đổi lựa chọn") | ✅ SOURCE_VERIFIED fixed |
| FIX-03 (safe area modal iOS) | ⏳ NEEDS_NATIVE_CONFIRMATION |
| FIX-04 (token hex HomeScreen) | ➡️ DEFERRED_TO_WAVE2 |
| Native visual verification | ❌ NATIVE_QA_INCOMPLETE (không có thiết bị) |

**Wave 1 Source Level:** Hoàn thành. **Wave 1 Native Acceptance:** Chưa đạt vì chưa có bằng chứng thiết bị.

---

## 2. Đánh giá Readiness từng Ticket Wave 2

### 2.1. NK-UI-03 — Adaptive Story UX (Affordance đúng khả năng)

**Mô tả:** Sửa label/microcopy cho node không có fixed Q&A, giữ toàn bộ voice commands. Không ẩn mic hay ô nhập khi `qa=[]`.

**Đánh giá technical readiness:**

| Tiêu chí | Trạng thái | Chi tiết |
|:---|:---:|:---|
| Spec đã được hiệu chỉnh (v1.1) | ✅ | State A/B wireframe rõ ràng, voice commands giữ nguyên |
| `QaScreen.tsx:1023` đã có guard `displayedQa.length > 0` | ✅ SOURCE_VERIFIED | Chip section chỉ hiện khi có Q&A — behavior đúng một phần |
| `VoiceInteractionDock` unconditional render | ✅ SOURCE_VERIFIED | Mic luôn hiển thị — đúng spec |
| Microcopy "Điều khiển bằng giọng nói" chưa có | ⏳ | Cần thêm translation key và cập nhật dock label |
| Cần sửa `ExpandableInputDrawer` placeholder khi qa=[] | ⏳ | Placeholder text "Gõ lệnh điều khiển..." chưa implement |
| File overlap với Wave 1 | ✅ Wave 1 đã hoàn thành | `translator.ts` và `QaScreen.tsx` đã qua Wave 1 |
| Test overlap | ⚠️ | `qaNodeStoryVoice.test.mjs`, `uiFlows.test.mjs` được sửa trong Wave 1 — cần single-writer |
| Native dependency | ⏳ | Mic controls, keyboard, VoiceOver cần native trước acceptance |

**Các file trong scope NK-UI-03:**
- `mobile/src/screens/QaScreen.tsx`
- `mobile/src/components/VoiceInteractionDock.tsx`
- `mobile/src/components/ExpandableInputDrawer.tsx`
- `mobile/src/i18n/translator.ts`
- New test: `mobile/tests/qaStoryMode.test.mjs`
- Sửa (existing): `mobile/tests/qaNodeStoryVoice.test.mjs`, `mobile/tests/uiFlows.test.mjs`, `mobile/tests/voiceIntent.test.mjs`

**Conflict/Dependencies:**
- `translator.ts` cũng là target của FIX-02 (đã xong). Không còn conflict tức thời.
- `QaScreen.tsx` cũng là target của NK-UI-04A (xem bên dưới) — **phải hoàn thành NK-UI-03 trước NK-UI-04A** để tránh overwrite.
- NK-019 (chapter Q&A semantics) vẫn blocked, không ảnh hưởng scope corrected của NK-UI-03.

**Verdict NK-UI-03:**

```
STATUS: TECHNICALLY_READY_FOR_APPROVAL
BLOCKER: Không có blocker code. Spec đã đủ. Cần user approval.
NATIVE_REQUIRED_FOR_ACCEPTANCE: Mic controls, keyboard behavior, VoiceOver, physical speech test
```

---

### 2.2. NK-UI-04A — Audio Presentation (Compact Player)

**Mô tả:** Đồng nhất icon Play/Pause, hiển thị `mm:ss`, progress bar read-only. Tạo component `CompactAudioPlayer.tsx` stateless. **04B (seek, miniplayer) vẫn BLOCKED**.

**Đánh giá technical readiness:**

| Tiêu chí | Trạng thái | Chi tiết |
|:---|:---:|:---|
| Spec 04A hoàn chỉnh (v1.1, mục 5.2) | ✅ | Props interface, layout, amber color tokens, mm:ss logic |
| Amber token `colors.amberAction` đã có | ✅ SOURCE_VERIFIED | `theme.ts:32` từ Wave 1 |
| `AppIcon` API hiện tại hỗ trợ `'play'`, `'pause'` | ✅ | Confirmed từ HomeScreen.tsx usage |
| `VoicePlayerBar.tsx` sẽ giữ nguyên (không extend) | ✅ | 04A chỉ tạo `CompactAudioPlayer.tsx` mới |
| File conflict với NK-UI-03 | ⚠️ | `QaScreen.tsx` xuất hiện trong allowlist của cả 03 và 04A |
| File conflict với FIX-04 | ⚠️ | `HomeScreen.tsx` cũng là target của FIX-04 (deferred) |
| `HomeScreen.tsx` là shared file | ⚠️ | Phải là single-writer; NK-UI-02 đã xong, Wave 2 mở mới |
| `AlleyStoryCard.tsx` không có conflict Wave 1 | ✅ | File chưa bị Wave 1 touch |
| Audio lifecycle guards (NK-003) vẫn giữ | ✅ SOURCE_VERIFIED | `useVoiceSession` hooks không bị sửa |

**Các file trong scope NK-UI-04A:**
- New: `mobile/src/components/CompactAudioPlayer.tsx`
- New test: `mobile/tests/voicePlayerBar.test.mjs`
- Sửa (existing): `mobile/src/components/VoicePlayerBar.tsx` (only presentational icon/label)
- Sửa (existing): `mobile/src/components/AlleyStoryCard.tsx`
- Sửa (existing): `mobile/src/screens/HomeScreen.tsx` (wire CompactAudioPlayer)
- Sửa (existing) nếu cần: `mobile/src/screens/QaScreen.tsx` (mặc định không sửa)

**Conflict/Dependencies:**
- **NK-UI-03 phải hoàn thành trước NK-UI-04A** nếu cả hai đều cần sửa `QaScreen.tsx`.
- `HomeScreen.tsx` sẽ bị cả NK-UI-04A và FIX-04 chạm — nên gộp FIX-04 vào NK-UI-04A.

**Verdict NK-UI-04A:**

```
STATUS: TECHNICALLY_READY_FOR_APPROVAL
BLOCKER: Không có blocker code. Phụ thuộc NK-UI-03 hoàn thành trước (nếu cần sửa QaScreen).
NATIVE_REQUIRED_FOR_ACCEPTANCE: Play/pause/resume nghe được, interruptions/routes, modal lifecycle
RECOMMENDED_ORDER: NK-UI-03 → NK-UI-04A
```

---

### 2.3. NK-UI-05A — Image Rights Ledger (Document only)

**Mô tả:** Tạo tài liệu ledger `NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md` liệt kê quyền ảnh 17 nodes, không sửa source code.

**Đánh giá technical readiness:**

| Tiêu chí | Trạng thái | Chi tiết |
|:---|:---:|:---|
| Spec rõ ràng | ✅ | 05A chỉ là docs; 05B là implementation blocked |
| Dữ liệu đầu vào | ✅ SOURCE_VERIFIED | `photoMap.ts` đã xác minh: 5/17 nodes có mapping riêng; 5 nodes dùng ảnh chung (`ngocamchi_03.jpg`, `cafengotongduytan_04.jpg`) |
| 9 nodes thiếu mapping đặc thù | ✅ | Confirmed: `tam-thuong-dinh-yen-thai`, `tam-thuong-den-vong-tien`, `phat-loc-*`, `cam-chi-*`, và 2 Trung Yên đã thay tên khỏi active |
| 4 Google Maps credits cần review | ✅ | Đã ghi nhận trong `photoMap.ts` |
| Không sửa source code | ✅ | 05A là read-only + write docs |
| Conflict với Phase 2B (Sol) | ✅ Không | 05A viết vào `docs/content/`, Sol viết content khác |

**Verdict NK-UI-05A:**

```
STATUS: TECHNICALLY_READY_FOR_APPROVAL (lowest risk)
BLOCKER: Không có blocker kỹ thuật. Chỉ cần user approval.
NATIVE_REQUIRED: Không (chỉ là tài liệu)
RECOMMENDED: Có thể mở song song với NK-UI-03 hoặc NK-UI-04A
```

---

### 2.4. NK-UI-05B — Heritage Sketch Placeholder (Implementation)

**Mô tả:** Tạo `nodeVisual.ts` và `HeritageSketchPlaceholder.tsx`, áp vào 9 nodes thiếu ảnh riêng.

**Đánh giá technical readiness:**

| Tiêu chí | Trạng thái | Chi tiết |
|:---|:---:|:---|
| Quyền ảnh 4 Google Maps assets chưa xác nhận | ❌ | Người dùng chưa cấp quyền pháp lý |
| Spec resolver đầy đủ (v1.1 mục 6) | ✅ | `resolveNodeVisual` discriminated union rõ |
| `CrossfadePhoto.tsx` API không thay đổi | ✅ | Consumer branch ở level trên component |
| File overlap với NK-UI-03/04A | ⚠️ | `HomeScreen.tsx`, `QaScreen.tsx`, `translator.ts` |
| 5B cần 5A hoàn thành trước | ⚠️ | Cần ledger để biết chính xác node nào cần placeholder |

**Verdict NK-UI-05B:**

```
STATUS: BLOCKED
BLOCKER: (1) Cần 05A ledger hoàn thành trước; (2) User quyết định về 4 Google Maps assets trước khi sửa photoMap
NATIVE_REQUIRED_FOR_ACCEPTANCE: Aspect ratio/crop, memory khi cuộn, placeholder readability
```

---

## 3. Thứ tự Triển khai Đề xuất cho Codex Luna

```
[Wave 2 — Đề xuất sau khi User duyệt]

Parallel (không conflict file):
├── NK-UI-05A  ─── Ledger docs (read-only source, low risk)
│                  Có thể mở ngay khi user duyệt

Sequential (theo thứ tự):
├── Bước 1: NK-UI-03  ─── QaScreen affordance
│   Files: QaScreen.tsx, VoiceInteractionDock.tsx, ExpandableInputDrawer.tsx, translator.ts
│   Tạo mới: qaStoryMode.test.mjs
│
├── Bước 2: NK-UI-04A ─── CompactAudioPlayer + icon alignment
│   Files: CompactAudioPlayer.tsx (new), VoicePlayerBar.tsx, AlleyStoryCard.tsx, HomeScreen.tsx
│   Tạo mới: voicePlayerBar.test.mjs
│   [Gộp FIX-04 hex tokens vào đây]
│
└── Bước 3: NK-UI-05B ─── Heritage Sketch Placeholder
    Files: nodeVisual.ts (new), HeritageSketchPlaceholder.tsx (new), photoMap.ts, consumers
    Điều kiện: 05A hoàn thành + user quyết định Google Maps assets
```

---

## 4. Single-Writer Rule cho Shared Files

| Shared File | Wave 1 Owner (done) | NK-UI-03 | NK-UI-04A | NK-UI-05B |
|:---|:---|:---:|:---:|:---:|
| `mobile/src/screens/QaScreen.tsx` | Phase 1B | ✍️ (primary) | Conditional | Conditional |
| `mobile/src/screens/HomeScreen.tsx` | NK-UI-02 | — | ✍️ (primary) | Conditional |
| `mobile/src/i18n/translator.ts` | NK-UI-06A/FIX-02 | ✍️ | — | ✍️ |
| `mobile/src/assets/photoMap.ts` | — | — | — | ✍️ |

**Quy tắc:** NK-UI-03 phải merge/commit trước khi NK-UI-04A chạm QaScreen. Trong môi trường working copy hiện tại (tất cả uncommitted), Luna cần áp patch tuần tự vào cùng working tree và chạy full test sau mỗi ticket.

---

## 5. Acceptance Criteria Phải Duy trì từ Wave 1

Bất kể ticket Wave 2 nào, các regression cases sau **bắt buộc phải giữ nguyên**:

1. **426 tests PASS** (có thể tăng, không bao giờ giảm về FAIL)
2. 8 collections × VI/EN dataset isolation
3. `fiction-letter` 6 PIN_CONFIG positions
4. `ngo-gach` và `ngo-trung-yen` polyline geometry (5 nodes each)
5. Voice scope guards: `mode:collectionId:locale:revision:status:foreground`
6. Audio lifecycle NK-003: blur/background stops audio, không auto-resume
7. GPS/QR explicit confirmation only
8. No synthetic `fallback-*` IDs trong trail layout

---

## 6. Verdict Wave 2 Readiness

### Verdict: `READY_FOR_WAVE2_APPROVAL`

**Điều kiện áp dụng:**
- Verdict này chỉ áp dụng cho **NK-UI-03**, **NK-UI-04A**, và **NK-UI-05A** (docs only).
- **NK-UI-05B** vẫn `BLOCKED` chờ user quyết định Google Maps assets và NK-UI-05A hoàn thành.
- Wave 1 native acceptance vẫn `NATIVE_QA_INCOMPLETE` — chưa có bằng chứng thiết bị thật.

**Giải thích về sự mâu thuẫn tương đối:**  
Native QA incomplete không tự động block Wave 2, vì:
- Không phát hiện defect P0/P1 nào từ mã nguồn trong Wave 1.
- Wave 2 tickets (NK-UI-03, 04A) không làm sai lệch bất kỳ behavior nào đã được wave 1 kiểm chứng.
- Nếu native QA sau này phát hiện vấn đề tại Wave 1 components, Wave 2 sẽ được tạm dừng và remediation được ưu tiên.

---

## 7. Mục Bắt buộc: Việc cần anh quyết / Việc anh tự làm

### A. Việc cần anh quyết

1. **Cho phép mở NK-UI-03 (Adaptive Story UX)?**
   - *Câu hỏi:* Anh có muốn mở ticket NK-UI-03 cho Codex Luna triển khai microcopy "Điều khiển bằng giọng nói" và ẩn chip suggestions khi qa=[] chưa?
   - *Đề xuất:* Duyệt — không có blocker code, risk thấp, test coverage đầy đủ.
   - *Hệ quả nếu chưa chốt:* Giao diện QA screen trên 5 ngõ mới tiếp tục hiển thị dock mic nhưng không có hướng dẫn ngữ cảnh phù hợp.

2. **Cho phép mở NK-UI-04A (Compact Audio Player)?**
   - *Câu hỏi:* Anh có muốn mở NK-UI-04A sau khi NK-UI-03 hoàn thành?
   - *Đề xuất:* Duyệt với điều kiện NK-UI-03 xong trước (tránh conflict QaScreen.tsx).

3. **Cho phép mở NK-UI-05A (Image Rights Ledger — docs only)?**
   - *Câu hỏi:* Anh có muốn Luna lập tài liệu ledger quyền ảnh 17 nodes song song với NK-UI-03?
   - *Đề xuất:* Duyệt — không có rủi ro kỹ thuật, không chạm source.

4. **Quyết định về 4 ảnh Google Maps contributor:**
   - *Câu hỏi:* Với `cafengotongduytan_04.jpg` và các ảnh có credit "Google Maps contributor", anh muốn: (a) Giữ nguyên trong demo nội bộ kèm credit rõ ràng, hay (b) Thay bằng `HeritageSketchPlaceholder` cho tất cả consumers?
   - *Hệ quả:* Quyết định này mở khóa NK-UI-05B. Nếu chưa chốt, 05B tiếp tục BLOCKED.

5. **Native QA — Thời điểm thực hiện:**
   - *Câu hỏi:* Anh có muốn thực hiện native QA checklist (xem Section 5.2 của Evidence Report) trước khi mở Wave 2, hay chạy song song?
   - *Đề xuất:* Chạy song song. Native QA không block Wave 2 nếu không có P0/P1 mới phát sinh.

---

### B. Việc anh tự làm

1. **Kiểm thử native Wave 1 trên thiết bị thật `[ngoài plan nhưng trong native matrix]`:**
   - Cài Expo Go hoặc build APK từ working copy hiện tại.
   - Thực hiện các test case trong Section 5.2 của Native QA Evidence Report.
   - Đặc biệt: Kiểm FIX-03 trên iPhone (Home Indicator padding).
   - Ghi lại: device model, OS version, build date, screenshot mỗi case.

2. **Rà soát bản quyền 4 ảnh Google Maps `[ngoài plan]`:**
   - Xác nhận chủ tư liệu ảnh hoặc thay thế bằng ảnh thực địa tự chụp.
   - AI không có thẩm quyền pháp lý cấp phép thay người dùng.
