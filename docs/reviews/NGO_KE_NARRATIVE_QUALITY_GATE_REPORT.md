# Ngõ Kể — Narrative Quality Gate / Storytelling Pilot V1

Ngày **24/10/2026**, Asia/Saigon. Scope: Research Reconciliation + read-only runtime + documentation only. **Verdict: READY_FOR_STYLE_APPROVAL — có điều kiện review P3 và role P5.** Không có nghĩa style hoặc exact text đã được người dùng duyệt. P5 vẫn **NEEDS_MORE_EVIDENCE cho heritage story**; các claim chưa giải không được trung bình điểm để bỏ qua.

## 1. Baseline và ownership

Branch `valentino/logic-fix-mobile-20261020`, HEAD `4af64c49a4ada47f952ddf76c35adfb90f826224`. Baseline có 20 tracked modified paths cùng untracked docs/skills/tests/cache; HEAD không đổi không có nghĩa worktree sạch. Bảo toàn Phase 1A/1B/UI Wave 1/remediation và toàn bộ Batch A/B; không reset/stash/checkout/commit/push/merge/pull hoặc xóa file.

User mới nhất báo đã chạy native iOS smoke và chưa ghi nhận lỗi UI rõ; đây là thông tin do người dùng cung cấp, không độc lập xác minh bản build/test matrix, không toàn bộ native acceptance hoặc listening QC. Antigravity đang UI QA/image rights; không sửa tài liệu của họ hoặc claim đã kiểm quyền ảnh. 426/426 mobile là kết quả remediation được báo cáo, **không fresh regression của lượt này**.

Ba output được kiểm tra chưa tồn tại trước ghi. Chỉ tạo:

1. [Narrative Style Guide V1](../content/NGO_KE_NARRATIVE_STYLE_GUIDE_V1.md).
2. [Five-node Pilot VI/EN](../content/NGO_KE_NARRATIVE_PILOT_VI_EN.md).
3. [Quality Gate Report](NGO_KE_NARRATIVE_QUALITY_GATE_REPORT.md).

Không sửa runtime JSON, IDs/order, summary/caption/intro/guide, Q&A/commands, images/audio, pipeline/catalogue/revision/textHash, claim ledger, original A/B, AGENTS/MEMORY. Không dispatch agent hoặc mở full audit. Không dùng secret/Voice IDs, generator/TTS/paid API. MEMORY không được cập nhật vì ràng buộc mới nhất cấm rõ.

Snapshot đầu phiên: **1413 paths**, SHA256 tổng hợp `c3bc718470b4e0e877d59e4d83ceca4fb4ecbc285be16bfc5afcb1c61d596500`. Thuật toán sorted unique path + NUL + raw bytes + NUL; gồm tracked trừ basename `.env*`, 10 input docs/AGENTS/MEMORY và ba untracked tests Wave 1 (deduplicated). Không xuất file contents bí mật. Đối chiếu lại cuối phiên; output mới không nằm trong snapshot. Không đóng băng công việc UI/image docs song song ngoài tập bảo vệ.

## 2. Inputs và reconciliation

Đối chiếu AGENTS, ledger, editorial review, rewrite plan, Decision Pack, Batch A, Batch B, Batch B matrix/report; runtime 5 node VI/EN, surfaces liên quan và actual consumers. Các hồ sơ cũ dùng để đối chiếu, không mặc định đúng mọi kết luận. Không nâng status ledger. D1–D7 giữ **PENDING_HUMAN_APPROVAL**.

Skills ảnh hưởng trực tiếp: heritage-fact-check buộc giữ original status/attribution và omissions; content-management giữ identity/order/provenance và role chỉ ở docs; voice-tts-quality tách review chữ khỏi listening, chỉ preview delta. Các đường CMS cũ trong skills không khớp repo thực: dùng data/localized/registry hiện hành, không tạo catalog giả hoặc chạy content mutation. Voice references legacy không thay contract của localized node-story pipeline.

Đã mở lại nguồn cho các claim sử dụng: S07, S24, S18, S19 và bản Thanh Hóa 2021 thuộc source family S06. URL/ngày/phạm vi ở source register của pilot. Không thêm nguồn thứ hai giả từ bản đăng lại. S29 không được mở/xác minh lại, không dùng để bảo chứng identity hiện tại của No.1; chỉ sự kiện start node trong cấu hình app được kiểm trực tiếp.

Actual consumers: `QaScreen.tsx:223,255–260` dùng intro hoặc node story, fallback summary/intro; node contentId có hậu tố `-story`. `tools/voice/generate_node_stories.py:138–143` lấy exact story và pins. `useVoiceSession.ts:442–462` kiểm kind/node/scope/revision/textHash. Vì vậy không thể “không kể dài” bằng cách tự xóa story rồi giả định player/commands không ảnh hưởng. Home summary/caption và guide vẫn có certainty riêng; pilot không tự làm sạch các surfaces đó.

## 3. Những lỗi storytelling cụ thể

| Artefact | Lỗi cụ thể | Pilot xử lý |
| --- | --- | --- |
| B-TS | Đọc mốc năm đăng lại giữa câu chuyện tên, lấy bài báo làm nhân vật chính | Chọn một trục lời chúc; account boundary còn, tuổi quán/operations bị lược |
| B-TC | Tên báo/năm ngắt nhịp; kết bằng gia đình/ký ức khá chung | Lời người nhà dẫn mạch, kết ở chính tên người + cây; không migration |
| B-G | Hook “một pho tượng có thể…” và kết đạo đức không đoán thêm áp dụng được nhiều di tích | Hai tượng vào ngay câu đầu; giữ nhận diện qua nguồn, không thêm provenance |
| A-P | Tên VietnamPlus và “các bài viết” làm lộ khung tổng hợp; câu hỏi rời quê hơi phổ quát | Tách lời giới thiệu di tích với lời dân; kết bằng tên người/tên làng |
| B-TN/B-AY/B-CH | Một số kết suy ngẫm “ký ức/di sản/đời sống” có nguy cơ thành công thức ở nhiều node | Style guide đặt specificity test, không viết lại ba node ngoài scope |
| Runtime No.1 | Nhật ký thiếu dữ liệu + chỉ dẫn đến 4A không phải story; A/B chưa có candidate | Ngoại lệ pilot: label app-only, không viết lịch sử quán |

Attribution cần thiết không phải lỗi cần xóa sạch. Các bản A/B vẫn giữ công dụng fact/trace và unresolved claims; pilot không phủ nhận toàn bộ audit hoặc làm mất nghĩa các qualifiers cũ.

## 4. Pilot revisions và quality gate

Mỗi node đủ 11 mục: exact runtime VI/EN; exact latest A/B nếu có; diagnosis; revised VI; revised EN; trace; attribution decision; proposed omissions; risks; text-readability; human decisions. Có **10 revised strings**, trong đó **8 story strings + 2 waypoint-label strings**. Tất cả **DRAFT_NOT_APPROVED**. Không gọi hai label là hai heritage stories đầy đủ.

| Pilot | Thay đổi trục | Evidence/hard gate | Hạn chế cần human |
| --- | --- | --- | --- |
| P1 Phở Sướng | Tên như lời chúc | T07 PARTIALLY_SUPPORTED; account không thành lịch sử kinh doanh | Cách quy nguồn gọn có tự nhiên/rõ mức chắc không? |
| P2 Sâm Cây Si | Lời người nhà về tên/cây | T08 PARTIALLY_SUPPORTED; không gán người kể thành bà Sâm | “si tree” dễ hiểu trong EN? |
| P3 Cầu Đông | Hai tượng → hiện diện nhân vật trong thờ tự | G11/G12 PARTIALLY_SUPPORTED, không giám định | Qualifier vẫn hơi nặng; engagement 3/5, không che hạn chế |
| P4 Tiên Hạ | Nhớ người / nhớ quê, hai chủ thể | P01/P04 có qualifier; P03/P05/P06 không kể chắc | Nhịp tên riêng; liên tưởng cuối không là chứng cứ chronology |
| P5 No.1 | Chỉ mốc trong app | Label có giới hạn; story NEEDS_MORE_EVIDENCE | D3 phải chọn role; chưa xác minh quán/địa chỉ hiện tại |

Chấm đủ 10 chiều 1–5 trong pilot, **5 là tốt**, cả citation/formulaic được diễn giải là ít intrusion/ít lặp. Không tính trung bình. Historical gate bốn story chỉ LIMITED_PASS trong phạm vi drafting có attribution, chưa human historical approval; P5 SAFE_AS_APP_LABEL_ONLY, không pass thành heritage story. Điểm là tự đánh giá biên tập, không nghiên cứu người dùng hay listening test. Nếu human thấy một qualifier bị hiểu sai, câu đó phải chỉnh/bỏ dù các điểm còn lại cao.

## 5. Evidence được bảo toàn như thế nào

- Chuyển tên báo/năm về trace, **giữ loại lời kể** trong spoken khi nguồn chưa đủ kể trực tiếp. Không dùng documentary voice để che oral account.
- Câu factual nào cũng có original claim/status/source và usage condition; câu liên tưởng đánh dấu editorial, không thêm row ledger hoặc dùng làm Q&A evidence.
- Các claim tuổi quán, migration, định niên đại tượng, quê “ông”, Nguyễn Siêu/1886 và số nhà tranh chấp được ghi **proposed omission**, chưa user chấp thuận xóa khỏi runtime.
- Không invent nhân chứng/quote, cảm giác tại chỗ, biography, lý do tạc tượng, menu/giờ/quality hoặc route. Oral accounts không tự thành legend; legend tương lai phải có nhãn ngay trong mạch kể.
- Không thêm schema/tab/UI cho evidence. Muốn áp dụng tương lai phải dùng surfaces hiện có với allowlist/approval phù hợp; không hứa app tự hiển thị các trace tables này.

## 6. Điều kiện nhân rộng A+B và drafting C

**12 node A+B là tổng phạm vi**, không 12 node chưa sửa: bốn node pilot nằm trong A+B, tám node A+B còn lại chưa được viết theo style pilot. Đề xuất chỉ mở một đợt tài liệu riêng sau user style approval; chốt lại bốn pilot và biên tập tám node còn lại theo evidence của từng node, không search-replace tên nguồn hoặc gắn một template kết bài. Không tự nhân rộng trong phiên này.

Trước khi gọi toàn bộ A+B sẵn sàng: exact VI/EN cần user duyệt; review summary/caption/intro/alleyStory/guide để không mạnh certainty hơn story; hai Vọng Tiên giữ fact sheet chung và tự chứa; identities/legend/operations pending phải được disposition theo field. Duyệt style không duyệt cả collection hoặc current Live status.

Batch C: chỉ No.1 được mở làm pilot; bốn node C còn lại chưa draft. Sau D3 role + evidence/identity phù hợp và quyền riêng mới viết. Nếu là waypoint, dùng short label không hứa access; nếu bắt buộc story sâu, **NEEDS_MORE_EVIDENCE**, không bù bằng chung chung. Field questions trong matrix B vẫn cần người dùng/đơn vị có thẩm quyền; không tự mở survey hoặc sửa geometry/audio behavior.

## 7. D1–D7 và voice impact

| Decision | Trạng thái | Ảnh hưởng |
| --- | --- | --- |
| D1 | PENDING_HUMAN_APPROVAL | Tên đình/đền Trung Yên ngoài pilot, không được tự chốt khi nhân rộng |
| D2 | PENDING_HUMAN_APPROVAL | Tiên Hạ omission/conflicts; không phục hồi Nguyễn Siêu/1886 qua approval style |
| D3 | PENDING_HUMAN_APPROVAL | No.1 label vs story; không tự đổi role runtime/ẩn player |
| D4 | PENDING_HUMAN_APPROVAL | Cầu Đông ngoài ngõ, không route; không đổi GPS |
| D5 | PENDING_HUMAN_APPROVAL | Phở/Sâm không ranking/operations; các food guides ngoài scope vẫn pending |
| D6 | PENDING_HUMAN_APPROVAL | Không tạo intro audio/guide/alleyStory cho Gạch để bù waypoint |
| D7 | PENDING_HUMAN_APPROVAL | Style, exact text, integration/delta và paid generation là gates tách biệt |

Hiện tại **zero runtime delta**: chỉ Markdown. Tương lai, nếu chọn đúng pilot, có 8 story strings khác runtime và latest A/B; 2 label strings tùy D3/presentation choice. Không suy thành 10 paid jobs hoặc lệnh xóa track. Không intro/display replacement ở lượt này. Nếu chạm ba collection Gạch/Trung Yên/Phất Lộc, revision review perimeter là **24 story + 4 intro = 28 slots**; toàn năm ngõ vẫn 42 slots, không phải số regenerate.

Whole-JSON canonical revision khác exact spoken textHash và raw/normalized source hash. Chỉ đổi display/evidence cũng cần revision review; unchanged text chỉ là reuse candidate sau kiểm scope/provenance/audio SHA/voice/model, không repin khác text. Không tạo candidate hashes, gọi generator, sửa manifest/catalogue hoặc xin key. Human pronunciation/listening và paid gates chưa thực hiện; native smoke hiện có không duyệt nội dung mới.

## 8. Verification và giới hạn

Kiểm tra bằng read-only Node in-memory và Git, không thêm test/script runtime. **15 automated documentation checks PASS, 0 FAIL, 0 SKIP**, cộng **4 cross-check PASS**: snapshot 1413 paths trùng baseline, nguyên văn 10 runtime stories, nguyên văn 8 latest A/B candidates, và cả 10 revised strings khác bản trước tương ứng. Tổng **19 checks PASS**; không phải 19 runtime tests hoặc human approvals.

Coverage gồm năm node/mười revised strings/11 mục, score matrix 10 chiều, D gates, relative links/Markdown/whitespace và HEAD/branch. Original claim references được đối chiếu editorial với ledger, không gọi đó là kiểm chứng lịch sử tự động. `git diff --check` **PASS** cho tracked WIP; explicit whitespace checks **PASS** cho ba untracked docs. SHA cuối khớp SHA đầu đã ghi mục 1; source, tests, original A/B, ledger, AGENTS/MEMORY giữ nguyên bytes.

Không chạy mobile/backend suite/typecheck/lint, TTS, native, ASR hoặc listening trong scope docs-only. Không ghi 426 thành kết quả mới. Nguồn viết hỗ trợ draft không chứng minh material provenance, quán đang mở hoặc access 2026. Technical checks không tự kiểm chứng narrative quality/historical truth.

## 9. Việc cần anh quyết / việc anh tự làm

### Cần người dùng quyết

1. Chọn style: đề xuất giữ qualifier ngắn tại claim, đưa bibliography ra hồ sơ, bỏ generic endings; P3 vẫn cần thử nhịp. Chưa duyệt thì không nhân rộng A+B.
2. Chọn No.1: đề xuất waypoint label, không long heritage story; hoặc chờ research nếu muốn story. Chưa chọn D3 thì không thay runtime/player/audio, không xóa node.
3. Duyệt/sửa exact VI/EN của từng pilot và proposed omissions; disposition D2/D4/D5/D7 theo scope. Duyệt hướng style không thay việc này.

### Cần người dùng tự làm

- Đọc thử cùng người VI/EN năm cặp text, đánh dấu nhịp khó/tên riêng/qualifier không rõ; đặc biệt P3 và si tree. Đây là human style review, chưa yêu cầu audio hay credits; chưa làm thì naturalness chỉ là self-review của agent.
- `[ngoài plan]` Nếu muốn heritage story dài cho No.1 hoặc nguồn gốc tượng/claims Tiên Hạ đang lược: chỉ định nguồn chuyên môn/đơn vị quản lý, khảo sát/phỏng vấn có phép và provenance. Chưa có thì giữ story NEEDS_MORE_EVIDENCE hoặc dùng bản ngắn có giới hạn, không tự sáng tác.

**Dừng tại Human Style Approval Gate — READY_FOR_STYLE_APPROVAL không phải exact-text approval. Không mở NK-006/009/010 hoặc UI Wave 2.**
