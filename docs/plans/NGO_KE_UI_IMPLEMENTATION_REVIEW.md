# Ngõ Kể — Technical review of UX implementation readiness

Ngày: 23/10/2026. Verdict: **NEEDS_UI_SPEC_REVISION**.

Đây là review application source chỉ đọc. Hai tài liệu của Antigravity là đề xuất thiết kế, chưa phải quyền triển khai. Handoff đã hiệu chỉnh ở [ticket scopes](NGO_KE_UI_APPROVED_TICKETS.md); tên file đó không có nghĩa sáu ticket đã được duyệt. Đường dẫn yêu cầu có dấu `\` trước `.md` được hiểu là file Markdown thông thường `NGO_KE_UI_IMPLEMENTATION_REVIEW.md`.

## Baseline và bằng chứng

- Branch `valentino/logic-fix-mobile-20261020`; HEAD `4af64c49a4ada47f952ddf76c35adfb90f826224`, kiểm lại thực tế.
- Worktree đã có 11 tracked modifications: 4 file Phase 1A và 7 file Phase 1B đúng danh sách báo cáo trước. Các source sửa cục bộ ở Notebook/Home/Qa là một phần baseline của review, không coi HEAD commit tự chứa remediation.
- Untracked ban đầu: `.agents/`, `docs/audits/`, `docs/design/`, `docs/plans/`, hai báo cáo Phase 1A/1B, `mobile/.cache/`. Giữ nguyên. Không đọc `.env.local`.
- Đọc AGENTS, MEMORY phần mới nhất, backlog các ticket liên quan, Phase 1B report, hai tài liệu design và source/tests mục tiêu. Skill `mobile-ux-qa` dùng để phân biệt source, host regression và native evidence; tham chiếu TEST_REPORT/testing/mobile README là lịch sử có ngày, không lấy số test cũ làm trạng thái hiện tại.
- Chạy lại `npm test` tại `mobile/`: **405 PASS, 0 FAIL, 0 SKIP**, exit 0. Không thêm hoặc sửa test/application code. Không chạy native, gateway, paid API, tạo ảnh hay audio.
- Probe chỉ đọc: dataset IDs/tags/coordinates; catalogue exports; `pickPoints` trên dữ liệu thật; PNG header/size; tính relative luminance của các cặp màu opaque nêu trong audit. Probe không chứng minh layout, quyền ảnh hoặc hiệu năng native.

Nguồn chính: `docs/design/NGO_KE_UX_AUDIT.md` (AUD registry và ticket proposals), `docs/design/NGO_KE_UI_SPEC.md` v1.0. Source anchors dưới đây là line hiện tại gồm patch uncommitted Phase 1B.

## Phân loại toàn bộ AUD

Một finding có thể chứa nhiều claim; nhãn đầu là kết luận chính, các claim phụ được phân loại riêng để không biến bằng chứng source thành kết luận native.

| Finding | Phân loại | Bằng chứng, hiệu chỉnh và tác động |
| --- | --- | --- |
| AUD-VIS-001 | DESIGN_PREFERENCE | Nhiều surface/màu có thật (`theme.ts:3`, AlleySelect styles, Passport styles). “Xung đột triệt để/chói mắt” chưa có device/user evidence. Dual-surface là lựa chọn thiết kế cần duyệt, không tự là defect. NK-UI-01 phải giữ compatibility tokens. |
| AUD-VIS-002 | DESIGN_PREFERENCE | Headers khác nhau có trong source, nhưng khác cấu trúc vì khác tác vụ. Không có bằng chứng “mỗi kỹ sư khác nhau” là root cause. Y bằng nhau 100% chưa phải AC phù hợp khi nội dung, safe area và fontScale khác. ScreenHeader mới và thêm locale control vào Qa là scope bổ sung, không nằm trong file lists sáu ticket; hoãn. |
| AUD-VIS-003 | CONFIRMED_BY_SOURCE | Home:237–250 dùng `PIN_CONFIG[index]` và ghi đè id bằng **node.id**. Ở 2 node, Y=0.08/0.23, canvas tối thiểu 560 đúng như phép tính audit. Khoảng trống và tác động thẩm mỹ cần native review. Helper mẫu sinh `fallback-*` sẽ không khớp Home:491 `nodes.find(id===pinMeta.id)`; không được dùng nguyên mẫu. |
| AUD-STY-001 | INACCURATE | 17 node có qa=[] là đúng. “Bất kỳ câu nói nào cũng thất bại 100%” sai: `voice/intent.ts:8–11,94–110` và Qa:473–520 xử lý listen/replay/stop/next/plan/QR/GPS độc lập Q&A. Tests Phase 1B giữ dock/mic và typed/voice unknown. Cảm giác lời mời hỏi quá rộng là design concern; **ẩn toàn bộ mic/type theo qa=[] phá chức năng**, phải sửa NK-UI-03. |
| AUD-STY-002 | CONFIRMED_BY_SOURCE | Home pill khác AlleyStoryCard:88 dùng glyph; VoicePlayerBar:7–15 chỉ có play/replay/stop, không seek callback. Qa đã dùng vector AppIcon và elapsed/total. Đồng bộ trình bày là enhancement; seek ±5s/tap scrub và miniplayer là logic mới cần contract riêng. |
| AUD-STY-003 | CONFIRMED_BY_SOURCE | Độ dài node story VI 1570/1776/1383 đúng. Nhưng Qa:217–271 có **5 companion chapters**, activeChapter chọn text; không phải chỉ 3 khối node story. `storyText` tại Qa:1248 là **17/26**, không phải 15/24. “Mỏi mắt” NEEDS_NATIVE_VERIFICATION; drop cap/pull quote/immersive mode là DESIGN_PREFERENCE ngoài sáu ticket hiện tại. Không sửa narrative để làm ngắn. |
| AUD-IMG-001 | CONFIRMED_BY_SOURCE | photoMap:88–138 có reuse ảnh minh họa; 7 node ba ngõ cuối rơi HERO. Tuy nhiên `trung-yen-pho-vui`, `trung-yen-mien-tron-muc` audit nêu là **legacy entries không active**. Current Trung Yên thiếu ảnh cho đình và Hương Trà; tổng thiếu mapping **9/17**, không chỉ 7. Phải phân biệt current/legacy, cover/node photo, minh họa/ảnh địa điểm. |
| AUD-IMG-002 | CONFIRMED_BY_SOURCE | Bốn credit `Google Maps contributor (name not recorded · demo)` tồn tại. Nhãn đó chứng minh provenance thiếu, **không tự chứng minh vi phạm pháp lý hoặc consent không tồn tại**. Quyền cần human verification NK-007. Không xóa chuỗi/provenance để đạt grep test, không xóa binary trong UI ticket. |
| AUD-IMG-003 | NEEDS_NATIVE_VERIFICATION | Byte counts đúng: Tam Thương 4,138,537 (1440×1586), Trung Yên 2,734,316 (1024×1536), Gạch 1,398,380 (720×960); tổng 8,271,233 bytes. PNG không đồng nghĩa “không nén”; decoded RAM phụ thuộc dimensions/cache/layers, không bằng compressed bytes. Home hiện không có blurRadius=6; Landing có (`Landing:70`, Home:330–336). Frame drops/OOM/<50ms chưa đo. Compression/quality budget cần approval riêng. |
| AUD-MOB-001 | NEEDS_NATIVE_VERIFICATION | Stacked preview có thật nhưng Home:431 **chuyển sang AlleyTrailView khi fontScale>1.3 hoặc nodes>6**, không tiếp tục map spline như audit mô tả. Các chiều cao 65/170/85 và số điểm nhìn thấy chưa được đo native. Không thêm cap1.6 để che lỗi. Đối chiếu NK-017 trước gesture/collapse redesign. |
| AUD-MOB-002 | INACCURATE | `AlleySelectScreen.tsx:594–600`: filterChip đã có **minHeight:48**, justifyContent center; audit mô tả chỉ paddingVertical6 và “đo thực tế32pt” không khớp source và không có native evidence. Không thêm hitSlop chồng lấn để sửa lỗi chưa tồn tại. Native vẫn kiểm touchability thật. |
| AUD-MOB-003 | INACCURATE | close text #4A3B32 trên #F5ECE0 (Notebook:270–277) tính ra **9.15:1**, không phải3.8; màu đề xuất #2E3028 trên nền đó≈11.44, không phải8.2. #8C7D70 ở **toolGridDesc**:309, không phải busy source text. Cặp #8C7D70/#F7F2E7≈3.56 có thể là issue riêng của chữ tool nhỏ. Busy loading có thể cải thiện presentation, không được che lỗi/Retry. |
| AUD-PRD-001 | CONFIRMED_BY_TEST | Probe actual pickPoints tại budget60: food→empty, history→ok cho Tạm Thương/Cấm Chỉ/Phất Lộc; themes trong translator:574/578/582 là Ẩm thực. Logic lọc tags đúng contract; metadata ngõ không hứa mọi POI là quán ăn. “Dead end không lối ra” sai: Plan:287–306 đã có hướng dẫn đổi chủ đề/thời gian và reset. Nâng contextual recovery là UX enhancement; không gắn tag food vào di tích để có kết quả. |
| AUD-PRD-002 | CONFIRMED_BY_SOURCE | ALLEY_LIST:141 trở đi còn phat-loc/tam-thuong/cam-chi/hang-chi, getAlleyMeta:269 fallback đầu danh sách. Nhưng Home:89–96,206,354 ưu tiên **activeCollection** từ registry cho name/cover, không dùng legacy storyCount45min làm primary hiện tại. Không xóa entries hoặc đổi tất cả ID sang ngo-*; ba collection cũ có ID khác. NK-015 map consumer trước, không import collections vào photoMap gây vòng phụ thuộc. |
| AUD-PRD-003 | CONFIRMED_BY_SOURCE | Ba ngõ cuối có7 node null coords; Trung Yên3 null, tổng10/17. `nearest.ts:74–75` no-coordinates có thật, nhưng chỉ sau location request/permission/accuracy path, không “lập tức” trước mọi điều kiện. Location:337–364 luôn có chọn tay; không tê liệt cả hành trình. Manual-first copy là cải thiện thuộc NK-016; không bịa coords hoặc gán sơ đồ thành GPS route. |

Không finding AUD nào cần đánh dấu OBSOLETE toàn bộ: audit biết Phase 1B đã bỏ empty notice. Những claim phủ nhận voice commands hoặc nói filter chip32pt là **INACCURATE**, không dùng nhãn obsolete để che sai bằng chứng. Các lỗi NK-002/003/004 trước Phase 1B đã có host regression xác nhận sửa và không được đưa trở lại khi đổi UI.

## Inventory phải sửa trong audit/spec

| Collection | Nodes / Q&A mỗi locale | Audio correction / ranh giới |
| --- | --- | --- |
| fiction-letter | 6 /21 | Có intro +6 story **cả VI và EN**, không chỉ VI. VI gốc và EN trong remaining catalogue. Source VI `data/demo.json`, EN `data/localized/fiction.en.json`. |
| old-quarter-pilot | 3 /9 | Có intro +3 story +3 caption +9 answer **mỗi locale**; ô story “không có” trong audit sai. File `old-quarter.{vi,en}.json`. |
| old-quarter-three-lenses | 3 /16 | 5 chapters,3 transitions,closing; 5 photo keys không bằng5node. Source `three-lenses.{vi,en}.json`, companion ở `data/journeys/`. |
| ngo-gach | 5 /0 | 5 story/locale; chưa có intro track/alleyStory/guide. Không tự tạo chúng để khớp triết lý thiết kế. |
| ngo-trung-yen | 5 /0 | Intro +5story/locale; guide/alleyStory có; map thiếu2 currentnode. |
| ngo-tam-thuong | 2 /0 | Intro +2story/locale, cả2 thiếu nodephoto. |
| ngo-cam-chi | 3 /0 | Intro +3story/locale, cả3 thiếu nodephoto. |
| ngo-phat-loc | 2 /0 | Intro +2story/locale, cả2 thiếu nodephoto. |

Current 17 new node IDs (VI/EN cùng IDs, order lấy dataset):

- Gạch: `ngo-gach-ca-phe-no1`, `ngo-gach-ta-ca-phe-4`, `ngo-gach-dinh-thanh-ha`, `ngo-gach-cafe-20`, `ngo-gach-chua-cau-dong`.
- Trung Yên: `trung-yen-pho-suong`, `trung-yen-dinh-trung-yen`, `trung-yen-bun-ca-sam-cay-si`, `trung-yen-bun-ngan-nhan`, `trung-yen-pho-ga-huong-tra`.
- Tạm Thương: `tam-thuong-dinh-yen-thai`, `tam-thuong-den-vong-tien`.
- Cấm Chỉ: `cam-chi-khong-gian-nghe-thuat`, `cam-chi-ngo-hoi-vu`, `cam-chi-den-vong-tien`.
- Phất Lộc: `phat-loc-den-tien-ha`, `phat-loc-cac-nhanh-ngo`.

Nguồn catalogue resolver `localizedCatalog.ts:19–47` kiểm collection/locale/contentId/revision; hook kiểm kind/node/textHash thêm. Audio đang tồn tại không có nghĩa human-approved/listened. Không sửa revision hoặc repin trong UI ticket. Live có đúng dataset backend đã cung cấp, không lấy bundle để làm đủ guide/audio/POI cho layout.

## Các quy cách buộc sửa trước bàn giao implementation

1. **NK-UI-03:** qa=[] chỉ nói không có fixed answers. Giữ mic/type và commands, sửa lời mời theo khả năng thật; không gọi đây là vô hiệu hóa chức năng “không tồn tại”. Hành vi story-mode mới cần wireframe với accessible alternative và user approval.
2. **NK-UI-02:** helper nhận nodes/IDs, không chỉ nodeCount; `fallback-*` cấm trở thành identity. n=1 phải center, không ở15% như sample hiện tại; n=0/invalid dims có behavior rõ. Sơ đồ không có scale/navigation claim; visual pin38pt phải có parent touch target riêng đủ lớn.
3. **NK-UI-01:** không thay nguyên theme object. Spec bỏ `colors.muted`, `typography.label` đang dùng; đổi titleLarge32→24 và các shared keys gây migration toàn app ngoài allowlist. Thêm tokens tương thích, migrate từng component được duyệt. Không blanket cap font1.6; không áp no-hex rule lên cả repo. Mẫu component còn nhiều literal colors và định nghĩa terracotta/surfaceWarm lệch palette, cần một nguồn token thống nhất.
4. **NK-UI-04:** tách presentation-only khỏi seek/miniplayer. Current VoicePlayerBar chưa có onSeek; hook replay có seek nội bộ không phải API seek tùy ý. Không nâng player ownership lên App hay cho phát tiếp sau blur vì mâu thuẫn NK-003. Time hiển thị từ status/manifest đo thật, thiếu audio phải fallback trung thực.
5. **NK-UI-05:** thiết kế union visual photo/placeholder vì ImageSourcePropType không nhận JSX component. Phải rà Home/Qa/Postcard/Location/Camera/Crossfade consumers, không chỉ Postcard. Provenance và rights ledger giữ; placeholder không giả kiến trúc khảo sát. Compression là asset task riêng; spec200KB/1440×810 và audit250KB/1440×960 chưa thống nhất, <50ms không có protocol.
6. **NK-UI-06:** contextual Plan feedback phân biệt không có tag, không còn available/unvisited và budget quá ngắn. Không tự chuyển chủ đề; action chỉ đổi draft khi người dùng bấm. Cultural copy mới là content chưa approved. Legacy metadata cleanup tách riêng, không đổi canonical collection/node IDs.
7. **Ngoài sáu ticket:** shared ScreenHeader, immersive reading, swipe-collapse preview, miniplayer, ảnh nén mới, guide mới Gạch và GPS manual-first cần scope riêng; không giấu trong token migration.

Các file test `alleyGeometry.test.mjs`, `qaStoryMode.test.mjs`, `voicePlayerBar.test.mjs`, `photoMapping.test.mjs`, `planScreen.test.mjs`, `planScreenExperience.test.mjs` trong design **chưa tồn tại** ở baseline này; phải ghi rõ new thay vì viện dẫn lệnh đó như đã PASS. Tests hiện hữu gồm homePhaseB/alleyIntegration/homeIntroPlay/qaNodeStoryVoice/uiFlows/recommendation/location/provenanceUiCleanup và catalogue suites.

## Quyết định và thứ tự đề xuất

- Có thể trình duyệt triển khai ngay sau hiệu chỉnh scope: **NK-UI-02** (helper schematic bảo toàn IDs), **NK-UI-01A** (additive tokens + đúng ba component), **NK-UI-06A** (Plan recovery generic, explicit user action). Không ticket nào được chính review này cấp quyền coding.
- Antigravity cần sửa thiết kế trước: NK-UI-03 toàn bộ; NK-UI-04 phần seek/miniplayer; NK-UI-05 resolver/rights/asset boundaries; NK-UI-01 blanket typography/header/font caps; NK-UI-06 phần migration IDs/content copy.
- Native reproduction **trước khi quyết định fix**: clipping/gesture NK-017/MOB-001, hiệu năng ảnh/PNG IMG-003. Native **trước acceptance**: tất cả sáu ticket nếu được triển khai; source không chứng minh cảm nhận màu, safe area, keyboard, TalkBack/VoiceOver, physical audio hoặc GPS.
- Thứ tự Luna đề xuất sau user approval: 01A →02 →06A →04A (presentation-only đã chốt), rồi03 sau spec revision,05 sau rights/resolver review. Sol giữ technical review cho geometry/audio contract; Antigravity sửa spec và review visual; W4/owner thiết bị làm native QA theo assignment được user chốt. Không tự đổi ownership AGENTS hoặc dispatch.
- Không coi sáu ticket độc lập: UI02/04/05 cùng Home; UI03/04/05 cùng Qa; UI01/03 cùng Notebook/theme; UI05/06 cùng photoMap. Một writer mỗi shared file, tích hợp/test tuần tự; global token migration phải trước visual comparison.

**Cần người dùng quyết:** chọn các scope sẵn sàng kỹ thuật để mở; đề xuất 01A/02/06A trước. Nếu chưa mở, chỉ giữ hai tài liệu handoff. Chọn owner Luna là đề xuất của yêu cầu mới, chưa phải thay FE ownership lâu dài.

**Cần người dùng tự làm:** cung cấp/xác nhận quyền dùng ảnh khi NK-007/05 được mở (**[ngoài plan]** đối với giấy phép/consent từ bên thứ ba trong TECH_DEMO_PLAN); chưa có thì không nâng rights status hoặc ship asset như đã approved. Native/human listening theo NK-012 vẫn pending, không có thao tác thiết bị bắt buộc để hoàn tất review tài liệu này.
