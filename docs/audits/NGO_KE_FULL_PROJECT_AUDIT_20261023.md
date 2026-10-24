# Ngõ Kể — Full Project Deep Audit & Technical Handoff

Ngày audit: 23/10/2026 (Asia/Saigon). Workspace: `D:\ngo_ke`.

## 1. Executive Summary

Audit chỉ đọc trên nhánh **valentino/logic-fix-mobile-20261020**, HEAD **4af64c49a4ada47f952ddf76c35adfb90f826224**. Đây là snapshot source, không phải nghiệm thu thiết bị hay phê duyệt nội dung.

Ngõ Kể hiện là app native Expo/React Native có **8 collection**, tương ứng một truyện hư cấu, hai tuyến phố cổ dùng chung ba địa điểm, và năm ngõ mới. Có **29 lượt node theo collection / 26 node ID khác nhau**, **46 Q&A mỗi ngôn ngữ**, **198 static MP3 references** và **382 MP3 vật lý**. Không nên đồng nhất collection với một ngõ địa lý, node với chapter, hay file MP3 với audio đang được UI sử dụng.

Các luồng lựa chọn ngõ, sơ đồ điểm dừng, kể chuyện, Q&A cố định, gợi ý lịch trình, QR/GPS có xác nhận, đổi VI/EN, audio và STT gateway đã có implementation. Chất lượng giữa các collection chưa đồng đều: năm ngõ mới đều có Q&A rỗng; Ngõ Gạch thiếu alleyStory/guide/intro audio; nhiều node không có ảnh riêng; ba ngõ mới hoàn toàn thiếu tọa độ. Phần lịch sử có ít nhất hai nhóm mâu thuẫn cần giải quyết trước khi duyệt lại nội dung và tạo lại TTS.

Kết quả kiểm tra thực chạy:

- Mobile: **390 tests, 389 PASS, 1 FAIL, 0 skipped**. Failure tại mobile/tests/nodeStoryVoiceCatalogue.test.mjs:61 là raw source-file hash khác do LF/CRLF: cả 34 entry đều khớp khi chuẩn hóa LF. Không được báo 390/390 trên checkout này; cũng chưa có bằng chứng 34 story audio stale.
- Backend config + E2E guards thuần: **35/35 PASS**. Không chạy các backend/HTTP tests tạo SQLite hoặc temp files.
- TypeScript noEmit, ESLint no-cache và git diff --check: đạt.
- 198 đường dẫn MP3 trong static catalogues đều tồn tại; 354 bản ghi manifest có đường dẫn cụ thể đã khớp audio SHA-256. 28 entry Nhật Phong Three Lenses dùng manifest không có trường path, chưa được kiểm độc lập bằng cùng phép nối path đó.
- Không có ffprobe trong PATH của phiên audit. Chưa chạy decode/thời lượng độc lập, chưa nghe audio, chưa thao tác app trên Android/iPhone trong lượt này.

**Verdict: NEEDS_ADDITIONAL_AUDIT.** Báo cáo đủ làm đầu vào lập kế hoạch có giới hạn; chưa đáp ứng tuyên bố đã đọc toàn bộ source/docs hoặc đã audit runtime toàn diện. Phần 2 và phụ lục ghi rõ coverage để phiên tiếp nối không phải đoán.

## 2. Audit Scope & Coverage

### 2.1 Phạm vi và kỷ luật thực thi

Chỉ tạo báo cáo này và thư mục cha. Không sửa source, dữ liệu, UI, audio, database, MEMORY.md hay .gitignore. Không checkout/pull/reset/stash/commit/merge/push, không build/export/generate, không gọi ElevenLabs, không đọc giá trị .env.local. Không gọi Claude hoặc worker khác.

Sandbox ban đầu lỗi khởi tạo: “helper_unknown_error: setup refresh had errors”. Các lệnh đọc/kiểm tra sau đó chạy bằng quyền thực thi bổ sung. Không có yêu cầu nào bị auto-review từ chối. Lỗi khởi tạo không được tính là lỗi sản phẩm.

Baseline trước audit: Git chỉ báo hai nhóm untracked có sẵn: .agents/ và mobile/.cache/. Báo cáo không sở hữu và không xử lý chúng. Đề xuất “Sol High” trong brief không chứng minh model thực thi đã được chuyển; không tự đổi model.

### 2.2 Kiểm kê

Trước khi thêm báo cáo: **1.410 files, 113 directories**. Directory count tính cả workspace root, không tính các nhánh bị prune. Phụ lục cuối báo cáo liệt kê đường dẫn/byte của snapshot được kiểm kê.

Prune trước khi đi sâu: .git, mobile/node_modules, mobile/.expo, mobile/.cache, mobile/dist, tools/voice/.cache, tools/voice/__pycache__; đồng thời đặt quy tắc loại build/dist/venv/vendor nếu gặp. Không đọc dependency source hoặc binary như văn bản.

| Nhóm | Files | Cách kiểm |
| --- | ---: | --- |
| Root | 6 | Config/README đọc; AGENTS dùng chỉ dẫn được cung cấp; MEMORY đọc phần hiện hành, không đọc hết lịch sử |
| .agents | 6 | Inventory; đọc đầy đủ 4 skill content/heritage/voice/UX |
| agent_docs | 630 | Inventory; testing và một số evidence/header được đọc; phần lớn bằng chứng cũ chưa mở |
| backend | 17 | Đọc toàn bộ 5 source + 2 migration + package/README; test suite inventory/IO scan, config test đọc/chạy |
| data | 20 | Parse 16 dataset đang dùng, 7 cặp V2; đọc trọn intro/story VI/EN của 17 node mới; draft/companion inventory và structural query |
| docs | 122 | Inventory; chọn source ledger, nghiên cứu ngõ, báo cáo mới nhất; nhiều tài liệu lớn chỉ đọc một phần |
| mobile | 553 | Inventory; entry/config, registry, resolver, Q&A và nhiều nhánh screen/hook được đọc; chưa đọc trọn mọi style/component/test |
| tools | 56 | Inventory; đọc các guard/pipeline nhắm mục tiêu; nhiều script lịch sử mới chỉ scan cấu trúc |

Mobile/src có **65 files / 643.890 bytes**; mobile/tests **38 / 789.752 bytes**. Backend/src **5 / 24.843 bytes**, backend/tests **5 / 35.920 bytes**. tools **56 / 624.301 bytes**. docs **122 / 2.222.393 bytes**. Assets mobile **434 / 143.962.006 bytes**. agent_docs **630 / 700.825.906 bytes**, phần lớn là evidence chụp.

### 2.3 Coverage đọc và giới hạn

Đọc đầy đủ, không chỉ tên file: backend/src/*.mjs, backend/migrations/*.sql; mobile/src/voice/localizedCatalog.ts, mobile/src/assets/photoMap.ts, mobile/src/location/nearest.ts, mobile/src/qr/parseQr.ts, mobile/src/qr/confirmPoint.ts, mobile/src/qa/match.ts, mobile/src/voice/transcribe.ts, mobile/src/data/localeStorage.ts, mobile/src/data/alleyGuide.ts; các test catalogue node story/intro; root/package/Expo config liên quan.

Đọc theo đoạn có line number: App.tsx; collections.ts; sourceState.ts; live.ts; Qa/Home/Landing/AlleySelect/Camera/Location; NotebookDrawerModal, Passport, Postcard, trail; useVoiceSession; generator node/intro; gateway; các báo cáo/source ledger. Một số lần xuất tool bị truncate; những phần bị cắt **không được coi là đã đọc**.

Chưa đọc đầy đủ: mọi JSX/style của tất cả screen/component; toàn bộ translator; toàn bộ 38 test mobile và 5 test backend; phần lớn script voice lịch sử; lockfile từng entry; PRD/TechDesign toàn văn; lịch sử MEMORY; mọi evidence XML/PNG; toàn bộ VOICE_TEST_REPORT và VOICE_HANDOFF. Không có ngo_ke.docx hoặc PDF trong inventory workspace được phép duyệt.

Đã dùng skill content-management, heritage-fact-check, voice-tts-quality, mobile-ux-qa để phân biệt kiểm kỹ thuật, duyệt nguồn, nghe thủ công và thiết bị. Một số chỉ dẫn skill lệch nhánh: content/alleys/catalog.json, tools/content.mjs, generatedContentRegistry.ts và docs/CONTENT_MANAGEMENT.md **không tồn tại**. Không tạo hệ thống đó hoặc chạy lệnh dựa trên nó. Skill voice mô tả pipeline data/demo.json cũ; source hiện tại có nhiều catalogue và ElevenLabs.

## 3. Repository Structure

| Directory | Purpose | Key Files | Dependencies | Status |
| --- | --- | --- | --- | --- |
| Root | Hướng dẫn, trạng thái, ignore | AGENTS.md, MEMORY.md, README.md, REVIEW-CHECKLIST.md | Con người/quyền triển khai | Tài liệu hiện hành xen lịch sử |
| mobile | Native application | index.ts, App.tsx, app.json, package.json | Expo 57, RN 0.86, React 19 | Implementation có test; native chưa audit lại |
| mobile/src/screens | 10 screens | Prologue, Landing, AlleySelect, Home, Qa, Plan, Camera, Location, Unavailable, Placeholder | Navigation/context/data/voice | Một số screen rất lớn |
| mobile/src/components | 15 files, gồm component và evidence parser | ToolDock, Notebook, Passport, StoryCard, VoicePlayerBar | React Native, SVG, i18n | UI và lifecycle mock-tested |
| mobile/src/data | Validation, bundle registry, Live adapter | collections.ts, sourceState.ts, live.ts | data/, canonicalJson, translator | Shared contract với backend |
| mobile/src/voice | Catalogue + recorder/player/STT lifecycle | localizedCatalog.ts, useVoiceSession.ts | expo-audio, crypto, filesystem | 198 MP3 references; provenance không đồng nhất |
| backend | Read API + import CLI + SQLite | src/app.mjs, database.mjs, cli.mjs | Node 24 built-ins; mobile validation TS | Chỉ một localized publication pair |
| data | Nội dung được bundle và authoring data | demo.json, localized/, journeys/, drafts/ | Registry, backend import, voice | 16 runtime locale datasets |
| docs | Specs, ledgers, reports, handoffs | POST8*, THREE_LENSES*, reviews/, content/ | Quyết định sản phẩm | Nhiều trạng thái cũ bị source vượt qua |
| agent_docs | Hướng dẫn + evidence cũ | testing.md, phase_*; evidence/ | Emulator/dev environment | Không chứng minh current HEAD |
| tools/e2e | Harness thuần, HTTP và ADB flows | guards.test.mjs, native-flow.mjs | Node; ADB/Metro cho native | Không chạy harness sinh output |
| tools/voice | Offline generation, historical probes, STT service | generate_node_stories.py, generate_alleys_intro.py, gateway/ | Python, FFmpeg, provider/model môi trường | Không chạy generator |
| content | Không tồn tại | — | — | Skill catalog lệch nhánh |

Root không có package.json/workspace orchestrator. Mobile và backend có package-lock riêng. Backend không có runtime npm dependency. Native binary/build folders không thuộc source cần đọc trong audit này.

## 4. Project Overview

Sản phẩm thực tế là trải nghiệm khám phá dựa trên nội dung biên soạn trước. App không sinh câu trả lời tự do. Storytelling có ba lớp khác nhau:

1. Truyện hư cấu “Bức thư cuối ngõ”: sáu node, mỗi node là một chương.
2. Hai collection phố cổ: cùng Bạch Mã/Mã Mây/Đồng Xuân; Three Lenses có companion để tách năm chương kể qua ba node, thêm đoạn nối/kết.
3. Năm ngõ mới: story trên từng node; bốn ngõ có thêm bài đọc tổng thể alleyStory và guide; không có Q&A.

Demo đọc bundle, kể cả một số dataset kind=reviewed. “Demo” là chế độ phân phối, không đồng nghĩa mọi văn bản là hư cấu; “reviewed” trong JSON là metadata quy trình, không tự chứng minh khảo sát, giấy phép hay duyệt nghe.

Live đọc publication backend, không mặc nhiên cung cấp tám collection như Demo. Code đang triển khai nhiều hơn mô tả MVP/README lịch sử. Không có bằng chứng phát hành store hoặc hosting production từ lượt audit này.

## 5. Complete Feature Inventory

Nhãn IMPLEMENTED_AND_TESTED bên dưới nghĩa là có implementation và kiểm tra host trong lượt này; không có nghĩa native hardware đã đạt.

| # | Feature; purpose / user flow | Source / data / API | Status | Tests và giới hạn |
| --- | --- | --- | --- | --- |
| F01 | Prologue mở trải nghiệm → Landing | PrologueScreen, App, local WAV | IMPLEMENTED_AND_TESTED | uiFlows/motion; âm thanh/chữ thật chưa nghe/nhìn |
| F02 | Landing carousel → chọn collection → Home | LandingScreen, collections, getBundledDataset | IMPLEMENTED_AND_TESTED | landing/home tests; 8 collection VI/EN |
| F03 | Danh sách ngõ, search/filter | AlleySelectScreen, normalizeQuestion | IMPLEMENTED_AND_TESTED | UI mock tests; địa giới/tên nhãn cần review |
| F04 | Sơ đồ ngõ và chọn node | HomeScreen, alleyGeometry, AlleyTrailView | IMPLEMENTED_AND_TESTED | geometry/large-font mocks; SVG là sơ đồ, không navigation map |
| F05 | Chủ đề + quỹ thời gian → tối đa 3 điểm | PlanScreen, recommendation/pick.ts | IMPLEMENTED_AND_TESTED | recommendation tests; visitMinutes là gợi ý biên tập |
| F06 | GPS một lần → candidate → xác nhận | LocationScreen, nearest.ts, expo-location | PARTIAL | Thuật toán pass; thiếu tọa độ nhiều node, không đo GPS thật |
| F07 | Kể story node → đọc/nghe, previous/next | QaScreen, dataset.nodes[].story | IMPLEMENTED_AND_TESTED | story UI/resolver tests; nội dung mới chưa đạt editorial |
| F08 | Chapters/transition/closing | threeLensesCompanion, journeys/*.json | PARTIAL | Companion chỉ demo đúng collection/revision; không mở cho mọi Live |
| F09 | alleyStory bài đọc riêng | HomeScreen, AlleyStoryCard, readAlleyStory | IMPLEMENTED_AND_TESTED | 4 collection có; Gạch và legacy không có field |
| F10 | Audio narration local | catalogues, localizedCatalog, useVoiceSession | PARTIAL | 198 static refs tồn tại; 16 pilot VI khác voice mục tiêu; chưa nghe/native |
| F11 | Q&A exact/alias có nguồn | QaScreen, qa/match.ts, qa[] | IMPLEMENTED_AND_TESTED | Logic matcher pass; 5 ngõ mới 0 QA; không có chatbot |
| F12 | Follow-up câu đã biên soạn | QaScreen.followUpEntries, followUps[] | IMPLEMENTED_AND_TESTED | Kiểm reference; không có follow-up nếu dataset không QA |
| F13 | Voice input/STT → fixed intent/Q&A | VoiceInteractionDock, useVoiceSession, transcribe, gateway | PARTIAL | Unit lifecycle/transcript pass; gateway không khởi động trong audit; cần LAN/model |
| F14 | Sổ tay công cụ và guide | NotebookDrawerModal, AlleyGuideSection | PARTIAL | Có guide 4 ngõ; phát hiện fallback bundle trong Live empty/error |
| F15 | Passport hình dung bộ sưu tập | AlleyPassportModal | PARTIAL | Hiển thị stamp mẫu; không phải nhật ký check-in bền vững |
| F16 | Postcard điểm dừng | PostcardCard, photoMap | IMPLEMENTED_AND_TESTED | Card UI, không có bằng chứng chức năng xuất/gửi bưu thiếp |
| F17 | Camera/QR → pending → confirm | CameraScreen, confirmPoint, parseQr | PARTIAL | Parser/manual pass; chưa quét QR vật lý trong audit |
| F18 | VI/EN và nhớ lựa chọn locale | LocaleContext, translator, localeStorage | IMPLEMENTED_AND_TESTED | 16 locale datasets parse; semantic parity vẫn có điểm lệch |
| F19 | Demo/Live toggle + cancel/retry | App, live.ts, sourceState | PARTIAL | Adapter/mode tests pass; drawer có lỗ hổng isolation |
| F20 | Backend dataset/health/ready | backend/src, /api/* và /api/v2/* | IMPLEMENTED_NOT_VERIFIED | Config pass; HTTP/DB không chạy vì cấm tạo DB/temp |
| F21 | Empty/error/unavailable recovery | UnavailableScreen, SourceState, retryLive | IMPLEMENTED_AND_TESTED | Mock tests; không được ẩn lỗi tải thật theo yêu cầu ẩn QA |
| F22 | Offline bundle text/audio/photos | Static JSON imports và requires | PARTIAL | Dữ liệu local có; chưa chứng minh cold launch airplane mode; STT cần gateway |

DOCUMENTED_ONLY: các kế hoạch phase cũ hoặc mở rộng chưa nối runtime không được gộp thành feature hiện tại. DATA_ONLY: drafts và ảnh/MP3 không được reference không phải tính năng hoàn tất. Không đủ bằng chứng xếp toàn app BROKEN do một test provenance fail.

## 6. Architecture & Data Flows

~~~mermaid
flowchart TD
  D[data/demo + localized JSON] --> R[collections.ts: getBundledDataset]
  R --> V[sourceState.ts: parseAnyDataset]
  B[SQLite publication_v2] --> API[backend/app.mjs: GET v2 dataset]
  API --> L[live.ts: loadLiveSourceV2]
  L --> A[App.tsx: SourceState + locale + mode]
  V --> A
  A --> S[Home / Qa / Plan / Camera / Location]
  J[journeys: Three Lenses companion] --> C[getScopedCompanion]
  C --> S
  S --> Q[qa/match.ts: exact question/alias]
  S --> VR[localizedCatalog.ts: collection + locale + revision + contentId]
  VR --> P[useVoiceSession: textHash + kind/node guards]
  P --> AU[expo-audio static MP3]
  MIC[Microphone] --> REC[useVoiceSession recorder]
  REC --> TX[transcribe.ts multipart]
  TX --> GW[private Node gateway + Python Whisper]
  GW --> INT[QaScreen: parseVoiceIntent / findAnswer]
  PH[photoMap.ts] --> S
  GPS[expo-location one-shot] --> NEAR[nearest.pickCandidate]
  NEAR --> CONF[User confirms node]
  CONF --> A
~~~

Trace và ownership:

- Content → registry → screen: collections.ts:7–23 import JSON; getBundledDataset:187–213 chọn locale; App.tsx:180–184 chọn demo/live; QaScreen:185–186 lấy node và lọc Q&A.
- Text → catalogue → player: QaScreen:253–260 tạo contentId node-story; :411–424 lookup; localizedCatalog.ts:25–46 xếp ưu tiên catalogue và đòi revision; useVoiceSession.ts:435–482 kiểm kind/node/hash rồi phát.
- Voice → STT → answer: useVoiceSession ghi tệp tạm; transcribe.ts:13–21 gửi audio + turn/locale/node/mode/revision; :53–58 kiểm response; QaScreen:473–521 nhận intent/Q&A. Không có LLM.
- GPS → selection: LocationScreen.readPosition gọi permission và getCurrentPositionAsync; nearest.ts:55–85 chọn một node available có tọa độ; chỉ confirm cập nhật App.confirmNode. Không có tự tìm ngõ toàn thành phố.
- Images → UI: photoMap.getNodePhoto:244–255 ưu tiên photoKey/Three Lenses/node mapping; thiếu mapping trả HERO_PHOTO. Home/Qa/Camera/Location/Postcard dùng resolver này.

Coupling: backend import trực tiếp TypeScript validator/canonicalizer từ mobile/src; validator lại import translator và matcher. Điều này giúp tránh hai schema khác nhau nhưng backend bị ràng buộc cấu trúc thư mục mobile. Node 24 phải hỗ trợ chạy TS kiểu đang dùng; không thể tách thư mục backend đem deploy độc lập mà bỏ mobile/src.

Duplicate/hardcoded state: collection metadata trong collections.ts, ALLEY_LIST trong photoMap.ts, i18n keys, các revision pins và nhiều catalogue. ALLEY_LIST có slugs/counts cũ như phat-loc/tam-thuong/cam-chi/hang-chi không bằng collection IDs hiện hành. Không kết luận tất cả dòng legacy đều đang hiện UI; phải theo call site.

## 7. Mobile Technical Analysis

Stack được pin trong mobile/package.json: Expo ~57.0.30, React 19.2.3, RN 0.86.3, React Navigation native/native-stack, expo-audio/camera/location/crypto/file-system, SVG. Không thấy Redux/Zustand; state ở App/context/hook. Không xác minh phiên bản registry mới nhất vì đây là audit lock/source hiện có, không tư vấn nâng dependency.

Entry index.ts → App → LocaleProvider / MotionProvider / SafeAreaProvider / NavigationContainer / native Stack. App giữ mode, collectionId, locale, currentNodeId, confirmedNodeId, readNodeIds và planDraft. Đổi collection/mode reset tiến trình; locale được giữ node logic và hủy dữ liệu live locale cũ. Locale là phần đã có persistent storage; không có bằng chứng passport/progress người dùng được lưu qua restart.

Screens phối hợp điều hướng, data và audio ngay trong cùng file. QaScreen 1.530 dòng / khoảng 62KB, Home 1.075 dòng, Prologue 992 dòng / khoảng 36KB, translator 66KB; kích thước này là nợ bảo trì, không tự là bug. Hook voice 570 dòng gom recorder state, timeout, cleanup, upload, hash và playback.

App.tsx:133–171 dùng AbortController cùng guards locale/mode/collection/liveRevision để bỏ response cũ. live.ts có deadline cả fetch/body/digest và giới hạn 512KiB. Nhánh API v2 chỉ truyền locale: **không có collection selector trong URL**. Thay collection trên mobile không làm backend phục vụ thêm collection.

Q&A lọc node trước khi match; unknown trả trạng thái unknown. Một điểm cần đọc sâu hơn: QaScreen:268–271 fallback chapterQa rỗng về nodeQa, nên nếu tương lai một chapter cố ý không có QA thì có thể hiện QA của chapter khác cùng node. Chưa có ca dữ liệu hiện tại chứng minh lỗi này.

Home intro player và Qa player là hai implementation riêng. HomeScreen:131–149 bắt lỗi kiểu “best effort”, không hiển thị trạng thái lỗi rõ như useVoiceSession; cần native failure test. Home intro không có bước hash text runtime giống Qa, dù revision guard đã giảm rủi ro.

Asset loading dùng static require, không tải ảnh/audio từ website khi mở node. Metro watchFolders thêm ../data. Không có map SDK/tile engine trong dependencies: đường ngõ là SVG từ geometry hoặc layout giả lập. Không được gọi sơ đồ đó là bản đồ dẫn đường chính xác.

## 8. Backend Technical Analysis

Đọc đầy đủ 5 source file và 2 migrations.

| Thành phần | Hành vi thực tế | Bằng chứng |
| --- | --- | --- |
| server.mjs | Kiểm DB tồn tại + migrated; bind config; shutdown signal | :8–29 |
| config.mjs | Node server mặc định 127.0.0.1:8086; DB_PATH dưới backend; simulated ẩn | :6–17 |
| app.mjs | GET-only, headersTimeout/requestTimeout 10s, maxHeader 8192 | :22–27 |
| /api/health | SELECT 1; chỉ kiểm connection, không kiểm dữ liệu sẵn sàng | app:80–87 |
| /api/ready, /api/dataset | V1; không nhận query | app:76–107 |
| /api/v2/ready, /api/v2/dataset | Chính xác một locale=vi/en; không nhận collectionId | app:38–74 |
| database.mjs | node:sqlite, WAL, foreign keys, 3s busy timeout; transactions | :8–12, :140–190 |
| cli.mjs | setup/migrate/seed/import/import-localized; backup trước thay pair | :39–105 |
| publication_v2 | locale là primary key; toàn DB có một cặp locale publication | migration 002:1–7 |

V1 dùng bảng dataset singleton + nodes + qa. V2 lưu canonical payload JSON cùng SHA256, locale, collection_id và imported_at. Read kiểm đủ hai locale, digest, canonical JSON, schema và pair; lỗi trả bounded error. Thay pair xóa hai row cũ trong một transaction, không phải catalog đa ngõ.

CLI V2 kiểm UTF-8 fatal và tối đa 512KiB mỗi input; cùng pair là no-op; thay khác cần --replace và backup. V1 reviewed import cần --reviewed. V2 metadata reviewed không đồng nghĩa đã có chữ ký/phê duyệt của người dùng; backend README:24 nói rõ giới hạn đó.

Không có authentication hoặc write HTTP endpoint; đây là read API nội bộ. LAN access phải cấu hình host. STT gateway là service khác dưới tools/voice/gateway, không được gộp thành backend/src có voice endpoint.

Chưa mở hoặc sửa DB thật; inventory không thấy backend/var database dưới phần workspace được duyệt. Không khởi động server nên readiness/publication hiện tại là UNKNOWN, không được suy “đã published” từ JSON trong bundle.

## 9. Complete Alley/Collection Inventory

Tên dưới đây mô tả sản phẩm; cần dùng i18n registry khi hiển thị đầy đủ tên EN. Mọi collection đều có dữ liệu VI/EN trong bundle. “Coordinates” chỉ đếm số node có numeric lat/lon, không xác nhận đã đo.

| Collection ID | Tên VI / EN khái quát | Dataset | Nodes / QA mỗi locale | alleyStory / guide | Coordinates | Content kind và mức hoàn thiện |
| --- | --- | --- | --- | --- | --- | --- |
| fiction-letter | Bức thư cuối ngõ / The letter story | data/demo.json + fiction.en.json | 6 / 21 | Không / Không | 6/6 simulated | Truyện hư cấu; chức năng hoàn chỉnh hơn nhóm mới; nghe/native pending |
| old-quarter-pilot | Phố cổ Hà Nội / Hanoi Old Quarter pilot | old-quarter.vi/en.json | 3 / 9 | Không / Không | 2/3 | reviewed metadata; 16 VI audio khác target voice |
| old-quarter-three-lenses | Ba lát cắt phố cổ / Three lenses on the Old Quarter | three-lenses.vi/en.json + journeys | 3 / 16 | Companion 5 chapters / Không | 2/3 | reviewed metadata; 3 transitions + closing; companion demo-only |
| ngo-gach | Ngõ Gạch / Gạch Alley | ngo-gach.vi/en.json | 5 / 0 | Không / Không | 5/5 | simulated nghiên cứu; 128m polyline; 3 café chỉ có vị trí |
| ngo-trung-yen | Ngõ Trung Yên / Trung Yên Alley | ngo-trung-yen.vi/en.json | 5 / 0 | 4 paragraphs / Có | 2/5 | simulated; 146m geometry; mâu thuẫn ranking/temple naming |
| ngo-tam-thuong | Ngõ Tạm Thương / Tạm Thương Alley | ngo-tam-thuong.vi/en.json | 2 / 0 | 4 paragraphs / Có | 0/2 | simulated; Yên Thái và Vọng Tiên là hai node; Vọng Tiên ngoài ngõ |
| ngo-cam-chi | Ngõ Cấm Chỉ / Cấm Chỉ Alley | ngo-cam-chi.vi/en.json | 3 / 0 | 5 paragraphs / Có | 0/3 | simulated; artwork/Hội Vũ/Vọng Tiên; mở rộng lân cận |
| ngo-phat-loc | Ngõ Phất Lộc / Phất Lộc Alley | ngo-phat-loc.vi/en.json | 2 / 0 | 5 paragraphs / Có | 0/2 | simulated; Tiên Hạ + branches; có lỗi địa danh/niên đại đáng kể |

Nguồn đọc runtime là collections.ts, không có content/alleys registry trên nhánh này. data/drafts/alleys-ngo-gach-trung-yen.draft.json là draft, không phải collection thứ chín. ALLEY_LIST có “Hàng Chỉ” nhưng không có dataset trong AVAILABLE_COLLECTIONS: không tính là ngõ hoàn tất hoặc tính năng broken nếu không có route hiện hành.

Tất cả 17 node mới có story không rỗng ở cả hai ngôn ngữ và caption. Năm ngõ mới không có follow-up vì không có QA. Bốn ngõ có intro riêng và guide chứa eat/visit/route/caveats/evidence. Ngõ Gạch vẫn có intro text dù thiếu intro audio và bài đọc tổng thể.

Published data: chưa truy vấn DB thật. Các field kind/reviewStatus/updatedAt chỉ được đọc, không được audit này nâng trạng thái duyệt. Nội dung mới có audio không có nghĩa đã được nghe hoặc được chấp nhận lịch sử.

## 10. Content Quality Assessment

### 10.1 Kết luận biên tập

Các đoạn mới có ưu điểm là công khai thiếu nguồn và gọi đúng truyền thuyết; nhưng nhiều story dành phần lớn thời lượng giải thích giới hạn nghiên cứu thay vì kể một chi tiết về điểm. Việc lặp “mình chưa tìm được nguồn”, “dữ liệu tuyến”, “không khẳng định” giúp tránh bịa, song người nghe gần như đang nghe nhật ký audit. Cần biên tập theo từng node sau khi xác định điều gì được hỗ trợ; không bỏ caveat bằng cách biến câu chưa rõ thành fact.

Bảng dưới là đánh giá editorial trong audit này, **không đổi approval status**. Story được đọc trọn VI/EN của cả 17 node; caption/guide/evidence đã parse nhưng chưa đối chiếu toàn văn từng guide item với website.

| Nội dung | Classification | Dẫn chứng và lý do | Hướng xử lý đề xuất |
| --- | --- | --- | --- |
| Fiction 6 chapters | KEEP, có điều kiện | data/demo.json; hư cấu có nhãn; chưa đọc lại toàn văn VI/EN trong lượt này | Giữ nhãn và kiểm thiết bị; không dùng làm chứng cứ lịch sử |
| Pilot 3 nodes | REQUIRES_SOURCE_VERIFICATION | old-quarter.*; ledger POST8 có nguồn và cảnh báo niên đại | Đối chiếu ledger, không mặc định full reapproval |
| Three Lenses | REQUIRES_SOURCE_VERIFICATION | 5 chapters/16QA có companion và authoring/source docs | Cần full semantic VI/EN review ở phần audit tiếp |
| Gạch: 3 café | MAJOR_REWRITE / MISSING_CONTENT | “Dữ liệu hiện có chỉ ghi vị trí…”; “chưa có nguồn riêng…” ở ngo-gach.* nodes | Chốt đây là waypoint hay điểm storytelling; bổ sung chứng cứ trước viết |
| Gạch: Thanh Hà | MINOR_REVISION + REQUIRES_SOURCE_VERIFICATION | VI nói lễ hội tháng IV/IX; EN bổ sung ngày 4 và 15, ngo-gach.en.json:75 | Hai locale cùng độ chi tiết đã xác minh; giữ legend là legend |
| Gạch: Cầu Đông | MINOR_REVISION | “Bài báo xác nhận địa chỉ… nhưng không xác nhận… sát đầu tây” | Tách thông tin vị trí cần kiểm khỏi nhịp kể; chưa hứa lối đi |
| Trung Yên: intro/story/guide | MAJOR_REWRITE + REQUIRES_SOURCE_VERIFICATION | intro và caption khẳng định ranking 2008; node đình lại từ chối khẳng định | Xác định đúng đối tượng Đền/Đình rồi thống nhất mọi bề mặt |
| Trung Yên: Phở Sướng, Sâm | MINOR_REVISION | Nguồn báo chí được quy về thời điểm; nhiều câu meta lặp | Giữ attribution, giảm trùng lặp sau duyệt |
| Trung Yên: Ngan Nhàn | REQUIRES_SOURCE_VERIFICATION | Nhận xét phục vụ/xếp hạng/chờ hơn giờ từ bài cũ | Ghi tuổi nguồn và cân nhắc giá trị đối với trải nghiệm hiện tại |
| Trung Yên: Hương Trà | MISSING_CONTENT | “chỉ nêu tên trong tuyến…”; chưa nguồn cụ thể | Xác minh cửa hàng và vai trò điểm trước mở rộng |
| Tạm Thương: Yên Thái | MINOR_REVISION | Thờ Ỷ Lan, distinction năm xếp hạng/năm xây đã giữ | Đối chiếu primary record, kiểm lịch mở |
| Tạm Thương: Vọng Tiên | MINOR_REVISION | Gọi rõ truyền thuyết và ở Hàng Bông | Gắn nhãn điểm lân cận, không nhận nằm trong ngõ |
| Cấm Chỉ: art space | MINOR_REVISION | Phân biệt tên ngõ và chỉnh trang 2025 | Kiểm source/ảnh thực tế, tránh mô tả cảnh đang thấy |
| Cấm Chỉ: Hội Vũ | MAJOR_REWRITE | Lặp giải thích truyền miệng và “không kể thêm…” | Xác định chi tiết đáng kể có nguồn và vị trí ngoài ngõ |
| Cấm Chỉ: Vọng Tiên | MAJOR_REWRITE | Kết “Câu chuyện đền đã kể ở chặng Tạm Thương” | Không giả định người dùng đã đi collection khác |
| Phất Lộc: Tiên Hạ | MAJOR_REWRITE + REQUIRES_SOURCE_VERIFICATION | Gộp quê Thái Bình với Nguyễn Trung Ngạn; Nguyễn Siêu soạn năm 1886 | Xử lý nhầm chủ thể/niên đại trước sửa chữ và audio |
| Phất Lộc: branches | MAJOR_REWRITE | Phần lớn là thông tin chưa kiểm và phủ định giao điểm | Chốt đây là mô tả tuyến hay story; khảo sát trước hướng đi |

### 10.2 Hai kiểm chứng nguồn ngoài có tác động lớn

**Trung Yên:** dataset VI intro:8 và caption:89 gọi “đình” được xếp hạng 2008; lời kể node lại không khẳng định ranking. Quyết định 07/2008/QĐ-BVHTTDL ghi **Đền Trung Yên**, phường Hàng Bạc. Đây là bằng chứng đối tượng pháp danh cần đối chiếu với node, không đủ để tự đổi toàn bộ tên hiện có: [Quyết định trên Cổng Chính phủ](https://vanban.chinhphu.vn/default.aspx?docid=78382&pageid=27160). Phải kiểm tên gọi khác/địa chỉ và scope công trình trước sửa. Không suy “không có di tích xếp hạng” chỉ vì lời kể nói chưa xác minh.

**Phất Lộc:** story Tiên Hạ gắn nguồn gốc quê Thái Bình với người được thờ. Tư liệu cơ quan Đảng bộ Hưng Yên xác định Nguyễn Trung Ngạn quê Thổ Hoàng–Ân Thi, nên cách gộp hiện tại cần kiểm lại chủ thể: [Hưng Yên — đất khoa bảng](https://vanphong.hungyen.dcs.vn/hung-yen-dat-khoa-bang-dat-anh-hung-c2356.html). Không cần xác nhận địa giới hành chính 2026 để nhận ra mâu thuẫn nguồn lịch sử.

Câu “Nguyễn Siêu soạn năm 1886” thực sự có trong [SGGP, 13/08/2006](https://www.sggp.org.vn/ngo-phat-loc-dac-trung-ngo-ha-noi-post152339.html), nhưng [Bảo tàng Lịch sử Quốc gia](https://baotanglichsuquocgia.vn/vi/Articles/3098/17777/nguyen-sieu-mot-danh-nhan-van-hoa-cua-thang-long-ha-noi-1799-1872.html) ghi ông sống 1799–1872. Suy luận audit: có mâu thuẫn thời gian giữa cách diễn đạt “soạn” và mốc 1886, cần xem bản dập/niên đại văn bia để phân biệt soạn/khắc/trùng tu hoặc lỗi báo. Không tự sửa năm, không coi việc sao đúng báo là fact đã đủ tin cậy.

### 10.3 Độ dài và VI/EN

Manifest P3 ghi 17 VI story tổng 6.075 ký tự và EN 6.814; các duration trong manifest chủ yếu khoảng 10–28 giây. Đó là metadata, không phải thời lượng đo lại ở audit này. Intro Trung Yên VI 626 ký tự, EN 792, khác biệt length không tự là lỗi.

Phân loại legend trong Cấm Chỉ, Vọng Tiên và Trần Lựu được giữ ở cả VI/EN. Vẫn có semantic drift nhỏ: chi tiết ngày lễ Thanh Hà chỉ EN thêm; phrase “nhà ống/communal house” phải theo đúng đối tượng di tích. “food life” và các câu ghi nhật ký nghiên cứu trong EN cần editorial pass riêng. Không có bản rewrite nào được tạo trong nhiệm vụ này.

## 11. Voice & ElevenLabs Inventory

### 11.1 Active coverage

| Collection | VI active tracks | EN active tracks | Composition / missing |
| --- | ---: | ---: | --- |
| fiction-letter | 34 | 34 | 1 intro + 6 story + 6 caption + 21 answers |
| old-quarter-pilot | 16 | 16 | 1 intro + 3 story + 3 caption + 9 answers |
| old-quarter-three-lenses | 28 | 28 | 1 intro + 5 chapters + 3 transitions + 1 closing + 3 captions + 16 answers |
| ngo-gach | 5 | 5 | 5 node stories; **không intro audio**, không caption audio/QA |
| ngo-trung-yen | 6 | 6 | 1 intro + 5 node stories |
| ngo-tam-thuong | 3 | 3 | 1 intro + 2 node stories |
| ngo-cam-chi | 4 | 4 | 1 intro + 3 node stories |
| ngo-phat-loc | 3 | 3 | 1 intro + 2 node stories |
| **Total** | **99** | **99** | **198** static references |

Node story/intro lookup trực tiếp đã chạy cho 164 track ngoài fiction VI. Fiction VI dùng revision legacy cố định voiceCatalogueRevision, không phải hash canonical V2: query thử bằng canonical V1 trả 0 là query sai revision, không phải app mất 34 track. 34 đường dẫn fiction VI được xác nhận từ catalog.ts và test catalogue pass. Tổng 198 được kiểm độc lập bằng static requires; không lấy 382 MP3 để quảng cáo coverage.

### 11.2 Voices và provenance

- Target VI Nhật Phong: ID **6adFm46eyy74snVn6YrT**, node stories/4 intros/Three Lenses dùng **eleven_v3**. Fiction VI cũng đã đổi sang ID Nhật Phong, dù field voiceName trong manifest cũ còn “Thắm”.
- Target EN Talia: ID **OZ0L6eISlOejga3XjDFt**, **eleven_v4**, các active EN catalogue theo manifests đã đọc.
- **16 pilot VI tracks** còn ID **0ggMuQ1r9f9jqBu50nJn** (“Thắm” trong manifest), khác ID Nhật Phong. Đây là mismatch metadata/target có bằng chứng, không phải kết luận bằng nghe.
- Root manifest 34 track “Đoan Trang” mô tả archive audio gốc, không mô tả 34 track fiction VI đang reference trong catalog.ts.
- Output phổ biến **mp3_44100_128**. Chưa xác nhận lại codec/rate/duration vì không có ffprobe trong PATH.
- humanApproved/listened/selectedForShipping false trong nhiều manifest vẫn đúng là pending. Resolver không chặn preview chỉ vì selectedForShipping=false; “active catalogue” và “shipping approved” khác nhau.

### 11.3 Assets, hashes và lifecycle

MP3 tổng **121.900.545 bytes**, trong đó **69.626.630 bytes** thuộc 198 tệp được static require; **184** MP3 còn lại chưa được catalogue source hiện hành reference. Không gọi 184 tệp này là rác: chúng có thể là rollback/legacy có chủ ý. Không xóa chúng. Chưa build nên không kết luận kích thước APK hay chắc chắn tất cả tệp lưu trong repo sẽ vào bundle.

Kiểm hash manifest: root 34/34; alley intro 8/8; node stories 34/34; old pilot initial 12/12; post8 remaining 54/54; remaining-elevenlabs 100/100; three-lenses legacy 56/56; three-lenses-elevenlabs 56/56. Tổng **354** concrete path/audio-hash matches. Manifest Three Lenses Nhật Phong có 28 entry không ghi path; catalogue/test hiện hữu cung cấp kiểm khác, nhưng audit chưa nối lại 28 hash với file độc lập. Một nested metadata record có audioSha256 nhưng không phải track; không tính là missing file.

Node story test fail ở sourceDataSha256 **34/34 raw-byte mismatch**, trong khi **34/34 LF-normalized source hashes match**. git config core.autocrlf=true và git ls-files --eol ghi i/lf w/crlf. Cần chốt chính sách hash byte và checkout normalization, không sửa expected tùy tiện, không regenerate MP3 để chữa lỗi xuống dòng.

useVoiceSession kiểm track kind/node/textHash và scope trước play; lỗi/missing giữ chữ. Dataset revision đổi có thể làm **mọi track của collection/locale** không resolve, kể cả chỉ sửa guide; phải lập map textHash nào đổi và repin các clip nguyên text thay vì mặc định phát sinh paid TTS cả batch.

### 11.4 Generator và chi phí

generate_node_stories.py:24–25 đặt reserve 4.000, budget 80.000. generate_alleys_intro.py:20–21 reserve 10.000, budget 80.000. Đây là hai cấu hình scope khác nhau, không tự đồng bộ. Có preflight voice/model/quota, progress atomic, hash pins, partial-response recovery, không tự retry trạng thái outcome_unknown/requesting/api_error.

Báo cáo P3 ghi 34 HTTP 200, 12.889 text characters accepted; subscription delta 2.769 là chỉ số khác. Không dùng delta này để tính chi phí chuẩn hoặc quota hiện tại. Các số đều lịch sử; audit không GET account/provider và không đọc key.

Thứ tự bắt buộc cho đợt sửa sau: duyệt nội dung → khóa spoken text và locale → audit hash/revision → duyệt batch chi phí → generate phần đổi → catalogue/hash/decode → nghe → native playback. Không tái tạo voice trước khi đóng editorial/source issues.

## 12. Image & Location Assessment

Có **27 ảnh trong mobile/assets/photos**: 23 JPG và 4 cover PNG. Tổng assets còn có 7 PNG Expo/icon, 2 WAV, 382 MP3, 14 JSON và 2 LICENSES.md. Không có font file cục bộ trong inventory. Không tìm thấy ảnh trùng **byte-for-byte** theo SHA256; việc nhiều node dùng chung một đường dẫn là reuse logic khác với duplicate file.

Bảng dưới bao phủ toàn bộ 26 node ID; ba node phố cổ xuất hiện ở hai collection nên gộp để tránh lặp. Root ảnh viết gọn P=mobile/assets/photos/.

| Collection | Node ID | Current Image | Image Source | Relevance | License Status | Recommended Action |
| --- | --- | --- | --- | --- | --- | --- |
| fiction | demo-01 | P/pexels_demo_01.jpg | Credit Pexels/Thuan Pham | PLACEHOLDER, có chủ ý | Ledger có link, chưa kiểm điều khoản lại | Giữ là minh họa hư cấu |
| fiction | demo-02 | P/pexels_demo_02.jpg | Pexels/Dang Hong | PLACEHOLDER | Chưa kiểm lại | Giữ attribution |
| fiction | demo-03 | P/pexels_demo_03.jpg | Pexels/HONG SON | PLACEHOLDER | Chưa kiểm lại | Giữ attribution |
| fiction | demo-04 | P/pexels_demo_04.jpg | Pexels/Thuan Pham | PLACEHOLDER | Chưa kiểm lại | Giữ attribution |
| fiction | demo-05 | P/pexels_demo_05.jpg | Pexels/meomupmofilm | PLACEHOLDER | Chưa kiểm lại | Giữ attribution |
| fiction | demo-06 | P/pexels_demo_06.jpg | Pexels/HONG SON | PLACEHOLDER | Chưa kiểm lại | Giữ attribution |
| pilot + Three Lenses | oldquarter-bach-ma | P/three-lenses/bach-ma.jpg | User-supplied | UNCERTAIN, đúng nhãn nguồn | Quyền chưa kiểm chứng | Xác nhận ảnh/giấy phép với chủ sở hữu |
| pilot + Three Lenses | oldquarter-ma-may | P/three-lenses/ma-may.jpg | User-supplied | UNCERTAIN | Quyền chưa kiểm chứng | Xác nhận ảnh đúng công trình |
| pilot + Three Lenses | oldquarter-dong-xuan | P/three-lenses/dong-xuan-timeline.jpg | User-supplied; chapters đổi fire/street | UNCERTAIN | Quyền chưa kiểm chứng | Kiểm từng ảnh/chú thích và thời điểm |
| ngo-gach | ngo-gach-ca-phe-no1 | P/cafengotongduytan_04.jpg | Pexels illustrative | PLACEHOLDER | Chưa kiểm lại | Cần ảnh riêng nếu card mang nghĩa địa điểm |
| ngo-gach | ngo-gach-ta-ca-phe-4 | Cùng café JPG | Pexels illustrative | PLACEHOLDER | Chưa kiểm lại | Như trên |
| ngo-gach | ngo-gach-dinh-thanh-ha | P/alleys/dinh-thanh-ha-1.jpg | Google Maps contributor không tên | UNCERTAIN | Chưa xác nhận | Ưu tiên xin phép/tự chụp |
| ngo-gach | ngo-gach-cafe-20 | Cùng café JPG | Pexels illustrative | PLACEHOLDER | Chưa kiểm lại | Cần ảnh riêng |
| ngo-gach | ngo-gach-chua-cau-dong | P/alleys/chua-cau-dong-1.jpg | Google Maps contributor không tên | UNCERTAIN | Chưa xác nhận | Xin phép/tự chụp |
| ngo-trung-yen | trung-yen-pho-suong | P/alleys/pho-suong-1.jpg | Google Maps contributor không tên | UNCERTAIN | Chưa xác nhận | Xác minh quyền và quán |
| ngo-trung-yen | trung-yen-dinh-trung-yen | P/pexels_demo_06.jpg (fallback) | HONG SON/Pexels | PLACEHOLDER | Không chứng minh đúng di tích | Ảnh riêng sau chốt định danh |
| ngo-trung-yen | trung-yen-bun-ca-sam-cay-si | P/alleys/bun-ca-sam-cay-si-1.jpg | Google Maps contributor không tên | UNCERTAIN | Chưa xác nhận | Xin phép/tự chụp |
| ngo-trung-yen | trung-yen-bun-ngan-nhan | P/ngocamchi_03.jpg | Pexels illustrative | PLACEHOLDER | Chưa kiểm lại | Ảnh riêng |
| ngo-trung-yen | trung-yen-pho-ga-huong-tra | HERO fallback | Pexels | PLACEHOLDER | Chưa kiểm đối tượng | Xác minh node trước ảnh |
| ngo-tam-thuong | tam-thuong-dinh-yen-thai | HERO fallback | Pexels | PLACEHOLDER | Không ảnh riêng | Chụp đúng công trình |
| ngo-tam-thuong | tam-thuong-den-vong-tien | HERO fallback | Pexels | PLACEHOLDER | Không ảnh riêng | Chụp đúng công trình |
| ngo-cam-chi | cam-chi-khong-gian-nghe-thuat | HERO fallback | Pexels | PLACEHOLDER | Không ảnh riêng | Ảnh cổng/không gian đã xác minh |
| ngo-cam-chi | cam-chi-ngo-hoi-vu | HERO fallback | Pexels | PLACEHOLDER | Không ảnh riêng | Xác nhận ngoài ngõ và ảnh |
| ngo-cam-chi | cam-chi-den-vong-tien | HERO fallback | Pexels | PLACEHOLDER | Không ảnh riêng | Dùng chung ảnh thật cùng di tích khi có quyền |
| ngo-phat-loc | phat-loc-den-tien-ha | HERO fallback | Pexels | PLACEHOLDER | Không ảnh riêng | Ảnh đền riêng |
| ngo-phat-loc | phat-loc-cac-nhanh-ngo | HERO fallback | Pexels | PLACEHOLDER | Không ảnh riêng | Ảnh/sơ đồ khảo sát sau duyệt |

**9/17 node mới** không có NODE_PHOTO_MAP entry và rơi về HERO. Trong 8 node có mapping, ba café dùng chung một ảnh và Ngan Nhàn dùng ảnh minh họa. Không có ảnh nào được audit này gắn VERIFIED về địa điểm/giấy phép; không nhìn ảnh trực tiếp để nhận diện kiến trúc. NOT_RELEVANT chỉ nên kết luận khi có chứng cứ trực quan/nguồn, không suy từ tên file.

4 cover PNG mới là cover riêng card, không tự giải quyết ảnh của từng node. Ngo-tam-thuong-cover.png **4.138.537 bytes**, Trung Yên **2.734.316**, Gạch **1.398.380**, Cấm Chỉ **879.592**: cần đo decode/memory trên native trước tối ưu; đây chưa phải lỗi performance đã tái hiện.

photoMap còn entry Phở Vui/Miến trộn mực đã bị thay node identity. Skill/source research đã cảnh báo không lấy ảnh Google Maps để đóng gói khi chưa có quyền, nhưng nhánh hiện tại có 4 ảnh được credit Google Maps “demo”. “Demo” không chứng minh quyền sử dụng. docs/IMAGE_SOURCES.md chủ yếu liệt kê sáu Pexels, chưa là ledger đầy đủ cho toàn bộ ảnh mới.

GPS: 7/17 node mới có numeric coordinates (Gạch 5, Trung Yên 2); 10/17 null. Ba ngõ còn lại chỉ có sơ đồ demo. Tọa độ OSM không phải khảo sát cổng vào; polyline/alongAlleyMeters không phải chỉ dẫn đi bộ. Không tải ảnh mới hoặc thay mapping trong audit.

## 13. UI/UX Issue Register

Các reproduction path là thao tác đề xuất tái hiện trên thiết bị; nguồn render/lookup đã kiểm, trừ khi ghi rõ thực chạy host. Không nói đã tái hiện bằng điện thoại.

| ID | Issue / reproduction path | Root cause / evidence | Impact, severity | Suggested solution / risk / relevant tests |
| --- | --- | --- | --- | --- |
| UX01 | Demo → 5 ngõ mới → bất kỳ node | qa=[]; QaScreen:186, :908–913 render emptyNotice | Khối rỗng lặp ở 17 node, MEDIUM | Ẩn riêng emptyNotice khi không QA theo yêu cầu; giữ unmatched-input và source error; qaNodeStoryVoice/uiFlows |
| UX02 | Trung Yên → nghe mở đầu → story đình → đọc caption/guide | Các field nói khác mức xác minh | Mất tin cậy nội dung, HIGH | Chốt đúng Đền/Đình và claim trước TTS |
| UX03 | Phất Lộc → Tiên Hạ → nghe/đọc | Chủ thể quê quán, 1886 mâu thuẫn nguồn | Sai nhận thức lịch sử, HIGH | Review claim với nguồn; không tự đổi năm |
| UX04 | Chọn node mới không photoMap | getNodePhoto fallback HERO, photoMap:244–255 | Trải nghiệm ngõ nào cũng cùng ảnh, MEDIUM | Mapping theo node có provenance; không đổi global fallback tùy tiện |
| UX05 | Demo Trung Yên → Sổ tay → Live chưa config/error | NotebookDrawerModal:49–53 lấy bundle khi source không ready; :203 vẫn render guide | Nội dung Demo lẫn vào Live, HIGH | Chỉ dùng bundled guide trong Demo; Live empty/error không lấy fixture; thêm regression mode/source transitions |
| UX06 | Pilot → VI → nghe story/answer | Catalogue still resolves 16 clips voice ID cũ | Không đồng nhất giọng yêu cầu, HIGH nếu Nhật Phong là target toàn VI | Duyệt scope thay voice sau content; không tạo MP3 bây giờ |
| UX07 | Passport Landing | Modal chỉ collections + min(nodeCount,6) stamp mẫu, không read/confirmed state | Có thể hiểu nhầm đã lưu hành trình, LOW | Chốt vai trò mock/passport thật; không tự thêm persistence |
| UX08 | Nghe Home intro khi native player lỗi | Home:131–149 nuốt lỗi, khác Qa feedback | Không biết vì sao không phát, MEDIUM (source-level risk) | Native failure test rồi dùng feedback phù hợp; homeIntroPlay |
| UX09 | Cấm Chỉ → Vọng Tiên chưa từng mở Tạm Thương | Story nhắc chặng khác đã kể | Trải nghiệm không tự chứa, MEDIUM | Biên tập sau duyệt source; không buộc thứ tự ngoài spec |
| UX10 | Landing Live simulated opt-in | Card wording “Authentic…/chân thực”, :226 | Có thể nâng mức tin cậy hơn dataset, MEDIUM | Xác nhận wording theo kind/mode; giữ metadata; provenance tests |
| UX11 | FontScale 2 / screen reader / keyboard native | Các test dùng mock JSX, không Yoga/layout engine | Chưa chứng minh không cắt/che, MEDIUM evidence gap | Chạy current-head native matrix; không coi mock style as visual pass |
| UX12 | GPS từ Landing mong chọn ngõ gần nhất | Location chỉ nodes collection hiện tại; copy :139–141 nói ngõ gần nhất | Kỳ vọng không khớp chức năng, MEDIUM | Chốt microcopy hay scope GPS; không tự mở feature chọn mọi ngõ |

Ẩn Q&A rỗng không giải quyết dữ liệu thiếu, cũng không được ẩn UnavailableScreen hoặc lỗi Live. Khối thông báo là JSX cục bộ trong QaScreen; không có shared EmptyQa component để sửa một nơi rồi coi mọi screen được xử lý.

## 14. Testing & QA Status

### 14.1 Thực chạy

Môi trường Node **v24.18.0**, PowerShell, Windows; package source backend yêu cầu >=24 <25.

| Command / check | Result | Giới hạn |
| --- | --- | --- |
| node --test --test-reporter=tap mobile/tests/*.test.mjs | 390 tests: 389 pass / 1 fail | Host Node/mock UI; không native |
| Rerun cùng suite để thu failure detail | Cùng failure source hash tại nodeStoryVoiceCatalogue:61 | Không sửa expected/hook |
| node --test backend/tests/config.test.mjs tools/e2e/guards.test.mjs | 35/35 pass | 2 config + 33 guards; không DB/HTTP |
| tsc --project mobile/tsconfig.json --noEmit --incremental false | exit 0 | Không build/bundle |
| eslint . --no-cache, cwd mobile | exit 0 | Không render/native; không cài dependency |
| git diff --check | exit 0 | Không phải content/runtime validation |
| Parse runtime dataset + 7 V2 pairs | 16 valid datasets; 7 pairs ok | Structural validity, không historical approval |
| Static MP3 require existence | 198/198 | Không playback/decode |
| Audio hash entries có path | 354/354 | Không nghe; 28 pathless entries chưa nối |
| Node-story raw hash vs LF hash | raw 0/34 match; LF 34/34 | Checkout normalization; spoken text không tự đổi |

Không chạy npm audit vì có network/cache và không được giao dependency remediation. Không build/native export, không gọi Metro, không dùng ADB tạo screenshot/UI dump, không khởi động gateway/ASR hay API.

### 14.2 Tests tồn tại nhưng không chạy

Backend/api, cli, database, localized tests tạo temp directories/SQLite/backup, hoặc spawn CLI; HTTP E2E cũng tạo temporary DB. Chúng bị bỏ qua có chủ ý theo quy tắc audit cấm thay database/sinh artifacts, kể cả temp. Các Python voice tests có fixture/progress/temp writes và import tooling; không chạy khi chưa kiểm đủ side effects. Các lệnh generator dry-run cũng không tự được coi an toàn.

Native-flow.mjs ghi tools/e2e/.runs; không chạy. demo-scenario/phase7-checks là historical theo agent_docs/testing.md, không nên dùng labels cũ để đánh giá UX mới.

### 14.3 Chất lượng coverage

38 file mobile tests có logic data/matcher/recommendation, voice scope/timeout/recording, locale pair, static catalogue hashes và mocked screen handlers. uiFlows.test.mjs:1–55 dùng TypeScript transpile + vm và mô hình hooks tự viết. Đây không phải React Native renderer; mock không đo clipping, accessibility tree thật, độ trễ audio hay touch behavior phần cứng.

Báo cáo Antigravity P4 có bảng 6 node ID cũ không trùng dataset hiện tại: tam-thuong-am-thuc-ngo, ba cam-chi-* cũ, phat-loc-o-quan-chuong và phat-loc-den-huong-tuong (docs/reviews/2026-10-23-antigravity-qa-node-stories.md:37–42). Vì vậy không dùng bảng đó làm matrix current node. Source/test hiện tại dùng dữ liệu mới là bằng chứng khác; cần đối chiếu riêng.

Không có fresh test coverage phần trăm. Không suy đầy đủ semantic coverage từ số tests. Một test có thể kiểm nhiều subtests; file test count không bằng #tests.

### 14.4 Manual verification còn mở

Current-head Android và iPhone: cold offline launch, nghe cả VI/EN, locale switch khi đang phát/đang ghi, 20s cap/cancel/back/app background, silent/headset/Bluetooth/call interruption, permission denied/blocked/settings, QR thật và GPS ngoài trời, fontScale 1.3/2.0, keyboard, screen reader, mode toggling trong pending request. Evidence AVD cũ giữ giá trị cho đúng SHA của nó, không áp vào HEAD này.

## 15. Documentation Consistency Review

| Tài liệu / chỉ dẫn | So với source hiện tại | Phân loại |
| --- | --- | --- |
| README.md:7–11 | Chỉ giới thiệu truyện sáu node, không đủ 8 collection VI/EN | OUTDATED product overview |
| README voice caveats | Gateway private LAN/no auth và native pending vẫn quan trọng | STILL_APPLICABLE |
| AGENTS newest block | Còn baseline Phase8/post8 nhưng memory/code đã đi đến 23/10 nhiều scope mới | Historical context + policy; không coi là full state |
| MEMORY latest section | Ghi 390/390 và ffprobe trên môi trường cũ | HISTORICAL evidence; checkout này 389/390, ffprobe PATH thiếu |
| agent_docs/testing.md | Nhiều count 20/197 là phase history; chỉ rõ harness cũ | Cần đọc ngày/SHA trước dùng |
| docs/reviews P4 | 390/390, bảng có node ID cũ, gọi host mocked checks end-to-end | MISMATCH evidence granularity |
| docs/IMAGE_SOURCES.md:38 | Nói cạnh mọi ảnh có disclaimer; cleanup source đã bỏ nhiều badge | OUTDATED UI statement |
| docs/content/FOUR_ALLEYS_SOURCE | Bản chụp Google Doc, tự nói chưa verify từng nguồn | REFERENCE, không phải approval proof |
| docs/content/ALLEY_RESEARCH | Geometry/points cũ; nói chưa import khi source hiện tại đã có | HISTORICAL research |
| docs/VOICE_GUIDE_FOUR_ALLEYS | Intro reservations/đợt cũ | Chỉ dùng cùng report mới và manifest |
| tools/voice/README.md | Tập trung local TTS + data/demo, không mô tả đầy đủ ElevenLabs/multi-collection | PARTIAL handoff |
| backend/README.md:3 | Opening chỉ ba V1 routes, đoạn sau đã có V2 | Thiếu cập nhật summary nhưng nội dung sau giải thích đúng |
| 4 skill local | Content catalog/tool absent; QR v1 skill khác runtime node URI | BRANCH_MISMATCH |

Quyết định còn hiệu lực: native Android/iOS, fixed sourced answers, user confirmation GPS/QR, Demo/Live isolation, không public hosting/store/LLM/navigation tự mở, không tự nâng approval. Quyền triển khai cũ không được dùng để sửa code trong nhiệm vụ audit này. Không sửa MEMORY vì user mới chỉ cho phép một file báo cáo.

Nội dung cần handoff mới: tám collection VI/EN, 17 node stories x2, intro x8, voice ID còn sót ở pilot, phân biệt dữ liệu bundle với publication SQLite, ảnh mới chưa rights ledger, failed raw hash test trên Windows.

## 16. Technical Debt & Risks

Không có CRITICAL được xác minh trong scope host đã kiểm. HIGH dưới đây chủ yếu ảnh hưởng tính tin cậy, isolation và nghiệm thu demo.

| Risk ID | Area | Severity | Evidence | Impact | Recommended Mitigation |
| --- | --- | --- | --- | --- | --- |
| R01 | Content Phất Lộc | HIGH | Tiên Hạ story + nguồn đối chiếu phần 10 | Sai quê nhân vật và mâu thuẫn niên đại | Claim review trước text approval/TTS |
| R02 | Demo/Live isolation | HIGH | NotebookDrawerModal:49–53,203 | Guide bundle lẫn Live empty/error | Mode-aware selection + regression |
| R03 | Image provenance | HIGH | photoMap:100–127; user covers/Three Lenses credits | Không đủ quyền tái sử dụng/publication | Rights ledger, consent, hoặc ảnh thay thế có phép |
| R04 | VI voice target | HIGH | pilot 16 clips ID 0ggMuQ1r9f9jqBu50nJn | Giọng không đồng nhất target | Chốt toàn phạm vi voice, chỉ regenerate sau nội dung |
| R05 | QA reproducibility | HIGH đối với gate | nodeStoryVoiceCatalogue.test:61; core.autocrlf | Checkout mới không pass toàn suite | Chốt LF/raw hashing policy, không che expected |
| R06 | Trung Yên identity | HIGH | intro/caption/guide vs story; QĐ07/2008 | Kể cùng điểm với độ chắc chắn khác | Định danh công trình + mọi field VI/EN |
| R07 | QA report drift | MEDIUM | P4:37–42 IDs không tồn tại | Agent mới test sai điểm/tưởng device đã đạt | Reconcile bằng manifest/dataset current SHA |
| R08 | Sparse storytelling | MEDIUM | café/Hương Trà/Hội Vũ stories | Demo nghe giống báo cáo nghiên cứu | Chốt role waypoint/story, review biên tập |
| R09 | Generic images | MEDIUM | 9 unmapped nodes + 3 reused café | Không đúng kỳ vọng contextual | Per-node assets sau quyền/source |
| R10 | GPS sparse/unsurveyed | MEDIUM | 10/17 new coords null, OSM draft | GPS không có candidate / dễ kỳ vọng sai | Manual path và khảo sát có evidence |
| R11 | Backend single publication | MEDIUM | locale PK, DELETE publication_v2 | Tưởng Live có tám ngõ nhưng chỉ một pair | Document constraint; feature change cần scope riêng |
| R12 | Frontend/backend coupling | MEDIUM | database.mjs:5–6 import mobile TS | Packaging/refactor gây lỗi backend | Shared contract boundary sau duyệt, không tự refactor |
| R13 | Asset lifecycle | LOW | 184 unreferenced MP3 | Repo/storage/handoff rối | Manifest archive/active map; không tự xóa |
| R14 | Native verification gap | HIGH trước nghiệm thu | Không có current-head device run | Host pass không chứng minh mic/audio/layout | Device QA sau source/content baseline |
| R15 | UI empty-state | MEDIUM | QaScreen:908–913 | Khối không cần thiết ở mọi node mới | Ẩn intentional no-QA, giữ load failures |
| R16 | Local gateway HTTP | MEDIUM trong LAN; HIGH nếu public | server host/config và README | Audio request không auth/TLS | Giữ private-LAN; public là scope khác |
| R17 | Hash/revision overcoupling | MEDIUM | resolver exact datasetRevision | Sửa guide làm audio mất lookup | Explicit re-pin unchanged tracks theo textHash |
| R18 | Multiple metadata registries | LOW | collections vs ALLEY_LIST vs translator | Slug/count/name drift | Xác định source of truth trước refactor |
| R19 | Passport semantics | LOW | Stamp mẫu min(nodeCount,6) | Hiểu nhầm progress đã lưu | Chốt expectation, không tự thêm feature |
| R20 | Home player error feedback | MEDIUM | Home:131–149 swallow errors | Playback failure im lặng | Native test và feedback sau duyệt |

## 17. Recommended Workstreams

Chỉ là đề xuất cho người điều phối; chưa khởi chạy worker/implementation.

| Priority | Workstream | Deliverable cụ thể | Acceptance |
| --- | --- | --- | --- |
| P0 | Đóng coverage audit còn thiếu | Full source/test/doc review theo phụ lục, current-head evidence | Không còn nhãn đọc một phần ở phần cần nghiệm thu |
| P1 | Content/editorial/heritage | Claim ledger 5 ngõ + VI/EN sign-off; ưu tiên Tiên Hạ/Trung Yên | Mỗi fact có nguồn phù hợp, legend đúng nhãn, không meta prose tràn story |
| P1 | Live isolation | Reproduction + fix được duyệt cho drawer guide | Live no-config/loading/error không có bundle guide |
| P1 | Image/location rights | Per-node mapping, rightsholder/license/consent + field checklist | Không dùng “public xem được” làm quyền đóng gói |
| P1 | Test/hash policy | Quy tắc byte/canonical + Windows/Linux regression | Suite pass mà không đổi text/audio để che newline |
| P2 | Q&A presentation | Hide intentional no-QA notice theo yêu cầu | Giữ unmatched input và load error; legacy Q&A không đổi |
| P2 | Voice alignment | Bảng changed-text/reused-audio/cost cho Nhật Phong/Talia | Chỉ generate sau nội dung approved; nghe + native QA |
| P2 | Device QA | Current SHA Android/iPhone, offline/mic/GPS/QR/a11y | Ghi pass/fail/pending và restore settings |
| P3 | Docs/technical debt | Current architecture + runbook + asset archive map | Agent mới không dùng instructions sai nhánh |

Không phân công lại W2/W3/W4 hoặc đổi model từ audit. Ownership lịch sử trong AGENTS cần đối chiếu run hiện hành trước giao việc. Không tự chuyển audit thành goal voice V0–V7.

## 18. Implementation Dependencies

~~~mermaid
flowchart LR
  CF[Kiểm nguồn và định danh] --> CR[Review story VI/EN]
  CR --> AP[Duyệt spoken text]
  AP --> HS[Text hash + revision + delta inventory]
  HS --> COST[Duyệt batch chi phí/giọng]
  COST --> TTS[TTS phần đổi]
  TTS --> MAP[Catalogue + hash/decode]
  MAP --> LISTEN[Nghe thủ công]
  LISTEN --> NATIVE[Native playback QA]
  IP[Kiểm ảnh/giấy phép] --> IA[Chọn asset theo node]
  IA --> IM[Mapping và loading]
  IM --> UIQA[Native UI QA]
  QD[QA data validation] --> QR[Conditional rendering]
  QR --> REG[Regression]
  LF[Chốt newline/hash policy] --> REG
  LIVE[Source/mode boundary] --> REG
~~~

Có thể review ảnh và nội dung song song về mặt kế hoạch; không có quyền audit tự dispatch agents. Không sinh TTS cho đoạn dự kiến viết lại, không xóa archive audio, không làm multi-collection backend chỉ để đạt parity với Demo khi chưa được mở scope.

## 19. Open Questions / Human Decisions

### Cần người dùng quyết

| Câu hỏi cụ thể | Lựa chọn đề xuất | Hệ quả nếu chưa chốt |
| --- | --- | --- |
| 5 ngõ mới là sourced preview hay mẫu mô phỏng để demo? | Giữ trạng thái hiện có; duyệt claim rồi mới nâng | Không gọi là nội dung production/verified |
| Chốt đối tượng Trung Yên là Đền/Đình, địa chỉ và tên thay thế nào? | Đối chiếu QĐ07/2008 + hồ sơ quản lý di tích | Không thống nhất intro/story/guide/ảnh/audio |
| Café/Hương Trà/branches là waypoint hay phải có story đủ chiều sâu? | Tách vai trò bằng quyết định biên tập trước sửa | Tránh bịa để đủ số điểm; chưa nên paid TTS lại |
| Nhật Phong áp dụng tất cả VI, gồm 16 pilot clips? | Nếu target toàn VI, đưa pilot vào batch sau content sign-off | Chưa được tự đổi voice hoặc gọi provider |
| Nguồn ảnh thay thế là tự chụp, xin phép hay thư viện có giấy phép? | Ưu tiên ảnh đúng node có quyền rõ | Bản demo có ảnh nhưng chưa đủ quyền publication |
| Passport hiện là preview hay muốn lưu tiến trình? | Giữ sample trong phạm vi hiện có | Persistence nếu muốn là scope riêng |
| Chọn nội dung Live publish đầu tiên trong single-pair backend? | Chọn một cặp đã review; ghi rõ giới hạn | Không thể coi Live đủ tám collection |
| Có duyệt đợt sửa source sau audit không? | Review findings/coverage trước mở tasks | Audit này kết thúc, chưa implementation |

Yêu cầu ẩn khối no-QA đã nêu rõ trong brief: không cần hỏi lại preference; nhưng brief chỉ cho phép phân tích và báo cáo, nên chưa có quyền sửa trong lượt này. Không dùng câu hỏi này để mở lại cửa duyệt cho từng thao tác đã được giao ở nhiệm vụ khác.

### Cần người dùng tự làm

| Việc chỉ người dùng/chủ quyền làm được | Trong/ngoài plan | Vì sao / hậu quả |
| --- | --- | --- |
| Nghe duyệt giọng/phát âm và xác nhận story VI/EN chấp nhận được | Trong scope voice đã giao, chưa coi hoàn tất | Hash/HTTP200 không đánh giá nội dung nghe |
| Cung cấp xác nhận quyền với ảnh người dùng/Google Maps đã có, hoặc chọn thay ảnh | **[ngoài plan]** khảo sát/licensing ảnh thật chưa có trong core TECH_DEMO_PLAN | Không đủ cơ sở dùng ảnh cho public/store |
| Khảo sát/chụp GPS/ảnh và xác nhận mở cửa các điểm thực tế | **[ngoài plan]** đối với dữ liệu thật của các ngõ mở rộng | Tọa độ/giờ trong demo không thành bằng chứng thực địa |
| Thao tác điện thoại thật, đặc biệt iPhone, mic/silent/audio route và QR/GPS | Kiểm thử native thuộc plan; thiết bị cần chủ sở hữu | Host/AVD không thay bằng chứng thiết bị |

Không yêu cầu người dùng mua quota/thay key ở audit này. Không có provider access blocker vì không gọi provider. Không cần người dùng tự sửa CRLF hoặc code trước khi review báo cáo.

## 20. Suggested Next Steps

1. Duyệt báo cáo với giới hạn coverage rõ ràng; chưa nghiệm thu “full audit 100%”.
2. Hoàn tất đọc source/tests/docs chưa đọc, tập trung backend/live + gateway + all native UI; đối chiếu evidence current SHA.
3. Review hai nhóm facts Tiên Hạ/Trung Yên, nguồn ảnh và bảng node IDs trước đổi story.
4. Khi được mở implementation, sửa isolation và hash reproducibility, rồi Q&A empty presentation; tests phải chứng minh giữ errors/locale isolation.
5. Đóng text và quyền ảnh; lập batch voice delta/cost; sau đó mới sinh audio và QA native.
6. Cập nhật README/MEMORY/handoff trong một nhiệm vụ được phép sửa các file đó.

Không có implementation, generator, deployment hoặc content approval nào được thực hiện trong audit này.

## 21. Evidence Index

### 21.1 Bằng chứng trọng yếu

| Evidence | Supports |
| --- | --- |
| Git branch + rev-parse HEAD + status trước/sau | Snapshot/ownership, không gộp untracked của người dùng |
| mobile/package.json:6–42; app.json:6–9 | Native stack/dependencies/commands |
| mobile/App.tsx:78–94,123–171,180–215 | State, reset, stale-request guards |
| mobile/src/data/collections.ts:7–33,88–167,187–241 | 8 collection, bundle locale registry |
| mobile/src/screens/QaScreen.tsx:185–186,253–271,411–424,908–913 | Scope QA, track IDs, empty notice |
| mobile/src/components/NotebookDrawerModal.tsx:49–53,203 | Bundle-guide fallback trong source non-ready |
| mobile/src/assets/photoMap.ts:44–140,244–277 | Node images/reuse/fallback và legacy metadata |
| mobile/src/voice/localizedCatalog.ts:25–46 | Priority/revision guard |
| mobile/src/voice/useVoiceSession.ts:435–482 | Playback kind/node/textHash checks |
| mobile/src/voice/transcribe.ts:13–21,53–58 | STT request/response context |
| mobile/src/location/nearest.ts:35–85; qr/parseQr.ts:1–11 | Candidate constraints; actual QR scheme |
| backend/src/database.mjs:84–98,105–190 | Canonical pair validation + transactions |
| backend/migrations/002_publication_v2.sql:1–7 | Single pair, locale primary key |
| backend/src/app.mjs:22–74 | Routes/query contract/read-only API |
| data/localized/ngo-trung-yen.vi.json:8,89,169,174,221 | Conflicting claims; empty QA |
| data/localized/ngo-gach.en.json:75 | Extra festival precision EN |
| docs/content/FOUR_ALLEYS_SOURCE_20261022.md:5,17–26,173–176 | User source snapshot limitations, initial facts |
| docs/reviews/2026-10-23-antigravity-qa-node-stories.md:37–42,63 | Stale node matrix, previous pass claim |
| mobile/tests/nodeStoryVoiceCatalogue.test.mjs:61 | Actual failing raw source hash |
| git ls-files --eol + core.autocrlf | i/lf w/crlf with autocrlf=true |
| Manifests + SHA256/static-require queries | Counts, hashes, voices, physical versus active |
| tools/voice/generate_node_stories.py:24–25,50,193–208,266–297 | Reserve/budget/retry/preflight guards |
| tools/voice/generate_alleys_intro.py:20–21,224–230 | Different scoped reserve; blocked uncertain resend |
| mobile/tests/uiFlows.test.mjs:1–55 | VM/mock harness; not native renderer |

### 21.2 Lệnh kiểm nối tiếp được đề xuất, chưa chạy nếu có output

- Mobile unit: node --test mobile/tests/*.test.mjs; typecheck: tsc --noEmit --incremental false; lint: eslint . --no-cache.
- Backend/HTTP tests: chỉ chạy khi nhiệm vụ sau cho phép temp SQLite/temp files; không chạy trên DB chính.
- Native: dùng agent_docs/testing.md để nhận đúng harness, nhưng đọc source hiện tại và chọn current node IDs, thiết bị/Metro/SHA đúng.
- Voice decode: tìm FFmpeg/ffprobe được cài hợp lệ trong môi trường, validate từng active path; không cài/generate tự động trong audit.
- Không chạy trực tiếp generator có --generate hoặc live provider request từ runbook này.

### 21.3 Quy ước phụ lục kiểm kê

Danh sách đường dẫn và byte phía dưới là **inventory**, không phải read-coverage proof. “Inventoried” không có nghĩa file đã được đọc/nghe/render. Bí mật chỉ được ghi nhận đường dẫn, không đọc nội dung. Count baseline loại chính báo cáo mới tạo. Paths của cache/dependency bị prune không nằm trong danh sách.

## 22. Final Audit Verdict

**NEEDS_ADDITIONAL_AUDIT**

Đã kiểm được kiến trúc chính, inventory đủ tám collection, nhiều luồng data/voice/GPS/QR, nguyên nhân Q&A empty, 198 active MP3 references, nhiều hash và test trên checkout thực tế. Đã có findings đủ cụ thể để người dùng review kế hoạch sửa.

Chưa thể gọi đây là khảo sát ngữ nghĩa toàn bộ repository: nhiều source/test/doc lớn và evidence chưa đọc trọn, chưa có ffprobe decode/subjective listening, chưa kiểm native current HEAD và chưa chạy backend DB/HTTP suites theo ràng buộc chỉ một file. Không dùng báo cáo làm content approval, shipping sign-off hay bằng chứng an toàn triển khai public.

Báo cáo là file duy nhất được phép thêm trong nhiệm vụ. Dừng tại bàn giao; mọi việc sửa/viết lại/tạo voice/đổi ảnh đều chờ nhiệm vụ triển khai sau khi người dùng duyệt kết quả.


## Phụ lục A — Complete Path Inventory

Baseline trước báo cáo: 1410 files / 113 directories; excluded subtrees theo phần 2.

<details>
<summary>Directories (113)</summary>

~~~text
.
.agents
.agents/skills
.agents/skills/content-management
.agents/skills/expo-debugging
.agents/skills/field-data-validation
.agents/skills/heritage-fact-check
.agents/skills/mobile-ux-qa
.agents/skills/voice-tts-quality
agent_docs
agent_docs/evidence
agent_docs/evidence/phase-1
agent_docs/evidence/phase-1/android-emulator
agent_docs/evidence/phase-1/fixture-completion
agent_docs/evidence/phase-2
agent_docs/evidence/phase-3
agent_docs/evidence/phase-4
agent_docs/evidence/phase-5
agent_docs/evidence/phase-6
agent_docs/evidence/phase-7
agent_docs/evidence/ui-logic-fix-2026-10-11
agent_docs/evidence/ui-ux-implementation-2026-10-12
agent_docs/evidence/ui-ux-review-2026-10-12
agent_docs/evidence/voice
agent_docs/evidence/voice/android-emulator
agent_docs/evidence/voice/android37-font-scale-2026-10-14
agent_docs/evidence/voice/android37-host-audio-route-attempt-2026-10-15
agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15
agent_docs/evidence/voice/android37-native-release-current-2026-10-15
agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15
agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15
agent_docs/evidence/voice/android37-native-sdk57-2026-10-15
agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14
agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14
backend
backend/migrations
backend/src
backend/tests
data
data/drafts
data/journeys
data/localized
docs
docs/content
docs/content/three-lenses
docs/handoffs
docs/reviews
docs/superpowers
docs/superpowers/plans
docs/superpowers/specs
mobile
mobile/assets
mobile/assets/photos
mobile/assets/photos/alleys
mobile/assets/photos/three-lenses
mobile/assets/sounds
mobile/assets/voice
mobile/assets/voice/alleys-intro
mobile/assets/voice/alleys-intro/en
mobile/assets/voice/alleys-intro/vi
mobile/assets/voice/node-stories
mobile/assets/voice/node-stories/en
mobile/assets/voice/node-stories/vi
mobile/assets/voice/post8
mobile/assets/voice/post8/old-quarter-pilot
mobile/assets/voice/post8/old-quarter-pilot/en
mobile/assets/voice/post8/old-quarter-pilot/vi
mobile/assets/voice/post8/remaining
mobile/assets/voice/post8/remaining-elevenlabs
mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter
mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en
mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi
mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot
mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en
mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi
mobile/assets/voice/post8/remaining/fiction-letter
mobile/assets/voice/post8/remaining/fiction-letter/en
mobile/assets/voice/post8/remaining/old-quarter-pilot
mobile/assets/voice/post8/remaining/old-quarter-pilot/en
mobile/assets/voice/post8/remaining/old-quarter-pilot/vi
mobile/assets/voice/three-lenses
mobile/assets/voice/three-lenses-elevenlabs
mobile/assets/voice/three-lenses-elevenlabs/en
mobile/assets/voice/three-lenses-elevenlabs/vi
mobile/assets/voice/three-lenses-nhat-phong
mobile/assets/voice/three-lenses-nhat-phong/vi
mobile/assets/voice/three-lenses/en
mobile/assets/voice/three-lenses/vi
mobile/locales
mobile/plugins
mobile/scripts
mobile/src
mobile/src/assets
mobile/src/components
mobile/src/context
mobile/src/data
mobile/src/hooks
mobile/src/i18n
mobile/src/location
mobile/src/qa
mobile/src/qr
mobile/src/recommendation
mobile/src/screens
mobile/src/theme
mobile/src/utils
mobile/src/voice
mobile/tests
tools
tools/e2e
tools/mock-api
tools/voice
tools/voice/gateway
tools/voice/gateway/test-fixtures
~~~

</details>

<details>
<summary>Files (1410), path và bytes; không phải xác nhận đọc toàn văn</summary>

| Path | Bytes |
| --- | ---: |
| .agents/skills/content-management/SKILL.md | 1881 |
| .agents/skills/expo-debugging/SKILL.md | 2012 |
| .agents/skills/field-data-validation/SKILL.md | 2002 |
| .agents/skills/heritage-fact-check/SKILL.md | 1793 |
| .agents/skills/mobile-ux-qa/SKILL.md | 1822 |
| .agents/skills/voice-tts-quality/SKILL.md | 1861 |
| .env.local | 112 |
| .gitignore | 608 |
| AGENTS.md | 18502 |
| MEMORY.md | 336227 |
| README.md | 2595 |
| REVIEW-CHECKLIST.md | 17449 |
| agent_docs/code_patterns.md | 3663 |
| agent_docs/evidence/phase-1/android-emulator/home-demo.png | 198166 |
| agent_docs/evidence/phase-1/android-emulator/home-live.png | 195448 |
| agent_docs/evidence/phase-1/android-emulator/home-restored.png | 211680 |
| agent_docs/evidence/phase-1/android-emulator/interaction-checks.json | 1470 |
| agent_docs/evidence/phase-1/android-emulator/landscape-scrolled.png | 112601 |
| agent_docs/evidence/phase-1/android-emulator/landscape.png | 96153 |
| agent_docs/evidence/phase-1/android-emulator/large-font-live.png | 234905 |
| agent_docs/evidence/phase-1/android-emulator/large-font-scrolled.png | 236750 |
| agent_docs/evidence/phase-1/android-emulator/large-font.png | 240514 |
| agent_docs/evidence/phase-1/android-emulator/layout-checks.json | 866 |
| agent_docs/evidence/phase-1/android-emulator/ngoke-android-device-properties.json | 512 |
| agent_docs/evidence/phase-1/android-emulator/ngoke-android-sdk-server.json | 926 |
| agent_docs/evidence/phase-1/android-emulator/placeholder-camera.png | 137567 |
| agent_docs/evidence/phase-1/android-emulator/placeholder-gps.png | 130609 |
| agent_docs/evidence/phase-1/android-emulator/placeholder-qa.png | 128394 |
| agent_docs/evidence/phase-1/android-emulator/placeholder-recommendations.png | 129345 |
| agent_docs/evidence/phase-1/android-emulator/runtime-summary.json | 1078 |
| agent_docs/evidence/phase-1/checks.json | 3974 |
| agent_docs/evidence/phase-1/fixture-completion/adb-restart.json | 508 |
| agent_docs/evidence/phase-1/fixture-completion/audit.json | 13107 |
| agent_docs/evidence/phase-1/fixture-completion/checks.json | 6278 |
| agent_docs/evidence/phase-1/fixture-completion/demo-list-0.png | 203303 |
| agent_docs/evidence/phase-1/fixture-completion/demo-list-1.png | 185847 |
| agent_docs/evidence/phase-1/fixture-completion/demo-list-2.png | 205027 |
| agent_docs/evidence/phase-1/fixture-completion/demo-list-3.png | 205027 |
| agent_docs/evidence/phase-1/fixture-completion/demo-list-4.png | 205027 |
| agent_docs/evidence/phase-1/fixture-completion/demo-list-5.png | 205027 |
| agent_docs/evidence/phase-1/fixture-completion/font15-home.png | 252574 |
| agent_docs/evidence/phase-1/fixture-completion/font15-list.png | 226879 |
| agent_docs/evidence/phase-1/fixture-completion/handoff-audit.json | 277 |
| agent_docs/evidence/phase-1/fixture-completion/handoff-home.png | 202817 |
| agent_docs/evidence/phase-1/fixture-completion/home-demo-returned.png | 203590 |
| agent_docs/evidence/phase-1/fixture-completion/home-demo.png | 208763 |
| agent_docs/evidence/phase-1/fixture-completion/home-final.png | 208413 |
| agent_docs/evidence/phase-1/fixture-completion/home-live.png | 197764 |
| agent_docs/evidence/phase-1/fixture-completion/interaction-checks.json | 1456 |
| agent_docs/evidence/phase-1/fixture-completion/landscape-home.png | 99381 |
| agent_docs/evidence/phase-1/fixture-completion/landscape-list.png | 102019 |
| agent_docs/evidence/phase-1/fixture-completion/launch.json | 115 |
| agent_docs/evidence/phase-1/fixture-completion/layout-checks.json | 954 |
| agent_docs/evidence/phase-1/fixture-completion/offline-checks.json | 1206 |
| agent_docs/evidence/phase-1/fixture-completion/offline-home.png | 206945 |
| agent_docs/evidence/phase-1/fixture-completion/offline-list.png | 193187 |
| agent_docs/evidence/phase-1/fixture-completion/offline-live.png | 198692 |
| agent_docs/evidence/phase-1/fixture-completion/placeholder-camera.png | 139387 |
| agent_docs/evidence/phase-1/fixture-completion/placeholder-gps.png | 132834 |
| agent_docs/evidence/phase-1/fixture-completion/placeholder-qa.png | 130905 |
| agent_docs/evidence/phase-1/fixture-completion/placeholder-recommendations.png | 132025 |
| agent_docs/evidence/phase-1/fixture-completion/scope-changes-2026-10-03.json | 558 |
| agent_docs/evidence/phase-1/handoff-audit.json | 1146 |
| agent_docs/evidence/phase-2/audit.json | 13107 |
| agent_docs/evidence/phase-2/checks.json | 1748 |
| agent_docs/evidence/phase-2/home-after-one-back.png | 198719 |
| agent_docs/evidence/phase-2/interaction-checks.json | 1379 |
| agent_docs/evidence/phase-2/launch.json | 115 |
| agent_docs/evidence/phase-2/qa-answer.png | 243877 |
| agent_docs/evidence/phase-2/qa-followup.png | 242215 |
| agent_docs/evidence/phase-2/qa-intro.png | 231245 |
| agent_docs/evidence/phase-2/qa-typed-answer.png | 237866 |
| agent_docs/evidence/phase-2/qa-unknown.png | 220334 |
| agent_docs/evidence/phase-2/typed-alias-question.png | 229758 |
| agent_docs/evidence/phase-2/typed-checks.json | 236 |
| agent_docs/evidence/phase-2/typed-unknown-question.png | 229279 |
| agent_docs/evidence/phase-3/audit.json | 13107 |
| agent_docs/evidence/phase-3/checks.json | 2193 |
| agent_docs/evidence/phase-3/home-plan-button.png | 205812 |
| agent_docs/evidence/phase-3/interaction-checks.json | 1856 |
| agent_docs/evidence/phase-3/picks-visibility.json | 173 |
| agent_docs/evidence/phase-3/plan-needs-budget.png | 189341 |
| agent_docs/evidence/phase-3/plan-questions.png | 183030 |
| agent_docs/evidence/phase-3/plan-suggestions.png | 218837 |
| agent_docs/evidence/phase-4/audit.json | 13107 |
| agent_docs/evidence/phase-4/camera-denied.png | 205737 |
| agent_docs/evidence/phase-4/camera-off.png | 193143 |
| agent_docs/evidence/phase-4/camera-on.png | 792489 |
| agent_docs/evidence/phase-4/camera-release-checks.json | 549 |
| agent_docs/evidence/phase-4/camera-release.txt | 3142 |
| agent_docs/evidence/phase-4/camera-state-after-back.txt | 4111 |
| agent_docs/evidence/phase-4/checks.json | 2654 |
| agent_docs/evidence/phase-4/interaction-checks.json | 1752 |
| agent_docs/evidence/phase-4/narrator-caption.png | 652634 |
| agent_docs/evidence/phase-4/story-without-camera.png | 205726 |
| agent_docs/evidence/phase-5/audit.json | 13107 |
| agent_docs/evidence/phase-5/checks.json | 2509 |
| agent_docs/evidence/phase-5/deny-screen.txt | 1022 |
| agent_docs/evidence/phase-5/emulator-gps-limitation.txt | 2550 |
| agent_docs/evidence/phase-5/interaction-checks-deny.json | 648 |
| agent_docs/evidence/phase-5/location-current-changed.png | 191399 |
| agent_docs/evidence/phase-5/location-denied.png | 214503 |
| agent_docs/evidence/phase-5/location-read-failed-emulator.png | 212519 |
| agent_docs/evidence/phase-5/location-start.png | 208080 |
| agent_docs/evidence/phase-6/audit.json | 13107 |
| agent_docs/evidence/phase-6/checks.json | 2545 |
| agent_docs/evidence/phase-6/demo-without-server.png | 232445 |
| agent_docs/evidence/phase-6/interaction-checks-followup.json | 678 |
| agent_docs/evidence/phase-6/interaction-checks.json | 3361 |
| agent_docs/evidence/phase-6/live-broken.png | 217690 |
| agent_docs/evidence/phase-6/live-empty.png | 226451 |
| agent_docs/evidence/phase-6/live-hang.png | 205000 |
| agent_docs/evidence/phase-6/live-no-config.png | 234425 |
| agent_docs/evidence/phase-6/live-ready-qa.png | 232432 |
| agent_docs/evidence/phase-6/live-ready.png | 228192 |
| agent_docs/evidence/phase-6/live-server-error.png | 203116 |
| agent_docs/evidence/phase-6/screen-text.json | 6333 |
| agent_docs/evidence/phase-7/audit.json | 13107 |
| agent_docs/evidence/phase-7/camera-denied-manual.png | 201298 |
| agent_docs/evidence/phase-7/checks.json | 2601 |
| agent_docs/evidence/phase-7/font-scale-130.png | 210354 |
| agent_docs/evidence/phase-7/gps-denied.png | 203108 |
| agent_docs/evidence/phase-7/keyboard-open.png | 210237 |
| agent_docs/evidence/phase-7/live-no-url.png | 228680 |
| agent_docs/evidence/phase-7/offline-limitation.txt | 3401 |
| agent_docs/evidence/phase-7/phase7-checks.json | 1785 |
| agent_docs/evidence/phase-7/qa-unknown-question.png | 210237 |
| agent_docs/evidence/phase-7/r1-answer.png | 231942 |
| agent_docs/evidence/phase-7/r1-followup.png | 231126 |
| agent_docs/evidence/phase-7/r1-picks.png | 187876 |
| agent_docs/evidence/phase-7/r1-story.png | 207533 |
| agent_docs/evidence/phase-7/r2-answer.png | 232193 |
| agent_docs/evidence/phase-7/r2-followup.png | 231160 |
| agent_docs/evidence/phase-7/r2-picks.png | 188559 |
| agent_docs/evidence/phase-7/r2-story.png | 207934 |
| agent_docs/evidence/phase-7/r3-answer.png | 231598 |
| agent_docs/evidence/phase-7/r3-followup.png | 230603 |
| agent_docs/evidence/phase-7/r3-picks.png | 187410 |
| agent_docs/evidence/phase-7/r3-story.png | 206936 |
| agent_docs/evidence/phase-7/scenario-runs.json | 4763 |
| agent_docs/evidence/ui-logic-fix-2026-10-11/alley-select-demo.png | 2210787 |
| agent_docs/evidence/ui-logic-fix-2026-10-11/home-after-confirm-node-03.png | 3342416 |
| agent_docs/evidence/ui-logic-fix-2026-10-11/home.png | 3292590 |
| agent_docs/evidence/ui-logic-fix-2026-10-11/live-empty.png | 180434 |
| agent_docs/evidence/ui-logic-fix-2026-10-11/plan-15-minutes.png | 1033397 |
| agent_docs/evidence/ui-logic-fix-2026-10-11/qa-node-02.png | 1735683 |
| agent_docs/evidence/ui-logic-fix-2026-10-11/typed-question.png | 1581860 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/01-prologue.png | 2689538 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/02-landing.png | 2852787 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/03-home.png | 2853203 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/04-qa.png | 1871949 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/05-qa-answer.png | 1706840 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/06-input-keyboard.png | 542118 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/07-plan.png | 237365 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/08-qa-empty.png | 1498625 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/09-home-short-window.png | 2301201 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/10-home-short-window-end.png | 2319106 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/11-home-short-window-card.png | 1659912 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/12-large-font.png | 2654777 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/13-home-large-font.png | 3075816 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/14-qa-large-font.png | 1453747 |
| agent_docs/evidence/ui-ux-implementation-2026-10-12/15-input-large-font-keyboard.png | 899722 |
| agent_docs/evidence/ui-ux-review-2026-10-12/01-prologue.png | 2884424 |
| agent_docs/evidence/ui-ux-review-2026-10-12/02-landing.png | 2783200 |
| agent_docs/evidence/ui-ux-review-2026-10-12/03-prologue-after-back.png | 31786 |
| agent_docs/evidence/ui-ux-review-2026-10-12/04-home.png | 3284225 |
| agent_docs/evidence/ui-ux-review-2026-10-12/05-qa.png | 2071744 |
| agent_docs/evidence/ui-ux-review-2026-10-12/06-qa-answer.png | 1567627 |
| agent_docs/evidence/ui-ux-review-2026-10-12/07-home-short-window.png | 2592462 |
| agent_docs/evidence/ui-ux-review-2026-10-12/08-landing-without-stats.png | 2762857 |
| agent_docs/evidence/ui-ux-review-2026-10-12/09-plan.png | 240564 |
| agent_docs/evidence/ui-ux-review-2026-10-12/10-plan-open-node-05.png | 1989037 |
| agent_docs/evidence/ui-ux-review-2026-10-12/11-prologue-large-font.png | 2877072 |
| agent_docs/evidence/voice/android-avd-gateway-accepted-2026-10-13.png | 488896 |
| agent_docs/evidence/voice/android-avd-stt-no-speech-2026-10-13.png | 1660654 |
| agent_docs/evidence/voice/android-emulator/README.md | 27426 |
| agent_docs/evidence/voice/android-emulator/android-api37-current-preview-2026-10-14.png | 1503358 |
| agent_docs/evidence/voice/android-emulator/android-api37-expogo-player-to-mic-meter-2026-10-14.png | 1363708 |
| agent_docs/evidence/voice/android-emulator/android-api37-font-scale-200-home-trail-2026-10-14.png | 1761502 |
| agent_docs/evidence/voice/android-emulator/android-api37-font-scale-200-landing-scrolled-2026-10-14.png | 2432113 |
| agent_docs/evidence/voice/android-emulator/android-api37-font-scale-200-landing-top-2026-10-14.png | 2496210 |
| agent_docs/evidence/voice/android-emulator/android-api37-font-scale-200-qa-2026-10-14.png | 1188821 |
| agent_docs/evidence/voice/android-emulator/android-api37-second-recording-2026-10-14.png | 1370109 |
| agent_docs/evidence/voice/android-emulator/android-emulator-after-point-select.png | 2882421 |
| agent_docs/evidence/voice/android-emulator/android-emulator-after-start.png | 2847107 |
| agent_docs/evidence/voice/android-emulator/android-emulator-answer-text-playing.png | 1403278 |
| agent_docs/evidence/voice/android-emulator/android-emulator-api37-release-launch.png | 2685280 |
| agent_docs/evidence/voice/android-emulator/android-emulator-back-stops-player.png | 2880922 |
| agent_docs/evidence/voice/android-emulator/android-emulator-final-mic-denied.png | 1355550 |
| agent_docs/evidence/voice/android-emulator/android-emulator-final-next-chapter.png | 1430875 |
| agent_docs/evidence/voice/android-emulator/android-emulator-final-replay-from-start.png | 1351490 |
| agent_docs/evidence/voice/android-emulator/android-emulator-fixed-next-chapter.png | 1430703 |
| agent_docs/evidence/voice/android-emulator/android-emulator-fixed-player-paused.png | 1427218 |
| agent_docs/evidence/voice/android-emulator/android-emulator-fixed-player-stopped.png | 1431386 |
| agent_docs/evidence/voice/android-emulator/android-emulator-fixed-qa-answer-chip.png | 1517843 |
| agent_docs/evidence/voice/android-emulator/android-emulator-fixed-retest-home.png | 2847340 |
| agent_docs/evidence/voice/android-emulator/android-emulator-fixed-retest-qa.png | 1678743 |
| agent_docs/evidence/voice/android-emulator/android-emulator-fixed-retest-start.png | 2685630 |
| agent_docs/evidence/voice/android-emulator/android-emulator-fixed-retest-trail.png | 2882938 |
| agent_docs/evidence/voice/android-emulator/android-emulator-fixed-text-still-playing.png | 1224732 |
| agent_docs/evidence/voice/android-emulator/android-emulator-home.png | 261873 |
| agent_docs/evidence/voice/android-emulator/android-emulator-mic-denied-retry.png | 726042 |
| agent_docs/evidence/voice/android-emulator/android-emulator-mic-denied.png | 1227622 |
| agent_docs/evidence/voice/android-emulator/android-emulator-mic-permission-denied-final.png | 1678540 |
| agent_docs/evidence/voice/android-emulator/android-emulator-mic-permission-denied-fixed.png | 1566130 |
| agent_docs/evidence/voice/android-emulator/android-emulator-mic-permission-request-final.png | 966680 |
| agent_docs/evidence/voice/android-emulator/android-emulator-mic-permission-request.png | 728728 |
| agent_docs/evidence/voice/android-emulator/android-emulator-next-chapter.png | 1327228 |
| agent_docs/evidence/voice/android-emulator/android-emulator-offline-local-audio.png | 1350277 |
| agent_docs/evidence/voice/android-emulator/android-emulator-player-playing.png | 1674333 |
| agent_docs/evidence/voice/android-emulator/android-emulator-qa-screen.png | 1677994 |
| agent_docs/evidence/voice/android-emulator/android-emulator-return-qa-does-not-autoplay.png | 1678290 |
| agent_docs/evidence/voice/android-emulator/android-emulator-text-open-playing.png | 1322660 |
| agent_docs/evidence/voice/android-emulator/android-emulator-voice-final-check-2026-10-13.png | 1765917 |
| agent_docs/evidence/voice/android-emulator/android-release-second-turn-meter-2026-10-14.png | 1533472 |
| agent_docs/evidence/voice/android-emulator/android37-auto-loop-after-one-pass-2026-10-14.png | 1672718 |
| agent_docs/evidence/voice/android-emulator/android37-auto-loop-first-pass-2026-10-14.png | 1671760 |
| agent_docs/evidence/voice/android-emulator/android37-auto-loop-stop-2026-10-14.png | 1676538 |
| agent_docs/evidence/voice/android-emulator/android37-com-background-recording-2026-10-14.png | 969132 |
| agent_docs/evidence/voice/android-emulator/android37-com-background-resumed-2026-10-14.png | 1561640 |
| agent_docs/evidence/voice/android-emulator/android37-com-mic-cancelled-2026-10-14.png | 1674984 |
| agent_docs/evidence/voice/android-emulator/android37-com-mic-recording-2026-10-14.png | 1517971 |
| agent_docs/evidence/voice/android-emulator/android37-com-package-launch-2026-10-14.png | 2686999 |
| agent_docs/evidence/voice/android-emulator/android37-com-player-playing-2026-10-14.png | 1671152 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-alley-2026-10-14.png | 2879572 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-alley-2026-10-14.xml | 32520 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-answer-2026-10-14.png | 1155757 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-answer-2026-10-14.xml | 43623 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-answer-playing-2026-10-14.png | 1151751 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-home-2026-10-14.png | 2845052 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-home-2026-10-14.xml | 28698 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-launch-2026-10-14.png | 2687233 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-meter-active-2026-10-14.png | 1095855 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-meter-active-2026-10-14.xml | 43623 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-mic-cancelled-2026-10-14.png | 1155397 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-qa-2026-10-14.png | 1675506 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-qa-2026-10-14.xml | 37333 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-qapoint-2026-10-14.png | 2879624 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-qapoint-2026-10-14.xml | 32520 |
| agent_docs/evidence/voice/android-emulator/android37-current-build-second-meter-active-2026-10-14.png | 1094496 |
| agent_docs/evidence/voice/android-emulator/android37-current-release-mic-active-2026-10-14.png | 1518765 |
| agent_docs/evidence/voice/android-emulator/android37-current-release-mic-cancelled-2026-10-14.png | 1675266 |
| agent_docs/evidence/voice/android-emulator/android37-current-release-mic-explicit-cancel-2026-10-14.png | 1675268 |
| agent_docs/evidence/voice/android-emulator/android37-gateway-configured-release-launch-2026-10-14.png | 2686775 |
| agent_docs/evidence/voice/android-emulator/android37-latest-build-alleyselect-2026-10-14.png | 2127964 |
| agent_docs/evidence/voice/android-emulator/android37-latest-build-auto-replay-2026-10-14.png | 1499821 |
| agent_docs/evidence/voice/android-emulator/android37-latest-build-home-2026-10-14.png | 2844511 |
| agent_docs/evidence/voice/android-emulator/android37-latest-build-launch-2026-10-14.png | 2686801 |
| agent_docs/evidence/voice/android-emulator/android37-latest-build-qa-2026-10-14.png | 1674836 |
| agent_docs/evidence/voice/android-emulator/android37-latest-build-stop-2026-10-14.png | 1503507 |
| agent_docs/evidence/voice/android-emulator/android37-latest-build-suggested-answer-2026-10-14.png | 1502613 |
| agent_docs/evidence/voice/android-emulator/android37-native-a11y-home-2026-10-14.png | 2687008 |
| agent_docs/evidence/voice/android-emulator/android37-native-a11y-voice-2026-10-14.png | 1531767 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-home-2026-10-14.png | 2686816 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-home-2026-10-14.xml | 11606 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-latest-launch-2026-10-14.png | 2687160 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-meter-active-2026-10-14.png | 1541673 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-meter-active-2026-10-14.xml | 37338 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-meter-cancelled-2026-10-14.xml | 37338 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-mic-cancelled-2026-10-14.png | 1669086 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-mic-stops-player-2026-10-14.png | 1541749 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-player-paused-2026-10-14.png | 1672297 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-player-playing-2026-10-14.png | 1670917 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-player-playing-2026-10-14.xml | 37338 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-player-stopped-2026-10-14.png | 1675517 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-qa01-2026-10-14.xml | 37338 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-reader-closed-playing-2026-10-14.png | 1672108 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-reader-open-playing-2026-10-14.png | 1316280 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-recorder-cancelled-2026-10-14.png | 1674816 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-recorder-cancelled-2026-10-14.xml | 37338 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-recorder-state-2026-10-14.png | 1556059 |
| agent_docs/evidence/voice/android-emulator/android37-native-release-second-turn-fix-2026-10-14.png | 299464 |
| agent_docs/evidence/voice/android-emulator/android37-permission-recovery-2026-10-14.png | 1518413 |
| agent_docs/evidence/voice/android-emulator/android37-permission-recovery-cancelled-2026-10-14.png | 1675623 |
| agent_docs/evidence/voice/android-emulator/android37-reader-open-playing-2026-10-14.png | 1317009 |
| agent_docs/evidence/voice/android-emulator/android37-release-after-async-playback-error-fix-2026-10-14.png | 2686948 |
| agent_docs/evidence/voice/android-emulator/android37-release-alley-after-audio-fix-2026-10-14.png | 2879420 |
| agent_docs/evidence/voice/android-emulator/android37-release-explore-after-audio-fix-2026-10-14.png | 2128018 |
| agent_docs/evidence/voice/android-emulator/android37-release-home-after-async-playback-error-fix-2026-10-14.png | 2844882 |
| agent_docs/evidence/voice/android-emulator/android37-release-negated-plan-result-2026-10-14.png | 251600 |
| agent_docs/evidence/voice/android-emulator/android37-release-playback-to-mic-first-2026-10-14.png | 1519126 |
| agent_docs/evidence/voice/android-emulator/android37-release-playback-to-mic-second-2026-10-14.png | 1525347 |
| agent_docs/evidence/voice/android-emulator/android37-release-player-before-recorder-2026-10-14.png | 1670971 |
| agent_docs/evidence/voice/android-emulator/android37-release-player-to-mic-first-active-2026-10-14.png | 1517790 |
| agent_docs/evidence/voice/android-emulator/android37-release-player-to-mic-second-active-2026-10-14.png | 1524360 |
| agent_docs/evidence/voice/android-emulator/android37-release-qa-after-audio-fix-2026-10-14.png | 1675232 |
| agent_docs/evidence/voice/android-emulator/android37-release-recorder-cycle-cancelled-2026-10-14.png | 1675564 |
| agent_docs/evidence/voice/android-emulator/android37-release-recorder-cycle-first-2026-10-14.png | 1524655 |
| agent_docs/evidence/voice/android-emulator/android37-release-recorder-cycle-second-2026-10-14.png | 1675565 |
| agent_docs/evidence/voice/android-emulator/android37-release-recorder-cycle-second-active-2026-10-14.png | 1519242 |
| agent_docs/evidence/voice/android-emulator/android37-replay-start-2026-10-14.png | 1317135 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-denied-fallback-2026-10-14.png | 1565671 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-blocked-settings-2026-10-14.png | 1447790 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-prompt-2026-10-14.png | 966369 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-recovery-active-2026-10-14.png | 1521546 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-recovery-cancelled-2026-10-14.png | 1678646 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-retry-prompt-2026-10-14.png | 965981 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-second-turn-cancelled-2026-10-14.png | 1679245 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-second-turn-recording-2026-10-14.png | 1521333 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-settings-recovery-cancelled-2026-10-14.png | 1678575 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-settings-recovery-ready-2026-10-14.png | 1535902 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-settings-recovery-recording-2026-10-14.png | 1521032 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-mic-permission-settings-screen-2026-10-14.png | 116078 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-player-background-active-2026-10-14.png | 1674365 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-player-background-return-2026-10-14.png | 1678311 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-player-playing-2026-10-14.png | 1674084 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-recorder-background-idle-appops-2026-10-14.png | 1678780 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-recorder-second-cancel-2026-10-14.png | 1678593 |
| agent_docs/evidence/voice/android-emulator/android37-source-release-recorder-second-start-2026-10-14.png | 1521542 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-back-stops-recorder-2026-10-14.png | 2877759 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-input-drawer-2026-10-14.png | 881293 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-input-keyboard-2026-10-14.png | 497256 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-launch-2026-10-14.png | 2687096 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-paused-2026-10-14.png | 1672651 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-playing-2026-10-14.png | 1672050 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-qa-reader-open-2026-10-14.png | 1321501 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-recorder-active-2026-10-14.png | 1444060 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-recorder-cancelled-2026-10-14.png | 1668725 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-recorder-limit-reached-2026-10-14.png | 1458959 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-recorder-pending-send-2026-10-14.png | 1602495 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-replay-2026-10-14.png | 1671478 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-resumed-2026-10-14.png | 1671549 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-stopped-2026-10-14.png | 1675353 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-typed-answer-2026-10-14.png | 1602698 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-typed-answer-text-open-2026-10-14.png | 1430269 |
| agent_docs/evidence/voice/android-emulator/android37-v6-release-unknown-question-2026-10-14.png | 1790892 |
| agent_docs/evidence/voice/android-emulator/clean-alley-open.png | 2880369 |
| agent_docs/evidence/voice/android-emulator/clean-input-drawer.png | 883020 |
| agent_docs/evidence/voice/android-emulator/clean-input-focused.png | 651880 |
| agent_docs/evidence/voice/android-emulator/clean-launch.png | 2685913 |
| agent_docs/evidence/voice/android-emulator/clean-list.png | 2197813 |
| agent_docs/evidence/voice/android-emulator/clean-player-paused.png | 1674809 |
| agent_docs/evidence/voice/android-emulator/clean-player-playing.png | 1674803 |
| agent_docs/evidence/voice/android-emulator/clean-player-replay.png | 1674129 |
| agent_docs/evidence/voice/android-emulator/clean-player-resumed.png | 1674072 |
| agent_docs/evidence/voice/android-emulator/clean-player-stopped.png | 1678131 |
| agent_docs/evidence/voice/android-emulator/clean-qa.png | 1678744 |
| agent_docs/evidence/voice/android-emulator/current-diag-screen.png | 3010152 |
| agent_docs/evidence/voice/android-emulator/font-current.png | 3060914 |
| agent_docs/evidence/voice/android-emulator/font-scale-150.png | 2650345 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-alley-final.png | 1367019 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-alley.png | 2616433 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-home-final.png | 2497400 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-home-fixed.png | 2497384 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-home.png | 2486089 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-input-ime.png | 715804 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-input-keyboard-open.png | 777575 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-input-keyboard.png | 715626 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-next.png | 3060645 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-qa.png | 264429 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-see-all-tapped.png | 1428559 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-step.png | 2616771 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-story-final.png | 1190343 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-trail.png | 3060302 |
| agent_docs/evidence/voice/android-emulator/font-scale-200-voice.png | 1190291 |
| agent_docs/evidence/voice/android-emulator/font-scale-200.png | 2616127 |
| agent_docs/evidence/voice/android-emulator/font-scale-after-start.png | 2615294 |
| agent_docs/evidence/voice/android-emulator/font-scale-base-current.png | 1622848 |
| agent_docs/evidence/voice/android-emulator/font-scale-tapped.png | 2847055 |
| agent_docs/evidence/voice/android-emulator/keyboard-final-paused.png | 1619615 |
| agent_docs/evidence/voice/android-emulator/keyboard-final-replay.png | 1618872 |
| agent_docs/evidence/voice/android-emulator/keyboard-final-resumed.png | 1619253 |
| agent_docs/evidence/voice/android-emulator/keyboard-final-stopped.png | 1622859 |
| agent_docs/evidence/voice/android-emulator/keyboard-fix-answer-playing.png | 1618676 |
| agent_docs/evidence/voice/android-emulator/keyboard-fix-answer-text.png | 1436391 |
| agent_docs/evidence/voice/android-emulator/keyboard-fix-answer-view.png | 1622624 |
| agent_docs/evidence/voice/android-emulator/keyboard-fix-answer.png | 1603994 |
| agent_docs/evidence/voice/android-emulator/keyboard-fix-focused.png | 537777 |
| agent_docs/evidence/voice/android-emulator/keyboard-fix-launch.png | 2685887 |
| agent_docs/evidence/voice/android-emulator/keyboard-fix-next.png | 1675663 |
| agent_docs/evidence/voice/android-emulator/keyboard-fix-question.png | 483742 |
| agent_docs/evidence/voice/android-emulator/landing-diagnostic.png | 2197659 |
| agent_docs/evidence/voice/android-emulator/qa-after-play.png | 1460749 |
| agent_docs/evidence/voice/android-emulator/qa-diag-screen.png | 1463919 |
| agent_docs/evidence/voice/android-emulator/qa-pause-fast-diagnostic.png | 1460117 |
| agent_docs/evidence/voice/android-emulator/qa-pause-short-diagnostic.png | 1460442 |
| agent_docs/evidence/voice/android-emulator/qa-paused-diagnostic.png | 1460325 |
| agent_docs/evidence/voice/android-emulator/qa-replay-diagnostic.png | 1460051 |
| agent_docs/evidence/voice/android-emulator/qa-resumed-diagnostic.png | 1460074 |
| agent_docs/evidence/voice/android-emulator/qa-stopped-diagnostic.png | 1463905 |
| agent_docs/evidence/voice/android-emulator/release-after-cap-cancel-2026-10-13.png | 1678603 |
| agent_docs/evidence/voice/android-emulator/release-after-mic-tap-2026-10-13.png | 1678658 |
| agent_docs/evidence/voice/android-emulator/release-after-recording-cancel-2026-10-13.png | 1679194 |
| agent_docs/evidence/voice/android-emulator/release-alley-select-2026-10-13.png | 2879826 |
| agent_docs/evidence/voice/android-emulator/release-back-recording-wait-2026-10-13.png | 2880047 |
| agent_docs/evidence/voice/android-emulator/release-back-to-alley-2026-10-13.png | 2877891 |
| agent_docs/evidence/voice/android-emulator/release-first-grant-recording-2026-10-13.png | 1545202 |
| agent_docs/evidence/voice/android-emulator/release-goto-input-tap-2026-10-13.png | 882471 |
| agent_docs/evidence/voice/android-emulator/release-home-2026-10-13.png | 2849973 |
| agent_docs/evidence/voice/android-emulator/release-input-closed-2026-10-13.png | 1679035 |
| agent_docs/evidence/voice/android-emulator/release-lan-after-cancel-2026-10-13.png | 1679073 |
| agent_docs/evidence/voice/android-emulator/release-lan-apk-launch-2026-10-13.png | 2685769 |
| agent_docs/evidence/voice/android-emulator/release-lan-back-recording-2026-10-13.png | 2880630 |
| agent_docs/evidence/voice/android-emulator/release-lan-fontscale-200-alley-2026-10-13.png | 1367266 |
| agent_docs/evidence/voice/android-emulator/release-lan-fontscale-200-answer-2026-10-13.png | 1241329 |
| agent_docs/evidence/voice/android-emulator/release-lan-fontscale-200-expanded-2026-10-13.png | 1235593 |
| agent_docs/evidence/voice/android-emulator/release-lan-fontscale-200-home-2026-10-13.png | 2498215 |
| agent_docs/evidence/voice/android-emulator/release-lan-fontscale-200-input-2026-10-13.png | 718863 |
| agent_docs/evidence/voice/android-emulator/release-lan-fontscale-200-keyboard-2026-10-13.png | 445446 |
| agent_docs/evidence/voice/android-emulator/release-lan-fontscale-200-keyboard-filled-2026-10-13.png | 562731 |
| agent_docs/evidence/voice/android-emulator/release-lan-fontscale-200-reader-2026-10-13.png | 3061152 |
| agent_docs/evidence/voice/android-emulator/release-lan-fontscale-200-text-2026-10-13.png | 1190116 |
| agent_docs/evidence/voice/android-emulator/release-lan-reader-2026-10-13.png | 1678827 |
| agent_docs/evidence/voice/android-emulator/release-lan-recording-cap-2026-10-13.png | 1560576 |
| agent_docs/evidence/voice/android-emulator/release-mic-current-2026-10-13.png | 1551209 |
| agent_docs/evidence/voice/android-emulator/release-mic-permission-2026-10-13.png | 961077 |
| agent_docs/evidence/voice/android-emulator/release-mic-permission-retry-2026-10-13.png | 1544729 |
| agent_docs/evidence/voice/android-emulator/release-mic-recording-2026-10-13.png | 1679046 |
| agent_docs/evidence/voice/android-emulator/release-qa-answer-2026-10-13.png | 1605978 |
| agent_docs/evidence/voice/android-emulator/release-reader-text-open-2026-10-13.png | 1323806 |
| agent_docs/evidence/voice/android-emulator/release-recording-cap-2026-10-13.png | 1560501 |
| agent_docs/evidence/voice/android-emulator/release-story-reader-2026-10-13.png | 1676910 |
| agent_docs/evidence/voice/android37-after-start-2026-10-13.png | 2844908 |
| agent_docs/evidence/voice/android37-after-start-2026-10-13.xml | 28698 |
| agent_docs/evidence/voice/android37-alley-2026-10-13.png | 2879085 |
| agent_docs/evidence/voice/android37-app-launch-2026-10-13.png | 2687086 |
| agent_docs/evidence/voice/android37-app-launch-2026-10-13.xml | 11606 |
| agent_docs/evidence/voice/android37-font-scale-2026-10-14/README.md | 1309 |
| agent_docs/evidence/voice/android37-font-scale-2026-10-14/font-1_5-ui.xml | 35436 |
| agent_docs/evidence/voice/android37-font-scale-2026-10-14/font-1_5.png | 1976194 |
| agent_docs/evidence/voice/android37-font-scale-2026-10-14/font-2_0-followups-full-ui.xml | 30868 |
| agent_docs/evidence/voice/android37-font-scale-2026-10-14/font-2_0-followups-full.png | 1985123 |
| agent_docs/evidence/voice/android37-font-scale-2026-10-14/font-2_0-followups-ui.xml | 32824 |
| agent_docs/evidence/voice/android37-font-scale-2026-10-14/font-2_0-followups.png | 1362337 |
| agent_docs/evidence/voice/android37-font-scale-2026-10-14/font-2_0-ui.xml | 32824 |
| agent_docs/evidence/voice/android37-font-scale-2026-10-14/font-2_0.png | 1363065 |
| agent_docs/evidence/voice/android37-host-audio-route-attempt-2026-10-15/README.md | 1128 |
| agent_docs/evidence/voice/android37-host-audio-route-attempt-2026-10-15/recording-no-input-level.png | 1507561 |
| agent_docs/evidence/voice/android37-mic-permission-2026-10-13.png | 1556958 |
| agent_docs/evidence/voice/android37-native-release-a11y-2026-10-14.xml | 37303 |
| agent_docs/evidence/voice/android37-native-release-a11y-home-2026-10-14.xml | 33636 |
| agent_docs/evidence/voice/android37-native-release-a11y-qa-2026-10-14.png | 1984971 |
| agent_docs/evidence/voice/android37-native-release-alleyselect-2026-10-14.xml | 28698 |
| agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/README.md | 2474 |
| agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/alley.png | 2882388 |
| agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/answer-text.png | 1296784 |
| agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/answer.png | 1566965 |
| agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/home.png | 2849317 |
| agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/input.png | 818626 |
| agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/launch.png | 2686290 |
| agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/point04.png | 3006873 |
| agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/reader.png | 1411568 |
| agent_docs/evidence/voice/android37-native-release-asr-alias-2026-10-15/typed.png | 553374 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/README.md | 7158 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/after-start.png | 2849638 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/chapter.png | 2881216 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/font-2_0-cancel.png | 1725442 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/font-2_0-home.png | 2498136 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/font-2_0-launch.png | 2616363 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/font-2_0-point.png | 1602845 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/font-2_0-reader-scrolled-ui.xml | 32869 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/font-2_0-reader-scrolled.png | 1724977 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/font-2_0-reader-ui.xml | 32379 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/font-2_0-reader.png | 1192966 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/font-2_0-recorder.png | 1623697 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-back-home.png | 2879474 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-player-text-open.png | 1335191 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-recorder-after-cancel.png | 1634525 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-recorder-first.png | 1508661 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-recorder-second.png | 1515974 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/latest-recorder-stress-idle.png | 1634712 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/launch-final-revision.png | 2685182 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/launch.png | 2686599 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-playing.png | 1628529 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-text-open.png | 1330236 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-title-fix-home.png | 2497577 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-title-fix-launch.png | 2617682 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-title-fix-point.png | 1602817 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-title-fix-reader-scrolled-ui.xml | 35419 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-title-fix-reader-scrolled.png | 1662518 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/player-title-fix-reader.png | 1156799 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/point-open.png | 2882479 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/qa04-flowers-manual-alias-answer-2026-10-15.png | 1293555 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/reader.png | 1633938 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/recorder-after-call-return.png | 1634829 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/recorder-call-answered.png | 65274 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/recorder-call-interrupt.png | 1320579 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/recorder-cancel.png | 1334652 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/recorder-next-point.png | 1391688 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/recorder-start.png | 1264339 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/voice-alias-answer.png | 1283710 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/voice-alias-build-launch.png | 2685322 |
| agent_docs/evidence/voice/android37-native-release-current-2026-10-15/voice-alias-current.png | 1487970 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/README.md | 2367 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/alley.png | 2882174 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/alley.xml | 28698 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/answer-playing.png | 1830641 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/answer-playing.xml | 19157 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/answer-text-open.png | 1335984 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/answer-text-open.xml | 19157 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-1-answer.png | 1834284 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-1-answer.xml | 19157 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-1-player-text-open.png | 1335985 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-1-reader.png | 1634890 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-1-reader.xml | 20666 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-1.png | 2882131 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-1.xml | 17684 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-4-alias-answer.png | 1565131 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-4-alias-answer.xml | 19242 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-4-alias-entered.png | 551327 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-4-alias-entered.xml | 5571 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-4-followup-answer.png | 1532547 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-4-followup-answer.xml | 19182 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-4-input-open.png | 549716 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-4-input-open.xml | 5570 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-4-reader.png | 1409253 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/chapter-4-reader.xml | 19647 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/home.png | 2848730 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/home.xml | 28698 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/launch.png | 2685298 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/launch.xml | 11606 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-cancel.png | 1532357 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-cancel.xml | 19182 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-cycle-1-idle.png | 1529495 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-cycle-1.png | 1391969 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-cycle-2-idle.png | 1532749 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-cycle-2.png | 1395635 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-cycle-final.xml | 19182 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-start.png | 1391693 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-start.xml | 19182 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-stress-20-idle.png | 1532820 |
| agent_docs/evidence/voice/android37-native-release-final-2f15c3-2026-10-15/recorder-stress-20-start.png | 1395724 |
| agent_docs/evidence/voice/android37-native-release-qa01-2026-10-14.xml | 37338 |
| agent_docs/evidence/voice/android37-native-release-qa6-answer-text-collapsed-playing-2026-10-14.png | 1662069 |
| agent_docs/evidence/voice/android37-native-release-qa6-answer-text-playing-2026-10-14.png | 1456478 |
| agent_docs/evidence/voice/android37-native-release-qascreen-2026-10-14.xml | 32520 |
| agent_docs/evidence/voice/android37-native-release-recorder-start-2026-10-14.xml | 37338 |
| agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/README.md | 2042 |
| agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/alley.png | 2881760 |
| agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/answer.png | 1833217 |
| agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/home.png | 2848437 |
| agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/launch.png | 2684985 |
| agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/player-playing.png | 1829035 |
| agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/player-text-open.png | 1335116 |
| agent_docs/evidence/voice/android37-native-release-v6-negation-2026-10-15/qa.png | 1633720 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/README.md | 5072 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/action-menu.png | 617293 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/action-menu.xml | 17239 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/alleyselect-accessibility-after-fix.png | 1934690 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/alleyselect-accessibility-after-fix.xml | 29980 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/alleyselect-accessibility.xml | 16959 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/alleyselect-filter-scroll-accessibility-after-fix.png | 960548 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/alleyselect-filter-scroll-accessibility-after-fix.xml | 24089 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/alleyselect-filter-selected-accessibility-after-fix.png | 1888179 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/alleyselect-filter-selected-accessibility-after-fix.xml | 28516 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/alleyselect-reset-state-accessibility.xml | 29978 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/alleyselect-search-clear-accessibility-after-fix.png | 808578 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/alleyselect-search-clear-accessibility-after-fix.xml | 24094 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/android37-current-state-before-reduced-motion.xml | 28698 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/android37-reduced-motion-navigation.png | 1934857 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/android37-reduced-motion-navigation.xml | 29980 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/chapter1-back-alleyselect.png | 2879818 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/chapter1-back-alleyselect.xml | 18065 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/chapter1-player-playing-text-collapsed.png | 1829484 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/chapter1-player-playing-text-open-00-08.png | 1335148 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/chapter1-player-playing-text-open-replay.png | 1334159 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/demo-trail-map-before-plan.png | 2881640 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/gps-explicit-read.png | 410209 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/gps-explicit-read.xml | 17292 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/home-accessibility-current-apk.png | 2849172 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/home-accessibility-current-apk.xml | 28698 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/home-accessibility.xml | 13893 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/home-after-back.png | 2848885 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/home-after-back.xml | 13893 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/plan-manual-entry.png | 217131 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/plan-manual-entry.xml | 21323 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/plan-result.png | 1104552 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/plan-result.xml | 15765 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/plan-toggle-48dp.png | 229844 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/plan-toggle-48dp.xml | 19738 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/qr-explicit-start.png | 454146 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/qr-explicit-start.xml | 19795 |
| agent_docs/evidence/voice/android37-native-sdk57-2026-10-15/trail-map-current.png | 3016633 |
| agent_docs/evidence/voice/android37-point-2026-10-13.png | 2878002 |
| agent_docs/evidence/voice/android37-point-card-2026-10-13.png | 2879028 |
| agent_docs/evidence/voice/android37-point-card-2026-10-13.xml | 17671 |
| agent_docs/evidence/voice/android37-qa-screen-2026-10-13.png | 1675146 |
| agent_docs/evidence/voice/android37-qa-screen-2026-10-13.xml | 20659 |
| agent_docs/evidence/voice/android37-reader-open-2026-10-13.png | 1320995 |
| agent_docs/evidence/voice/android37-reader-open-2026-10-13.xml | 18053 |
| agent_docs/evidence/voice/android37-silent-recording-active-2026-10-13.png | 1556471 |
| agent_docs/evidence/voice/android37-silent-submit-2026-10-13.png | 1608697 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/README.md | 1809 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-01-collapsed.png | 1830742 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-01-collapsed.xml | 36907 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-01-open.png | 1856747 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-01-open.xml | 33348 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-02-collapsed.png | 1542691 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-02-collapsed.xml | 36924 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-02-open.png | 1520400 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-02-open.xml | 34206 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-03-collapsed.png | 1916252 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-03-collapsed.xml | 36965 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-03-open.png | 1789746 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-03-open.xml | 36518 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-04-collapsed.png | 1561114 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-04-collapsed.xml | 36992 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-04-open.png | 1574330 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-04-open.xml | 34238 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-05-collapsed.png | 1654305 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-05-collapsed.xml | 36958 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-05-open.png | 1667690 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-05-open.xml | 34219 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-06-collapsed.png | 1665554 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-06-collapsed.xml | 36987 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-06-open.png | 1676358 |
| agent_docs/evidence/voice/android37-six-chapter-reader-2026-10-14/chapter-06-open.xml | 34252 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/README.md | 1751 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-01.png | 1831455 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-01.xml | 36907 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-02.png | 1543064 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-02.xml | 36924 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-03.png | 1916416 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-03.xml | 36965 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-04.png | 1561636 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-04.xml | 36992 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-05.png | 1654292 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-05.xml | 36958 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-06.png | 1665998 |
| agent_docs/evidence/voice/android37-six-chapter-ui-2026-10-14/chapter-06.xml | 36987 |
| agent_docs/phase_1_completion.md | 5996 |
| agent_docs/phase_1_review.md | 13602 |
| agent_docs/phase_2_review.md | 7918 |
| agent_docs/phase_3_review.md | 6249 |
| agent_docs/phase_4_review.md | 8694 |
| agent_docs/phase_5_review.md | 9393 |
| agent_docs/phase_6_review.md | 8449 |
| agent_docs/phase_7_review.md | 7798 |
| agent_docs/product_requirements.md | 7123 |
| agent_docs/project_brief.md | 3210 |
| agent_docs/setup_review.md | 7548 |
| agent_docs/tech_stack.md | 9000 |
| agent_docs/testing.md | 8363 |
| agent_docs/voice_v0_review.md | 8533 |
| agent_docs/voice_v1_listening_checklist.md | 6368 |
| agent_docs/voice_v1_review.md | 9426 |
| agent_docs/voice_v2_review.md | 6693 |
| agent_docs/voice_v3_review.md | 28284 |
| agent_docs/voice_v4_review.md | 16059 |
| agent_docs/voice_v5_review.md | 22346 |
| agent_docs/voice_v6_review.md | 9043 |
| agent_docs/voice_v7_review.md | 56492 |
| backend/.env.example | 257 |
| backend/.gitignore | 17 |
| backend/README.md | 1929 |
| backend/migrations/001_initial.sql | 2343 |
| backend/migrations/002_publication_v2.sql | 343 |
| backend/package-lock.json | 243 |
| backend/package.json | 620 |
| backend/src/app.mjs | 4103 |
| backend/src/cli.mjs | 5287 |
| backend/src/config.mjs | 986 |
| backend/src/database.mjs | 13310 |
| backend/src/server.mjs | 1157 |
| backend/tests/api.test.mjs | 4655 |
| backend/tests/cli.test.mjs | 11499 |
| backend/tests/config.test.mjs | 763 |
| backend/tests/database.test.mjs | 4730 |
| backend/tests/localized.test.mjs | 14273 |
| data/README.md | 3284 |
| data/demo.json | 23898 |
| data/drafts/alleys-ngo-gach-trung-yen.draft.json | 14816 |
| data/journeys/three-lenses.en.json | 17992 |
| data/journeys/three-lenses.vi.json | 21510 |
| data/localized/fiction.en.json | 18547 |
| data/localized/ngo-cam-chi.en.json | 15073 |
| data/localized/ngo-cam-chi.vi.json | 15946 |
| data/localized/ngo-gach.en.json | 6246 |
| data/localized/ngo-gach.vi.json | 6648 |
| data/localized/ngo-phat-loc.en.json | 13004 |
| data/localized/ngo-phat-loc.vi.json | 13606 |
| data/localized/ngo-tam-thuong.en.json | 11453 |
| data/localized/ngo-tam-thuong.vi.json | 12016 |
| data/localized/ngo-trung-yen.en.json | 15321 |
| data/localized/ngo-trung-yen.vi.json | 16095 |
| data/localized/old-quarter.en.json | 16779 |
| data/localized/old-quarter.vi.json | 18335 |
| data/localized/three-lenses.en.json | 30449 |
| data/localized/three-lenses.vi.json | 33321 |
| docs/ALLEY_INTEGRATION_SPEC_20261022.md | 4671 |
| docs/ANTIGRAVITY_LOGIC_REVIEW.md | 20197 |
| docs/ANTIGRAVITY_UI_PROMPT.md | 16141 |
| docs/APP_FLOW.md | 10172 |
| docs/DATA_COLLECTION_GUIDE.md | 10632 |
| docs/HANDOFF_API.md | 8971 |
| docs/HANDOFF_DATA.md | 4806 |
| docs/HANDOFF_UI.md | 2997 |
| docs/HANDOFF_VOICE.md | 5275 |
| docs/IMAGE_SOURCES.md | 8537 |
| docs/LANDING_QUICK_ACTIONS_REVIEW_20261021.md | 7477 |
| docs/LANDING_REDESIGN_SPEC_20261022.md | 5430 |
| docs/LUNA_6_XHIGH_VOICE_PROMPT.md | 16451 |
| docs/MVP_ROADMAP.md | 9867 |
| docs/PHASE_7_1_8_EXECUTION_SPEC.md | 10760 |
| docs/PHASE_8_ANDROID_BUILD.md | 3752 |
| docs/PHASE_8_QA_REPORT.md | 10039 |
| docs/POST8_AUDIO_PROBE.md | 46684 |
| docs/POST8_BACKEND_REPORT.md | 3175 |
| docs/POST8_CONTENT_REVIEW.md | 5155 |
| docs/POST8_CONTENT_TEST_REPORT.md | 18847 |
| docs/POST8_COORDINATOR_REVIEW.md | 26003 |
| docs/POST8_DEMO_GUIDE.md | 17539 |
| docs/POST8_EXECUTION_SPEC.md | 15766 |
| docs/POST8_FINAL100_QA_REPORT.md | 20103 |
| docs/POST8_FIRST_SCREEN_LAYOUT.md | 6009 |
| docs/POST8_FIRST_SCREEN_REVIEW.md | 10439 |
| docs/POST8_LAYOUT_WAVES_ANTIGRAVITY_REVIEW.md | 16249 |
| docs/POST8_LAYOUT_WAVES_COORDINATOR_REVIEW.md | 5611 |
| docs/POST8_LAYOUT_WAVES_IMPLEMENTATION.md | 9256 |
| docs/POST8_MOTION_UX_ANTIGRAVITY_REVIEW.md | 14428 |
| docs/POST8_MOTION_UX_COORDINATOR_REVIEW.md | 8351 |
| docs/POST8_MOTION_UX_REDESIGN_BRIEF.md | 11782 |
| docs/POST8_PRONUNCIATION_REVIEW.md | 2790 |
| docs/POST8_QA_PLAN.md | 3375 |
| docs/POST8_SOURCE_REVIEW.md | 8736 |
| docs/POST8_W2_UI_INVENTORY.md | 11992 |
| docs/POST8_W3_DATA_VOICE_INVENTORY.md | 20308 |
| docs/PRO-NgoKe-MVP.md | 56759 |
| docs/REMAINING_ELEVENLABS_REVIEW.md | 8188 |
| docs/REMAINING_ELEVENLABS_SPEC.md | 5883 |
| docs/TECH_DEMO_PLAN.md | 17803 |
| docs/TEST_REPORT.md | 4374 |
| docs/THREE_LENSES_COORDINATOR_REVIEW.md | 7911 |
| docs/THREE_LENSES_ELEVENLABS_REVIEW.md | 5259 |
| docs/THREE_LENSES_ELEVENLABS_SPEC.md | 8498 |
| docs/THREE_LENSES_EXECUTION_SPEC.md | 11368 |
| docs/THREE_LENSES_FINAL_REVIEW.md | 10313 |
| docs/TechDesign-NgoKe-MVP.md | 76680 |
| docs/UI_FRAMEWORK.md | 23530 |
| docs/UI_LOGIC_FIX_HANDOFF.md | 8891 |
| docs/UI_UX_AUDIT_2026-10-12.md | 16811 |
| docs/UI_UX_IMPLEMENTATION_HANDOFF.md | 9779 |
| docs/UI_UX_IMPROVEMENT_PLAN.md | 21000 |
| docs/UI_UX_REBUILD_PROPOSAL.md | 24843 |
| docs/VOICE_API_CONTRACT.md | 4756 |
| docs/VOICE_FICTION_SCRIPT.md | 12739 |
| docs/VOICE_GOAL_PROMPT.md | 3603 |
| docs/VOICE_GUIDE_FOUR_ALLEYS_20261022.md | 6405 |
| docs/VOICE_HANDOFF.md | 46183 |
| docs/VOICE_INTERACTION_UX_SPEC.md | 37636 |
| docs/VOICE_PHASE_ROADMAP.md | 62750 |
| docs/VOICE_TEST_REPORT.md | 93427 |
| docs/VOICE_UX_HIFI_LISTEN.png | 220132 |
| docs/VOICE_UX_HIFI_LISTEN.svg | 7569 |
| docs/VOICE_UX_HIFI_TEXT.png | 138493 |
| docs/VOICE_UX_HIFI_TEXT.svg | 10512 |
| docs/VOICE_UX_MOBILE_COMPACT.png | 95709 |
| docs/VOICE_UX_MOBILE_COMPACT.svg | 4103 |
| docs/VOICE_UX_STORYBOARD.png | 180530 |
| docs/VOICE_UX_STORYBOARD.svg | 9005 |
| docs/VOICE_VIENEU_REVIEW.md | 8144 |
| docs/content/ALLEY_GEOMETRY_20261022.json | 2205 |
| docs/content/ALLEY_RESEARCH_NGO_GACH_TRUNG_YEN_20261022.md | 9941 |
| docs/content/FOUR_ALLEYS_EN_NARRATION_20261023.md | 6020 |
| docs/content/FOUR_ALLEYS_SOURCE_20261022.md | 22311 |
| docs/content/POST8_CONTENT_INVENTORY.md | 4712 |
| docs/content/POST8_GLOSSARY.md | 3391 |
| docs/content/POST8_PILOT_COPY.md | 20219 |
| docs/content/POST8_SOURCE_LEDGER.md | 9952 |
| docs/content/three-lenses/EN_AUTHORING.json | 14044 |
| docs/content/three-lenses/EN_NARRATIVE.json | 9169 |
| docs/content/three-lenses/STORY_PREVIEW_VI.md | 18437 |
| docs/content/three-lenses/USER_SCRIPT_VI.txt | 25511 |
| docs/content/three-lenses/VI_AUTHORING.json | 12306 |
| docs/content/three-lenses/build_dataset.py | 15001 |
| docs/handoffs/2026-10-23-node-story-voice-handoff.json | 11603 |
| docs/reviews/2026-10-21-antigravity-ui-ux-remediation.md | 30720 |
| docs/reviews/2026-10-21-claude-ui-ux-review.md | 19444 |
| docs/reviews/2026-10-21-luna-backend-support.md | 3133 |
| docs/reviews/2026-10-21-opencode-ui-ux-verification.md | 36857 |
| docs/reviews/2026-10-22-antigravity-alley-integration.md | 10813 |
| docs/reviews/2026-10-22-antigravity-hero-moss.md | 7120 |
| docs/reviews/2026-10-22-antigravity-landing-redesign.md | 15462 |
| docs/reviews/2026-10-22-antigravity-provenance-residual-fix.md | 11297 |
| docs/reviews/2026-10-22-antigravity-provenance-ui-cleanup.md | 12281 |
| docs/reviews/2026-10-22-claude-landing-design-is.md | 14005 |
| docs/reviews/2026-10-22-claude-landing-redesign-review.md | 14993 |
| docs/reviews/2026-10-22-claude-provenance-ui-cleanup-review.md | 9867 |
| docs/reviews/2026-10-22-codex-provenance-cleanup-blocker.md | 1872 |
| docs/reviews/2026-10-22-codex-provenance-final-verification.md | 2470 |
| docs/reviews/2026-10-22-four-alley-data.md | 4459 |
| docs/reviews/2026-10-22-four-alley-fe.md | 10038 |
| docs/reviews/2026-10-22-four-alleys.md | 5779 |
| docs/reviews/2026-10-23-antigravity-qa-node-stories.md | 5868 |
| docs/reviews/2026-10-23-claude-home-uiux-review.md | 10434 |
| docs/reviews/2026-10-23-codex-coordination.md | 6849 |
| docs/reviews/2026-10-23-luna-alley-en.md | 4370 |
| docs/reviews/2026-10-23-luna-alley-voice-en.md | 4791 |
| docs/reviews/2026-10-23-luna-alley-voice-vi.md | 8748 |
| docs/reviews/2026-10-23-node-story-voice-report.md | 4168 |
| docs/superpowers/plans/2026-10-02-phase-1-bundled-fixture.md | 5950 |
| docs/superpowers/plans/2026-10-02-phase-1-native-shell.md | 5981 |
| docs/superpowers/plans/2026-10-22-four-alley-content.md | 23475 |
| docs/superpowers/plans/2026-10-23-home-uiux-en-voice-handoff.md | 12067 |
| docs/superpowers/specs/2026-10-02-greenfield-phase-1-proposal.md | 4602 |
| docs/superpowers/specs/2026-10-03-phase-2-intro-qa-design.md | 5682 |
| docs/superpowers/specs/2026-10-03-phase-3-recommendation-design.md | 5466 |
| docs/superpowers/specs/2026-10-03-phase-4-camera-qa-design.md | 4751 |
| docs/superpowers/specs/2026-10-03-phase-5-location-design.md | 5390 |
| docs/superpowers/specs/2026-10-03-phase-6-live-api-design.md | 5184 |
| docs/superpowers/specs/2026-10-03-phase-7-offline-e2e-design.md | 4826 |
| mobile/.gitignore | 481 |
| mobile/App.tsx | 18371 |
| mobile/LICENSE | 1127 |
| mobile/README.md | 19889 |
| mobile/app.json | 2881 |
| mobile/assets/android-icon-background.png | 17549 |
| mobile/assets/android-icon-foreground.png | 78796 |
| mobile/assets/android-icon-monochrome.png | 4140 |
| mobile/assets/favicon.png | 1129 |
| mobile/assets/icon.expo.png | 1460415 |
| mobile/assets/icon.png | 730807 |
| mobile/assets/logo_monogram.jpg | 730807 |
| mobile/assets/photos/alleys/bun-ca-sam-cay-si-1.jpg | 215196 |
| mobile/assets/photos/alleys/chua-cau-dong-1.jpg | 472055 |
| mobile/assets/photos/alleys/dinh-thanh-ha-1.jpg | 240476 |
| mobile/assets/photos/alleys/ngo-cam-chi-cover.png | 879592 |
| mobile/assets/photos/alleys/ngo-gach-cover.png | 1398380 |
| mobile/assets/photos/alleys/ngo-tam-thuong-cover.png | 4138537 |
| mobile/assets/photos/alleys/ngo-trung-yen-cover.png | 2734316 |
| mobile/assets/photos/alleys/pho-suong-1.jpg | 318846 |
| mobile/assets/photos/cafengotongduytan_04.jpg | 226414 |
| mobile/assets/photos/cover_hero.jpg | 1106050 |
| mobile/assets/photos/cuaso_hanoi_02.jpg | 239692 |
| mobile/assets/photos/ngocamchi_03.jpg | 257783 |
| mobile/assets/photos/ngochieusau_05.jpg | 136360 |
| mobile/assets/photos/ngophatloc_01.jpg | 335173 |
| mobile/assets/photos/ngophatloc_06.jpg | 324434 |
| mobile/assets/photos/pexels_demo_01.jpg | 263293 |
| mobile/assets/photos/pexels_demo_02.jpg | 187478 |
| mobile/assets/photos/pexels_demo_03.jpg | 311844 |
| mobile/assets/photos/pexels_demo_04.jpg | 258440 |
| mobile/assets/photos/pexels_demo_05.jpg | 233807 |
| mobile/assets/photos/pexels_demo_06.jpg | 216551 |
| mobile/assets/photos/three-lenses/bach-ma.jpg | 859989 |
| mobile/assets/photos/three-lenses/dong-xuan-fire.jpg | 886501 |
| mobile/assets/photos/three-lenses/dong-xuan-street.jpg | 716538 |
| mobile/assets/photos/three-lenses/dong-xuan-timeline.jpg | 676137 |
| mobile/assets/photos/three-lenses/ma-may.jpg | 417418 |
| mobile/assets/sounds/prologue_door.wav | 48554 |
| mobile/assets/sounds/prologue_waterdrop.wav | 45908 |
| mobile/assets/splash-icon.png | 17547 |
| mobile/assets/voice/LICENSES.md | 2452 |
| mobile/assets/voice/alleys-intro/en/ngo-cam-chi-intro.mp3 | 720604 |
| mobile/assets/voice/alleys-intro/en/ngo-phat-loc-intro.mp3 | 659164 |
| mobile/assets/voice/alleys-intro/en/ngo-tam-thuong-intro.mp3 | 638684 |
| mobile/assets/voice/alleys-intro/en/ngo-trung-yen-intro.mp3 | 769087 |
| mobile/assets/voice/alleys-intro/manifest.en.json | 4654 |
| mobile/assets/voice/alleys-intro/manifest.vi.json | 4815 |
| mobile/assets/voice/alleys-intro/progress.en.json | 4017 |
| mobile/assets/voice/alleys-intro/progress.vi.json | 4016 |
| mobile/assets/voice/alleys-intro/vi/ngo-cam-chi-intro.mp3 | 615278 |
| mobile/assets/voice/alleys-intro/vi/ngo-phat-loc-intro.mp3 | 597724 |
| mobile/assets/voice/alleys-intro/vi/ngo-tam-thuong-intro.mp3 | 601486 |
| mobile/assets/voice/alleys-intro/vi/ngo-trung-yen-intro.mp3 | 647461 |
| mobile/assets/voice/demo-01-caption.mp3 | 50733 |
| mobile/assets/voice/demo-01-story.mp3 | 287469 |
| mobile/assets/voice/demo-02-caption.mp3 | 45837 |
| mobile/assets/voice/demo-02-story.mp3 | 323469 |
| mobile/assets/voice/demo-03-caption.mp3 | 53613 |
| mobile/assets/voice/demo-03-story.mp3 | 328653 |
| mobile/assets/voice/demo-04-caption.mp3 | 43821 |
| mobile/assets/voice/demo-04-story.mp3 | 311949 |
| mobile/assets/voice/demo-05-caption.mp3 | 46701 |
| mobile/assets/voice/demo-05-story.mp3 | 285453 |
| mobile/assets/voice/demo-06-caption.mp3 | 52461 |
| mobile/assets/voice/demo-06-story.mp3 | 344205 |
| mobile/assets/voice/intro.mp3 | 241965 |
| mobile/assets/voice/manifest.json | 13112 |
| mobile/assets/voice/node-stories/en/cam-chi-den-vong-tien-story.mp3 | 422181 |
| mobile/assets/voice/node-stories/en/cam-chi-khong-gian-nghe-thuat-story.mp3 | 361995 |
| mobile/assets/voice/node-stories/en/cam-chi-ngo-hoi-vu-story.mp3 | 402955 |
| mobile/assets/voice/node-stories/en/ngo-gach-ca-phe-no1-story.mp3 | 226158 |
| mobile/assets/voice/node-stories/en/ngo-gach-cafe-20-story.mp3 | 246638 |
| mobile/assets/voice/node-stories/en/ngo-gach-chua-cau-dong-story.mp3 | 441407 |
| mobile/assets/voice/node-stories/en/ngo-gach-dinh-thanh-ha-story.mp3 | 436392 |
| mobile/assets/voice/node-stories/en/ngo-gach-ta-ca-phe-4-story.mp3 | 294286 |
| mobile/assets/voice/node-stories/en/phat-loc-cac-nhanh-ngo-story.mp3 | 422181 |
| mobile/assets/voice/node-stories/en/phat-loc-den-tien-ha-story.mp3 | 407971 |
| mobile/assets/voice/node-stories/en/tam-thuong-den-vong-tien-story.mp3 | 423435 |
| mobile/assets/voice/node-stories/en/tam-thuong-dinh-yen-thai-story.mp3 | 451438 |
| mobile/assets/voice/node-stories/en/trung-yen-bun-ca-sam-cay-si-story.mp3 | 443915 |
| mobile/assets/voice/node-stories/en/trung-yen-bun-ngan-nhan-story.mp3 | 410478 |
| mobile/assets/voice/node-stories/en/trung-yen-dinh-trung-yen-story.mp3 | 448931 |
| mobile/assets/voice/node-stories/en/trung-yen-pho-ga-huong-tra-story.mp3 | 407971 |
| mobile/assets/voice/node-stories/en/trung-yen-pho-suong-story.mp3 | 372444 |
| mobile/assets/voice/node-stories/manifest.json | 44825 |
| mobile/assets/voice/node-stories/progress.json | 39917 |
| mobile/assets/voice/node-stories/vi/cam-chi-den-vong-tien-story.mp3 | 381221 |
| mobile/assets/voice/node-stories/vi/cam-chi-khong-gian-nghe-thuat-story.mp3 | 323543 |
| mobile/assets/voice/node-stories/vi/cam-chi-ngo-hoi-vu-story.mp3 | 399194 |
| mobile/assets/voice/node-stories/vi/ngo-gach-ca-phe-no1-story.mp3 | 158449 |
| mobile/assets/voice/node-stories/vi/ngo-gach-cafe-20-story.mp3 | 223651 |
| mobile/assets/voice/node-stories/vi/ngo-gach-chua-cau-dong-story.mp3 | 372444 |
| mobile/assets/voice/node-stories/vi/ngo-gach-dinh-thanh-ha-story.mp3 | 351964 |
| mobile/assets/voice/node-stories/vi/ngo-gach-ta-ca-phe-4-story.mp3 | 224905 |
| mobile/assets/voice/node-stories/vi/phat-loc-cac-nhanh-ngo-story.mp3 | 336500 |
| mobile/assets/voice/node-stories/vi/phat-loc-den-tien-ha-story.mp3 | 355726 |
| mobile/assets/voice/node-stories/vi/tam-thuong-den-vong-tien-story.mp3 | 346531 |
| mobile/assets/voice/node-stories/vi/tam-thuong-dinh-yen-thai-story.mp3 | 413404 |
| mobile/assets/voice/node-stories/vi/trung-yen-bun-ca-sam-cay-si-story.mp3 | 422181 |
| mobile/assets/voice/node-stories/vi/trung-yen-bun-ngan-nhan-story.mp3 | 361995 |
| mobile/assets/voice/node-stories/vi/trung-yen-dinh-trung-yen-story.mp3 | 373698 |
| mobile/assets/voice/node-stories/vi/trung-yen-pho-ga-huong-tra-story.mp3 | 386237 |
| mobile/assets/voice/node-stories/vi/trung-yen-pho-suong-story.mp3 | 400447 |
| mobile/assets/voice/post8/old-quarter-pilot/en/bm-guardian-answer.mp3 | 172269 |
| mobile/assets/voice/post8/old-quarter-pilot/en/bm-horse-answer.mp3 | 185517 |
| mobile/assets/voice/post8/old-quarter-pilot/en/bm-observe-answer.mp3 | 203949 |
| mobile/assets/voice/post8/old-quarter-pilot/en/intro.mp3 | 265005 |
| mobile/assets/voice/post8/old-quarter-pilot/en/oldquarter-bach-ma-caption.mp3 | 65421 |
| mobile/assets/voice/post8/old-quarter-pilot/en/oldquarter-bach-ma-story.mp3 | 735309 |
| mobile/assets/voice/post8/old-quarter-pilot/manifest.json | 29153 |
| mobile/assets/voice/post8/old-quarter-pilot/vi/bm-guardian-answer.mp3 | 135981 |
| mobile/assets/voice/post8/old-quarter-pilot/vi/bm-horse-answer.mp3 | 186093 |
| mobile/assets/voice/post8/old-quarter-pilot/vi/bm-observe-answer.mp3 | 170541 |
| mobile/assets/voice/post8/old-quarter-pilot/vi/intro.mp3 | 239085 |
| mobile/assets/voice/post8/old-quarter-pilot/vi/oldquarter-bach-ma-caption.mp3 | 61101 |
| mobile/assets/voice/post8/old-quarter-pilot/vi/oldquarter-bach-ma-story.mp3 | 560781 |
| mobile/assets/voice/post8/remaining-elevenlabs/LICENSES.md | 1089 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-01-caption.mp3 | 76529 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-01-story.mp3 | 450185 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-02-caption.mp3 | 67752 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-02-story.mp3 | 511625 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-03-caption.mp3 | 79037 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-03-story.mp3 | 559272 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-04-caption.mp3 | 66498 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-04-story.mp3 | 533358 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-05-caption.mp3 | 69006 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-05-story.mp3 | 547569 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-06-caption.mp3 | 74021 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/demo-06-story.mp3 | 639938 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/intro.mp3 | 331484 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-01-answer.mp3 | 188124 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-02-answer.mp3 | 209858 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-03-answer.mp3 | 204425 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-04-answer.mp3 | 157195 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-05-answer.mp3 | 222397 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-06-answer.mp3 | 178929 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-box-answer.mp3 | 221143 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-cake-answer.mp3 | 186870 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-che-answer.mp3 | 205678 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-clock-answer.mp3 | 160957 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-envelope-answer.mp3 | 219889 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-flowers-answer.mp3 | 191886 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-gear-answer.mp3 | 153434 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-home-answer.mp3 | 222397 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-huong-answer.mp3 | 222397 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-knot-answer.mp3 | 208604 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-lam-answer.mp3 | 205678 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-letter-answer.mp3 | 203171 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-light-answer.mp3 | 218635 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-ribbon-answer.mp3 | 188124 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/en/qa-xoi-answer.mp3 | 212366 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-01-caption.mp3 | 65244 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-01-story.mp3 | 412150 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-02-caption.mp3 | 54795 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-02-story.mp3 | 489891 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-03-caption.mp3 | 71514 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-03-story.mp3 | 476098 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-04-caption.mp3 | 57303 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-04-story.mp3 | 481114 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-05-caption.mp3 | 54795 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-05-story.mp3 | 458126 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-06-caption.mp3 | 76529 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/demo-06-story.mp3 | 524581 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/intro.mp3 | 351964 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-01-answer.mp3 | 204425 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-02-answer.mp3 | 188124 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-03-answer.mp3 | 170152 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-04-answer.mp3 | 140477 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-05-answer.mp3 | 219889 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-06-answer.mp3 | 178929 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-box-answer.mp3 | 194394 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-cake-answer.mp3 | 152180 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-che-answer.mp3 | 175167 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-clock-answer.mp3 | 168898 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-envelope-answer.mp3 | 209858 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-flowers-answer.mp3 | 176421 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-gear-answer.mp3 | 152180 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-home-answer.mp3 | 221143 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-huong-answer.mp3 | 176421 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-knot-answer.mp3 | 188124 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-lam-answer.mp3 | 198155 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-letter-answer.mp3 | 195647 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-light-answer.mp3 | 196901 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-ribbon-answer.mp3 | 171406 |
| mobile/assets/voice/post8/remaining-elevenlabs/fiction-letter/vi/qa-xoi-answer.mp3 | 185198 |
| mobile/assets/voice/post8/remaining-elevenlabs/manifest.json | 267001 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/bm-guardian-answer.mp3 | 199409 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/bm-horse-answer.mp3 | 241623 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/bm-observe-answer.mp3 | 245385 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/dx-current-answer.mp3 | 222397 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/dx-food-answer.mp3 | 293032 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/dx-trade-answer.mp3 | 193140 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/intro.mp3 | 354472 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/mm-courtyard-answer.mp3 | 196901 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/mm-restore-answer.mp3 | 296794 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/mm-tube-answer.mp3 | 219889 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/oldquarter-bach-ma-caption.mp3 | 91994 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/oldquarter-bach-ma-story.mp3 | 803778 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/oldquarter-dong-xuan-caption.mp3 | 118743 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/oldquarter-dong-xuan-story.mp3 | 825512 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/oldquarter-ma-may-caption.mp3 | 107458 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/en/oldquarter-ma-may-story.mp3 | 826766 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/bm-guardian-answer.mp3 | 199409 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/bm-horse-answer.mp3 | 268790 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/bm-observe-answer.mp3 | 241623 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/dx-current-answer.mp3 | 232846 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/dx-food-answer.mp3 | 295540 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/dx-trade-answer.mp3 | 208604 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/intro.mp3 | 381221 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/mm-courtyard-answer.mp3 | 204425 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/mm-restore-answer.mp3 | 295540 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/mm-tube-answer.mp3 | 242877 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/oldquarter-bach-ma-caption.mp3 | 94501 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/oldquarter-bach-ma-story.mp3 | 868980 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/oldquarter-dong-xuan-caption.mp3 | 118743 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/oldquarter-dong-xuan-story.mp3 | 893221 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/oldquarter-ma-may-caption.mp3 | 108712 |
| mobile/assets/voice/post8/remaining-elevenlabs/old-quarter-pilot/vi/oldquarter-ma-may-story.mp3 | 948392 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-01-caption.mp3 | 64845 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-01-story.mp3 | 297261 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-02-caption.mp3 | 50733 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-02-story.mp3 | 316269 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-03-caption.mp3 | 65709 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-03-story.mp3 | 394029 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-04-caption.mp3 | 53901 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-04-story.mp3 | 357741 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-05-caption.mp3 | 58221 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-05-story.mp3 | 356013 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-06-caption.mp3 | 61101 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/demo-06-story.mp3 | 414189 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/intro.mp3 | 250605 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-01-answer.mp3 | 147501 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-02-answer.mp3 | 151245 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-03-answer.mp3 | 169965 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-04-answer.mp3 | 124173 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-05-answer.mp3 | 177165 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-06-answer.mp3 | 134253 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-box-answer.mp3 | 167373 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-cake-answer.mp3 | 147501 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-che-answer.mp3 | 167661 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-clock-answer.mp3 | 121869 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-envelope-answer.mp3 | 155853 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-flowers-answer.mp3 | 145485 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-gear-answer.mp3 | 122733 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-home-answer.mp3 | 160173 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-huong-answer.mp3 | 171981 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-knot-answer.mp3 | 153261 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-lam-answer.mp3 | 154989 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-letter-answer.mp3 | 148941 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-light-answer.mp3 | 163629 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-ribbon-answer.mp3 | 152973 |
| mobile/assets/voice/post8/remaining/fiction-letter/en/qa-xoi-answer.mp3 | 164493 |
| mobile/assets/voice/post8/remaining/manifest.json | 127661 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/en/dx-current-answer.mp3 | 182349 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/en/dx-food-answer.mp3 | 227853 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/en/dx-trade-answer.mp3 | 161037 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/en/mm-courtyard-answer.mp3 | 158733 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/en/mm-restore-answer.mp3 | 237933 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/en/mm-tube-answer.mp3 | 183789 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/en/oldquarter-dong-xuan-caption.mp3 | 95949 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/en/oldquarter-dong-xuan-story.mp3 | 815949 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/en/oldquarter-ma-may-caption.mp3 | 74925 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/en/oldquarter-ma-may-story.mp3 | 838989 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/vi/dx-current-answer.mp3 | 148653 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/vi/dx-food-answer.mp3 | 182637 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/vi/dx-trade-answer.mp3 | 135981 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/vi/mm-courtyard-answer.mp3 | 122733 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/vi/mm-restore-answer.mp3 | 188973 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/vi/mm-tube-answer.mp3 | 163917 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/vi/oldquarter-dong-xuan-caption.mp3 | 77517 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/vi/oldquarter-dong-xuan-story.mp3 | 560493 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/vi/oldquarter-ma-may-caption.mp3 | 59373 |
| mobile/assets/voice/post8/remaining/old-quarter-pilot/vi/oldquarter-ma-may-story.mp3 | 582669 |
| mobile/assets/voice/qa-01-answer.mp3 | 120717 |
| mobile/assets/voice/qa-02-answer.mp3 | 119853 |
| mobile/assets/voice/qa-03-answer.mp3 | 119853 |
| mobile/assets/voice/qa-04-answer.mp3 | 108333 |
| mobile/assets/voice/qa-05-answer.mp3 | 150381 |
| mobile/assets/voice/qa-06-answer.mp3 | 123597 |
| mobile/assets/voice/qa-box-answer.mp3 | 126477 |
| mobile/assets/voice/qa-cake-answer.mp3 | 115821 |
| mobile/assets/voice/qa-che-answer.mp3 | 125613 |
| mobile/assets/voice/qa-clock-answer.mp3 | 116973 |
| mobile/assets/voice/qa-envelope-answer.mp3 | 128493 |
| mobile/assets/voice/qa-flowers-answer.mp3 | 115821 |
| mobile/assets/voice/qa-gear-answer.mp3 | 102573 |
| mobile/assets/voice/qa-home-answer.mp3 | 137997 |
| mobile/assets/voice/qa-huong-answer.mp3 | 125613 |
| mobile/assets/voice/qa-knot-answer.mp3 | 124461 |
| mobile/assets/voice/qa-lam-answer.mp3 | 135981 |
| mobile/assets/voice/qa-letter-answer.mp3 | 135117 |
| mobile/assets/voice/qa-light-answer.mp3 | 138861 |
| mobile/assets/voice/qa-ribbon-answer.mp3 | 122733 |
| mobile/assets/voice/qa-xoi-answer.mp3 | 132237 |
| mobile/assets/voice/three-lenses-elevenlabs/en/bm-deity-answer.mp3 | 107458 |
| mobile/assets/voice/three-lenses-elevenlabs/en/bm-east-answer.mp3 | 112474 |
| mobile/assets/voice/three-lenses-elevenlabs/en/bm-name-answer.mp3 | 175167 |
| mobile/assets/voice/three-lenses-elevenlabs/en/dx-banner-answer.mp3 | 203171 |
| mobile/assets/voice/three-lenses-elevenlabs/en/dx-facade-answer.mp3 | 121251 |
| mobile/assets/voice/three-lenses-elevenlabs/en/dx-fire-answer.mp3 | 89486 |
| mobile/assets/voice/three-lenses-elevenlabs/en/dx-fountain-answer.mp3 | 129192 |
| mobile/assets/voice/three-lenses-elevenlabs/en/dx-goods-answer.mp3 | 100771 |
| mobile/assets/voice/three-lenses-elevenlabs/en/dx-history-answer.mp3 | 147164 |
| mobile/assets/voice/three-lenses-elevenlabs/en/dx-rebuild-answer.mp3 | 80291 |
| mobile/assets/voice/three-lenses-elevenlabs/en/dx-stalls-answer.mp3 | 135461 |
| mobile/assets/voice/three-lenses-elevenlabs/en/dx-trade-answer.mp3 | 131700 |
| mobile/assets/voice/three-lenses-elevenlabs/en/intro.mp3 | 1013594 |
| mobile/assets/voice/three-lenses-elevenlabs/en/mm-date-answer.mp3 | 114981 |
| mobile/assets/voice/three-lenses-elevenlabs/en/mm-layout-answer.mp3 | 158449 |
| mobile/assets/voice/three-lenses-elevenlabs/en/mm-restore-answer.mp3 | 88232 |
| mobile/assets/voice/three-lenses-elevenlabs/en/mm-trade-answer.mp3 | 168898 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-bach-ma-caption.mp3 | 80291 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-bach-ma-story.mp3 | 1516398 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-bach-ma-transition-story.mp3 | 372444 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-dong-xuan-caption.mp3 | 95755 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-dong-xuan-closing-story.mp3 | 847246 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-dong-xuan-fire-story.mp3 | 1428209 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-dong-xuan-story.mp3 | 1529355 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-dong-xuan-street-story.mp3 | 1408983 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-ma-may-caption.mp3 | 93247 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-ma-may-story.mp3 | 1663938 |
| mobile/assets/voice/three-lenses-elevenlabs/en/oldquarter-ma-may-transition-story.mp3 | 388745 |
| mobile/assets/voice/three-lenses-elevenlabs/manifest.json | 137257 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/bm-deity-answer.mp3 | 86978 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/bm-east-answer.mp3 | 98263 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/bm-name-answer.mp3 | 194394 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/dx-banner-answer.mp3 | 221143 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/dx-facade-answer.mp3 | 114981 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/dx-fire-answer.mp3 | 112474 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/dx-fountain-answer.mp3 | 129192 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/dx-goods-answer.mp3 | 107458 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/dx-history-answer.mp3 | 216127 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/dx-rebuild-answer.mp3 | 86978 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/dx-stalls-answer.mp3 | 125430 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/dx-trade-answer.mp3 | 127938 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/intro.mp3 | 1077541 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/mm-date-answer.mp3 | 119997 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/mm-layout-answer.mp3 | 171406 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/mm-restore-answer.mp3 | 108712 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/mm-trade-answer.mp3 | 166390 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-bach-ma-caption.mp3 | 89486 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-bach-ma-story.mp3 | 1696957 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-bach-ma-transition-story.mp3 | 422181 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-dong-xuan-caption.mp3 | 93247 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-dong-xuan-closing-story.mp3 | 937943 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-dong-xuan-fire-story.mp3 | 1698211 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-dong-xuan-story.mp3 | 1726632 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-dong-xuan-street-story.mp3 | 1626740 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-ma-may-caption.mp3 | 107458 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-ma-may-story.mp3 | 1999141 |
| mobile/assets/voice/three-lenses-elevenlabs/vi/oldquarter-ma-may-transition-story.mp3 | 409225 |
| mobile/assets/voice/three-lenses-nhat-phong/manifest.json | 23000 |
| mobile/assets/voice/three-lenses-nhat-phong/progress.json | 23208 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/bm-deity-answer.mp3 | 69006 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/bm-east-answer.mp3 | 80291 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/bm-name-answer.mp3 | 173914 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/dx-banner-answer.mp3 | 186870 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/dx-facade-answer.mp3 | 98263 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/dx-fire-answer.mp3 | 97009 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/dx-fountain-answer.mp3 | 118743 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/dx-goods-answer.mp3 | 88232 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/dx-history-answer.mp3 | 182691 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/dx-rebuild-answer.mp3 | 76529 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/dx-stalls-answer.mp3 | 112474 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/dx-trade-answer.mp3 | 116235 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/intro.mp3 | 1008578 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/mm-date-answer.mp3 | 100771 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/mm-layout-answer.mp3 | 148418 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/mm-restore-answer.mp3 | 95755 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/mm-trade-answer.mp3 | 134207 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-bach-ma-caption.mp3 | 71514 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-bach-ma-story.mp3 | 1580764 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-bach-ma-transition-story.mp3 | 419674 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-dong-xuan-caption.mp3 | 79037 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-dong-xuan-closing-story.mp3 | 888206 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-dong-xuan-fire-story.mp3 | 1520578 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-dong-xuan-story.mp3 | 1665192 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-dong-xuan-street-story.mp3 | 1520578 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-ma-may-caption.mp3 | 97009 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-ma-may-story.mp3 | 1836555 |
| mobile/assets/voice/three-lenses-nhat-phong/vi/oldquarter-ma-may-transition-story.mp3 | 387491 |
| mobile/assets/voice/three-lenses/en/bm-deity-answer.mp3 | 92781 |
| mobile/assets/voice/three-lenses/en/bm-east-answer.mp3 | 95949 |
| mobile/assets/voice/three-lenses/en/bm-name-answer.mp3 | 146061 |
| mobile/assets/voice/three-lenses/en/dx-banner-answer.mp3 | 179757 |
| mobile/assets/voice/three-lenses/en/dx-facade-answer.mp3 | 97677 |
| mobile/assets/voice/three-lenses/en/dx-fire-answer.mp3 | 69741 |
| mobile/assets/voice/three-lenses/en/dx-fountain-answer.mp3 | 105165 |
| mobile/assets/voice/three-lenses/en/dx-goods-answer.mp3 | 82125 |
| mobile/assets/voice/three-lenses/en/dx-history-answer.mp3 | 131085 |
| mobile/assets/voice/three-lenses/en/dx-rebuild-answer.mp3 | 67437 |
| mobile/assets/voice/three-lenses/en/dx-stalls-answer.mp3 | 104589 |
| mobile/assets/voice/three-lenses/en/dx-trade-answer.mp3 | 114669 |
| mobile/assets/voice/three-lenses/en/intro.mp3 | 755469 |
| mobile/assets/voice/three-lenses/en/mm-date-answer.mp3 | 94221 |
| mobile/assets/voice/three-lenses/en/mm-layout-answer.mp3 | 130509 |
| mobile/assets/voice/three-lenses/en/mm-restore-answer.mp3 | 75501 |
| mobile/assets/voice/three-lenses/en/mm-trade-answer.mp3 | 143757 |
| mobile/assets/voice/three-lenses/en/oldquarter-bach-ma-caption.mp3 | 54765 |
| mobile/assets/voice/three-lenses/en/oldquarter-bach-ma-story.mp3 | 1156941 |
| mobile/assets/voice/three-lenses/en/oldquarter-bach-ma-transition-story.mp3 | 280557 |
| mobile/assets/voice/three-lenses/en/oldquarter-dong-xuan-caption.mp3 | 68589 |
| mobile/assets/voice/three-lenses/en/oldquarter-dong-xuan-closing-story.mp3 | 641421 |
| mobile/assets/voice/three-lenses/en/oldquarter-dong-xuan-fire-story.mp3 | 1107693 |
| mobile/assets/voice/three-lenses/en/oldquarter-dong-xuan-story.mp3 | 1179117 |
| mobile/assets/voice/three-lenses/en/oldquarter-dong-xuan-street-story.mp3 | 1084365 |
| mobile/assets/voice/three-lenses/en/oldquarter-ma-may-caption.mp3 | 65709 |
| mobile/assets/voice/three-lenses/en/oldquarter-ma-may-story.mp3 | 1265805 |
| mobile/assets/voice/three-lenses/en/oldquarter-ma-may-transition-story.mp3 | 290349 |
| mobile/assets/voice/three-lenses/manifest.json | 148332 |
| mobile/assets/voice/three-lenses/vi/bm-deity-answer.mp3 | 61101 |
| mobile/assets/voice/three-lenses/vi/bm-east-answer.mp3 | 68013 |
| mobile/assets/voice/three-lenses/vi/bm-name-answer.mp3 | 133101 |
| mobile/assets/voice/three-lenses/vi/dx-banner-answer.mp3 | 150381 |
| mobile/assets/voice/three-lenses/vi/dx-facade-answer.mp3 | 75501 |
| mobile/assets/voice/three-lenses/vi/dx-fire-answer.mp3 | 76653 |
| mobile/assets/voice/three-lenses/vi/dx-fountain-answer.mp3 | 83277 |
| mobile/assets/voice/three-lenses/vi/dx-goods-answer.mp3 | 69741 |
| mobile/assets/voice/three-lenses/vi/dx-history-answer.mp3 | 147501 |
| mobile/assets/voice/three-lenses/vi/dx-rebuild-answer.mp3 | 59373 |
| mobile/assets/voice/three-lenses/vi/dx-stalls-answer.mp3 | 85293 |
| mobile/assets/voice/three-lenses/vi/dx-trade-answer.mp3 | 91917 |
| mobile/assets/voice/three-lenses/vi/intro.mp3 | 681453 |
| mobile/assets/voice/three-lenses/vi/mm-date-answer.mp3 | 79533 |
| mobile/assets/voice/three-lenses/vi/mm-layout-answer.mp3 | 112077 |
| mobile/assets/voice/three-lenses/vi/mm-restore-answer.mp3 | 77517 |
| mobile/assets/voice/three-lenses/vi/mm-trade-answer.mp3 | 103437 |
| mobile/assets/voice/three-lenses/vi/oldquarter-bach-ma-caption.mp3 | 50733 |
| mobile/assets/voice/three-lenses/vi/oldquarter-bach-ma-story.mp3 | 1113165 |
| mobile/assets/voice/three-lenses/vi/oldquarter-bach-ma-transition-story.mp3 | 273069 |
| mobile/assets/voice/three-lenses/vi/oldquarter-dong-xuan-caption.mp3 | 59373 |
| mobile/assets/voice/three-lenses/vi/oldquarter-dong-xuan-closing-story.mp3 | 616365 |
| mobile/assets/voice/three-lenses/vi/oldquarter-dong-xuan-fire-story.mp3 | 1106829 |
| mobile/assets/voice/three-lenses/vi/oldquarter-dong-xuan-story.mp3 | 1182285 |
| mobile/assets/voice/three-lenses/vi/oldquarter-dong-xuan-street-story.mp3 | 1119501 |
| mobile/assets/voice/three-lenses/vi/oldquarter-ma-may-caption.mp3 | 59373 |
| mobile/assets/voice/three-lenses/vi/oldquarter-ma-may-story.mp3 | 1339533 |
| mobile/assets/voice/three-lenses/vi/oldquarter-ma-may-transition-story.mp3 | 274221 |
| mobile/eas.json | 113 |
| mobile/eslint.config.mjs | 764 |
| mobile/index.ts | 315 |
| mobile/locales/en.json | 383 |
| mobile/locales/vi.json | 410 |
| mobile/metro.config.cjs | 309 |
| mobile/package-lock.json | 296766 |
| mobile/package.json | 1381 |
| mobile/plugins/withVoiceGatewayNetworkSecurity.cjs | 3220 |
| mobile/scripts/generate-prologue-sound.mjs | 7190 |
| mobile/src/assets/photoMap.ts | 10690 |
| mobile/src/components/AlleyGuideSection.tsx | 8616 |
| mobile/src/components/AlleyPassportModal.tsx | 7033 |
| mobile/src/components/AlleyStoryCard.tsx | 6583 |
| mobile/src/components/AlleyTrailView.tsx | 8676 |
| mobile/src/components/AppIcon.tsx | 1442 |
| mobile/src/components/ClickableSources.tsx | 3731 |
| mobile/src/components/CrossfadePhoto.tsx | 1631 |
| mobile/src/components/ExpandableInputDrawer.tsx | 8858 |
| mobile/src/components/NgoKeLogo.tsx | 4455 |
| mobile/src/components/NotebookDrawerModal.tsx | 12225 |
| mobile/src/components/PostcardCard.tsx | 5885 |
| mobile/src/components/ToolDock.tsx | 5132 |
| mobile/src/components/VoiceInteractionDock.tsx | 9089 |
| mobile/src/components/VoicePlayerBar.tsx | 3582 |
| mobile/src/components/evidenceParser.ts | 647 |
| mobile/src/context/LocaleContext.tsx | 2943 |
| mobile/src/data/alleyGuide.ts | 2212 |
| mobile/src/data/canonicalJson.ts | 1577 |
| mobile/src/data/collections.ts | 9231 |
| mobile/src/data/live.ts | 17455 |
| mobile/src/data/locale.ts | 984 |
| mobile/src/data/localeStorage.ts | 1211 |
| mobile/src/data/localeStorageCore.ts | 2336 |
| mobile/src/data/sourceState.ts | 25739 |
| mobile/src/data/threeLensesCompanion.ts | 8337 |
| mobile/src/hooks/MotionPreferences.tsx | 1662 |
| mobile/src/hooks/useMotion.ts | 4874 |
| mobile/src/i18n/translator.ts | 66766 |
| mobile/src/location/nearest.ts | 2797 |
| mobile/src/navigation.ts | 1313 |
| mobile/src/qa/match.ts | 1560 |
| mobile/src/qr/confirmPoint.ts | 752 |
| mobile/src/qr/parseQr.ts | 385 |
| mobile/src/recommendation/pick.ts | 6774 |
| mobile/src/screens/AlleySelectScreen.tsx | 24036 |
| mobile/src/screens/CameraScreen.tsx | 22717 |
| mobile/src/screens/HomeScreen.tsx | 37038 |
| mobile/src/screens/LandingScreen.tsx | 21042 |
| mobile/src/screens/LocationScreen.tsx | 24387 |
| mobile/src/screens/PlaceholderScreen.tsx | 2101 |
| mobile/src/screens/PlanScreen.tsx | 20702 |
| mobile/src/screens/PrologueScreen.tsx | 36116 |
| mobile/src/screens/QaScreen.tsx | 62102 |
| mobile/src/screens/UnavailableScreen.tsx | 4600 |
| mobile/src/theme.ts | 2079 |
| mobile/src/theme/motion.ts | 2215 |
| mobile/src/utils/alleyGeometry.ts | 6183 |
| mobile/src/voice/alleysCatalog.ts | 4502 |
| mobile/src/voice/appState.ts | 1090 |
| mobile/src/voice/catalog.ts | 10219 |
| mobile/src/voice/config.ts | 477 |
| mobile/src/voice/intent.ts | 13965 |
| mobile/src/voice/localizedCatalog.ts | 2285 |
| mobile/src/voice/metering.ts | 200 |
| mobile/src/voice/nodeStoriesCatalog.ts | 14282 |
| mobile/src/voice/performance.ts | 1402 |
| mobile/src/voice/playback.ts | 1474 |
| mobile/src/voice/post8Catalog.ts | 4368 |
| mobile/src/voice/post8RemainingCatalog.ts | 17220 |
| mobile/src/voice/recorderPreparation.ts | 3191 |
| mobile/src/voice/recordingLimit.ts | 411 |
| mobile/src/voice/threeLensesCatalog.ts | 17617 |
| mobile/src/voice/transcribe.ts | 2567 |
| mobile/src/voice/useVoiceSession.ts | 26119 |
| mobile/tests/alleyContent.test.mjs | 5552 |
| mobile/tests/alleyGuideSection.test.mjs | 15936 |
| mobile/tests/alleyIntegration.test.mjs | 38531 |
| mobile/tests/alleyStoryCard.test.mjs | 16481 |
| mobile/tests/alleysVoiceCatalogue.test.mjs | 6693 |
| mobile/tests/cameraQr.test.mjs | 3191 |
| mobile/tests/fictionContent.test.mjs | 2126 |
| mobile/tests/fourAlleyDatasets.test.mjs | 7020 |
| mobile/tests/homeIntroPlay.test.mjs | 20490 |
| mobile/tests/homePhaseB.test.mjs | 42524 |
| mobile/tests/landingQuickActions.test.mjs | 22649 |
| mobile/tests/landingRedesign.test.mjs | 25853 |
| mobile/tests/live.test.mjs | 10664 |
| mobile/tests/location.test.mjs | 5693 |
| mobile/tests/nodeStoryVoiceCatalogue.test.mjs | 5354 |
| mobile/tests/post8SharedContract.test.mjs | 43206 |
| mobile/tests/post8VoiceCatalogue.test.mjs | 22918 |
| mobile/tests/provenanceUiCleanup.test.mjs | 50242 |
| mobile/tests/qa.test.mjs | 11399 |
| mobile/tests/qaNodeStoryVoice.test.mjs | 28275 |
| mobile/tests/qaRegressions.test.mjs | 2558 |
| mobile/tests/recommendation.test.mjs | 7146 |
| mobile/tests/remediationIntegration.test.mjs | 56053 |
| mobile/tests/sourceState.test.mjs | 16297 |
| mobile/tests/threeLensesIntegration.test.mjs | 13844 |
| mobile/tests/threeLensesVoiceCatalogue.test.mjs | 2933 |
| mobile/tests/uiFlows.test.mjs | 244361 |
| mobile/tests/voiceCatalogue.test.mjs | 4710 |
| mobile/tests/voiceIntent.test.mjs | 11162 |
| mobile/tests/voiceLifecycle.test.mjs | 3281 |
| mobile/tests/voiceMetering.test.mjs | 586 |
| mobile/tests/voiceNetworkSecurity.test.mjs | 5129 |
| mobile/tests/voicePerformance.test.mjs | 1413 |
| mobile/tests/voicePlayback.test.mjs | 3319 |
| mobile/tests/voiceRecorderPreparation.test.mjs | 4926 |
| mobile/tests/voiceRecordingLimit.test.mjs | 718 |
| mobile/tests/voiceSessionLifecycle.test.mjs | 21318 |
| mobile/tests/voiceTranscription.test.mjs | 5201 |
| mobile/tsconfig.json | 164 |
| tools/e2e/audit_apk_assets.py | 4604 |
| tools/e2e/demo-scenario.mjs | 12536 |
| tools/e2e/e2e-env.mjs | 8281 |
| tools/e2e/guards.test.mjs | 7502 |
| tools/e2e/native-flow.mjs | 26323 |
| tools/e2e/phase7-checks.mjs | 14981 |
| tools/e2e/phase8-http.test.mjs | 14050 |
| tools/e2e/post8-content.test.mjs | 17672 |
| tools/e2e/test_audit_apk_assets.py | 3490 |
| tools/mock-api/server.mjs | 2765 |
| tools/voice/POST8_ELEVENLABS_DRY_RUN.json | 45643 |
| tools/voice/POST8_ELEVENLABS_REPORT.md | 4771 |
| tools/voice/POST8_REMAINING_REPORT.md | 8792 |
| tools/voice/README.md | 2464 |
| tools/voice/THREE_LENSES_ELEVENLABS_REPORT.md | 16217 |
| tools/voice/THREE_LENSES_VOICE_REPORT.md | 3711 |
| tools/voice/apply_nhat_phong_fiction_letter.py | 5820 |
| tools/voice/asr_model.py | 645 |
| tools/voice/benchmark_qa_asr.py | 5842 |
| tools/voice/elevenlabs_post8_remaining.py | 55467 |
| tools/voice/elevenlabs_three_lenses.py | 49584 |
| tools/voice/finalize_nhat_phong_three_lenses.py | 2673 |
| tools/voice/gateway/README.md | 3378 |
| tools/voice/gateway/post8_http_probe.mjs | 1643 |
| tools/voice/gateway/server.mjs | 11963 |
| tools/voice/gateway/smoke_test.mjs | 9536 |
| tools/voice/gateway/stt_worker.py | 4830 |
| tools/voice/gateway/test-fixtures/ios-aac-smoke.m4a | 23886 |
| tools/voice/gateway/test_stt_language.py | 656 |
| tools/voice/generate_alleys_intro.py | 20174 |
| tools/voice/generate_catalogue_v1.py | 8391 |
| tools/voice/generate_elevenlabs_catalogue.py | 8737 |
| tools/voice/generate_nhat_phong_three_lenses.py | 5914 |
| tools/voice/generate_node_stories.py | 30165 |
| tools/voice/post8_asr_probe.py | 3315 |
| tools/voice/post8_firstpoint.py | 16921 |
| tools/voice/post8_probe.py | 12268 |
| tools/voice/post8_remaining.py | 34491 |
| tools/voice/post8_story_speed_probe.py | 6679 |
| tools/voice/post8_synthetic_qa.mjs | 8768 |
| tools/voice/prepare_models.py | 1135 |
| tools/voice/probe_asr_v0.py | 4116 |
| tools/voice/probe_v0.py | 2961 |
| tools/voice/requirements-stt-cuda-win.txt | 381 |
| tools/voice/requirements-stt.txt | 92 |
| tools/voice/requirements-tts.txt | 96 |
| tools/voice/test_elevenlabs_post8_remaining.py | 11265 |
| tools/voice/test_elevenlabs_three_lenses.py | 20749 |
| tools/voice/test_generate_alleys_intro.py | 6767 |
| tools/voice/test_node_story_voice.py | 3952 |
| tools/voice/test_post8_probe.py | 3606 |
| tools/voice/test_post8_remaining.py | 3676 |
| tools/voice/test_three_lenses.py | 3920 |
| tools/voice/three_lenses.py | 26625 |
| tools/voice/tts_local.py | 1910 |
| tools/voice/validate_catalogue_v1.py | 7502 |

</details>



