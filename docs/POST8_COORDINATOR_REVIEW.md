# Review tích hợp Việt/Anh — bản demo đã kiểm trong môi trường hiện có

Coordinator Codex/W1, cập nhật17/10/2026. BaselinePhase8 `91ddfbd`; candidate cục bộ `valentino/post8-integration`. Triển khai và các ca kiểm môi trường hiện có đã kết thúc; không thay thế human QC hoặc nghiệm thu điện thoại. Nhật ký các vòng bên dưới là lịch sử, trạng thái hiện hành ở mục này và `POST8_FINAL100_QA_REPORT.md`.

## Kết quả hiện hành

- Source build cuối **`66c5fc4278aa5585a02dfc2be60c3d472bb16e44`**. APK đóng băng `C:/Users/LEGION/AppData/Local/Temp/ngoke-post8-66c5-6c0623d6f226-final.apk`,96,638,626bytes, SHA256 **`6c0623d6f226b9c5f307444789fafe011e441346741f566e3bbf1b7e38c677be`**. Nativehash/copyhash/Pythonhash/installedbase khớp; build2m50s/597tasks/exit0. Các commit tài liệu nhận sau không đổi cây source của bản build này.
- Root **257/257 app tests, typecheck và lint đạt**. Backend/data/voice engine không đổi trong lượt sửa UI này; không nhận các suite cũ là lượt chạy lại mới. Bảng asset132/100MP3 và100ZIP/source hash-multiset+raw-resource mapping đạt;46audio được bảo vệ (gồm34VI gốc) không đổi bytes. Raw `data/demo.json` vẫn SHA8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b.
- Đã review và nhận riêng W2 `43209f4`,`68d3450`,`2b95a16`,`5a76000` và phần bổ sung nhãn accessibility. W2amended34d6999 có cây giống hệt canonical1af7eeb; candidate nhận958c645+66c5fc4, giữ toàn bộ test/hook/key RECORDER_RECOVERY_PENDING của W3 khi giải quyết conflict. Không đổi thuật toán, IDs, dữ liệu hay audio để làm đẹp kết quả.
- Root kiểm ảnh native: Landing VI/EN200 hết chồng subtitle/nút; Home pilot có nhãn chưa đo; Plan EN hiệnAlleyfood/Matches và1stop đúng; drawer reviewedDemo VI/EN, nhãnQa notebook VI/EN và Camera active-card photo disclaimer được kiểm lại trên APK6c0623. W4Muse chạy focused follow-up với17file evidence tại `../test-opencode/tools/e2e/.runs/final-66c/`. D704 giữ bằng chứng **chỉ phần không đổi**, gồm fictionENstory00:07→00:11/00:24 khi mở chữ và MMENoffline00:49/01:09; không gán các ảnh cũ cho APK mới.
- IME đã quan sát là **panel emoji nổi**, gồm ảnh nonemptyWherearewe+Sendenabled; panel có thể che header/nút hủy của drawer. Submit sau khi đóng panel mở Answer/source đúng. **Chưa kiểm** QWERTY dạngdocked, resize theo bàn phím docked, appCancelX khi panel nổi che lên, TalkBack đọc/focusorder, hoặc timinganimation. Đây là giới hạn bằng chứng, không blanketfont/keyboard/a11yPASS.
- iOS JS export đạt (`index-c4b815e26d7343b700f1166b2d0c374b.hbc`), chưa phải iPhone. ASRsynthetic cũ36=18expected/18unknown/0wrong/0decoder mismatch giữ nguyên, không chạy lại hoặc đổi matcher/aliases.66audio mới vẫn provisional, không human listening/shipping approval.
- W4 đã tắt actualownedqemu41588 và39048. Root kiểm độc lập sau cleanup: ADB không có emulator, không còn emulator/qemu. Root headless kiểm accessibility_enabled=0 trước/sau thao tác idempotent về baseline0, servicesnull rồi tắt lại; config hiện tại khớp backup `final-66c/config.ini.pre-task-backup`, SHA0ce6d3d57792feacf6dc747ef6706423856844197660e4a8d7de3c3339dc0375. Audit việc backup cũ bị xóa/originalhash chưa đo và cold-boot chưa chứng minh vẫn giữ trong báo cáo, không nâng thành bằng chứng.

## Việc cần anh quyết / việc anh tự làm

- **Cần anh quyết sau:** giữ giọngEN `af_heart` US/cách đọc tên Việt hay yêu cầu chỉnh. Đề xuất giữ bản provisional để nghe; chưa chốt thì chưa coi human/shippingQC đạt. Không có quyết định/credential/ngân sách nào chặn phần triển khai hiện tại, không cần trả lời để xử lý task nội bộ.
- **Cần anh tự làm [ngoài plan core TECH_DEMO_PLAN, thuộc scopeVI/EN đã mở]:** nghe66audio mới và chỉ rõ câu/tên cần chỉnh;34VI gốc không cần nghe lại chỉ vì tích hợp này. Chưa nghe thì chất lượng cảm nhận vẫn pending.
- **Cần anh tự làm theo plan thiết bị:** khi có máy, thử GPSfix/QRthật và app native Android/iPhone; iOS cần môi trường build/ký/cài phù hợp. Windows export/MCP thấy iPhone không thay cho việc cài/chạy. Các giới hạn này không được ghi thành đã kiểm hoặc đã được anh duyệt.

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
| Header thiếu | 200, bodyEN hợp lệ, headers.get luônnull | ready | shapeerror, Content-Language bắt buộc khớplocale | Đã đóng bằng5b59f70, root tái hiện lại trên1c33b69 trảerror/shape |
| 404 sai nghĩa | 404 với `{error:{code:'NOT_FOUND'}}` | empty/no-data | error; chỉNO_REVIEWED_DATA hợp lệ làempty | Đã đóng bằng5b59f70, root kiểm lạierror/http |
| Body vượtdeadline | timeoutMs5, textPromise trả bodyEN sau40ms và bỏ quaAbortSignal | ready | timeout, khôngcommitbodymuộn | Đã đóng bằng5b59f70, root kiểm lạierror/timeout |

Hướng sửa đã gửiW2: bound toàn bộ fetch/body bằng deadline thật kể cả khi abort không được tôn trọng, pre-aborted không gửi request, guard elapsed/signal trước kết quảready; regression missing/wrongheader, malformed/huge404, never-resolving/latebody, externalabort. V1 giữ hành vi tương thích; API V2 không dò V1 hoặc auto-retry. Chưa duyệt loaderV2 cho UI/native mặc dù212test đạt. Hash/revision trongApp cũng cần giữ trong budget trước sourcecommit, không chỉ timeout network.

Sau5b59f70, root phát hiện thêm3case trên cùngcandidate1c33b69: bare`{code:'NO_REVIEWED_DATA'}` vẫnempty do helper thêm compatibility không được chỉ định; response201/oktrue/body hợp lệ vẫnready dù contract chỉ200; 404canonicaltext() block đồng bộ20ms với budget5ms vẫnempty vì thiếu finalelapsedguard nhánh404. Đã giao W2 stage2 task339957fe9ad1/ctx_cb4f437b9e73 đóng bằng commit nhỏ trước UI, rồi tiếp tục Provider/dictionary/screens theo ownership. Không nhận chữ “bulletproof” trong worker summary là chứng cứ.

W4 contenttests`ee8e10b`43/43 xác minh text/manifest nhưng chưa đọc hash34MP3thật; test kiểu literal không cóintro-en và helpercheckPair tự lặp không chứng minh catalogue/parser. W4 task4d5bd517c59a/ctx_0bed527c6ac5 đang thay bằng actualfileSHA/pureparserpair, không claim assetcoverage mới đã đạt.

## Mẫu audio thực tế đang QC

W3 đã tạo14fileignored ở`backend-luna/tools/voice/.cache/post8-probe`:6track BạchMã+1sample kiểm tên mỗi preset. `results.json` ghi af_heart story52.45s, bf_emma48.8s; MP3mono24kHz96kbps, clipping0. Af_heart peak cao nhất−3.4dBFS/RMS thấp nhất−26.41; bf_emma−4/−24.65. Đây là đo tự động, chưa phải ASR/human/nativelistening. LegacyVI48kHz được giữ nguyên; productionencoding mới phải ghi rõ source/outputrate, không nhận upsampling là chất lượng tăng. Truyện thử phát âm có nhân vật hư cấu cạnh địa danh thật chỉ là syntheticcheckignored, không đưa vào nội dung di sản.

## Phần còn lại

### Resume 16/10/2026, 11:30 ICT

- Candidate `78de2ab` đã nhận W4 `124ca80` sau review. Coordinator chạy content suite **47/47**: actual matcher, shared pair parser và đọc SHA cả34MP3 đạt; raw manifest34925f và gitLF92e277 đều được giải thích/kiểm đúng EOL, không sửa manifest.
- Trên cùng candidate, targeted `tests/post8SharedContract.test.mjs` **12/12**, typecheck/lint exit0. Coordinator chạy thêm7assert qua actual `loadLiveSourceV2`: missingheader→shape, bare404→http, NOT_FOUND404→http,201→http, canonical404→empty/no-data, latebody40ms/budget5→timeout, synchronous404body20ms/budget5→timeout. Như vậy các lỗi boundary nêu trên đã đóng bằng7b7fc7a/candidate d58e40e. Đây chưa phải fullApp/native hoặc deadlinehash proof.
- W2 `cda2775`+`604dd2f` có UI/provider/persistence/collection nhưng chưa được chấp nhận hoàn tất. Đọc exact App.tsx cho thấy effect `[collectionId,locale]` resetnode; có runtimeV1fallback; liverevision giả `live-N`; source cũ chưa được chặn đồng bộ khi đổi locale; đọc preference muộn có thể ghi đè manualchoice. Một số màn/component chưa dịch, QaScreen vẫn đọc legacy voiceTracks. Root đã dispatch sửa `task_d71e37f957cf`/`ctx_9e729a942fc9`, W4 review độc lập `task_8ce4636ae98e`/`ctx_3daa34d43861`; chưa cherry-pick UI vào candidate.
- W3 scaffold `672eedb` có lookupVoiceTrack và hooklocale/collection, chỉ legacyVI được lookup để không fallbackEN. W2 nhận export này để nối màn, W3 giữ ownership hook/engine. Worker cũ executionhost xác nhận failed/exited/operatorclose; retry đúngLuna/xhigh `ctx_a458b962c53f`/`term_51c850fd-d8e7-45e8-8087-393fde027e9e`, không đổi model hoặc ghi đèWIP.
- Audio EN chưa đạt: W4 `docs/POST8_PRONUNCIATION_REVIEW.md` chẩn đoán token Việt→UNK→đọc Unicode codeword; syntheticcheck cònmojibake. Root giao W3 lexicon hữu hạn tại TTSfrontend, giữ text hiển thị/hashnguồn và ghi spokenText/hashriêng. Mapping/probe chưa phải humanQC;14samplelỗi được giữ, khôngbulk trước firstpointnative.

**Việc cần anh quyết / việc anh tự làm:** hiện không có quyết định hoặc credential chặn phần triển khai. Khi có bản native cụ thể, cần nghe mẫu tên Việt/giọngEN và thử thiết bị thật; chưa nhận những việc này đã xong. Không yêu cầu anh xử lý lại task nội bộ.

Đính chính 11:34: nhận định riêng về syntheticcheckmojibake ở trên không đúng. W3 và root cùng parseUTF8/AST: source PRONUNCIATION_CHECK và JSON syntheticCheck có cùng hash `63192695ca6548299966793cb904b73c0bc27cea8f49657ad5de2505f533be91`, codepoint đúng, khôngreplacement/C1; PowerShelldefaultdisplay gây nhầm. Không sửa input. W4 được giao đính chính report; defect G2P/Unicodecodeword vẫn được giữ vì có chứng cứ riêng. Root full candidate `node --test tests/*.test.mjs` **213/213**,0skip/0todo, chưa gồm UI đang sửa.

11:37: candidate nhận scaffold672eedb thành `7b55d90`. Typecheck exit0, nhưng fullapp suite **fail** vì VMhookharness tạiuiFlows146 chưa mock import `../data/locale`, gồm duplicate/cancel/scope case527. Root đã gửi lỗi cho W2 chỉnh caller/harness thuộc sở hữu và thêm behavioral locale/collection regression; không bỏ kiểm tra hoặc sửahook để chiều mock. Kết quả213pass ởcandidate78de2ab không phải kết quả cây mới. UIcda2775/604dd2f vẫn chưa nhập candidate.

### Lỗi muộn giữa hai lượt locale — root tái hiện 11:42

Candidate7b55d90, actual `useVoiceSession` từ672eedb. Root dùng hàm mount hiện có trong `uiFlows.test.mjs` trích vào bộ nhớ, thêm injectedimport cho locale/translator/lookup; không sửa file/hook, không native/audio/API thật. Hai ASR promise được giữ riêng, recorder.stop hoàn tất có kiểm soát:

1. Bắt đầu VI, submit, giữ ASR1; stage=transcribing.
2. Render cùngscope/node/revision nhưng localeEN; effectcancel đưa vềidle đúng.
3. Bắt đầu EN, submit, giữ ASR2; requests=2, stage=transcribing.
4. Resolve ASR1 cũ, await submission cũ. **Expected:** lượtEN vẫntranscribing. **Actual:** stage=idle. Output: `{requests:2,expectedAfterOld:'transcribing',actualAfterOld:'idle',reproduced:true}`.

`submitRecording` finally ở khoảng dòng348 xét `!isCurrentTurn()` rồi chuyển stage stopping/transcribing sangidle mà chưa bảo vệ một turn mới. Không nhận việc bỏ transcript cũ là đã bảo vệ toàn bộ callback/cleanup. W3 được giao sửa voicecode và kiểm các nhánh xóa file/audioMode muộn; W2 sở hữu regression trong uiFlows và harness, giữ expectedtranscribing. Lỗi này chặn nghiệm thu locale lifecycle, chưa có patch được root xác minh.

**Cập nhật sau patch `15bad5a`, candidate `8464054`:** root chạy lại actual hook bằng hai ASR promise độc lập cho cả đổi locale và đổi collection. Khi lượt cũ hoàn tất, lượt mới vẫn ở `transcribing`, file mới chưa bị xóa, transcript cũ không được giao; khi lượt mới hoàn tất, chỉ transcript mới được nhận đúng một lần. Hai ca này đạt; sáu test thuần của `voiceLifecycle.test.mjs` cũng đạt. Chưa kết luận các giai đoạn khác hoặc native đã đạt. W4 đang kiểm riêng xin quyền, dừng thu âm và cleanup muộn ở task `task_6c89f04213aa` / dispatch `ctx_992df41fbd76`.

Checkpoint trước resume: W2 sửa boundary trước wiringProvider/persistence/UI; W3 setup isolated/probe, W4 viết content-contract tests. Trạng thái này được cập nhật bởi mục resume ở trên. GPL eSpeak/phonemizer là công cụ local, không ship app; gatewaylocale bridge đã unit nhưng chưa nhận end-to-endengine/matcher. Sau candidate cụ thể mới chạy firstpointVI/EN native, rồi fullcoverage/assets/ASR/security/lifecycle/font/iOSexport.

GPS fix/QR thật/physicalAndroid+iPhone/humanEnglishlistening chưa kiểm. MainE:/Project/Ngo_Ke/ngoke làread-only, WIP giữ nguyên; không gitmerge/push/publish/store, không tiếp tục voiceV0–V7 cũ.

## Tích hợp 13:22 ICT — candidate 88ae8c5

Đã nhận riêng W2 `20bd562` và W3 intent/lifecycle/decoder/12clip/backend commits. Conflict helper của `4e288ed` giữ exact W2 blob đã review; `7a32fcc` chưa nhận, chờ W2 reconcile. Root backend31/31/typecheck/lint đạt; mobile236/238, hai uiFlows mock chưa xuất stopVoiceRecorderWithTimeout. Không sửa expected hoặc nhận suite worker là native.

### Blocker đã tái hiện: import-localized thất bại vẫn ghi V1

Trên DB tạm mới `migrate()` bằng actual backend module: dataset rowcount0. Chạy actual CLI với `import-localized --vi invalid.json --en invalid.json`, cả hai file là `{}`. Exit1 nhưng dataset rowcount1/nodes6. `cli.mjs` chạy nhánh `command !== 'migrate'` rồi seed V1 trước khi validate localized. Vì vậy valid import cũng thêm V1 ngoài ý định. Đây là vi phạm validate trước mutation và giữ V1; test populatedV1 hiện có không bắt được.

Đã giao W3 loại localized khỏi nhánh V1, kiểm invalid import giữ tất cả rowcounts và valid import chỉ tạo V2 trên empty migratedDB. DB thử ở Temp `ngoke-root-import-audit-XJxxOu`, không dùng DB người dùng. W3 cũng sửa ready200 đang thiếu schemaVersion2/Content-Language và hook chặn mọi live asset.

W2 xử lý live picker vẫn lấy hai bundled collection rồi gắn nhãn backend catalog, UI demo-only audio gates, compact duration và mock contract; W4 review source độc lập. Chưa native hoặc human acceptance, chưa bulk66audio mới. Không có quyết định người dùng đang chặn những việc này.

## Cập nhật hiện hành — 16/10/2026, 14:43 ICT

Các blocker trên đã được sửa và kiểm lại trong candidate `d68223e441104fd923f9c39a0fc4acc18edd2d89`:

- W3 `5ab6876`: import-localized không seed V1 trước validation; actual CLI trên DB tạm lỗi trả exit1 và giữ dataset/nodes/qa/publication_v2 đều0. Ready V2 có schemaVersion2 và Content-Language. Actual backend HTTP qua actual mobile loader VI/EN đều ready, đúng canonical revision.
- W3 `b80b525`: EN thời lượng âm/khoảng không âm thầm chọn một số. Root13 focused intent/hook checks đạt. Known Live audio vẫn phải qua scope/revision/textHash/kind/node/catalogue, không phát asset khi nội dung server đổi.
- W2 `bf84bf3`, `6d24eee`: picker Live chỉ mô tả collection thực được backend trả; demo có hai collection bundle. Home lấy đúng metadata nguồn/locale; UI mở known Live audio và phân loại nội dung solely theo kind, không nâng simulated thành reviewed dựa vào ID.
- W2 `7ddd5d5`: permission strings bọc trong namespace ios, ngăn Android nhận6 extra translations. Strict Android lint được giữ; không baseline/suppress lỗi.

Root full app **245/245 Node/mock tests** đạt tại d68223e. Backend **32/32**, content/guards/V1 HTTP **95/95** được chạy trên các revision trước đã ghi trong MEMORY; không gọi những kiểm tra đó là native. iOS JS export ở4fec643 đạt1099modules/75assets, chưa phải iPhone.

**Artifact native:** Android release x86_64,589tasks,4m19s, build thành công có strict native lint. APK `../post8-integration/mobile/android/app/build/outputs/apk/release/app-release.apk`,61357774bytes, SHA256 `d1ee78850c77c4e8595c53421e699402a4feefec1b0419d9b2295e405bfdcb6f`. Root đọc ZIP đối chiếu46/46MP3 bytes khớp source;34VI nguyên bytes. Build này phục vụ emulator, không nhận là bằng chứng điện thoại thật.

W4 nhận FINAL-BUILD `msg_f44d1ae95d3f` cho cùng task_f7a87737dd16/ctx_3a102ed255c1. QA firstpoint Bạch Mã VI/EN **đang chờ thực thi/kết quả**, chưa chốt gate. Bulk còn54 assets (fictionEN34 + hai pilot còn lại20) chỉ dispatch sau coordinator review bằng chứng firstpoint. Tổng hiện46/100;12clip mới là provisional, humanApproved/shippingApproved=false.

Raw synthetic ASR→production matcher:3/6expected,3unknown,0wrong; mappedEN1/3expected,2unknown,0wrong. Không sửa aliases/JSON để làm đẹp số. Gateway18787 đang dừng; không coi URL build là mic/speech đã chạy native. GPS fix/QR thật/iPhone/human listening vẫn pending.

### Cập nhật 15:22 ICT — firstpoint cho phép tạo audio còn lại

Coordinator đã xem ảnh native mới của đúng candidate d68223e/APKd1ee78: `tools/e2e/.runs/fp/vi-story-play.png` (Live VI story00:08/00:46), `en-story-play4.png` (Live EN story00:07/01:01), `vi-play.png` (answer00:07/00:15), `qa-state.png` (ENanswerprogress). W4 interim `msg_94fa1072f8ed` bổ sung QA/followups/source hai locale, coldENOS, manualVIpersist qua force-stop, Livepilot3node và MMtextkhôngplayer. Ca câu hỏi lạ trả chưa có dữ liệu.

Chấp nhận **technical feasibility của firstpoint để tạo54audio provisional**, không nhận toànpost8 hoặc human/shipping approval. Đường thao tác native là rờiQa→Home→locale nên có navigation cleanup trước; direct in-place locale-during-playing/recorderstates chưa có native proof. Actualhooktests được ghi riêng. Font, quyền camera/GPS, mic/âm thanh người thật/iPhone còn theo QA/report.

W3 bulk `task_3a2ba393559c / ctx_caa129d5d5d2` chạy cùng Luna/xhigh tại backend-luna, không đổi matcher/aliases/JSON hay34+12audio hiện có. W4 tiếp tục candidate đóng băng; root chỉ tích hợp sau khi evidence được chốt. W2 wordingfix `e570943` đã review, chưa nhận candidate. Kết quả mới theo MEMORY, không suy số100 từ target khi chưa có file.

## Cập nhật 20:49 ICT — tích hợp đủ100 track, chờ native cuối

W3 task3a2/ctx13 đã báo succeeded bằng `5bac9c5`; root review riêng generator `b953ecf` và nhận candidate `40791d0` + `a1991ee`. Conflict duy nhất tại mock stop-recording giữ bản candidate đã review. Lint sau tích hợp bắt duplicate `localizedCatalog` do W3 bổ sung một mock đã có trong UI mới; root chọn lại nguyên blob UI test ở9c84a59, commit `5eae095`, không sửa production UI/hook hoặc expected. Toàn bộ regression mới về catalogue/hash/kind/node vẫn giữ.

- Root trên5eae095: **248/248 app**, **32/32 backend**, **95/95 guards/content/HTTP**, typecheck/lint đạt; focused54/54 sau resolution. Không skip/todo.
- Có100track,46MP3 bảo vệ so baseline9c84a59 đều giữ bytes; original manifest rawSHA34925f5d… và data/demo rawSHA8b318b… đúng worktree tài liệu. Git blob LF khác raw CRLF nên so raw với bản worktree nguyên trạng, không đổi file để thỏa so sánh sai lớp EOL.
- `lookupVoiceTrack` giữ4field availability API; playback hook giữ kind/node/textHash. W3 báo audit100identity/hash/codec/duration và54decode, stored metrics54khớp decoded MP3. EN24kHz, VI48kHz; các số baseline pre-encode khác decoded được report thật, không rewrite34+12.
- Actual gateway synthetic36:18expected/18unknown/0wrong/0decoder mismatch;18approvedgraph followups, chỉ9sau expectedcanonical. Forceddecoder locale không phải independent language classification. Không sửa JSON/aliases/matcher. Gateway18787 của worker đã dừng.
- W3 release trả retained/user_takeover/processAction none; delivery8cb0cc72f272 đã ACK sau xử lý. Không mở thêm công việc từ dispatch đãsettled. User yêu cầu mobile-mcp đã cài/verified riêng trong MOBILE_MCP_QA.md; chưa có Android app QA qua MCP.
- Native cuối: đang buildrelease arm64-v8a+x86_64 từ5eae095, dùng generated ignored buildrecipe đã kiểm. Chưa có APKhash mới, chưa startW4 chờartifact. Chưa chốt toànpost8.

### Cập nhật sau tích hợp sửa lỗi — source `2d9b210`

Các mốc20:49 bên trên là lịch sử. Candidate hiện tại đã nhận riêng W3 error latch/retry `e3a12c7`→`ff94710`, W2 badge `41e64c8`→`dd6d098`, W2 dịch filter/area wrap/thời gian reviewed/Notes `04888f3`→`2d9b210`; không sửa audio hay mở lại matcher. Root kiểm252app/32backend/95guards, typecheck/lint đạt. W4 asset guard có5unitcase, nhận từng commit QA đã review.

APK `f2d0b7ab…` bị rút: đủ100MP3 nhưng embedded manifest chỉ46mapping. SDK Gradle task theo dõi entryFile dạngString, nên tái build phải chạy `:app:createReleaseUpdatesResources --rerun :app:assembleRelease`. Bản mapping reference `13b27ffd…` đã phát các track mới native. Bản cuối source2d9b210 sau exit0 có96,637,278bytes, SHA256 `93c8d639c23ca9090d8f92ab7d8eee1757ce71ba5d5d986e4e76300344fb8c36`; root kiểm lặp hash ổn định,100ZIP/sourceSHA khớp,132asset/100MP3/54remaining và0missingmapping. Hash7cf7 đọc trước khi build xong đã rút, không phải artifact được nghiệm thu.

W4 đang chạy focused native QA trên đúng APK93c8 qua mobile-mcp: locale/filter/font200, Home/Plan/Location, keyboard thật, offline playback và accessibility. Root đã xem ảnh `final-2d9b/mm-en-play.png`: Mã MâyEN01:04/01:09; đây là bằng chứng trạng thái phát, không phải nghe được âm thanh. Báo cáo cuối và các giới hạn theo `POST8_FINAL100_QA_REPORT.md` sau khi nhận kết quả; không gán các ca13b2 cũ cho93c8.

### Việc cần anh quyết / việc anh tự làm

- **Cần anh quyết:** khi có mẫu nghe, chốt preset EN và phát âm tên Việt; đề xuất giữ af_heart provisional trong lúc hoàn tất kỹ thuật. Chưa chốt thì không gắn human/shipping approval, vẫn tiếp tục phần được phép.
- **Cần anh tự làm:** nghe66asset mới và thử mic/audio VI/EN trên điện thoại thật; phần VI/EN là yêu cầu post8 **[ngoài plan core TECH_DEMO_PLAN]** đã được mở riêng. Chưa thực hiện thì chỉ kết luận từ emulator/kiểm tự động; không cần nghe lại34VI nguyên bytes chỉ vì lần tích hợp này.
