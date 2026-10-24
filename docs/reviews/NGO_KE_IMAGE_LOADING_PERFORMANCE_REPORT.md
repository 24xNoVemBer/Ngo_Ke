# Ngõ Kể — Image Loading Performance Investigation

**Mode:** Read-only source, asset and documentation investigation

**Branch / HEAD:** `valentino/logic-fix-mobile-20261020` / `4af64c49a4ada47f952ddf76c35adfb90f826224`

**Verdict:** `HUMAN_IMPLEMENTATION_APPROVAL_REQUIRED` — the code-level loading pressure is credible and actionable, but no iPhone timing trace was available to prove which stage accounts for the reported wait.

## Tóm tắt phát hiện

Ảnh không lấy từ URL trong luồng khám phá ngõ. Các ảnh bìa và ảnh điểm dừng được khai báo bằng `require()` từ `mobile/assets/photos`. Tuy vậy, màn Landing tạo một horizontal `ScrollView` rồi map toàn bộ 8 collection thành thẻ có `<Image>`; React Native xác nhận `ScrollView` render tất cả children cùng lúc. Bảy file ảnh bìa khác nhau của các collection này chiếm **10,562,538 bytes** trên đĩa, trong đó bốn ảnh bìa của các ngõ mới chiếm **9,150,825 bytes**. Đây là nguyên nhân có bằng chứng ở source có thể gây cạnh tranh tải/giải mã trên màn đầu, đặc biệt khi chạy development qua Metro. Chưa có trace trên iPhone để kết luận nó là nguyên nhân duy nhất hoặc đo được thời gian ảnh chậm.

Khi chuyển sang Home hoặc Qa, `ImageBackground` nhận ảnh ngay trong lần render đầu; hai màn không có `onLoad`/`onLoadEnd`, trạng thái chờ ảnh hoặc preload được thấy trong source. UI không chờ Promise ảnh trước khi render/navigate, nên chưa có bằng chứng ảnh đang khóa navigation hay JS. Vấn đề có thể là ảnh chưa hiện trong khi nội dung đã mở, tạo cảm giác phải đợi.

## Baseline và phạm vi kiểm tra

- Branch `valentino/logic-fix-mobile-20261020`; HEAD `4af64c49a4ada47f952ddf76c35adfb90f826224`.
- Worktree đã có nhiều tracked changes và untracked WIP trước điều tra. Không file ứng dụng, ảnh, registry, quyền ảnh hoặc tài liệu Antigravity nào được sửa.
- Đã đọc `AGENTS.md`, `MEMORY.md` (trạng thái gần nhất), `docs/TEST_REPORT.md`, `agent_docs/testing.md`, `mobile/README.md`, `photoMap.ts`, registry collection, các screen/component tải ảnh, app config, và image-rights ledger hiện có.
- File báo cáo này không tồn tại trước khi tạo.
- Không chạy app/build/test hoặc đo trên thiết bị trong lượt điều tra.

## Trace luồng ảnh

1. **Landing → Home:** `LandingScreen` lấy `getLocalizedCollections(locale)`, tạo thẻ cho mọi collection trong horizontal `ScrollView`, và mỗi thẻ render `<Image source={col.coverPhoto}>`. Tap gọi `navigate('Home', { alleyId })`. `AlleySelectScreen` cũng render `filteredCollections.map(...)` với ảnh từng thẻ rồi điều hướng Home.
2. **Home:** `HomeScreen` lấy `activeCollection.coverPhoto` làm full-screen `ImageBackground`. Nó đồng thời tính ảnh node hiện tại và render ảnh nhỏ qua `CrossfadePhoto` khi preview có mặt. Nút mở câu chuyện gọi `navigate('Qa')` mà không đợi ảnh.
3. **Qa:** `QaScreen` resolve ảnh node/chapter qua `getNodePhoto()` và đưa thẳng vào full-screen `ImageBackground`. Không thấy preload trước navigation hay loading/error handler cho ảnh nền.
4. **Khác:** `PlanScreen` dùng `PostcardCard` cho các gợi ý; `PrologueScreen`/`LandingScreen` dùng ảnh hero; Camera/Location có các ảnh minh họa cục bộ. Vì vậy thay đổi cache, loader, registry hoặc asset format có thể ảnh hưởng nhiều màn hơn Home/Qa.

`photoMap.ts` cũng giữ một `ALLEY_LIST` cũ. Với route collection hợp lệ, Home ưu tiên `activeCollection.coverPhoto` từ `collections.ts`; ví dụ `ngo-phat-loc` đang dùng `ngophatloc_01.jpg`, trong khi `ALLEY_LIST` và rights ledger ghi `cover_hero.jpg`. Đây là bất nhất metadata cần người sở hữu nội dung/quyền ảnh đối chiếu; không được tự đổi mapping trong một lượt performance.

## Bằng chứng và mức độ kết luận

| Finding | Phân loại | Bằng chứng / giới hạn |
| --- | --- | --- |
| Landing mount toàn bộ ảnh card thay vì tải card gần viewport | **Confirmed by source** | `LandingScreen.tsx` dùng `ScrollView` và `.map()`; ảnh nằm trực tiếp trong từng Pressable. Tài liệu React Native ghi ScrollView render tất cả children, trong khi FlatList render lazy. Tác động thời gian thực tế trên iPhone chưa đo. |
| Các ảnh là static local `require`, không phải remote URL | **Confirmed by source** | `collections.ts` và `photoMap.ts` dùng `require('../../assets/photos/...')`; không tìm thấy `source={{ uri: ... }}` cho ảnh ở luồng này. Expo ghi asset local được phục vụ qua HTTP trong development và được đóng gói cho production binary/đọc từ disk. ([Expo Assets](https://docs.expo.dev/develop/user-interface/assets/), [React Native Images](https://reactnative.dev/docs/images)) |
| Tải ảnh nền bắt đầu sau khi screen nhận source; không có preload trước chuyển màn | **Confirmed by source** | Home/Qa render `ImageBackground` trực tiếp từ static source; không có `Image.prefetch`, `Asset.loadAsync`, `useAssets` hoặc cơ chế preload trong mobile source. React Navigation không bị chặn bởi Promise ảnh. |
| Full-screen background không có trạng thái loading/error | **Confirmed by source** | `ImageBackground` ở Home/Qa không truyền load callbacks; `CrossfadePhoto` có `onLoad`/`onError` cho thumbnail riêng. Nền màu/content vẫn được render. Chưa xác định người dùng có thấy blank/flash hay chỉ ảnh xuất hiện muộn. |
| Một số cover ảnh lớn, gồm PNG ảnh chụp ở kích thước gần/ngang 1K pixels | **Confirmed by asset metadata** | Kích thước, định dạng và byte đọc trực tiếp từ 26 file trong `mobile/assets/photos`; bảng dưới. Kích thước file hoặc pixel không tự chứng minh thời gian load. |
| Ảnh chậm khi mở lần đầu, nhưng nhanh khi mở lại | **Needs iPhone reproduction** | Không có timestamp load, log cache, video hoặc profiling của lượt báo lỗi. Không thể xác nhận cache nóng, native decoded-image cache, hay khác biệt cold/warm. |
| React re-render đang làm ảnh tải lại hoặc làm block navigation | **Not established** | Parent screens có state/effects nên có render lại, nhưng source không chứng minh source prop đổi hay native loader tải/decode lại. Không thấy `await` ảnh trước navigation. Cần profiler/load callbacks. |

Tài liệu React Native mô tả static `require()` có metadata kích thước ngay từ bundler; tài liệu hiện hành không đủ để kết luận cơ chế cache/decoded-memory thực tế của chính thiết bị iPhone đang dùng. ([React Native Images](https://reactnative.dev/docs/images))

## Ảnh lớn nhất và ứng viên cần đo

Không có ảnh nào được xác nhận là nguyên nhân chậm trên iPhone vì chưa có timing theo asset. Đây là các ứng viên ưu tiên theo byte/pixel và vai trò trong luồng:

| Collection / ảnh | File đang được collection registry dùng | Kích thước | Kích thước pixel | Vai trò và lưu ý |
| --- | --- | ---: | ---: | --- |
| Tạm Thương | `mobile/assets/photos/alleys/ngo-tam-thuong-cover.png` | 4,138,537 B (3.95 MiB) | 1440×1586 | Cover trên carousel/Home; quyền `RIGHTS_UNVERIFIED` theo rights ledger. |
| Trung Yên | `mobile/assets/photos/alleys/ngo-trung-yen-cover.png` | 2,734,316 B (2.61 MiB) | 1024×1536 | Cover trên carousel/Home; quyền `RIGHTS_UNVERIFIED`. |
| Ngõ Gạch | `mobile/assets/photos/alleys/ngo-gach-cover.png` | 1,398,380 B (1.33 MiB) | 720×960 | Cover trên carousel/Home; quyền `RIGHTS_UNVERIFIED`. |
| Cấm Chỉ | `mobile/assets/photos/alleys/ngo-cam-chi-cover.png` | 879,592 B (0.84 MiB) | 700×875 | Cover trên carousel/Home; quyền `RIGHTS_UNVERIFIED`. |
| Ba lát cắt phố cổ | `mobile/assets/photos/three-lenses/bach-ma.jpg` | 859,989 B (0.82 MiB) | 2048×1536 | Collection cover và node/chapter fallback; rights ledger ghi quyền chưa xác minh. |
| Đồng Xuân — lửa | `mobile/assets/photos/three-lenses/dong-xuan-fire.jpg` | 886,501 B (0.85 MiB) | 1536×2048 | Ảnh chapter trong detail; cần đo nếu vào flow này. |
| Đồng Xuân — phố | `mobile/assets/photos/three-lenses/dong-xuan-street.jpg` | 716,538 B (0.68 MiB) | 1536×2048 | Ảnh chapter trong detail. |
| Đồng Xuân — timeline | `mobile/assets/photos/three-lenses/dong-xuan-timeline.jpg` | 676,137 B (0.64 MiB) | 2048×1536 | Ảnh chapter trong detail. |
| Phất Lộc (registry hiện hành) | `mobile/assets/photos/ngophatloc_01.jpg` | 335,173 B (0.32 MiB) | 960×1280 | Cover của `ngo-phat-loc` trong `collections.ts`; rights ledger ghi file khác (`cover_hero.jpg`), cần đối chiếu. |

Tổng bảy file cover khác nhau được `AVAILABLE_COLLECTIONS` tham chiếu là **10,562,538 B**; file `ngophatloc_01.jpg` được dùng cho hai collection nên số collection là 8 nhưng số cover file duy nhất là 7. Bốn PNG cover của bốn ngõ mới cộng **9,150,825 B**. Đây là tổng dung lượng file nén, không phải lượng network đã đo.

Ảnh `cover_hero.jpg` là JPEG 896×1200, 1,106,050 B; nó xuất hiện trong `photoMap.ts` legacy `ALLEY_LIST` và rights ledger, nhưng **không phải** cover mà `getLocalizedCollections()` hiện cấp cho `ngo-phat-loc`. Không tính nó vào tổng cover registry đang render.

Không tìm thấy variant ảnh `@2x`/`@3x` trong thư mục photos. Pixel buffer RGBA thô cho riêng bốn PNG cover mới xấp xỉ **19.6 MiB** nếu cả bốn cùng được decode/resident; đây chỉ là ước lượng `width × height × 4`, không phải số đo bộ nhớ iOS hoặc khẳng định chúng cùng nằm trong RAM.

## Development, release, cache và lần mở lại

- `mobile/README.md` hướng dẫn phát triển bằng Expo Go/Metro. Theo Expo, asset tĩnh local được phục vụ qua HTTP trong development. Nếu người dùng mở nhanh carousel khi các ảnh lớn chưa xong, các asset request có thể cạnh tranh; cần network trace để chứng minh mức độ.
- Trong native production build, static assets được bundler đóng vào app binary/được đọc từ disk. Vì vậy tốc độ release không nhất thiết giống Expo Go dev. Đây là khác biệt theo mô hình phân phối của Expo, không phải benchmark của app hiện tại.
- `expo-asset` có trong dependency/config nhưng mobile source không gọi API preload; `expo-image` không có trong dependencies. Source dùng React Native `Image`/`ImageBackground`.
- `CrossfadePhoto` giữ ảnh `previous` trong khi ảnh mới load rồi fade ảnh mới vào. Điều này bảo vệ thumbnail khỏi trống khi đổi node, nhưng có thể đồng thời giữ hai Image view. Nó không xử lý full-screen background.
- Không có số liệu cold open / warm reopen. Caching của platform/Metro/EAS và reuse ảnh đã decode phải được tách bằng iPhone measurement; không thể kết luận từ code.

## Đề xuất tối ưu

### P0 — đo và bỏ cảm giác chờ mà không khóa chuyển màn

1. Trong một implementation được duyệt, thêm timestamp/log chỉ môi trường QA cho tap/navigation focus/first layout và `onLoadStart`/`onLoad`/`onLoadEnd`/`onError` trên Landing cover, Home/Qa backgrounds và thumbnail. Không gửi telemetry người dùng. Điều này phân biệt Metro/network, image decode/load, screen transition và thời gian cảm nhận.
2. Hiện màu nền/placeholder nhẹ ngay lập tức ở vùng ảnh, thay bằng ảnh khi load xong và giữ text/control/navigation tương tác được. Hiển thị fallback trung thực khi lỗi. Không chờ ảnh load xong mới mở Home/Qa.
3. Xác minh cụ thể Tạm Thương, Trung Yên và Gạch trước vì ba cover lớn nhất; thử cả dev Expo Go và release iOS. Chưa tối ưu file nguồn khi chưa có so sánh sau đo.

### P1 — giảm lượng công việc và byte ảnh khi số đo ủng hộ

1. Lazy-render ảnh ngoài viewport trong carousel Landing và AlleySelect. Horizontal `FlatList`/virtualized list hoặc chỉ gắn `Image` gần viewport có thể tránh mount/tải đồng thời mọi cover; giữ layout, accessibility, collection order và navigation. Kiểm cả font scale và scroll trên iPhone.
2. Tạo derivative tối ưu cho ảnh cover quyền đã được xác nhận: scale theo pixel cần hiển thị trên thiết bị mục tiêu, chọn JPEG/WebP sau khi kiểm định support iOS/Android, chất lượng và crop. Giữ nguyên file gốc/provenance. Bốn cover được ledger đánh `RIGHTS_UNVERIFIED` và `bach-ma.jpg` cần xác minh quyền trước khi xử lý/tái phân phối derivative.
3. Chỉ preload ảnh của collection sắp mở nếu đo được lần tải đầu sau tap là nút thắt. Bắt đầu tải không đồng bộ từ lúc collection ở gần viewport/tap và vẫn điều hướng ngay. Không preload cả thư viện. `Image.prefetch` không phải lựa chọn tự nhiên cho các static `require()` hiện tại; Expo `expo-asset` load có thể được đánh giá cho development nếu network trace xác nhận vấn đề ở Metro. Release assets vốn được bundle/disk nên preload có thể không đem lại lợi ích.
4. Không thêm cache library/đổi global cache limits trước khi có profile; chúng có thể tăng memory pressure và ảnh hưởng Home, Qa, Plan, Camera/Location.

## Files có thể liên quan nếu được duyệt implementation

| File | Vai trò dự kiến |
| --- | --- |
| `mobile/src/screens/LandingScreen.tsx` | Lazy loading carousel, load timing, placeholder cover. |
| `mobile/src/screens/AlleySelectScreen.tsx` | Lazy loading danh sách thẻ ảnh, nếu xác nhận người dùng đi qua màn này. |
| `mobile/src/screens/HomeScreen.tsx` | Đo/load placeholder cho cover nền và thumbnail; không chặn navigation. |
| `mobile/src/screens/QaScreen.tsx` | Đo/load placeholder cho ảnh nền điểm/chapter. |
| `mobile/src/components/CrossfadePhoto.tsx` | Đo thời gian load/fade thumbnail, kiểm tra giữ ảnh trước và sau. |
| `mobile/src/data/collections.ts` | Chỉ đổi source mapping nếu dùng derivative đã được duyệt. |
| `mobile/src/assets/photoMap.ts` | Chỉ đồng bộ node-photo mapping sau khi giải quyết ownership/rights/UI-05B; file hiện có contributor provenance và metadata legacy. |
| `mobile/tests/*image*` hoặc test files tương ứng | Kiểm thứ tự tải/placeholder/fallback/lazy window; không thay ảnh hoặc rights data. |
| `mobile/assets/photos/` | Chỉ thêm derivative mới sau phê duyệt quyền, không ghi đè ảnh nguồn. |

Không sửa file nào trong danh sách ở lượt điều tra này. Mọi thay đổi `photoMap.ts`, image resolver hoặc placeholder phải phối hợp ownership UI-05B của Antigravity và rights ledger; đây không phải quyền mở UI-05B.

## Cách đo trước/sau

Khi có implementation được duyệt, dùng cùng một iPhone/OS, cùng locale, cùng nội dung và cùng điều kiện mạng; thử Expo Go dev và một native release cùng revision. Ghi ít nhất 5 lần mỗi trạng thái và báo median/p95:

1. Cold launch → Landing: thời gian first layout, số ảnh card bắt đầu/kết thúc load, thời điểm ảnh đầu tiên nhìn thấy.
2. Tap collection → Home: tap-to-navigation/focus, first layout, cover `onLoadEnd`, thời điểm cover nhìn thấy.
3. Tap story → Qa: tap-to-focus/first layout, ảnh node `onLoadEnd` và thời điểm nhìn thấy; không đo nhầm audio.
4. Warm reopen/back rồi mở lại cùng collection, và đổi sang collection khác để đo cache/reuse.
5. Network bytes/time trong dev; memory peak, frame drops/jank trong chuyển màn; capture màn hình để xác định UI có tiếp tục dùng được trước khi ảnh xong.

So sánh cold lần đầu với warm lần mở lại, Expo Go dev với release, trước/sau lazy loading và trước/sau derivative riêng rẽ. Báo bytes và kích thước pixel của derivative; không gộp nhiều thay đổi trong một lượt đo vì khó quy nguyên nhân.

## Cần người dùng kiểm tra trên iPhone

- Xác nhận phiên gặp lỗi là Expo Go development/Metro, EAS Update hay native release, và ngõ/ảnh cụ thể nào chậm.
- Quay màn hình có thể thấy thời điểm tap, nội dung màn hình hiện ra và ảnh xuất hiện; thử cold open, warm reopen, quay lại rồi mở lần hai.
- Nếu có thể, cung cấp model iPhone, iOS, loại build, mạng Wi-Fi/cellular và khoảng thời gian ước lượng. Không cần cung cấp log chứa token hoặc secret.
- Sau một implementation được duyệt, kiểm lại story text/controls vẫn hiện và bấm được khi ảnh chưa xong; ảnh lỗi có fallback; không có flash/crop xấu; carousel vẫn cuộn và thứ tự đúng.

## Tài liệu tham chiếu

- Source repository: `mobile/src/screens/LandingScreen.tsx`, `AlleySelectScreen.tsx`, `HomeScreen.tsx`, `QaScreen.tsx`; `mobile/src/data/collections.ts`; `mobile/src/assets/photoMap.ts`; `mobile/src/components/CrossfadePhoto.tsx`.
- Inventory quyền hiện có: `docs/content/NGO_KE_NODE_VISUAL_RIGHTS_LEDGER.md` (được đọc; không sửa).
- [Expo — Assets](https://docs.expo.dev/develop/user-interface/assets/): local static assets dùng trong development và production.
- [React Native — ScrollView](https://reactnative.dev/docs/scrollview): ScrollView render toàn bộ child cùng lúc; FlatList render lazy.
- [React Native — Images](https://reactnative.dev/docs/images): static image resources, kích thước asset và image sources.

## Việc cần anh quyết / việc anh tự làm

- **Cần anh quyết:** Chưa có quyết định implementation nào được thực hiện. Nếu muốn mở một lượt tối ưu ảnh, cần cấp quyền riêng cho P0 instrumentation/placeholder và chọn có cho phép tạo derivative sau rights verification hay không. Nếu chưa chốt, ảnh gốc/registry/UI vẫn giữ nguyên.
- **Cần anh tự làm:** Xác định loại build iPhone gặp lỗi và gửi tên ngõ/asset hoặc video/ước lượng cold vs warm. Thiếu dữ liệu này thì không thể xác nhận chính xác asset nào gây chậm hoặc benchmark cải thiện trên thiết bị của anh.

**Dừng tại Human Implementation Approval Gate.**
