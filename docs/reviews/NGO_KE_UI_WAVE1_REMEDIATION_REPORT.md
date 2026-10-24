# Ngõ Kể — UI Wave 1 Final Remediation

Ngày: **24/10/2026** (Asia/Saigon). Phạm vi được người dùng mở: **NK-UI-W1-FIX-01 và NK-UI-W1-FIX-02**. Model: Codex runtime hiện hành, không đổi model/ownership lâu dài.

**Verdict: `READY_FOR_NATIVE_QA`.** Hai scoped fixes và host regression đạt; **chưa có native PASS**. Không bắt đầu UI Wave 2, FIX-03/FIX-04 hoặc NK-UI-03/04/05.

## 1. Baseline thực tế

- Branch đầu/cuối: `valentino/logic-fix-mobile-20261020`.
- HEAD đầu/cuối: `4af64c49a4ada47f952ddf76c35adfb90f826224`; không đổi so với baseline được báo cáo.
- Worktree đầu phiên có **20 tracked modified files**, không staged changes; kèm untracked skills, audit/content/design/plans/reports, mobile cache và ba tests Wave 1. Các patch Phase 1A/1B/Wave 1 được giữ nguyên, không reset/stash/checkout/commit/push/merge, không xóa untracked.
- Baseline full mobile chạy lại trước sửa: **418 PASS / 0 FAIL / 0 SKIP**, không chỉ dùng số từ báo cáo cũ.
- Đã đọc AGENTS.md, MEMORY.md (chỉ đọc), Wave 1 report, Visual QA, Fix Backlog, Approved Tickets; đối chiếu source/tests/registry thực tế. Skill `mobile-ux-qa` được dùng cho ranh giới bằng chứng host/native và regression; không mở thêm UX feature.

### Hiệu chỉnh nhận định QA — không sửa design document

1. `collections.ts` và cả VI/EN localized datasets xác nhận **Ngõ Gạch 5 node, Trung Yên 5 node**, không phải 6/4 trong Visual QA. IDs, start, order và qa=[] giữ nguyên; không sửa JSON để khớp báo cáo.
2. Home hiện dùng `canvasWidth = Math.min(screenWidth, 540)`. Với màn 320/360/375/430, canvas bằng viewport; viewport 720 chỉ có canvas 540. Phép kiểm phải dùng canvas, không dùng 720 để tính nhãn.
3. Với schematic left pin xPct=0.44, lề trái 10 và khoảng cách pin–nhãn 25, độ rộng tối đa an toàn ở canvas 360 là **123.4**, không phải luôn 130 từ width≥360 như backlog mô tả. Mức 130 bắt đầu ở canvas 375 cho vị trí này.
4. `Math.max(80, px - 35)` có thể ép nhãn rộng hơn chỗ trống; `Math.min(130, px - 35)` đơn thuần có thể âm trên canvas rất nhỏ. Không dùng hai công thức này nguyên trạng.

## 2. FIX-01 — Root cause, giải pháp và giới hạn

**Confirmed by source + regression:** label trái có `width: 130`, `right: canvasWidth - px + 25`, nên mép trái bằng `px - 25 - 130`. Với schematic canvas 320, kết quả **−14.2**. Regression mounted trên node Trung Yên hiện hành cũng tái hiện mép trái **−10.18358352053076** ở canvas 320 trước sửa.

Chỉ thay hình hộp nhãn trái trong `HomeScreen.tsx`, không thay pin hoặc geometry:

```text
inset = min(10, canvasWidth / 2)
labelRight = max(inset, min(canvasWidth - inset, px - 25))
labelWidth = max(0, min(130, labelRight - inset))
right style = canvasWidth - labelRight
horizontal padding = min(8, labelWidth / 2)
```

Ở canvas thông thường, giữ nguyên anchor `px - 25`, top `py - 18`, padding 8 và width tối đa 130; chỉ co width khi cần giữ lề 10. Không thêm `numberOfLines`, ellipsis, font cap hay tắt scaling; tên dài vẫn có thể wrap và height tăng theo nội dung.

Canvas dưới 20 không thể giữ hai lề 10: inset giảm về nửa canvas, width có thể về 0 nhưng không âm. Khi width≤16 (không còn bề rộng text sau padding chuẩn), chỉ hộp nhãn dùng overflow hidden để glyph không vẽ xuyên biên; padding cũng co theo width. Đây không phải giải pháp clipping cho màn 320–430: nhãn bình thường vẫn overflow visible/wrap. Pin, hành vi chọn và full accessibility name vẫn giữ. Các ca width cực nhỏ là kiểm tính hữu hạn/biên hộp, **không phải tuyên bố đọc được chữ hoặc touch target phù hợp trên màn 1–16 điểm**.

Ví dụ schematic xPct=0.44:

| Viewport | Canvas thực | Width nhãn sau sửa | Mép trái |
| --- | --- | --- | --- |
| 320 | 320 | 105.8 | 10 |
| 360 | 360 | 123.4 | 10 |
| 375 | 375 | 130 | 10 |
| 430 | 430 | 130 | 34.2 |
| 720 | 540 | 130 | 82.6 |

Các test mounted dùng cả **8 collections × VI/EN** ở năm viewport trên, với tên dài trong fixture in-memory; không thay runtime content. Kiểm hộp trái trong canvas, padding, wrapping props, full accessibility name và tap trả actual node ID. Đồng thời đối chiếu pin X/Y, count/order và path với nhánh geometry hiện hữu; fiction giữ sáu tọa độ cũ. Thêm các canvas 1/8/16/20/40/64/96 cho fiction, polyline Gạch và schematic Tạm Thương.

Không đổi `computeAlleyLayout`, `computeSchematicTrailLayout`, PIN_CONFIG, node coordinates/IDs, selection guard, fontScale/list threshold, nhánh phải hoặc audio lifecycle. Không mở rộng ticket sang tối ưu mọi layout ở canvas cực nhỏ; native readability/collision vẫn phải kiểm.

## 3. FIX-02 — Root cause và giải pháp

**Confirmed by source + regression:** CTA đang render đúng hai ngôn ngữ nhưng dùng ternary inline, chưa có central key. Trước sửa, gọi key mới trả lại chính tên key thay vì nhãn VI/EN.

- Thêm `plan.empty.change_selection` vào `TranslationKey` và hai dictionary: VI **Đổi lựa chọn**, EN **Change selection**.
- Chỉ thay label expression ở PlanScreen bằng `t('plan.empty.change_selection')`.
- Không thay `onDraftChange`, `showResult`, topic/budget state, picker hoặc CTA behavior.
- Hai test VI/EN kiểm exact label từ dictionary **và** spy chứng minh screen thật sự gọi key; render không đổi draft/chọn node. Chỉ sau tap mới reset topic, giữ budget 30, không chọn/navigate tới recommendation; kết quả rỗng đóng như behavior cũ.

## 4. Exact files changed trong phiên này

| File | Phạm vi mới của remediation |
| --- | --- |
| `mobile/src/screens/HomeScreen.tsx` | Ba biến cục bộ cho bounds nhãn trái và inline width/right/padding/overflow của chính nhãn trái |
| `mobile/src/i18n/translator.ts` | Một union key và hai dictionary entries, giữ nguyên câu chữ hiển thị |
| `mobile/src/screens/PlanScreen.tsx` | Một label expression gọi central key |
| `mobile/tests/alleyIntegration.test.mjs` | Append helper/cases FIX-01, 6 tests mới; giữ mọi assertion cũ |
| `mobile/tests/planScreenExperience.test.mjs` | Spy translation trong harness, 2 tests mới VI/EN; giữ tests cũ |
| `docs/reviews/NGO_KE_UI_WAVE1_REMEDIATION_REPORT.md` | Báo cáo mới này |

Hai test files đều thuộc allowlist của tickets UI-02/UI-06A hiện có; `planScreenExperience.test.mjs` đã tồn tại untracked trước phiên, không tạo lại/ghi đè toàn bộ nội dung. Không sửa `MEMORY.md`, `AGENTS.md`, design docs hoặc tài liệu Phase 2B.

## 5. Tests executed — số thực tế

Các lệnh Node/npm chạy tại `D:\ngo_ke\mobile`; diff-check tại repo root. Không chạy Expo/Metro/emulator, generator hoặc gateway.

| Kiểm tra | Command | Kết quả |
| --- | --- | --- |
| Baseline trước sửa | `npm test` | **418 PASS, 0 FAIL, 0 SKIP** |
| Focused mới sau sửa | `node --test --test-name-pattern='FIX-0[12]' tests/alleyIntegration.test.mjs tests/planScreenExperience.test.mjs` | **8 PASS, 0 FAIL, 0 SKIP** |
| Focused + legacy/audio/recommendation | `node --test tests/alleyIntegration.test.mjs tests/planScreenExperience.test.mjs tests/recommendation.test.mjs tests/homePhaseB.test.mjs tests/homeIntroPlay.test.mjs` | **67 PASS, 0 FAIL, 0 SKIP** |
| Full mobile cuối | `npm test` | **426 PASS, 0 FAIL, 0 SKIP** |
| TypeScript | `npm run typecheck` | PASS, `tsc --noEmit`, exit 0 |
| ESLint | `npm run lint -- --no-cache` | PASS, exit 0, không errors/warnings |
| Whitespace | `git diff --check` | PASS |
| Scoped-hunk preservation | Inline Node, đảo đúng hunk remediation **trong bộ nhớ**, SHA256 so snapshot trước sửa | **5/5 file khớp SHA gốc**, không ghi hoặc rollback file |
| Outside allowlist / data-media / docs | Inline Node SHA256 sorted paths + NUL + raw bytes + NUL | Khớp baseline; xem mục 6 |

Tổng mobile tăng **418→426** do 8 regression mới, không sửa target count hoặc bỏ assertion để giữ 418. Log “Voice transcription request failed Error offline” đến từ negative test hiện có; suite vẫn 0 fail, không có paid request.

RED được chạy trước production patch: xác nhận overflow và missing dictionary key. Khi xây tests mới, đã sửa finder canvas cho đúng host harness (mock SVG không phải native SVG) và dùng epsilon 1e-8 cho phép trừ số thực thay vì strict equality. Không giảm kiểm bounds/pin IDs hoặc thay expected dữ liệu để làm xanh. Đây là kiểm component props/style math, không đo Yoga/text pixels.

Không chạy lại backend full suite vì không thay backend/API/HTTP code hoặc hợp đồng; fingerprint bảo toàn các file đó. Không dùng host test thay native.

## 6. Bảo toàn source/data/audio và WIP

Fingerprint trên đường dẫn sorted, mỗi path + NUL + bytes + NUL; không normalize EOL/nội dung. Không đọc env. Tracked file set ngoài allowlist giữ nguyên; docs kiểm thêm cả các untracked tài liệu đã có.

| Tập bảo vệ | Số file | SHA256 trước = sau |
| --- | --- | --- |
| Tracked ngoài 5 source/test files được sửa, loại env files | 1398 | `79199d43d2327b6d2fc6cc061458de88c080f01e355efef5bfeee07c39e22ee6` |
| Data, backend, mobile assets/voice/data/recommendation, tools, Camera/Location và alleyGeometry | 556 | `d3b36d893248fa6b38dac8d200cd6940e165f0e962ef0b9ac61e42d17b9ea205` |
| Docs/agent_docs có sẵn + MEMORY.md/AGENTS.md, không tính báo cáo mới này | 774 | `1aaa61e108b5f4d0d3e23a0d7e3106b461ef204b7c6b76bf46098d7f4283e178` |

Ngoài hash sets, đảo riêng hunk mới trong bộ nhớ khôi phục đúng SHA trước phiên của cả năm file được sửa. Như vậy patch audio/Home Phase 1B, Plan Wave 1, translator keys trước và tests WIP cũ không bị ghi đè khi chạm cùng file. Không có EOL renormalization toàn repo.

Kết luận phạm vi: Data/JSON, Q&A, story/content, revision pins, textHash, audio bytes/catalogues/generators, image assets/provenance, GPS/QR và backend contracts không đổi trong phiên. Không gọi ElevenLabs, không đọc/log secrets, không xóa untracked files.

## 7. Remaining Native QA — PENDING

`Get-Command adb` không tìm thấy adb trong PATH ở phiên này. Không khởi chạy/cài native build hoặc Metro; không có screenshot/device trace mới, không tự ghi native PASS.

| Ca cần kiểm | Nội dung cần ghi bằng chứng |
| --- | --- |
| Home Android/iPhone 320/360/375/430; VI/EN | Bounds thực của canvas/nhãn trái, wrap tên dài, selected/visited/locked, không đè pin/nhãn khác, scroll tới nhãn cuối |
| Canvas nhỏ hơn viewport | Kiểm canvas capped 540 trên màn lớn; không suy rộng host props thành measured pixel layout |
| Font 1/1.3/2 và Dynamic Type | Map ở boundary hiện có, list fallback không đổi; đọc/chạm được tên đầy đủ, không mất chức năng |
| Tám collections | Hai polyline Gạch/Trung Yên 5/5; fiction sáu vị trí; schematic 2/3 node; pin/label tap đúng node |
| Home audio + navigation smoke | Play/pause/blur/background/mode/locale theo guards hiện có; host audio regression đã pass nhưng chưa nghe/native verify |
| Plan VI/EN | Exact nhãn đổi lựa chọn, reset topic/giữ budget chỉ sau tap, focus/announcement và keyboard; không coi live-region prop là VoiceOver đã đọc |
| FIX-03 | Modal đáy trên iPhone Home Indicator cần native reproduction; **không sửa padding/safe-area trong lượt này** |
| Wave 1 còn lại | Palette/ảnh nền thực, hit boxes, screen-reader, modal Back/reopen và reduced motion theo native matrix cũ |

FIX-04 (token hex Home) tiếp tục deferred; không dùng việc đang sửa Home để migrate màu. NK-UI-03/04/05, seek/miniplayer, voice commands/UI mode và image resolver không được mở.

## 8. UI Wave 2 entry recommendation và điểm dừng

Đề xuất **đưa candidate hiện tại vào Native QA trước**, sau đó disposition các phát hiện theo scope. Chỉ cân nhắc UI Wave 2 khi có evidence native phù hợp, những defect mới được phân loại, contract/allowlist của ticket tiếp theo được review và người dùng cấp quyền riêng. Host 426/426 không tự phê duyệt FIX-03 hay bất kỳ NK-UI-03/04/05 nào.

### Việc cần anh quyết

- Chọn Android/iPhone và mức native coverage dùng để nghiệm thu Wave 1. Đề xuất kiểm cả hai nền tảng ở các width/font/locale nói trên; nếu mới có Android, ghi Android-only và giữ iOS pending, không blanket PASS.
- Chưa cần quyết nội dung/audio cho hai fix này. UI Wave 2 vẫn cần yêu cầu mở scope riêng sau Native QA; nếu chưa mở thì dừng ở candidate này.

### Việc anh tự làm

- Cung cấp/mở thiết bị hoặc môi trường native khả dụng và xác nhận đang chạy đúng candidate, rồi lưu screenshot/OS/build/fontScale/locale cho các ca trên. Đây là gate native verification đã có trong UI plan, **không gắn nhãn ngoài plan một cách mặc định**; thiếu thiết bị thì chỉ host-regression complete, native còn PENDING.
- Nếu thấy đáy modal bị che trên iPhone, cung cấp bằng chứng tái hiện để đánh giá FIX-03 trước khi cấp quyền sửa. Không tự xem giả thuyết trong Visual QA là native confirmation.

**Dừng tại `READY_FOR_NATIVE_QA`. Không bắt đầu wave/ticket/phase tiếp theo.**
