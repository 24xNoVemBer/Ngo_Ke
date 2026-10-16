# Review tích hợp Việt/Anh — đang thực hiện

Coordinator Codex/W1,16/10/2026. BaselinePhase8 `91ddfbd`; candidate cục bộ `valentino/post8-integration`. Đây là nhật ký kiểm độc lập, không là tuyên bố đã hoàn thành post8, không gate người dùng hoặc nghiệm thu điện thoại.

## Nội dung

- W4 nguồn `b1f4fbd`, full copy `a06bb0a`, adjudication/QAplan `2da4c62` được W1 review và đưa vào nhánh plan/candidate bằng từng cherry-pick. Một finding củaW4 về MM2 xây nhà đầuTK20 đã bị rút: đoạn mở đầu mô tả kiến trúc khu phố cuốiTK19/đầuTK20, còn đoạn riêng nhà87 nêu cuốiTK19. W1 đọc lại primary quaJinaHTTP200; không chọn niên đại precise đang khácMM1. Copy19thcentury,1999 giữ đúng mức chắc chắn.
- W1 biên tập fictionEN `cde7d22`, pilotVI/EN `d3e1e15`; assert độc lập kiểm identity/logicalfields/graph/approvedUTC/evidence/limits/nullablepair và actualmatcher. Kết quả259question+alias inputs trên4dataset trả đúngentry trongnode; không thaymatcher. Đây là lookup test, **không chứng minh ASR**.
- `data/demo.json` SHA2568b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b không đổi. ManifestVI SHA25634925f5d005fa7fb684c4f8fac19992865b581c6eeaa6bde0e9183431c9be05a và34/34audioSha256 được kiểm lại bằng Nodecrypto/readfile, không tái sinh.
- Sharedparser`ef93b68` đã parse được cảfictionEN vàpilotVI/EN; `validateDatasetV2Pair` pilot trảok. Text inventory100track khác assetcoverage100track:66audio mới còn pending.

## Shared stage1 — test xanh nhưng còn lỗi biên

W2 commit `ef93b68757155a404bb6c1597c26739b8090b979`, candidate cherry-pick `35a7288`. Root cài đúnglockfile bằng `npm ci --no-audit --no-fund` trong candidate/mobile (593packages), không đổi package/lock. Lần đầu trước cài có2test module fail do thiếutypescript/@expo/config-plugins, không nhận là codefail hoặc pass. Sau cài:

- `node --test tests/*.test.mjs`:212/212,0skip/0todo.
- `npm run typecheck`:exit0.
- `npm run lint`:exit0.

Root tái hiện thêm bằng Node24 với injectedfetch, dataset`old-quarter.en.json`, baseURLlocalhost, đúngmodule của candidate:

| Case | Input quan sát | Kết quả ef93b68 | Cần đạt | Trạng thái |
| --- | --- | --- | --- | --- |
| Header thiếu | 200, bodyEN hợp lệ, headers.get luônnull | ready | shapeerror, Content-Language bắt buộc khớplocale | W2 sửa, chưa đóng |
| 404 sai nghĩa | 404 với `{error:{code:'NOT_FOUND'}}` | empty/no-data | error; chỉNO_REVIEWED_DATA hợp lệ làempty | W2 sửa, chưa đóng |
| Body vượtdeadline | timeoutMs5, textPromise trả bodyEN sau40ms và bỏ quaAbortSignal | ready | timeout, khôngcommitbodymuộn | W2 sửa, chưa đóng |

Hướng sửa đã gửiW2: bound toàn bộ fetch/body bằng deadline thật kể cả khi abort không được tôn trọng, pre-aborted không gửi request, guard elapsed/signal trước kết quảready; regression missing/wrongheader, malformed/huge404, never-resolving/latebody, externalabort. V1 giữ hành vi tương thích; API V2 không dò V1 hoặc auto-retry. Chưa duyệt loaderV2 cho UI/native mặc dù212test đạt. Hash/revision trongApp cũng cần giữ trong budget trước sourcecommit, không chỉ timeout network.

## Phần còn lại

W2 sửa boundary rồi mới wiringProvider/persistence/UI và toàn bộUI/a11y/errorstrings. W3 license preflight Kokoro/Misaki0.9.4 Apache và2preset pinned đã báo, đang setup isolated/probe; GPL eSpeak/phonemizer là công cụ local, không ship app, chưa nhận audio đạt. Gatewaylocale bridge đã unit nhưng chưa nhận end-to-endengine/matcher. W4 đang viết content-contract tests; sau candidate cụ thể mới chạy firstpointVI/EN native, rồi fullcoverage/assets/ASR/security/lifecycle/font/iOSexport.

GPS fix/QR thật/physicalAndroid+iPhone/humanEnglishlistening chưa kiểm. MainE:/Project/Ngo_Ke/ngoke làread-only, WIP giữ nguyên; không gitmerge/push/publish/store, không tiếp tục voiceV0–V7 cũ.
