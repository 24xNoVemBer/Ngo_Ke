# Ngõ Kể — Rà soát logic và kiểm thử UI mới
Ngày 12/10/2026. Source được kiểm tại workspace, HEAD nền `25c9e8c`; bản UI mới còn là thay đổi chưa commit. Đây là review cho demo native Android/iOS, không phải nghiệm thu production.

## Kết luận
Bản mới có Prologue, hệ motion dùng Animated và thêm tương tác micro. **100/100 test hiện có đạt nhưng vẫn có lỗi runtime.** Đã tái hiện màn trống khi Back từ Landing về Prologue và Home mất nội dung trong cửa sổ thấp. Cần sửa các lỗi này trước khi tăng hiệu ứng.

Theo yêu cầu bổ sung của người dùng, **đã bỏ cụm thống kê 5 bìa ngõ / 6 điểm / 100% ảnh** ở Landing, gồm animation và style chỉ dùng cho cụm đó. Đây là thay đổi source duy nhất trong lượt review. Những sửa lỗi và nâng cấp khác nằm trong [plan](UI_UX_IMPROVEMENT_PLAN.md), chưa triển khai.

## 1. Môi trường và cách kiểm
- Windows; Expo 57.0.26, React Native 0.86.3, native-stack 7.20.0, routers 7.6.4, react-native-screens 4.26.2.
- Android emulator `Medium_Phone_API_37.0`, Android 17, Expo Go 57.0.9; màn chuẩn 1080×2400.
- Thử thêm cửa sổ 1800×1080 bằng `adb shell wm size`; đây là kiểm bố cục cửa sổ rộng/thấp, **không thay cho xoay máy thật**.
- Thử font_scale 1.5: Expo Go khởi tạo lại activity, nên ảnh thu được là Prologue, không phải Q&A. Đã trả kích thước và font về mặc định.
- Test callback/state qua VM dùng module native thay thế; probes bổ sung chạy trong bộ nhớ, không ghi đè test hoặc expected trong repo.
- Kiểm router bằng **StackRouter thực tế đã cài**, không chỉ spy navigation.
- Ảnh chụp trực tiếp emulator; chữ ký PNG của 11 ảnh đều hợp lệ.

## 2. Kết quả kiểm tra
Các lệnh chạy từ `mobile/`, trừ diff check chạy ở root repo.

| Kiểm tra | Kết quả và giới hạn |
| --- | --- |
| `node --test tests/*.test.mjs` | **100/100 đạt**, chạy lại sau khi bỏ thống kê |
| `tsc --noEmit` | Đạt, trước và sau thay đổi Landing |
| `eslint .` | Đạt trên bản UI mới trước thay đổi; lint riêng Landing sau thay đổi đạt |
| `git diff --check` | Đạt |
| Export Android | Đạt: 984 modules; chạy trước thay đổi bỏ cụm thống kê |
| Export iOS | Đạt: 989 modules; chạy trước thay đổi bỏ cụm thống kê; không chứng minh runtime iOS |
| Prologue → Bắt đầu → Landing | Chạy được trên Android |
| Landing → Back → Prologue | **Không đạt: màn tối trống**, ảnh 03 |
| Landing sau bỏ thống kê | Đạt trên emulator, không còn cụm hoặc khoảng trống dành cho cụm đó, ảnh 08 |
| Landing → Home → Q&A điểm 01 | Chạy được, ảnh 04–05 |
| Q&A → câu mẫu “Đây là điểm nào?” | Đáp án điểm 01 hiển thị đúng, ảnh 06 |
| Home sau mở lời kể | Tiến độ 1/6, không tự thành đủ 6 điểm, ảnh 07 |
| Q&A → Sổ tay → Plan | Chạy được, ảnh 09 |
| Plan → ẩm thực + 15 phút | 1 điểm demo 05, 10 phút; không vượt quỹ |
| CTA Plan → Q&A | Mở đúng điểm 05; không mượn Q&A điểm 01, ảnh 10 |
| Home cửa sổ thấp | **Không đạt:** điểm cuối và CTA ngoài vùng nhìn thấy, ảnh 07 |
| Prologue font 1.5, portrait | Nội dung và CTA còn nhìn thấy, ảnh 11; chưa kiểm font lớn trên toàn bộ app |
| Prologue animation bị hủy | Probe: callback `finished:false` vẫn gọi navigate |
| Dừng micro trước timer hết | Probe: trạng thái nghe tắt nhưng timer cũ vẫn mở ô nhập |
| Lặp Q&A → Plan → Q&A | Router thật tích thêm Qa/Plan vào stack, không tái dùng route cũ |
| Live Home với dữ liệu kiểm soát | Render vẫn ghi “câu chuyện · Demo” dù prop mode là live |
| Điểm 02 đóng, điểm 03–06 mở | Probe: Next từ 01 bị disabled; vẫn có thể chọn trực tiếp các đoạn phía trên. Đây là bất tiện luồng, không mất dữ liệu |

Không dùng hierarchy XML cũ làm bằng chứng: các màn có loop liên tục có lần uiautomator không lấy được trạng thái mới. Khi đó dùng ảnh trực tiếp và đối chiếu source; chỉ đọc XML khi lệnh báo dump thành công.

## 3. Các mục phải sửa
Số mục dưới đây dùng để giao việc. P1 cần xử lý trước khi tiếp tục demo; P2 cần xử lý trong lượt polish. Không coi pass test hiện có là lý do bỏ qua lỗi đã tái hiện.

### 1. [P1] Back về màn mở đầu trống
**Source:** [PrologueScreen.tsx](../mobile/src/screens/PrologueScreen.tsx), dòng 53–70 và 78–84; [App.tsx](../mobile/App.tsx), dòng 128–147.

- Hành vi: CTA làm `exitAnim` từ 1 xuống 0 rồi `navigate('Landing')`. Prologue vẫn nằm dưới Landing; khi Back, instance cũ hiện lại với opacity 0.
- Bằng chứng: thực hiện Bắt đầu → Back trên emulator, [ảnh màn trống](../agent_docs/evidence/ui-ux-review-2026-10-12/03-prologue-after-back.png). Probe state cũng cho opacity 0 sau khi chuyển đi.
- Sửa nhỏ nhất: chuyển bằng `replace('Landing')`, để Prologue không nằm trong lịch sử Back, đúng yêu cầu người dùng. Dùng một transition của navigator; bỏ fade-out cục bộ nếu không cần. Nếu giữ animation callback phải kiểm `finished`, khóa bấm lặp và khôi phục khi bị hủy.
- Nếu bỏ qua: người dùng quay lại một màn không có nội dung nhưng vẫn có thể còn vùng bấm vô hình.

### 2. [P1] Home mất điểm cuối và nút khám phá khi cửa sổ thấp
**Source:** [HomeScreen.tsx](../mobile/src/screens/HomeScreen.tsx), dòng 121–138, 259, 417 và style mapCanvas dòng 778.

- Hành vi: canvas có chiều cao ít nhất 520 đơn vị, tọa độ pin/card dựa vào chiều cao này; phần chứa không cuộn. Khi chiều cao cửa sổ giảm, nội dung và dock chồng nhau.
- Bằng chứng: [ảnh cửa sổ 1800×1080](../agent_docs/evidence/ui-ux-review-2026-10-12/07-home-short-window.png): điểm 05–06 và phần CTA của card không nằm trong viewport.
- Sửa: tách vùng header/dock khỏi nội dung; vùng hành trình cuộn khi không đủ cao. Card lựa chọn nằm sau danh sách/trail hoặc trong vùng riêng, không đè lên nhãn pin. Đo vùng khả dụng thay vì áp min-height vào viewport.
- Nếu bỏ qua: một số màn hình không thể truy cập đầy đủ chức năng.

### 3. [P1] Micro hiển thị chức năng giọng nói chưa có, timer không bị hủy
**Source:** [QaScreen.tsx](../mobile/src/screens/QaScreen.tsx), dòng 56–76, 414–418; [VoiceInteractionDock.tsx](../mobile/src/components/VoiceInteractionDock.tsx), dòng 67–99; [HomeScreen.tsx](../mobile/src/screens/HomeScreen.tsx), dòng 499–506.

- Hành vi: Q&A bật “Đang lắng nghe” rồi sau 1200ms mở nhập chữ; không có STT hoặc quyền micro. Home có nút gọi là trò chuyện giọng nói nhưng chỉ mở Q&A.
- Probe: bấm micro rồi bấm dừng; drawer ban đầu false, chạy timer cũ → true. Timer cũng không có cleanup khi đổi điểm/rời màn.
- Sửa: bỏ callback/nhãn micro giả, dùng hành động thật “Hỏi bằng chữ” hoặc “Đọc lời kể”; bỏ timer và state isListening chưa cần. Không thêm engine Voice vào lượt này.
- Nếu bỏ qua: người dùng nói nhưng không có câu hỏi được nhận, hoặc drawer mở bất ngờ sau khi đã dừng.
- Test hiện có đã đổi assertion sang yêu cầu callback voice là function; assertion này đang bảo vệ sự tồn tại của nút, không chứng minh nó có chức năng.

### 4. [P2] Lặp Q&A/Sổ tay tạo lịch sử Back dài
**Source:** [App.tsx](../mobile/App.tsx), dòng 202 và 213.

- Hành vi: Qa → navigate Plan → chọn điểm → navigate Qa. Trên routers 7.6.4 đang cài, navigate không tự tìm lại route cùng tên nằm sâu hơn nếu không có cấu hình/action phù hợp.
- Bằng chứng router thật: `Prologue, Landing, Home, Qa, Plan, Qa, Plan, Qa`. Back đi qua những trang Plan/Qa đã tạo trước đó.
- Sửa: chốt lịch sử `Landing → Home → Qa`; Plan mở từ Qa thì chọn xong quay về Qa có sẵn với điểm mới; Plan mở từ Home thì chọn xong replace Plan bằng Qa. Có thể dùng popTo với ngữ cảnh gọi rõ, không tự đoán route trước đó.
- Nếu bỏ qua: càng chọn hành trình càng phải Back nhiều, và nhiều bản màn cùng chia sẻ selected node toàn cục.

### 5. [P2] Loop chưa gắn với focus và trạng thái app
**Source:** [useMotion.ts](../mobile/src/hooks/useMotion.ts), dòng 29–57, 160–190, 210–233; các callers ở Prologue, Landing, AlleySelect, Home, Q&A, Camera.

- Hành vi: phần lớn caller luôn để active true. Cleanup chạy khi effect đổi/unmount, không dựa vào màn có đang được xem. Q&A gọi `useWaveformLoop(true)`; camera laser bắt đầu ngay cả khi chưa mở camera.
- Sửa: active theo focus + app đang foreground + thao tác thực cần animation. Laser chỉ chạy khi cameraOn && scanning; dừng khi nhận QR, pending, blur hoặc app background.
- Nếu bỏ qua: chuyển động không cần thiết tiếp tục được lên lịch; tăng tải và làm việc kiểm UI khó hơn. **Chưa đo được mức tốn pin hoặc FPS**, không kết luận bằng con số.

### 6. [P2] Chưa có Reduce Motion
**Source:** [useMotion.ts](../mobile/src/hooks/useMotion.ts), [motion.ts](../mobile/src/theme/motion.ts), [App.tsx](../mobile/App.tsx).

- Hành vi: không có đọc preference hoặc listener Reduce Motion. Các zoom, pulse, waveform và slide vẫn được định nghĩa chạy như nhau.
- Sửa: đọc `AccessibilityInfo.isReduceMotionEnabled()`, theo dõi `reduceMotionChanged`; khi bật, đưa nội dung về trạng thái hoàn chỉnh, tắt loop/zoom và dùng fade ngắn hoặc đổi ngay. Điều chỉnh navigator cùng chính sách đó.
- Nếu bỏ qua: người dùng bật giảm chuyển động nhưng app vẫn zoom/pulse. Đây là kết luận từ source, chưa kiểm bằng thiết bị iOS hoặc screen reader.

### 7. [P2] Drawer đóng tức thì, animation đóng không xuất hiện
**Source:** [ExpandableInputDrawer.tsx](../mobile/src/components/ExpandableInputDrawer.tsx), dòng 41–66.

- Hành vi: visible false vừa chạy timing về 300 vừa return View, làm Modal biến mất trước animation. Quãng trượt cố định 300 cũng không dựa trên chiều cao drawer thực.
- Sửa: giữ Modal mounted tới khi exit hoàn tất; tách visible/rendered, xử lý đóng/mở lại nhanh và callback bị hủy. Dùng chiều cao đo thực, tôn trọng keyboard/safe area.
- Nếu bỏ qua: mở có hiệu ứng nhưng đóng giật; đóng/mở liên tục có thể dùng giá trị animation đang dở. Chưa quay video hay kiểm bàn phím iOS trong lượt này.

### 8. [P2] Thông báo thiếu Q&A khó đọc trên ảnh
**Source:** [QaScreen.tsx](../mobile/src/screens/QaScreen.tsx), dòng 316 và style noDataBody 752–755.

- Hành vi: cùng màu chữ muted dùng trong card được đặt trực tiếp lên ảnh khi điểm không có câu hỏi; không có nền bảo vệ tương phản.
- Bằng chứng: [điểm 05 sau CTA Plan](../agent_docs/evidence/ui-ux-review-2026-10-12/10-plan-open-node-05.png). Dòng “Chưa có câu hỏi…” chìm vào ảnh.
- Sửa: một notice giấy nhỏ, chữ mực và lối chọn điểm khác; giữ thông báo sát khu vực hỏi, không dùng màu chữ trên ảnh tùy ý.
- Nếu bỏ qua: người dùng không nhận ra lý do không có chip hoặc đáp án.

### 9. [P2] Copy Demo cố định khi dùng Live
**Source:** [HomeScreen.tsx](../mobile/src/screens/HomeScreen.tsx), dòng 229; [QaScreen.tsx](../mobile/src/screens/QaScreen.tsx), dòng 245, 305, 312, 339; [PlanScreen.tsx](../mobile/src/screens/PlanScreen.tsx), dòng 257 và 315.

- Hành vi: Home nhận mode live nhưng progress vẫn ghi Demo. Q&A/Plan không nhận provenance/mode nên giữ các nhãn mô phỏng.
- Bằng chứng: render Home với mode live và source ready kiểm soát vẫn có “câu chuyện · Demo”. Không dùng đây làm bằng chứng đã test backend thật.
- Sửa: truyền mode/nhãn nguồn thật từ App tới các màn; copy mô phỏng chỉ dùng cho demo. Màn Live không tự gắn tên/bìa ngõ mẫu vào dữ liệu mới khi chưa có metadata được duyệt.
- Nếu bỏ qua: người dùng không phân biệt được nguồn đang xem. Engine Live hiện vẫn tách fixture đúng; lỗi này ở trình bày.

## 4. Mục nên sửa trong plan

### 10. Bộ test chưa bảo vệ navigation và motion thật
**Source:** [uiFlows.test.mjs](../mobile/tests/uiFlows.test.mjs), dòng 57–79, 97–103 và ca Q&A dòng 226–252.

- Animated.Value.setValue đang không đổi value, timing không mô phỏng kết thúc/hủy, useMotion bị thay bằng giá trị cố định. Prologue chưa được mount trong test; App screen mock không chứng minh lịch sử router.
- Sửa: bổ sung một fake animation có value và finished để test transition/cancel; kiểm stack bằng router đang cài, và ca native cho Back/màn thấp. Callback voice chỉ được truyền khi có khả năng thực.
- Nếu bỏ qua: cùng lỗi opacity hoặc timer có thể quay lại mà test vẫn xanh. Không cần thêm một framework E2E chỉ để có thêm số test.

Ngoài lỗi trên: Next/Prev nên chọn điểm đang mở gần nhất thay vì đứng lại vì node liền kề đóng; các đoạn story cần vùng bấm rộng hơn kích thước vạch 22×3.5; Q&A header nên tách credit khỏi hàng tên điểm; thống nhất nhãn “Sổ tay”, “Hành trình”, “Hỏi bằng chữ” để các nút có ý nghĩa nhất quán. Đây là cải thiện UX có phương án trong plan, không gán thành lỗi mất dữ liệu.

## 5. Bằng chứng hình ảnh
Thư mục [ui-ux-review-2026-10-12](../agent_docs/evidence/ui-ux-review-2026-10-12/).
- 01: Prologue ban đầu; 02: Landing trước bỏ thống kê; 03: màn trống sau Back.
- 04: Home portrait; 05: Q&A điểm 01; 06: câu trả lời điểm 01.
- 07: Home cửa sổ thấp; 08: Landing đã bỏ thống kê.
- 09: Plan; 10: CTA Plan mở đúng điểm 05 và notice thiếu Q&A khó đọc.
- 11: Prologue font 1.5, sau khi activity khởi tạo lại.

## 6. Nguồn kỹ thuật đã đối chiếu
- [React Navigation lifecycle](https://reactnavigation.org/docs/navigation-lifecycle/): màn cũ trong stack có thể vẫn được giữ khi đi tới màn mới. Vì thế không trông chờ remount để reset opacity.
- [Stack actions](https://reactnavigation.org/docs/stack-actions/): replace và popTo cho việc kiểm soát lịch sử. Hành vi navigate còn được kiểm trực tiếp trên routers 7.6.4 đã cài.
- [React Native Animated](https://reactnative.dev/docs/animated): callback có finished, native driver và điều khiển loop. Dùng native driver không bảo đảm 60/120 FPS nếu chưa đo.
- [AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo): API đọc và theo dõi giảm chuyển động.
Tài liệu chính thức đọc qua agent-reach/Jina; hướng dẫn local ui-ux-pro-max được đối chiếu theo stack native, không áp dụng CSS/web API vào app.

## 7. Chưa kiểm và việc người dùng cần làm
- Chưa kiểm lại runtime iPhone/iOS, swipe-back iOS, VoiceOver/TalkBack, QR qua ống kính và GPS thực, offline first launch, ma trận font/keyboard toàn app hoặc FPS/pin trên bản release.
- API production chưa có trong scope; Live ready/response muộn được kiểm ở test hoặc source có kiểm soát, không tuyên bố kết nối backend thật.
- Người dùng review [plan](UI_UX_IMPROVEMENT_PLAN.md) rồi cho phép triển khai các đợt sửa còn lại. Yêu cầu bỏ thống kê đã làm riêng theo chỉ đạo trực tiếp.
- Giữ nguyên các thay đổi UI đang có; không commit/push. Không mở thêm backend hoặc Voice.
