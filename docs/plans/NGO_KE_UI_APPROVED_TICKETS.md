# Ngõ Kể — Corrected UI tickets for approval

Ngày: 23/10/2026. Parent review: [NGO_KE_UI_IMPLEMENTATION_REVIEW.md](NGO_KE_UI_IMPLEMENTATION_REVIEW.md).

**APPROVAL STATE: NONE.** Đây là danh sách scope đã được technical review để trình duyệt; tên file theo yêu cầu không biến ticket thành approved. Không worker được dispatch. Mọi file list dưới đây là allowlist **đề xuất cho đợt tương lai**, chỉ có hiệu lực khi người dùng mở đúng ticket/subscope. Source hiện tại gồm patch Phase 1A/1B chưa commit tại HEAD `4af64c49a4ada47f952ddf76c35adfb90f826224`.

## Quy tắc dùng chung

- Trước coding phải kiểm lại branch/HEAD/status và toàn bộ uncommitted patch; giữ WIP và untracked. Không chỉ so với commit HEAD mà bỏ qua Phase 1B.
- Không sửa data JSON, companion, coordinates, QR payload, node IDs/order, historical metadata, MP3, manifest, revision pins, catalogues hoặc hook audio trong sáu scope này. Không paid APIs, push/merge/deploy.
- Tests existing được sửa chỉ cho visual requirement đã được duyệt; không bỏ negative tests. Bảo toàn 8 collections × VI/EN, mode isolation, guards textHash/revision/kind/node, unknown handling và explicit confirmation GPS/QR.
- Không font cap blanket, tắt Dynamic Type, giảm touch targets hoặc giấu chức năng để snapshot vừa màn. Wrap/scroll/list là phương án ưu tiên; hard cap chỉ được xem xét cho element cụ thể sau native reproduction và approval rõ.
- Regression chung sau app patch: full mobile suite, typecheck, ESLint no-cache, diff check; các test backend/HTTP/Python còn lại khi contract liên quan bị chạm hoặc user yêu cầu. Count lấy thực tế; 405 là baseline review hiện tại, không target cố định.
- Native matrix chung: Android+iPhone, width320/360/375/430, fontScale1/1.3/2 và Dynamic Type khả dụng, VI/EN long labels, safe area/Back, keyboard, screen reader, reduced motion, offline, Live loading/empty/error/retry. Chưa chạy trên device thì ghi PENDING, không PASS.

| Ticket | Technical readiness | Quyền triển khai | Visual / logic |
| --- | --- | --- | --- |
| NK-UI-01 | Needs approval | Chưa có | 01A visual tokens; global typography/header là scope hoãn |
| NK-UI-02 | Ready với corrected contract dưới đây | Chưa có | Geometry presentation + ID/navigation integration |
| NK-UI-03 | Blocked — cần sửa spec | Chưa có | Affordance/copy + voice/input/navigation behavior |
| NK-UI-04 | Needs approval cho 04A; 04B Blocked | Chưa có | 04A presentation; seek/miniplayer là state/lifecycle logic |
| NK-UI-05 | Blocked — quyền ảnh và visual resolver chưa chốt | Chưa có | Resolver/consumers/provenance, không chỉ styles |
| NK-UI-06 | Needs approval cho 06A; 06B Needs spec review | Chưa có | Recommendation recovery/draft; legacy adapter riêng |

## NK-UI-01 — Additive tokens và các surface được chỉ định

**Corrected scope:** 01A bổ sung semantic tokens theo dual-surface đã được duyệt rồi migrate AlleySelect, Passport, Notebook. Không thay theme object hoặc typography toàn app theo code sample v1.0.

**Exact existing files đề xuất:**

- `mobile/src/theme.ts`
- `mobile/src/screens/AlleySelectScreen.tsx`
- `mobile/src/components/AlleyPassportModal.tsx`
- `mobile/src/components/NotebookDrawerModal.tsx`
- Tests: `mobile/tests/landingRedesign.test.mjs`, `mobile/tests/alleyGuideSection.test.mjs`, `mobile/tests/remediationIntegration.test.mjs`, `mobile/tests/uiFlows.test.mjs` — chỉ cases component/token tác động.

**Exact new file:** `mobile/tests/themeTokens.test.mjs` cho public token compatibility và meaningful contrast pairs; không snapshot toàn bộ source literal.

**Allowed:** thêm token tên mới; giữ alias `colors.muted`, `typography.label` và values của keys chưa được mở migration; thay references/colors chỉ ở ba UI consumers; tương phản labels/controls bằng cặp màu có context. Giữ fontScale flow và modal behaviors.

**Forbidden:** blanket hex ban/refactor repo; đổi titleLarge 32→24 trên shared key; ScreenHeader mới; thêm locale/action control; haptics dependency; cap1.6; xóa mode controls/provenance fields; thay source resolution NK-002.

**Acceptance criteria:** key consumers cũ resolve; VI/EN readable; close/back/Passport/Notebook mở đóng như cũ; Demo guide còn đúng locale, Live non-ready không có bundle; artwork overlay contrast được native review, không dùng tỷ lệ opaque để kết luận readability trên ảnh. Không yêu cầu Y headers đồng nhất 100%.

**Regression matrix:** existing token consumers load; 8 collections; Notebook Demo/Live ready/no-guide/non-ready/retry; modal reopen/Back; font 1/1.3/2. Native kiểm OLED transitions, focus order, safe-area và actual touch boxes. Audit filter chip 32pt không được dùng làm reason sửa vì source đã minHeight 48.

**Dependencies/risks:** NK-002 đã có host regression; overlap NK-UI-03 Notebook/copy. Global keys ảnh hưởng mọi screen, do đó 01A chỉ additive. Native layout liên quan NK-017.

**Proposed model/owner:** Luna implementation sau explicit ticket approval; Antigravity duyệt palette; Sol review compatibility; giữ ownership AGENTS cho tới khi user giao scope tạm rõ. **Status: Needs approval**, không blocker code đã xác nhận; palette/migration phải chốt trước.

## NK-UI-02 — Schematic trail fallback bảo toàn IDs

**Corrected scope:** thay spacing fallback cho các collection không có polyline, ngoại trừ fiction-letter giữ layout cũ. Không thay dataset geometry, `computeAlleyLayout` geographic projection hoặc route logic.

**Exact existing files:** `mobile/src/utils/alleyGeometry.ts`, `mobile/src/screens/HomeScreen.tsx`; tests `mobile/tests/alleyIntegration.test.mjs`, `mobile/tests/homePhaseB.test.mjs`, `mobile/tests/homeIntroPlay.test.mjs`, `mobile/tests/uiFlows.test.mjs` ở cases geometry/Home/navigation.

**Exact new file:** `mobile/tests/alleyGeometry.test.mjs`.

**Allowed contract:** helper nhận ordered nodes/IDs và canvas dimensions; output pins mang **chính node.id**. n=0→empty; n=1→center; n>=2 Y từ 0.15 đến 0.85; finite positive dimensions là precondition, invalid dimensions→empty result theo test rõ. X so le, spline finite. Preserving fiction PIN_CONFIG positions theo hành vi baseline; không dùng synthetic fallback IDs làm state. Canvas chỉ là sơ đồ thứ tự, không route/distance/ETA.

**Forbidden:** chỉnh coords/length/order/status; auto-confirm node; đổi navigation payload; bịa GPS position; nới source validation; sửa Home intro guards; thay polyline nhánh Gạch/Trung Yên; thay fontScale>1.3 và >6 node list fallback khi chưa có yêu cầu.

**Acceptance criteria:** Tạm Thương/Phất Lộc 2 pins tách Y 70% canvas; Cấm Chỉ/pilot/Three Lenses 3 pins tương ứng node IDs thực tế; một node giả lập nằm giữa; tap known available pin vẫn mở đúng node/story; closed node không được confirm; fiction 6 không lệch; reorder không trỏ sai node. Inline descriptor “sơ đồ”/“schematic” chỉ nếu copy được duyệt, không coi vector là survey evidence.

**Regression matrix:** n0/1/2/3/5/6/>6; IDs reordering/unavailable; fixture 6 node cũ; polyline unchanged; không polyline V2; VI/EN; fonts 1/1.3/2; source error; pending intro→blur; live collection absent/unknown không substitute Demo. Native verify pin touch boxes, labels/collisions, scroll and selected preview ở phone hẹp.

**Dependencies/risks:** giữ NK-003, NK-012/017 cho native acceptance. `TrailPinMeta` đang local ở Home; helper type riêng hoặc compatible export cần đúng kiểu, không import screen vào utility. Shared Home serial với 04/05. Spec sample `fallback-*` bị từ chối vì Home tìm node bằng pin ID.

**Proposed model/owner:** Luna cho helper/wiring; Sol review identity và boundary tests; Antigravity visual review. **Status: Ready để người dùng cấp scope**, chưa approved, không cần khảo sát GPS để sửa schematic spacing.

## NK-UI-03 — Affordance đúng khả năng, giữ voice commands

**Corrected scope:** sửa lời mời/labels cho node không fixed Q&A và trình bày story actions; giữ access mic, typing và các commands. Không triển khai bản v1.0 ẩn toàn bộ mic/type theo qa=[].

**Exact existing files đề xuất sau khi spec sửa:** `mobile/src/screens/QaScreen.tsx`, `mobile/src/components/VoiceInteractionDock.tsx`, `mobile/src/components/ExpandableInputDrawer.tsx`, `mobile/src/i18n/translator.ts`; tests `mobile/tests/qaNodeStoryVoice.test.mjs`, `mobile/tests/uiFlows.test.mjs`, `mobile/tests/voiceIntent.test.mjs` chỉ regressions của affordance. Translator chỉ thêm/update copy keys được duyệt.

**Exact new file:** `mobile/tests/qaStoryMode.test.mjs`. Không tạo StoryPlayerDock hoặc second audio hook trong scope corrected tối thiểu này.

**Allowed:** copy ví dụ “Điều khiển bằng giọng nói / Voice controls” cho không có fixed Q&A, hướng dẫn khả năng thật; chỉ show suggested-question section khi có questions, nhưng giữ text input fallback. Existing story controls/prev-next không duplicate focus targets. Khi recording/transcribing vẫn có progress/cancel/errors.

**Forbidden:** `hasQa=false` vô hiệu hóa mic/type; thay matcher/aliases/intents/hook; tạo câu trả lời; đổi companion.qaIds semantics (NK-019); phục hồi emptyNotice NK-004; auto-play hay auto-open QR/GPS; badge “di sản thật” cho simulated fiction/data.

**Acceptance criteria:** 17 nodes × VI/EN vẫn listen/replay/stop/next/plan/QR/GPS commands; explicit action confirmation giữ; question lạ vẫn unknown typed/voice; source errors/Retry không bị story-mode che; 21/9/16 Q&A cũ, follow-ups và Three Lenses intro/chapter/transition/closing giữ nguyên. Không nói qa=[] nghĩa không có audio hay commands.

**Regression matrix:** không Q&A / có Q&A / Q&A chỉ tại node khác; voice idle/denied/permanently-denied/recording/stopping/transcribing/error; typed unknown; đổi locale và collection; thiếu audio / revision không khớp; mode switch; font / keyboard; actual intent parser và UI callback integration. Native trước acceptance: mic controls/cancel/settings, keyboard, VoiceOver/TalkBack và physical speech được kiểm riêng với host transcript mocks.

**Dependencies/risks:** NK-004 behavior giữ, NK-003/home/Qa scopes không trộn; NK-019 cần quyết riêng nếu muốn đổi chapter QA. Chuẩn UI-03 và UI-04 player locations phải chốt để không controls trùng lặp.

**Proposed model/owner:** Antigravity sửa spec; Sol review behavior; Luna chỉ implement copy/layout đã được mở. **Status: Blocked — v1.0 gây regression mất commands, cần revised wireframe/AC và user approval.**

## NK-UI-04 — Audio presentation; seek/miniplayer hoãn

**Corrected scope 04A:** thống nhất icon, elapsed/total time và a11y label, dùng state từ player hiện tại. **04B** (seek ±5/tap scrub/miniplayer/persist after blur) không thuộc scope sẵn sàng.

**Exact existing files 04A:** `mobile/src/components/VoicePlayerBar.tsx`, `mobile/src/components/AlleyStoryCard.tsx`, `mobile/src/screens/HomeScreen.tsx`; tests `mobile/tests/alleyStoryCard.test.mjs`, `mobile/tests/homeIntroPlay.test.mjs`, `mobile/tests/homePhaseB.test.mjs`, `mobile/tests/qaNodeStoryVoice.test.mjs`, `mobile/tests/uiFlows.test.mjs` cases player props. `QaScreen.tsx` chỉ bổ sung vào allowlist nếu revised design thật sự cần wiring khác; mặc định không đổi.

**Exact new files 04A:** `mobile/src/components/CompactAudioPlayer.tsx` (stateless presentation), `mobile/tests/voicePlayerBar.test.mjs` (pure component contract, compact/expanded). Reuse AppIcon existing API, không thêm glyph/icon package.

**Allowed:** card nhận optional currentTime/duration/measuredDuration/availability từ Home introPlayer hiện hữu; glyph→AppIcon; mm:ss, clamp finite/nonnegative; show progress/Ready/Unavailable đúng track; giảm chuyển động không animate equalizer; unknown duration không bịa. Không tạo player mới trong modal hoặc compact component.

**Forbidden:** chỉnh `useVoiceSession.ts`/recorder/playback engine; expose seek từ replay nội bộ; drag gesture dependency; kéo playback state lên App; miniplayer khi rời Qa/Home; thay cancelled generation semantics; repin catalogue; text mismatch vẫn phát clip.

**Acceptance criteria:** cùng một Home player qua modal open/close; play/pause/replay/stop behavior giữ; read-only progress không giả scrub affordance; thời lượng lấy runtime hoặc matched catalogue, không dùng hằng 00:40; Gạch không có intro vẫn text fallback; các intros VI/EN và Qa tracks hợp lệ vẫn đủ; blur/background vẫn stop, không tự resume.

**Regression matrix:** idle/playing/paused/ended/duration bằng 0/thiếu clip / lỗi native; seek không có trong 04A; audio mode đang pending→blur/unmount/locale/collection/mode; đóng modal rồi quay lại; guards kind/node/textHash của track thực tế; motion bình thường / giảm chuyển động; nhãn dài / font / keyboard. Native: nghe được play/pause/resume, interruptions/routes, timer/progress agreement, modal lifecycle, không phát muộn.

**Dependencies/risks:** NK-003 phải giữ tests đạt; NK-011 error feedback không âm thầm mở; layout UI-03 phải chốt nếu thay nơi controls. Home là shared file, thực hiện sau UI-02. **04B** cần riêng contract ownership/seek range/async cancellation/error/recording arbitration/return navigation/native evidence trước coding.

**Proposed model/owner:** Luna cho 04A; Sol audio contract review; Antigravity visual. **Status: Needs approval cho 04A; Blocked cho 04B**. Native acceptance pending, không cần sửa voice catalogue để chuẩn hóa UI.

## NK-UI-05 — Honest node visuals và quyền ảnh

**Corrected scope:** 05A lập rights/active/legacy mapping trước; 05B chỉ sau quyết định assets/renderer, áp placeholder trung thực thay vì ảnh giả danh. Compression 05C là task tài sản riêng chưa mở. Không xóa provenance bằng grep.

**Exact files 05A (docs only, proposed):** new `docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md`. Dữ liệu đầu vào đọc: `mobile/src/assets/photoMap.ts`, `docs/IMAGE_SOURCES.md`, active datasets; không write chúng ở 05A.

**Exact existing files 05B proposed:** `mobile/src/assets/photoMap.ts` (mapping hiển thị, giữ provenance/legacy records); `mobile/src/screens/HomeScreen.tsx`, `mobile/src/screens/QaScreen.tsx`, `mobile/src/screens/LocationScreen.tsx`, `mobile/src/screens/CameraScreen.tsx`, `mobile/src/components/PostcardCard.tsx`; `mobile/src/i18n/translator.ts` chỉ localized placeholder copy. `CrossfadePhoto.tsx` existing API giữ nguyên: chỉ nhận image source; branch renderer ở consumer trước khi gọi nó.

**Exact new files 05B:** `mobile/src/assets/nodeVisual.ts`, `mobile/src/components/HeritageSketchPlaceholder.tsx`, `mobile/tests/photoMapping.test.mjs`. Existing tests proposed: `mobile/tests/alleyIntegration.test.mjs`, `mobile/tests/homePhaseB.test.mjs`, `mobile/tests/qaNodeStoryVoice.test.mjs`, `mobile/tests/uiFlows.test.mjs`, `mobile/tests/provenanceUiCleanup.test.mjs` ở cases photo/caption/fallback.

**Allowed sau duyệt contract:** visual resolver discriminated union photo(imageSource,credit,status) / placeholder(reason,nodeName, alleyName). Không trả component JSX vào getNodePhoto đang trả ImageSourcePropType. Giữ current Three Lenses photoKey precedence, fiction photos, cover và node separation. Áp 17 current nodes theo ledger; generic vector phải ghi minh họa/chờ xác minh, không giả kiến trúc cụ thể.

**Forbidden:** xóa files/untracked/legacy entries/Google Maps credit/raw source notes; đổi rights flags thành approved; khẳng định pháp lý chỉ từ credit; sửa datasets; tạo ảnh/building depiction chưa có quyền; đổi HERO toàn cục; nén hoặc thay cover trong 05B. Tính năng “không có chuỗi Google Maps trong repo” **không phải acceptance criterion**.

**Acceptance criteria:** mỗi current node trong 17 nodes có quyết định visual/rights đọc được; đủ 9 node thiếu mapping (không chỉ 7); 4 credit Google Maps được giữ trong ledger; 2 legacy IDs Trung Yên không bị coi active. Nếu chọn quarantine, ảnh disputed không hiển thị trên **mọi** consumer đã liệt kê, kể cả Camera/Location, nhưng provenance còn. Cover rights và legacy marketing assets ghi riêng; không tuyên bố toàn bộ media đã sạch chỉ vì thay 4 ảnh.

**Regression matrix:** ảnh có sẵn / ảnh minh họa / thiếu ảnh / quyền chưa xác minh; 9 node thiếu ảnh; 4 Google Maps assets; 6 ảnh fiction; 3 pilot nodes; 5 Three Lenses photo keys; preview→Qa→Plan→Camera→Location; mode/locale switch; stale image load callbacks; placeholder với tên dài / font 2; screen reader alt text; no binary/data/revision diff. Native: không nháy ảnh hoặc nhảy layout, aspect ratio/crop, bộ nhớ khi cuộn và placeholder readability.

**Dependencies/risks:** NK-007 rights ledger→NK-008 mapping; NK-015 consumer/legacy map; NK-017 đo performance trước 05C. 05B mở rộng file ownership so với Antigravity proposal, phải review union contract và người dùng duyệt danh sách. Shared files Home/Qa/photoMap thực hiện tuần tự với 02/03/04/06. 05C chỉ sau owner cho phép derived asset, quality/budget/protocol nhất quán; không dùng AC <50ms suy đoán.

**Proposed model/owner:** Luna làm inventory 05A và implementation 05B sau duyệt; chủ quyền ảnh / content owner chốt quyền; Sol review resolver; Antigravity visual. **Status: Blocked cho implementation 05B; 05A docs Ready để mở riêng.** Không cần xóa assets để review quyền.

## NK-UI-06 — Plan recovery, tách legacy metadata

**Corrected scope 06A:** cải thiện contextual empty/recovery bằng dữ liệu hiện có và thao tác rõ của người dùng. 06B metadata adapter là nhánh review riêng; không sửa topics/tags tự động.

**Exact existing files 06A:** `mobile/src/screens/PlanScreen.tsx`, `mobile/src/i18n/translator.ts`; tests `mobile/tests/recommendation.test.mjs`, `mobile/tests/uiFlows.test.mjs` cases Plan. `mobile/src/recommendation/pick.ts` chỉ đọc, thuật toán giữ nguyên.

**Exact new file 06A:** `mobile/tests/planScreenExperience.test.mjs`. Không có `planScreen.test.mjs` ở baseline; phải dùng tên đã chốt này trong lệnh kiểm thử tương lai.

**Allowed:** phân biệt không có node mang topic / không còn node đủ điều kiện / thiếu thời gian bằng nodes và draft hiện tại; copy VI/EN tổng quát không có claim văn hóa mới. Nút “Chuyện xưa” chỉ xuất khi có node đủ điều kiện cho topic đó; action cập nhật draft, giữ budget và phản ánh kết quả qua pickPoints hiện hành. Các controls/reset cũ vẫn còn. Không tự đổi theme/topic nếu người dùng chưa bấm.

**Forbidden:** thêm `an thuc` vào đình/đền; fabricate food POI; thay metadata để khớp label; sửa dataset/visited flags/order; ép kết quả có 3 picks; bỏ budget; tự fallback topic; copy văn hóa về quán cụ thể chưa approved; thêm GPS/ETA/walking route vào kết quả.

**Acceptance criteria:** food tại 3 ngõ không có tag food giải thích trung thực; thao tác chọn history rõ ràng cho kết quả nếu đủ điều kiện và budget đủ; budget quá ngắn không nói rằng không có node food; đã visited / closed không được gợi; no-config / error không nhận bundle; ≤3 picks, tổng thời gian ≤budget; reason gợi ý không đổi đáp án hoặc evidence. Label Ẩm thực của collection vẫn giữ vì đây không phải ticket review claim.

**Regression matrix:** 3 ngõ food-empty × VI/EN; fiction food; pilot food; unknown / negated input; needs-topic/budget; too-small budget; closed / visited nodes; không còn topic thay thế đủ điều kiện; bấm topic thay thế và giữ budget; draft tồn tại sau Back; chọn recommended node giữ ID và không tự confirm. Native: keyboard focus, feedback announcement, cuộn tới action recovery, font lớn / copy EN dài.

**06B exact proposed files chỉ sau contract review:** new `mobile/src/data/alleyPresentation.ts`, new `mobile/tests/alleyPresentation.test.mjs`; existing `mobile/src/screens/HomeScreen.tsx` chỉ nếu thay legacy consumer; `mobile/src/assets/photoMap.ts` chỉ explicit aliases/documentation, không delete. Adapter đọc registry thay vì bắt photoMap import collections (tránh cycle `collections→photoMap→collections`). Khớp cả 8 canonical IDs; mapping legacy phat-loc/tam-thuong/cam-chi rõ; hang-chi giữ archive, không tự hiện trong picker. Không đổi route/node IDs. Hiện tại Home đã ưu tiên registry, nên 06B không phải blocker của 06A.

**Dependencies/risks:** NK-014 copy, NK-015 legacy consumer; NK-005/006 nếu đề xuất copy văn hóa/tag/content mới. Shared photoMap thực hiện tuần tự với 05/06B. Recommendation recovery là logic draft nhỏ cần negative checks, không coi chỉ visual.

**Proposed model/owner:** Luna cho 06A; Sol review result classification / ID adapter; Antigravity duyệt copy/layout; human content owner nếu có facts mới. **Status: Needs approval cho 06A; 06B Needs spec review**, chưa có quyền coding.

## Integration và handoff gates

1. Antigravity sửa spec/các AUD sai, không tự sửa application. Lead đối chiếu revised scopes với tài liệu review.
2. User chọn ticket/subscope, file allowlist và temporary owner; mặc định ownership AGENTS còn hiệu lực. Đề xuất mở 01A, 02, 06A trước; thứ tự Luna 01A→02→06A→04A sau approval. 03/05 đợi đủ contract.
3. Một writer mỗi shared file. Mỗi patch giữ Phase 1A/B tests, source baseline và changed files, review diff trước ghép; không đổi expected để che lỗi nguồn.
4. Native reproduction trước sửa clipping / image performance chưa được chứng minh; native verification trước acceptance visual/audio. Chưa có device ghi PENDING và nêu rõ cases.

**Việc cần người dùng quyết:** chọn các scope muốn mở sau khi xem revision; không có scope nào đang được triển khai. **Việc người dùng tự làm:** xác nhận quyền từ chủ tư liệu nếu chọn 05; thiết bị/listening theo NK-012 khi mở acceptance, không phải điều kiện để hoàn thành review tài liệu hiện tại.
