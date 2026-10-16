# Việt/Anh sau Phase8 — hợp đồng/ownership T1, bản phản biện

**DRAFT T1, chưa coding sản phẩm cho tới khi W1 chốt sau phản biện W2/W3.** Không phải cửa xin duyệt người dùng: prompt đã cho quyền tự chủ, Codex thay vai trò Claude. Phase8 đã chốt91ddfbd bằng code/test/native/artifact/restore; nguồn và giới hạn ở PHASE_8_QA_REPORT.md. Task umbrella29530ca62743. Hai inventory đã review: POST8_W2_UI_INVENTORY.md (248d861), POST8_W3_DATA_VOICE_INVENTORY.md (887d194).

## 1. Phạm vi hữu hạn và dữ liệu

- Giữ **data/demo.json**,34MP3/manifest Việt và source/hash8b318b… nguyên byte. Đây là một bộ truyện hư cấu6 chương/21QA/intro/6caption, không phải năm bộ của5ngõ. VI giữ mức user-reported listeningQC, không nâng bằng chứng.
- Hai collection demo offline: `fiction-letter` (6chương cũ, VI/EN) và `old-quarter-pilot` (tối đa3 điểm thật đủ nguồn, VI/EN). Pilot dự kiến Bạch Mã, nhà87 Mã Mây, Đồng Xuân; source ledger/QA quyết nội dung đủ chắc. Không bịa để đủ3. Một điểm hoàn chỉnh được review nativeVI/EN trước khi sinh hàng loạt audio.
- Card chỉ mở dataset thực sự có. Các ngõ metadata chưa có nội dung không được mở cùng truyện rồi nhận là bộ riêng; bỏ khỏi danh mục đang hoạt động hoặc hiện unavailable được dịch, không xóa asset/file cũ. Tên/đếm chương lấy từ collection/dataset thực, không giữ số4–6 giả.
- Mode `demo` dùng bundle của collection được chọn, không API/key. Mode `live` dùng một collection VI/EN đang công bố từ backend; không cache/fallback sang bundle. Đổi mode/collection có thể chọn startNode khi ID hiện tại không thuộc dataset; đổi locale phải giữ node/chương logic.
- W1 sở hữu content mới tại `data/localized/fiction.en.json`, `data/localized/old-quarter.vi.json`, `data/localized/old-quarter.en.json`; docs/content source/claim/glossary. W2/W3 đọc, không tự sửa nội dung/alias hoặc copy các file này sang nguồn thứ hai. VI fiction đọc fixture cũ, không tạo bản sao dữ liệu Việt.
- Lời kể pilot mốc60–90s nếu đủ facts; tách legend khỏi lịch sử. Không lời bịa/quán mở/giá/giờ/dị ứng. Không đọc URL/metadata/disclaimer dài vào audio; nhãn nguồn/hư cấu rõ trên UI. Tên địa danh/món Việt giữ dấu trong display; bản dịch giữ cùng facts/độ chắc chắn.

## 2. Locale và schema dữ liệu

- Locale duy nhất `vi | en`, type/validator thuần ở `mobile/src/data/locale.ts` doW2. Không import Expo/React từ module được Node/backend dùng.
- Schema1/fixture/parser cũ vẫn được kiểm nhưPhase8, defaultdemo đúng6node/simulated. Schema2 thêm bắt buộc `locale`, `collectionId` (ID1..128 ký tự); giữ `kind,disclaimer,intro,startNodeId,nodes,qa` và cấu trúc text/evidence hiện có.
- Schema2demo/live cho1..50node/0..200QA, simulated hoặcreviewed; collection fiction bundled vẫn đúng6/21. Reviewed phải có approved/UTCupdatedAt trênintro/mỗinode/mỗiQA; evidenceintro/QA khôngrỗng. Metadata là quy trình review nội dung, không giả duyệt thiết bị/người dùng.
- Mọi localized file cùngcollection dùng cùngnodeID, QAID,nodeId,startNodeId,order,followUps,logicaltags,availability,visitMinutes,geometry; chỉ text/name/summary/story/caption/question/answer/aliases/evidence/disclaimer đổi ngôn ngữ. Alias/matcher chỉ trong(locale,nodeId), không fuzzy/cross-chapter/cross-language.
- V2 cho geometry **cảlatitude/longitude lànull** khi chưa có nguồn; chỉ mộtnull làshapeerror. V1giữ numericbounds. GPS chỉ xét node có cặp tọa độ hợp lệ; không có thìUImissing-coordinate/chọn tay, không lấy tọa độfake. Thời gian `visitMinutes` là gợi ý biên tập chưa đo thực địa, không nhận là ETA đi bộ. Sơ đồ trang sách không phải dẫn đường.
- Giữ toàn bộ giới hạn Phase8: bodyUTF8≤512KiB mỗi locale, story/answer≤2000,caption≤220,intro≤4000,disclaimer≤2000,ID≤128,shorttext≤500,evidence≤20×2000,alias1..7,followUp0..2,tags≤20. Không nâng trần vì dịch. V2metadata/missing locale/locale không khớp expectation làerror, không silently dùngVI.
- Dataset revision V2 =SHA256 của `JSON.stringify(parsedDataset)` (ECMAScript, giữ array order); NodeCrypto/ExpoCrypto hiện có, không thêm serializer framework. Backend lưu/serve chính chuỗi compact này, kiểmdigest khiđọc; app kiểm/tạo revision từ cùng dữ liệu. VI fiction V1 giữ revision8b318b… hiện có. Manifest mới ghi quy tắc/hash và test parityNode/mobile; hashtext từngtrack vẫn là chốt chọnaudio.

## 3. API/SQLite — thay đổi hợp đồng có chủ đích

**DOI so vớiPhase8:** thêm tài nguyênV2 để giữ nguyên đườngV1, schema2/locale/nullablegeometry. Đây là phần cần cho scopeVIEN mới, không suy rằngPhase8 đã có nó.

- Giữ nguyên `GET /api/dataset`, `/api/health`, `/api/ready`, CLI/schema1 và hành vi query/method củaPhase8 cho client cũ. Không viết đè datasetV1 đang có khi thêm V2.
- Thêm `GET /api/v2/dataset?locale=vi|en` và `GET /api/v2/ready?locale=vi|en`. Locale bắt buộc, query khác/trùng/không hỗ trợ→400 mãlỗi; không tự dò/probe hay gọi lạiV1. Methods khácGET→405/AllowGET; khôngchat/LLM/adminHTTP/gatewaydata.
- V2dataset200 chỉtrả mộtlocale hoàn chỉnh, `Content-Language` đúnglocale và bodymetadata khớp. Chưa cópublication→404NO_REVIEWED_DATA; dữ liệu lưu lỗi/partialpair/hash sai→503DATASET_INVALID, khôngemptygiả. ReadyV2 trả200 hoặc503 vàlocale. Errorbody dùngcodes, khôngstack/rawserverVI trongENUI.
- AppV2gọi đúngmộtGETdataset với locale hiện hành, baseURL vẫnHTTP(S)khônguserinfo/query/fragment; giữprefix, UIchỉorigin. Tổngdeadline8s gồmbody/parse/revision, abortmode/locale/collection/revision/unmount, bỏmọi kếtquảcũ. Không persistence/livefallback.
- Migration002 **additive**, giữ nguyên bảngV1/khóa/FK/STRICT/WAL; thêm một bảngpublicationV2 lưu2row(vi/en), collectionId,payloadJSON đãvalidate, SHA256. JSONpayload bounded/valid và kiểm lại bằng sharedparser khiimport/read; không nhậnSQLFK đãkiểm refs trongJSON — refs do parser dùngchung kiểm.
- CLI mới `import-localized --vi <file> --en <file>` validate cảpair+logicalidentity+size trướcmutation, transaction xuất bản đồngthời2locale/cùngcollection. Zero rows làchưa côngbố; mộtrowhoặcID/order/geometry lệch làpersisted-invalid. Không ghiVI/ENpartial/âm thầm bùlocale. Mộtactivepair, không thêmcatalogCRUD/APIđa-collection.
- BackupSQLite cótimestamp trước migrate/replace DBcódata; thử trênbảnsao vàrestore/rowcount/digest trước thao tácdatacógiátrị. Serverstartupkhông migrate, khôngdrop/reseedV1. Taskchỉ dùngDBtemp, khôngDBmain/user. PhảnbiệnW3 được đềxuất cáchlưuítcodehơn nhưng phải giữ tính tươngthích/atomic/rollback/integrity này.

## 4. UI/persistence và ranh giới mã

- W2 viết dictionarykeyVI/EN nhỏ, coveragekeys bằngnhau; khôngi18nframework/dependencyappmới. Puretranslator `translate(locale,key,params)` vàkeynamespacevoice/error ổn định được commit sớm choW3 dùng; không hai nguồn thôngđiệp UI.
- Ngônngữmáy từIntl.resolvedOptions locale(en→en,vi→vi,khác→vi), lựa chọn manual ưu tiên vàgiữqua restart bằng File/Paths.document củaexpo-file-system đãcó. Không trộn modernFileAPIvới legacydocumentDirectory. Filelocale riêng, khôngghiđè preference/userdata khác; corruptread/unsupportedvalue→OSfallback, khôngcrash. Kiểm native thực vềIntl/persistence, không nhận chỉ unit làOSproof.
- SelectorTiếngViệt/English có ngayPrologue/trangđầu vàmenuHome; khôngcờđơnlẻ/intro dài mớiđổiđược. ProviderAppgiữlocale+collection/session/node; đổi locale clear/hủytrạngtháicũ, content-loading/error đúnglocale, không hiệnnguồnVI trongUIEN dưới dạngfallback.
- Dịch toàn bộreachableUI/a11y/errors/header/dialog/player/dock/GPS/QR/source/topic/time/confirmation; tagslogic giữIDcũ nhưng display qua dictionary. Preset/freetexttopic/timeEN nhậncùnglogic core, giữparseTimeBudgetVI/half-hour đãkhóa. ErrorcodesmapUIlocalizedgeneric nếuunknown, khôngrawstack/message.
- Giữ kiểu thiết kế hiện hành vàattribution; ảnh minh họa không nhận làảnh đúngsite. Khôngcopy nguyênWIPmain hoặc redesignngoàiphạmvi. Textstory/answerẩn mặcđịnh; toggletextkhôngresetplayer. Locale switch thìstopoldaudio, khôngautoplaytrackmới.
- Font150–200%, keyboard, screenreader/reducedmotion, nútkhôngellipsis chetràn. Bảnđịa hóa nativepurposestringsVI/EN bằngconfig/build phùhợp; OS/ExpoGopopup cóthểtheohost/OS, nêuđúnggiới hạn runtime/iPhoneWindows.

## 5. Audio/STT — chỉ phần cần choVIEN

- W3 sở hữu `mobile/src/voice/**`, `tools/voice/**`, manifest/audio/catalogmới; W2 sở hữu màn/hộp/player/dock UI. W3 không sửa màn hoặcW2dictionary; W2 không sửa hook/engine/catalog. W3dùng puretranslator doW2 commit sớm cho notice/errors từhook, cần thêmkey thìaskcoordinator/W2.
- Context/turn/scope giữlocale cùngmode,nodeId,datasetRevision; scopeclientcócollectionId. `useVoiceSession` nhậnlocale, transcribe contextmởunionvi/en; app→multipart→gateway→worker→decoder language chínhlocale→responseecho→validator. Cácfieldidentity hiệncó giữnguyên; khôngchỉechoEN màenginevẫnVI. OldVIrequestscompatible. Unsupportedlocale400, ASRunavailable503, timeout/quota/no-speechgiữnguard/mãlỗi; không outboundLLM/dịchtranscript.
- Locale switch ởpreparing/recording/stopping/ready/transcribing/playing: giữnode, cancelrecord/request+tempfile, stopplayback, clear/refreshsheet/action/notice, tăngepoch vàignoreoldcallbacks dùhủy khôngdừngserver. Khôngmic/autoplay. Giữmộtplayer/playpause/replay/stop vàlựa chọnlặp.
- MatchQA/intentEnglish bằngbảngexact theo locale/node; mởcâuEnglish chointentđangcó, negative/ambiguouskhôngraactionnhầm. Khôngthêmintentfeature, fuzzy haymượnchương/VI.
- Catalogue cũ34VI giữnguyênbytes/hash. Assets/manifestmới táchfolderlocale/collection; staticrequires choMetro. Trackidentity(collectionId,locale,contentId), hashtext hiệnhành phải khớp, revision/source/modelrevision,path,duration/audiohash đo. KhôngtrackVI hoặcdevicevoicefallback khiENthiếu; UIbáoAUDIO_UNAVAILABLE. Live chỉplayassetknowncollection/content/locale/hash khớp, không đọc nội dungserverkhác bằngclipcũ; datasetrevision vẫn bảo vệturnscope.
- ProbeEN **tối đa2preset** của cùngfreeKokoro82M: af_heart(US),bf_emma(UK); chưaprobe/lựa chọncuối. Modelprimaryhexgrad/Kokoro-82M revisionf3ff3571791e39611d31c381e3a41a3af07b4987, cardApache-2.0; kiểm/license/preset/library trước download. PiperLessac chưachốt vìcardtrỏresearch-license, eSpeak khôngđạt mục tiêuấm rõtheokỳvọng; khôngtả chúngđãprobe.
- Runtime/deps/model chỉisolatedignored/cache hoặcTemp đúngtask, khôngglobalpip/SDK/registry vàkhôngwritesmain. Đượctải đúngfreepublicweights/pinnedpackages cần chohaiENprobe vàlưu license/hash/recipe, khôngpaidAPI/clone/privateaudio. Ưutiên cachedweights đọc/copy, khôngđổi service8788/8081 củauser; own backend/voice/Metro port/PIDs riêng, loopback mặcđịnh, LANchỉtestexplicit. KhôngdùngmodelVIđểgiảEN.
- Tạođủmọitrackdemoreachable sauverticalslice: fictionEN34, pilotVI/ENintro+story/caption/QA theoinventory thật. QCformat/duration/levels/cuts/hash + realASRsynthetic theođúnglanguage; khôngnhậnautomatedASRthànhhumanlistening/phone. Dữliệu/textchưacóaudio=scopechưaxong.

## 6. Ownership/thứ tự và nghiệm thu

1. W1 chốt draft này sauW2/W3 critique; W4 kiểmsource/claim ledger riêng, W1viếtcontentVI/EN+glossary. Khôngcodingtrướccontractfinal.
2. W2earlycommit locale type/puretranslator +sharedV2parser/loader interfaces. W3cherry-pick đúngsharedcommit, làmbackendV2/migration/STT; W2làmUI songngữ. Mọiworkerxemsourcecụthể91ddfbd vàchỉcommit file sởhữu.
3. W1/W3/W2 nối1point thậtVIEN đầu tiên (contentapproved+audio+ASR+UI+native) choW4review; đónglỗi trước bulkcatalogue/đủinventory. W1cóthểbiêntập drafttext khácsong song, khôngnhận đãpublished/QC.
4. W4review từngSHA, coverageUI/text/audio, facts/translation/propernames/fiction distinction, nativecoldEN/persistVI-switch, allfixedQA lookup, ít nhấtcặphỏi/hỏitiếpVIEN ởmọiđiểmdemo(syntheticphânbiệtphone), lifecycle/no-fallback/quota/timeout/cancel/audiofail, fontkeyboardA11y/ReduceMotion, VI34hashregression.
5. Sourcecodeđổi sauQA thìchạy lạiđúngphần ảnhhưởng. Giữevidencefreshignored, SHA/build/device/source/model/preset/duration/actualcommand rõ. iOSexportkhônglàiPhone, micAVDkhôngthànhphoneproof; thiếuthiếtbị/humanQCghi pending cụthể.
6. Gitpost8: cácnhánhlocal post8-plan/ui/backend/qa bắtđầuclean91ddfbd, nhánhPhase8 giữnguyên. Khônggitmerge/push/publish/store; dùngcherry-pick córeview từngcommit vào candidatecụcbộriêng đểkiểm, khôngmain hoặcnguyênnhánhcũ. Khôngreset/revert/pulltreebẩn; khôngmainWIPwrites. W1sởhữuMEMORY/checklist/tổnghợp, khôngsourceUI/backend.

**Chưađượcnhậnlàđãxong:** ENUI/content/audio/STTđanginventory; licensecardkhônglàprobe, sampleTTSkhônglàSTT, syntheticASRkhônglàmicthiếtbị. CácgateV0–V7 giữtrạngtháiriêng. Chỉhỏiuserkhiquyền/ngânsách/credential/quyếtđịnhthật sựchặn, khôngxinlạitừngtask nội bộ.
