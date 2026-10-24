# Storytelling remediation — Gạch và alley audio entry

Ngày 24/10/2026. Baseline `4af64c49a4ada47f952ddf76c35adfb90f826224`, branch `valentino/logic-fix-mobile-20261020`, dirty worktree. **PROPOSED_ONLY — chưa cấp quyền triển khai.** [Audit và bằng chứng](../reviews/NGO_KE_STORY_ENTRYPOINT_AUDIT.md). Giữ WIP UI-03/PERF-01; không triển khai PERF-02/UI-05B/UI-04A hoặc mở NK-006/009/010 theo tài liệu này.

## 1. Chuẩn đề xuất để duyệt

Chọn **C về trình bày + A về availability**. Home có hai capability độc lập: đọc khi reader hợp lệ, nghe khi intro đúng scope/revision. Không bắt mọi collection có cùng số audio. Gạch tiếp tục có 5 story audio mỗi locale, không intro MP3; D6-A giữ nguyên. Không tạo `alleyStory` để làm nút xuất hiện.

Copy UI đề xuất, cũng cần duyệt exact VI/EN:

| State / field | VI | EN |
| --- | --- | --- |
| Intro audio entry | Nghe mở đầu | Listen to introduction |
| Intro audio a11y | Nghe phần mở đầu của hành trình | Listen to the journey introduction |
| Node-led helper khi không intro track | Chọn một điểm để nghe câu chuyện tại đó. | Choose a stop to hear its story. |
| Text-only intro, nếu duyệt entry riêng | Giới thiệu ngõ | About the alley |

Không dùng “Nghe toàn bộ câu chuyện ngõ” vì intro MP3 không đọc nguyên `alleyStory`. Không tự thêm text-only reader cho Gạch trước khi intro replacement được duyệt và có quyền presentation. Không làm placeholder “sắp có audio” nếu chưa có kế hoạch được cấp quyền.

## 2. Ticket giao Luna sau khi được duyệt

### ST-01 — P1 — Tách intro audio entry khỏi reader

- **Class/root cause:** BUG coupling + UX_INCONSISTENCY, SE-01. Ba collection cũ có intro/file/hash hợp lệ nhưng `HomeScreen.tsx:418` bao cả nút nghe trong nhánh alleyStory. Reproduced VI/EN, không lỗi mapping. Contract đề xuất mở rộng vị trí entry cũ; user phải duyệt trước.
- **Owner/model:** Luna. Existing allowed files: `mobile/src/screens/HomeScreen.tsx`, `mobile/src/i18n/translator.ts`, `mobile/tests/homeIntroPlay.test.mjs`, `mobile/tests/homePhaseB.test.mjs`, `mobile/tests/uiFlows.test.mjs`, `mobile/tests/alleyStoryCard.test.mjs` nếu snapshot/mount contract thực sự đổi. Không cần file mới, không sửa catalogue/data/hook.
- **Hướng:** giữ reader conditional riêng; đặt audio entry tại Home theo introTrack hợp lệ trong nhánh ready. Tái sử dụng handler/generation guards. Không await audio trước navigation, không autoplay, không đổi track selection hay state reset.
- **Acceptance:** 7/8 collection có intro được nghe trực tiếp từ Home cả VI/EN; Gạch không tạo intro/player giả. Ba collection legacy không cần alleyStory. Reader chỉ hiện nơi dữ liệu hợp lệ. Revision mismatch/missing track vẫn không nghe nhầm; empty/error Live vẫn có recovery.
- **Regression risk:** phát chồng Home→Qa; stale preparation sau đổi locale/alley/background; layout entry rộng ở fontScale 2. Giữ existing 4 intro ngõ mới và fiction labeling.
- **Tests/native:** matrix 8×2, ready/unavailable/revision mismatch, double tap, blur/unmount/background/locale/collection/mode; iPhone bấm Play/Pause→mở node→Back, không âm thanh muộn/chồng. Native PASS chỉ khi đã nghe thật.
- **Dependencies/gate:** user duyệt C+A và scoped UI allowlist; phối hợp scope UI-04A để tránh đụng cùng JSX nhưng không mở CompactAudioPlayer ở ticket này. **NEEDS_APPROVAL**.

### ST-02 — P1 — Dùng reader thật trong regression entry

- **Class/root cause:** BUG/test coverage, SE-06. `homeIntroPlay.test.mjs:225–230` dựng reader từ intro; che Gạch thực tế không có reader và không phát hiện legacy missing button.
- **Owner/model/files:** Luna; `mobile/tests/homeIntroPlay.test.mjs`, `mobile/tests/alleyStoryCard.test.mjs`, `mobile/tests/uiFlows.test.mjs` nếu cần. Import actual `mobile/src/data/alleyGuide.ts`; không sửa reader production để thỏa tests.
- **Hướng/acceptance:** test registry datasets thật, reader thật, correct Three Lenses revision; kiểm read và listen độc lập, Gạch cả reader và intro play đều absent trước khi có approved text-entry scope. Giữ ca malformed reader và audio scope mismatch.
- **Risk:** vô tình bỏ lifecycle mocks hữu ích; chỉ thay reader fake, giữ native doubles. Full mobile tests/typecheck/lint/diff-check sau implementation.
- **iPhone:** kết quả host đối chiếu visibility 8 collections VI/EN; tests không thay native audio proof.
- **Dependencies/gate:** có thể triển khai cùng ST-01, bắt buộc xong trước nghiệm thu. Có thể làm test-only baseline riêng nếu user cấp quyền; không tự đặt new desired visibility thành current expected. **NEEDS_APPROVAL**.

### ST-03 — P1 — Exact content review Gạch, đủ mọi surface chứa claim yếu

- **Class/root cause:** CONTENT_QUALITY, G01–G13/SE-03/04. Ba café quá nhiều meta research; Thanh Hà có G08; Cầu Đông nặng bibliography; hướng dẫn bước/ngoài ngõ thiếu field evidence.
- **Owner/model:** Sol biên tập/human duyệt; Luna chỉ tích hợp ở phase riêng sau quyền riêng. **Files của ticket hiện đề xuất:** chỉ một bản review Markdown mới hoặc append tài liệu review được user chọn; không overwrite Narrative V2, ledger/Batch A/B. Runtime future targets chỉ để tính impact: `data/localized/ngo-gach.vi.json`, `.en.json` (intro.text; story/summary/caption của 5 IDs); source evidence append nếu duyệt, không sửa geometry/order/start/qa.
- **Hướng/acceptance:** duyệt từng candidate mục 3; giữ attribution/legend, bỏ G08/steps và implied route, VI/EN cùng certainty. Không claim cả collection approved. Không biến cafe waypoint thành heritage story dài.
- **Risk:** chữ mới khác audio cũ; cả sửa intro không audio/display cũng đổi whole-dataset revision. Không ship text mới kèm story clip cũ không khớp; không nới textHash/resolver.
- **iPhone:** sau gói integration/voice rollout được duyệt riêng, đọc và nghe đúng same text, kiểm labels/caption và node navigation. Hiện chỉ human đọc candidate, chưa listening QC.
- **Dependencies/gate:** D2/D3/D4/D6/D7 giữ nguyên; P3 exact approval riêng; NK-006/009/010 vẫn đóng. **NEEDS_EXACT_CONTENT_APPROVAL**, chưa READY cho Luna runtime.

### ST-04 — P2 — Nhãn và giải thích availability

- **Class/root cause:** UX_INCONSISTENCY, SE-02/05. “Nghe/Listen” cạnh reader tạo hiểu nhầm về nội dung clip; không intro cũng không có lời chỉ dẫn khả năng nghe từng điểm.
- **Owner/model/files:** Luna; `HomeScreen.tsx`, `AlleyStoryCard.tsx`, `translator.ts`, `homeIntroPlay.test.mjs`, `alleyStoryCard.test.mjs`, `uiFlows.test.mjs`. Không file mới/hook/seek/miniplayer. Dùng UI copy được duyệt ở mục 1.
- **Acceptance:** labels đúng vai trò intro vs read; node-led helper không disable mic/typed commands khi qa=[]; không hứa audio tương lai; không duplicate info đầy màn. Reader audio vẫn gọi handler hiện có.
- **Risk/native:** wrap/VoiceOver/focus ở fontScale 1/1.3/2; kiểm Home và modal VI/EN, không thay modal-close audio policy ngoài scope. Không che lỗi bằng giới hạn font scaling.
- **Dependencies:** ST-01 và human UI copy approval; UI-04A cần phối hợp ownership sau. **NEEDS_APPROVAL**; an toàn về assets, không phải quyền triển khai hiện tại.

### ST-05 — P2 — Tái hiện và chốt fallback khi intro playback lỗi

- **Class/root cause:** UX_INCONSISTENCY/error-path gap SE-07; catch im lặng trong Home. Chưa có native error reproduction.
- **Owner/model:** Luna khảo sát test trước, Sol review contract. Proposed files: `HomeScreen.tsx`, `translator.ts`, `homeIntroPlay.test.mjs`; chỉ mở rộng `AlleyStoryCard.tsx` nếu contract hiển thị error trong modal được duyệt.
- **Hướng:** simulate `setAudioModeAsync`/replace/play throw hoặc promise reject và native load error; ghi actual behavior. Chỉ đề xuất visible retry/text fallback khi tái hiện, không đổi voice hook để “fix” lỗi chưa thấy.
- **Acceptance:** lỗi không thành success/Playing giả, không crash/unhandled rejection, giữ text/navigation; retry không phát stale clip; không swallow lỗi audio-mode dẫn đến hứa phát được. Chi tiết implementation chờ reproduction.
- **Risk/native:** audio session/lifecycle; kiểm iPhone silent switch, Back, background trong preparation/play, lỗi asset simulated development. Không dùng lỗi paid service để thử.
- **Dependencies/gate:** scope error handling tách khỏi presentation UI-04A và independent of new MP3. **NEEDS_REPRODUCTION_AND_APPROVAL**.

Không có P0 chặn toàn app được chứng minh. P1 content risk cần ưu tiên duyệt, nhưng không tự hotfix/hide node/audio trong audit. Bổ sung deep heritage stories/café survey là backlog evidence P2, không gate bắt buộc cho waypoint đã chọn.

## 3. Proposed exact VI/EN — DRAFT_NOT_APPROVED

Các candidate sau là đề xuất riêng, không thay bản V2 hay runtime. Mã `SG-*` chỉ nhãn duyệt tài liệu, không field/schema/claim ID mới. Câu ngắn là chủ ý với waypoint. Không sinh audio để thử đọc.

### SG-I — `ngo-gach / intro.text`

VI:

> Câu chuyện Ngõ Gạch bắt đầu với đình Thanh Hà và những ngày tưởng nhớ Trần Lựu. Một điểm di sản liên quan nằm ngoài ngõ, trên phố Hàng Đường: chùa Cầu Đông, với hai pho tượng được nhận diện là Trần Thủ Độ và Trần Thị Dung.

EN:

> The story of Gạch Alley begins with Thanh Hà Communal House and its dates of remembrance for Trần Lựu. A related heritage site lies outside the alley, on Hàng Đường Street: Cầu Đông Pagoda, with two statues identified as Trần Thủ Độ and Trần Thị Dung.

Trace: G06/G09 VERIFIED, G11/G12 PARTIALLY_SUPPORTED, S22/S24; “bắt đầu” là thứ tự chủ đề, không đổi startNodeId khỏi No.1. Bỏ 128 m, nhà nghỉ/quán hiện trạng, bia 1430. So với S-G1 cũ, intro này gợi chủ đề hai tượng thay vì chỉ liệt kê; vẫn có thể chọn nguyên S-G1 trong V2 nếu user thích ngắn hơn. **Không intro MP3 mới, không tạo reader object**; muốn hiện intro trên Home cần ST-04 scope riêng.

### SG-T — `ngo-gach-dinh-thanh-ha / story`

VI:

> Mùng bốn tháng Tư và rằm tháng Chín âm lịch: hai ngày tưởng nhớ gắn với đình Thanh Hà. Ngôi đình thờ Trần Lựu. Bên cạnh tên người được thờ, lịch lễ cũng là một cách để tìm hiểu nơi này.

EN:

> The fourth day of the fourth lunar month and the fifteenth day of the ninth: two dates of remembrance associated with Thanh Hà Communal House. The site honors Trần Lựu. Alongside the name of the figure honored here, its festival calendar offers another way to understand the place.

Trace: G06/G09 → S22, B2B-S01; câu cuối là editorial interpretation, không giả cảnh đã dự lễ. Bỏ G08, Vũ Ninh/G07 chưa đủ nguồn, không thêm sử tích. So với V2-03 bớt lặp “nhịp trở lại”; không phải cải thiện bằng tăng facts. User có thể chọn V2-03 cũ hoặc SG-T, không mix câu không record. Summary/caption dùng replacements V2-03 để bỏ bia trên **cả** surfaces, cũng cần duyệt riêng. Lịch lễ không cam kết diễn ra năm nay hoặc access.

### SG-C — `ngo-gach-chua-cau-dong / story`

VI:

> Hai pho tượng gỗ ngồi thiền, cả hai đều mặc trang phục giản dị. Đó là chi tiết bài viết về chùa Cầu Đông ghi lại khi giới thiệu cặp tượng được nhận diện là Trần Thủ Độ và Trần Thị Dung.

EN:

> Two wooden figures sit in meditation, both in simple clothing. An account of Cầu Đông Pagoda records this detail in its description of the pair identified as Trần Thủ Độ and Trần Thị Dung.

Trace: G12 PARTIALLY_SUPPORTED/S24, mô tả qua bài viết, không quan sát mới/giám định. Bỏ ước định XVIII, origin/ý nghĩa chưa rõ được kéo đến hiện tại, địa chỉ/near-west-route và “duy nhất”. So với V2-05 mở bằng chi tiết rồi đặt attribution một lần; vẫn **PENDING_P3_EXACT_APPROVAL**. Summary/caption ưu tiên V2-05 đúng supporting place ngoài ngõ, chờ duyệt riêng. Không thêm tiểu sử để tạo kết luận triết lý.

### SG-W1 — `ngo-gach-ca-phe-no1 / story`

VI: **Cà Phê No.1 — mốc mở đầu trong trải nghiệm Ngõ Gạch của Ngõ Kể.**

EN: **Cà Phê No.1 — the opening marker in Ngõ Kể’s Gạch Alley experience.**

Giữ nguyên candidate P5 đã có, không coi đã approved. G02 PARTIALLY_SUPPORTED/G03 editorial; startNodeId thực xác nhận vai trò trong app. Không số nhà/phía đông/đi tới 4A/đang hoạt động.

### SG-W2 — `ngo-gach-ta-ca-phe-4 / story`

VI: **Ta Cà Phê 4 — điểm dừng mang địa chỉ 4A Ngõ Gạch.**

EN: **Ta Cà Phê 4 — a stop listed at 4A Gạch Alley.**

G04 VERIFIED/S25 website đơn vị hỗ trợ nhận diện chi nhánh ở lần kiểm ledger 23/10, không bảo đảm đang mở hôm nay. Đây là waypoint trong app, không lời mời mua hoặc heritage story. Bỏ “ba chục bước”, “đi tiếp tới đình”, “không có nguồn về quán”. Identity không cho phép thêm lịch sử/menu. Summary/caption nếu duyệt có thể dùng exact cùng câu này để bỏ G05; phải chọn từng field.

### SG-W3 — `ngo-gach-cafe-20 / story`

VI: **Cafe 20 — một mốc trong danh sách điểm của trải nghiệm Ngõ Gạch.**

EN: **Cafe 20 — a marker in the stop list for the Gạch Alley experience.**

G10 PARTIALLY_SUPPORTED/S29 chỉ nhãn bản đồ + node runtime; không xác nhận quán hoạt động/số nhà/hướng cuối ngõ. Bỏ research monologue và route cue. Summary/caption nếu duyệt nên dùng exact nhãn tương tự thay hiện trạng; user disposition từng field, không tự copy cả bộ.

### Duyệt theo field, không theo tên collection

| Nhóm | Fields cần quyết VI/EN | Current status |
| --- | --- | --- |
| SG-I | intro.text; có muốn text entry Home sau duyệt? | DRAFT_NOT_APPROVED; no audio |
| SG-T | story SG-T hay V2-03; summary/caption V2-03; name.en nếu chọn dấu | DRAFT_NOT_APPROVED |
| SG-C | story SG-C hay V2-05; summary/caption V2-05; name.en | PENDING_P3_EXACT_APPROVAL |
| SG-W1 | story P5; summary/caption cần disposition nhãn thay claim vị trí cũ | DRAFT_NOT_APPROVED |
| SG-W2 | story/summary/caption độc lập, không duyệt nguyên node | DRAFT_NOT_APPROVED |
| SG-W3 | story/summary/caption độc lập | DRAFT_NOT_APPROVED |

Không đề xuất đổi name IDs/order/start, geometry, QA, image provenance, availability. `pendingCheck` vẫn là operational notes chưa field-verified; không coi duyệt story đã duyệt current access. Không “KEEP approved” cho field không được chọn.

## 4. Điều gì làm được mà không tạo audio mới?

- ST-01/ST-02/ST-04: dùng 14 intro đang có, sửa entry/copys/tests; không đổi dữ liệu nên không cần đổi revision/textHash. Đây là phần nhỏ có thể giao Luna **sau approval**.
- Chốt exact editorial pack/candidates: chỉ Markdown, không tác động voice.
- Intro Gạch text-only không có track để regenerate, nhưng tích hợp chữ vẫn đổi dataset revision và tác động 10 node-story slots. Không phải thay đổi runtime tự do hoặc được miễn NK-006/009.
- Thay story Gạch dù rút thành waypoint sẽ đổi spoken strings. Clip cũ không khớp chữ mới: cần human quyết voice rollout riêng; không ghép clip/reuse khác text, ẩn player hoặc disable commands để lách gate. Tối đa 10 changed story strings nếu chọn cả 5×VI/EN, không phải quyền sinh 10 clip.

## 5. Thứ tự và native acceptance

1. Human chọn C+A và exact UI copy; duyệt ST-01/02/04 scoped files, Luna kiểm diff với WIP UI-03/PERF-01 hiện hành.
2. ST-02 dựng matrix thật, ST-01 sửa coupling, ST-04 chuẩn hóa labels. Chạy focused + full mobile tests + typecheck + lint no-cache + diff-check theo source lúc triển khai. Không lấy 431 làm số expected bắt buộc.
3. iPhone VI/EN: 4 ngõ mới vẫn nghe Home; 3 legacy nghe được Home sau sửa; Gạch node-led; modal đọc đúng text, nghe đúng intro; Play/Pause/Back/Home→Qa, đổi locale/alley/mode, nền/foreground, fontScale 2/VoiceOver. Xác nhận không ảnh hưởng mic/typed commands `listen/replay/stop/next/plan/open-qr/open-gps` dù qa=[]; không double playback. Không fake native PASS từ host.
4. Human review SG fields/P3; chỉ sau exact wording và rollout contract mới xét yêu cầu mở NK-006 riêng. NK-009/010/TTS/ElevenLabs vẫn chưa được cấp. Không gộp PERF-02.

**Cần anh quyết:** chọn C+A (đề xuất), duyệt scope UI và từng exact field/locale, chọn story SG-T/SG-C hay bản V2 tương ứng. Nếu chưa chốt, Luna chưa sửa UI/runtime và audio giữ nguyên.

**Cần anh tự làm:** kiểm/nghe trên iPhone đúng bundle sau triển khai được cấp quyền; hiện audit chưa chạy thiết bị. Khảo sát đường nối/cửa/café hiện trạng nếu muốn biến waypoint thành chỉ dẫn là **[ngoài plan của lượt audit]**, cần giao riêng; không bắt buộc cho phương án waypoint trong app và không tự thêm vào execution scope.

**STOP: HUMAN CONTENT & IMPLEMENTATION APPROVAL GATE.**
