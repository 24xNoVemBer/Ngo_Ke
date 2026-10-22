# Bốn ngõ phố cổ: lời kể, voice, gợi ý ăn chơi — Implementation Plan

## Quyết định đã chốt — chỉ dẫn mới nhất 22/10/2026

Người dùng bổ sung: **“xong all thì push lên github”**. Sau kiểm tra tích hợp, Codex commit/push source lên remote `ngoke-public` (`24xNoVemBer/Ngo_Ke`), nhánh `valentino/logic-fix-mobile-20261020`. Chỉ dẫn này thay giới hạn không push bên dưới. D6 vẫn không sinh hoặc thêm audio mới; các slot trống là source của tính năng.

Các bước chi tiết dưới đây giữ dấu vết plan ban đầu, không phải nhật ký lệnh đã chạy. Trạng thái thực và giới hạn nghiệm thu xem `docs/reviews/2026-10-22-four-alleys.md`; không suy ra đã chạy fail-first hoặc commit từng bước từ checklist.

Trạng thái cuối: Tasks 1–7 đã tích hợp; Task 8 tùy chọn không làm (không bịa polyline); Task 9 kiểm môi trường hiện có đạt 358/358 test, typecheck/lint sạch, export iOS/Android đạt. Metro 8082 offline, kiểm thiết bị thật còn pending. Codex đã kiểm độc lập, Anti bàn giao và được release; không gọi Claude. WIP mới chốt chung sau tích hợp theo yêu cầu push, không commit từng bước lịch sử của template.

- D1: Trung Yên đổi sang danh sách điểm trong doc: giữ Phở Sướng, Bún cá Sâm Cây Si, Bún ngan Nhàn; bỏ Phở Vui/Miến trộn mực; thêm Đình Trung Yên và Phở gà Hương Trà. Không bịa tọa độ cho điểm mới. Polyline OSM 146 m được giữ; khoảng 200 m trong bài kể là mô tả của nguồn, ghi lệch trong báo cáo.
- D2: Chấp nhận các điểm ghé thăm của doc, chưa dựng polyline cho ba ngõ mới.
- D3: KHÔNG làm bản Anh cho ba ngõ mới, ẩn ba collection đó ở giao diện EN, không âm thầm fallback VI. Trung Yên EN chỉ đồng bộ tối thiểu tên/điểm/cấu trúc, không dịch mới toàn bộ câu chuyện hoặc hướng dẫn.
- D4: Nút “Câu chuyện ngõ” trên Home được chốt.
- D5: Antigravity đã hồi quota, được giao Task 3/5/7. Codex sở hữu dữ liệu/schema/slot voice và nghiệm thu. WIP Landing/cleanup đã được commit cục bộ `a93a002` trước khi dispatch FE; baseline trước đó là `cf2168c`. Không push.
- D6: KHÔNG sinh audio, không commit audio mới. Chỉ bốn slot intro VI trống và hướng dẫn sinh sau; không đọc khóa, không gọi ElevenLabs hoặc sinh clip giả. Ước lượng offline phần Việt hiện tại: 2.432 ký tự. Không tạo script sinh audio trong lượt này.

Các mặc định/Task EN hoặc generation dưới đây là lịch sử đề xuất, không ghi đè quyết định đã chốt ở trên. Task 4 đợt này chỉ là đồng bộ EN tối thiểu của Trung Yên; ba ngõ mới không có file EN. Chạy các task tương ứng bằng workflow Orca của dự án; không tự cài skill/subagent mới từ dòng template bên dưới.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa nội dung 4 ngõ (Trung Yên, Tạm Thương, Cấm Chỉ, Phất Lộc) từ tài liệu "HỒ SƠ NỘI DUNG CÁC NGÕ HÀ NỘI" vào app theo 3 phần: (1) câu chuyện để người dùng đọc, (2) lời kể audio, (3+4) mục "Khám phá thêm" trong Sổ tay gồm quán nên thử và chỗ nên ghé.

**Architecture:** Mỗi ngõ là một collection trong dataset localized có sẵn. Thêm hai trường tùy chọn ở cấp ngõ: `alleyStory` (phần 1) và `guide` (phần 3+4). Phần 2 là chính `intro.text`, được đọc nguyên văn bằng track voice `intro` (đúng luật "TTS chỉ đọc nguyên văn"). Sổ tay đọc `guide` của collection đang chọn.

**Tech Stack:** Expo/React Native TS, `data/localized/*.json`, `mobile/src/data/collections.ts`, `mobile/src/voice/*Catalog.ts`, pipeline ElevenLabs trong `tools/voice`, Node test runner.

**Spec:** Google Doc `14yQCu0lMjDdfIPTFvboIf3Duddvtake10uoaR3dIbq8` ("Thông tin", sửa lần cuối 22/10/2026 theo comment của người dùng). Comment trong doc: phần 1 "để text vào Ngõ kể"; phần 2 "thêm vào voice"; phần 3+4 "thêm vào phần 'Khám phá thêm' của Ngõ kể". Chuyển nội dung nguyên văn vào repo trước (Task 1), vì doc có thể đổi.

## Global Constraints
- Không bịa lịch sử, nguồn, địa chỉ, giờ. Mọi chữ lấy nguyên từ doc; chỗ doc ghi chưa xác minh phải giữ nguyên lời rào đón ("chưa xác minh", "giờ tham khảo", "ý kiến người viết", "giai thoại dân gian", "46 hoặc 48").
- VI là bắt buộc. EN theo D3: ba ngõ mới chỉ VI (ẩn ở UI EN); Trung Yên giữ EN tối thiểu. Mọi bản dịch EN phải trung thực, ghi chờ người xem lại trong báo cáo.
- Hiển thị: người dùng đã yêu cầu bỏ chữ "mô phỏng"/nguồn gốc khỏi giao diện (đợt cleanup đang dở). Danh mục nguồn APA nằm trong `evidence` của dữ liệu, không in ra UI. Lời rào đón của nội dung (ở trên) vẫn hiển thị, vì đó là nội dung, không phải nhãn nguồn.
- Không thêm dependency, không backend/Q&A engine mới, không restart Metro 8082, không web/PWA, không merge/push/deploy. Commit cục bộ đúng phần sở hữu.
- Q&A của ngõ mới để `qa: []`, hành vi "chưa có dữ liệu" như hiện tại. Không sinh Q&A.
- Voice: chỉ đọc nguyên văn `intro.text`; sinh audio tốn credit ElevenLabs và cần khóa của người dùng, nên chặn bằng cửa duyệt (Task 6).
- Quyền sở hữu: dữ liệu và tài liệu là Codex/W1; FE là Antigravity (đang hết quota, xem D5). Claude chỉ review khi người dùng gọi lại.

## Quyết định của người dùng (chốt 22/10/2026)
| # | Quyết định | Áp dụng trong plan |
|---|---|---|
| D1 | **Đổi Ngõ Trung Yên sang các điểm mới của doc.** | Thay toàn bộ điểm dừng cũ (Phở Sướng, Phở Vui, Bún cá Sâm Cây Si, Bún ngan Nhàn, Miến trộn mực). Điểm mới, theo doc: Đình Trung Yên (số 10), Khu vực chợ Hàng Bè và phố Gia Ngư, Bún cá Sâm Cây Si (số 5), Phở Sướng (24B), Bún ngan Nhàn (11), Phở gà Hương Trà (2). Bỏ Phở Vui và Miến trộn mực (doc không có). Ảnh `pho-suong-1` và `bun-ca-sam-cay-si-1` giữ cho hai điểm tương ứng; điểm khác dùng ảnh thay thế. Vị trí dọc ngõ của các điểm mới chưa kiểm: đặt `alongAlleyMeters: null` cho mọi điểm, giữ polyline OSM làm hình dáng, pin chia đều theo thứ tự. Ghi vào báo cáo: lệch 146 m (OSM) so với "khoảng 200 m" (doc). |
| D2 | OK theo đề xuất. | Ba ngõ mới: điểm dừng = mục "Nên ghé thăm" theo thứ tự "Hành trình đề xuất", không `story`, `summary` lấy từ gạch đầu dòng. Chưa có polyline: Home dùng bố cục pin cố định (Task 8 tùy chọn). |
| D3 | **Không làm tiếng Anh đợt này.** | Ba ngõ mới chỉ có VI; ở giao diện EN các collection này bị ẩn khỏi danh sách (không hiện nội dung Việt lẫn trong UI Anh). Riêng Ngõ Trung Yên đã có EN từ trước: chỉ cập nhật EN tối thiểu cho khớp điểm dừng mới (tên riêng giữ nguyên, `summary` dịch trung thực từ gạch đầu dòng, `intro` dịch từ phần 2), KHÔNG làm EN cho `alleyStory`/`guide`; ở EN các nút/mục đó ẩn. Task 4 rút gọn tương ứng. |
| D4 | OK theo đề xuất. | Nút "Câu chuyện ngõ" trên Home mở thẻ đọc. |
| D5 | **Antigravity đã hồi quota.** | Task 3, 5, 7 giao Antigravity; Codex dispatch. |
| D6 | **Không sinh audio.** Voice Nhật Phong đã lấy về (`cf2168c`). Phần mới chỉ để chừa slot, người khác sinh sau theo `docs/VOICE_GUIDE_FOUR_ALLEYS_20261022.md`. | Task 6 chỉ làm slot trống, script `dry-run` và test fallback; không gọi `generate`, không cần khóa ElevenLabs. |

## File Structure
- `docs/content/FOUR_ALLEYS_SOURCE_20261022.md` (tạo): bản chụp nguyên văn doc, làm nguồn cho dữ liệu. Chủ: Codex/W1.
- `data/localized/ngo-trung-yen.{vi,en}.json` (sửa); `data/localized/ngo-tam-thuong.*`, `ngo-cam-chi.*`, `ngo-phat-loc.*` (tạo): dataset.
- `mobile/src/data/alleyGuide.ts` (tạo): kiểu `AlleyStory`, `AlleyGuide` và hàm đọc an toàn từ dataset. Một file một trách nhiệm.
- `mobile/src/data/collections.ts`, `sourceState.ts`, `mobile/src/i18n/translator.ts` (sửa): đăng ký collection, cho phép trường mới, khóa dịch.
- `mobile/src/screens/HomeScreen.tsx` (sửa): nút và thẻ "Câu chuyện ngõ".
- `mobile/src/components/NotebookDrawerModal.tsx` (sửa) + `mobile/src/components/AlleyGuideSection.tsx` (tạo): mục "Khám phá thêm".
- `mobile/src/voice/alleysCatalog.ts` (tạo), `localizedCatalog.ts` (sửa): track intro 4 ngõ. `tools/voice/elevenlabs_alleys.py` (tạo, theo mẫu `elevenlabs_three_lenses.py`).
- Tests: `mobile/tests/alleyContent.test.mjs`, `alleyGuideSection.test.mjs`, `alleysVoiceCatalogue.test.mjs` (tạo).

## Review Focus
1. Collection không có `guide` (4 collection cũ): mục "Khám phá thêm" ẩn hoàn toàn, không để khung trống.
2. Giờ, địa chỉ, giá chưa xác minh hiển thị như khẳng định: test khẳng định mọi dòng quán có nhãn "giờ tham khảo", và địa chỉ "46 hoặc 48" giữ nguyên chữ.
3. Chữ lớn (`fontScale` 1.3 và 2.0) làm tràn thẻ đọc, bảng quán hoặc nút nghe: phải cuộn được, không cắt chữ.
4. Thiếu file audio hoặc `textHash` lệch: app rơi về đọc chữ, không crash, không phát audio sai nội dung.
5. Bảng 4 cột của doc (quán, địa chỉ, món, giờ) hiển thị trên màn hẹp, và dòng "Chưa xác minh" trống giờ không thành ô trống vô nghĩa.

---

### Task 1: Chụp doc vào repo và chốt schema
**Owner:** Codex/W1 (dữ liệu, tài liệu)

**Files:**
- Create: `docs/content/FOUR_ALLEYS_SOURCE_20261022.md`
- Create: `mobile/src/data/alleyGuide.ts`
- Modify: `mobile/src/data/sourceState.ts` (validator cho dataset)
- Test: `mobile/tests/alleyContent.test.mjs`

**Interfaces:**
- Produces (`alleyGuide.ts`):
  - `type AlleyStory = { title: string; paragraphs: string[]; evidence: string[] }`
  - `type GuideEatItem = { name: string; address: string | null; dishes: string; hours: string | null; note: string | null }`
  - `type GuideVisitItem = { name: string; address: string | null; notes: string[] }`
  - `type AlleyGuide = { eat: GuideEatItem[]; visit: GuideVisitItem[]; route: string[]; caveats: string[]; evidence: string[] }`
  - `readAlleyStory(dataset: unknown): AlleyStory | null` và `readAlleyGuide(dataset: unknown): AlleyGuide | null` (trả `null` nếu thiếu hoặc sai dạng, không ném lỗi).

- [ ] **Step 1: Chép nguyên văn doc** (4 ngõ, 4 phần, bảng, danh mục tham khảo) vào `FOUR_ALLEYS_SOURCE_20261022.md`, ghi ngày chụp và trạng thái comment (một comment còn OPEN). Không chỉnh chữ.
- [ ] **Step 2: Viết test `alleyContent.test.mjs` (fail trước):** `readAlleyGuide({})` là `null`; `readAlleyGuide` với `eat[0].hours` không phải chuỗi/`null` là `null`; dataset hiện có (fiction, old-quarter, ngo-gach) vẫn qua validator `sourceState` khi không có trường mới; dataset có `alleyStory`/`guide` hợp lệ cũng qua.
- [ ] **Step 3: Chạy** `npm test --prefix mobile -- --test-name-pattern=alleyContent`. Dự kiến FAIL (module chưa có).
- [ ] **Step 4: Cài đặt `alleyGuide.ts` và nới validator trong `sourceState.ts`** để chấp nhận hai trường tùy chọn; không đổi cách tính revision của dataset cũ (test so sánh revision của `fiction-letter` trước và sau không đổi).
- [ ] **Step 5: Kiểm backend:** chạy `node backend/src/cli.mjs import-localized --vi data/localized/ngo-gach.vi.json --en data/localized/ngo-gach.en.json` trên DB tạm (không ghi DB chính) và xác định xem trường mới có bị từ chối không. Kết quả đưa vào báo cáo; nếu bị từ chối, KHÔNG sửa backend trong plan này, ghi giới hạn "bản live chưa có phần mới".
- [ ] **Step 6: Chạy lại test, typecheck, lint; commit** `docs+feat(data): source snapshot and alley story/guide schema`.

### Task 2: Dữ liệu VI cho 4 ngõ
**Owner:** Codex/W1

**Files:**
- Modify: `data/localized/ngo-trung-yen.vi.json`
- Create: `data/localized/ngo-tam-thuong.vi.json`, `ngo-cam-chi.vi.json`, `ngo-phat-loc.vi.json`
- Test: `mobile/tests/alleyContent.test.mjs`

**Interfaces:**
- Consumes: `AlleyStory`, `AlleyGuide` (Task 1).
- Produces: `collectionId` mới `ngo-tam-thuong`, `ngo-cam-chi`, `ngo-phat-loc`; mỗi dataset có `intro.text` = đúng phần 2 (lời kể audio) của doc, `alleyStory` = phần 1, `guide` = phần 3+4, `qa: []`.

- [ ] **Step 1: Thêm test** (fail trước): với từng ngõ, `intro.text` bằng đúng đoạn lời kể trong `FOUR_ALLEYS_SOURCE`; `alleyStory.paragraphs` không rỗng; `guide.eat.length` lần lượt 4, 4, 4, 3 (Trung Yên, Tạm Thương, Cấm Chỉ, Phất Lộc); `guide.route` có 4 hoặc 5 bước theo "Hành trình đề xuất"; mỗi dòng `eat` có `hours` là chuỗi chứa "tham khảo" hoặc "theo" hoặc `null`; `qa.length === 0` cho 3 ngõ mới; `kind` KHÔNG là `reviewed`.
- [ ] **Step 2: Viết dữ liệu.** Chuyển bảng "Quán nên thử" thành `guide.eat`, "Nên ghé thăm" thành `guide.visit`, "Hành trình đề xuất" thành `guide.route`. Lời rào đón của doc (ví dụ "Đánh giá về chất lượng món ăn là ý kiến trải nghiệm của người viết…", "giá món năm 2020 không dùng làm giá hiện hành") vào `guide.caveats`. Điểm dừng cho ngõ mới theo D2. Danh mục APA vào `evidence`.
- [ ] **Step 3: Chạy** `npm test --prefix mobile -- --test-name-pattern=alleyContent`. Dự kiến PASS.
- [ ] **Step 4: Commit** `feat(data): four alley datasets vi`.

### Task 3: Đăng ký collection và khóa dịch
**Owner:** Antigravity (FE)

**Files:**
- Modify: `mobile/src/data/collections.ts` (`CollectionId`, `AVAILABLE_COLLECTIONS`, `getBundledDataset`, `COLLECTION_REVISIONS`, `isCollectionId`), `mobile/src/i18n/translator.ts` (tên, tagline, theme, district, VI và EN), `mobile/src/assets/photoMap.ts` (cover tạm).
- Test: `mobile/tests/alleyContent.test.mjs`

**Interfaces:**
- Consumes: dataset từ Task 2 (chỉ VI, theo D3); hàm liệt kê collection theo locale phải ẩn ba id mới khi locale là `en`.
- Produces: 3 id mới trong `AVAILABLE_COLLECTIONS` với `kind: 'simulated'`, `nodeCount` đúng số điểm dừng.

- [ ] **Step 1: Test (fail trước):** mỗi id mới thỏa `isCollectionId`, có trong `getLocalizedCollections('vi')` đúng tên, `COLLECTION_REVISIONS[id]` bằng hash sinh theo đúng cách repo đang dùng.
- [ ] **Step 2: Cài đặt** theo mẫu `ngo-gach` ở commit `4bc7d26`. Cover: ảnh Phất Lộc có sẵn (`ngophatloc_01.jpg`); Tạm Thương và Cấm Chỉ chưa có ảnh nên dùng ảnh thay thế hiện có (người dùng chọn ảnh thật sau, xem việc tự làm).
- [ ] **Step 3: Chạy** toàn bộ test, typecheck, lint. Commit `feat(mobile): register three new alley collections`.

### Task 4: Dữ liệu EN tối thiểu (chỉ Ngõ Trung Yên, theo D3)
**Owner:** Codex/W1

**Files:** Modify `data/localized/ngo-trung-yen.en.json`; Test: `mobile/tests/alleyContent.test.mjs`.

- [ ] **Step 1: Test:** Ngõ Trung Yên: EN và VI cùng số `nodes`, cùng thứ tự id, cùng `startNodeId`; ba ngõ mới vắng ở danh sách EN.
- [ ] **Step 2:** Chỉ sửa `ngo-trung-yen.en.json`: cùng số `nodes`, thứ tự và `startNodeId` với bản VI mới; tên riêng giữ nguyên; `intro.text` dịch trung thực từ phần 2; không thêm `alleyStory`/`guide`. Ba ngõ mới không tạo file EN và phải bị ẩn ở EN (test: `getLocalizedCollections('en')` không chứa `ngo-tam-thuong`, `ngo-cam-chi`, `ngo-phat-loc`). Ghi chờ người xem lại trong báo cáo.
- [ ] **Step 3: Chạy test, commit** `feat(data): ngo trung yen en aligned`.

### Task 5: Thẻ "Câu chuyện ngõ" trên Home (phần 1)
**Owner:** Antigravity (FE)

**Files:** Modify `mobile/src/screens/HomeScreen.tsx`; Create `mobile/src/components/AlleyStoryCard.tsx`; Modify `translator.ts`; Test `mobile/tests/alleyContent.test.mjs` (hoặc `uiFlows.test.mjs` theo mẫu hiện có).

**Interfaces:** Consumes `readAlleyStory(dataset)`. Produces `AlleyStoryCard({ story, onClose }: { story: AlleyStory; onClose: () => void })`.

- [ ] **Step 1: Test:** Home với dataset có `alleyStory` hiển thị nút `testID="home-alley-story"`; chạm nút mở thẻ có đúng `paragraphs`; dataset không có `alleyStory` thì không có nút; nút và nút đóng có vùng chạm ≥44 pt; không làm đổi layout đường mòn hiện có.
- [ ] **Step 2: Cài đặt**; thẻ cuộn được, chữ ≥12 px, hoạt động ở `fontScale` 2.0 (test giả lập `useWindowDimensions`).
- [ ] **Step 3: Test, typecheck, lint, Metro bundle 200 (chỉ đọc); commit** `feat(mobile): alley story card`.

### Task 6: Voice cho 4 ngõ (phần 2) — chỉ chừa slot, KHÔNG sinh audio (D6)
**Owner:** Codex/W1. Người khác sinh audio sau, theo `docs/VOICE_GUIDE_FOUR_ALLEYS_20261022.md`. Giọng Việt là Nhật Phong; voice đã có ở commit `cf2168c` (cherry-pick từ `ngoke-public/feat/nhat-phong-tts`). Không cần khóa ElevenLabs, không gọi API, không thêm MP3.

**Files:** Create `mobile/src/voice/alleysCatalog.ts`, `mobile/tests/alleysVoiceCatalogue.test.mjs`; Modify `mobile/src/voice/localizedCatalog.ts`.

**Interfaces:** Consumes `VoiceTrack` từ `mobile/src/voice/catalog.ts`. Produces `alleysVoiceCatalogues: Record<Locale, { datasetRevision: string; tracks: Record<string, VoiceTrack> }>` cùng dạng `threeLensesVoiceCatalogues`, với `tracks` rỗng ở cả hai locale (slot chờ), và `ALLEY_VOICE_SLOTS: readonly { collectionId: CollectionId; trackId: 'intro'; locale: 'vi'; textSource: 'intro.text' }[]` liệt kê 4 slot VI.

- [ ] **Step 1: Test (fail trước):** `ALLEY_VOICE_SLOTS` đúng 4 slot, `collectionId` đều tồn tại trong `AVAILABLE_COLLECTIONS`; `alleysVoiceCatalogues.vi.tracks` rỗng; việc tra track `intro` của 4 ngõ qua `localizedCatalog` trả `undefined` và UI/phát giọng rơi về chữ, không ném lỗi; các catalogue cũ (Three Lenses, Fiction, Post8) không đổi (so sánh số track và `textHash` hiện có).
- [ ] **Step 2: Cài đặt `alleysCatalog.ts`** và đăng ký trong `localizedCatalog.ts` sao cho collection chưa có track vẫn rơi về chữ như hiện nay.
- [ ] **Step 3: Chạy test, typecheck, lint; commit** `feat(voice): empty narration slots for four alleys`.

### Task 7: Mục "Khám phá thêm" trong Sổ tay (phần 3+4)
**Owner:** Antigravity (FE)

**Files:** Create `mobile/src/components/AlleyGuideSection.tsx`, `mobile/tests/alleyGuideSection.test.mjs`; Modify `mobile/src/components/NotebookDrawerModal.tsx`, `translator.ts`.

**Interfaces:** Consumes `readAlleyGuide(dataset)`. Produces `AlleyGuideSection({ guide }: { guide: AlleyGuide })`; Sổ tay nhận dataset/collection đang chọn qua prop sẵn có `collectionId` và `source`.

- [ ] **Step 1: Test (fail trước):** (a) collection có `guide` thì Sổ tay có mục "Khám phá thêm" (VI) / "Explore more" (EN) với 3 nhóm "Quán nên thử", "Nên ghé thăm", "Hành trình đề xuất"; (b) collection không có `guide` (fiction-letter, old-quarter) thì không có mục và không để khung trống; (c) mỗi quán hiện tên, địa chỉ, món, giờ; giờ `null` hiện "Chưa xác minh giờ"; (d) mọi dòng `caveats` hiển thị; (e) không có nút gọi/đặt chỗ/mở bản đồ (không mở thêm hành động ngoài app).
- [ ] **Step 2: Cài đặt** như một khối cuộn trong modal Sổ tay hiện có (không modal mới, theo bài học Passport); chữ ≥12 px, vùng chạm ≥44 pt, tương thích `fontScale` 2.0.
- [ ] **Step 3: Test, typecheck, lint, Metro 200; commit** `feat(mobile): notebook explore-more section`.

### Task 8 (tùy chọn): Hình dáng ngõ cho 3 ngõ mới
**Owner:** Codex/W1 (dữ liệu), cần D2

- [ ] Lấy polyline OSM cho Tạm Thương, Cấm Chỉ, Phất Lộc theo cách đã làm cho Ngõ Gạch (Overpass, ODbL), ghi `[OSM]`/`[Chưa kiểm]` trong tài liệu, thêm `polyline` và `alongAlleyMeters` vào dataset, test chiều dài hợp lý. Điểm không có tọa độ để `alongAlleyMeters: null` theo `order`.

### Task 9: Nghiệm thu tích hợp
**Owner:** Codex (coordinator)

- [ ] Chạy `npm test`, typecheck, lint, `git diff --check`; Metro 8082 bundle iOS và Android trả 200 (chỉ đọc).
- [ ] `node tools/voice/...audit` nếu đã sinh audio. Cập nhật `MEMORY.md`, `docs/reviews/2026-10-22-four-alleys.md` với phần chưa kiểm trên máy thật.
- [ ] Chỉ gọi Claude review khi người dùng yêu cầu.

## Tiền điều kiện (chặn mọi task FE)
Cây làm việc còn nhiều thay đổi chưa commit của đợt cleanup "bỏ chữ mô phỏng/nguồn" và Landing redesign (17 file sửa, `git status`). Lúc 22/10 sau khi đưa voice Nhật Phong về (`cf2168c`), em đo lại: `npm test` 340/340 đạt, typecheck sạch, lint sạch, `git diff --check` không lỗi khoảng trắng. Chưa có review độc lập cho bản cleanup hoàn chỉnh. Codex cần commit hoặc chốt phần chưa commit này trước Task 3, 5, 7 vì cùng file (`translator.ts`, `NotebookDrawerModal.tsx`, `HomeScreen.tsx`).

## Việc người dùng tự làm
- Chọn ảnh cho Tạm Thương, Cấm Chỉ (hiện dùng ảnh thay thế); ảnh Google Maps vẫn chờ quyết định cách nhúng và quyền.
- Đi thực địa kiểm giờ mở cửa, địa chỉ và quán còn hoạt động; đặc biệt Đình Trung Yên (lịch mở), đền Tiên Hạ (số 46 hay 48), Xôi Hồng, Bún đậu Trung Hương.
- Nghe thử audio sau khi sinh (chưa duyệt phát âm) và quyết định có đưa vào bản giao hay không.
- Giải quyết comment còn mở trong doc sau khi thấy phần "Khám phá thêm" trong app.

## Self-review
- Phủ yêu cầu: phần 1 → Task 2 và 5; phần 2 → Task 2 (`intro.text`) và 6; phần 3+4 → Task 2 và 7; 4 ngõ trong doc đều có dữ liệu (Task 2) và EN (Task 4).
- Nhất quán kiểu: `AlleyStory`, `AlleyGuide`, `readAlleyStory`, `readAlleyGuide` định nghĩa ở Task 1 và dùng đúng tên ở Task 2, 5, 7.
- Lỗ hổng đã biết: UI vị trí phần 1 (D4) và việc nhúng ảnh chưa chốt; backend live chưa chắc nhận trường mới (Task 1 step 5).
