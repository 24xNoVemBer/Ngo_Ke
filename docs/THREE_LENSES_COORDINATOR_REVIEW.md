# Ba lát cắt phố cổ — coordinator review

Date19/10/2026. **Technical integration complete; current results and demo instructions: [THREE_LENSES_FINAL_REVIEW.md](THREE_LENSES_FINAL_REVIEW.md).** Content,56-track audio and app fixes accepted by coordinator with285/285 app tests, TypeScript/lint and native-platform bundle checks. Human listening and native device acceptance remain pending. The earlier review checkpoints below are retained for provenance.

## Authority and scope

User asked to add a complete demo from their Google Doc, including voices, then explicitly allowed additions to make the story more compelling. W1 owns content/contracts and independent review; Antigravity W2 app, Codex Luna/xhigh W3 voice. No newengine/LLM/AR/navigation/backendmigration, no mainworkspace writes, no push/merge/publish/store.

Newcollection`old-quarter-three-lenses`:3physicalplaces (BạchMã,87MãMây,ĐồngXuân),5narrativechapters (1+1+3),16Q&A (3+4+9),5suppliedphotos. A3chapterĐồngXuân is onephysicalpoint, not3GPSpoints. Intro, fullhook/body/observation,2transitions andclosing all have voice targets. Existing2collections and100MP3/cue remain protected.

## Content and provenance accepted by W1

- Source: [user Google Doc](https://docs.google.com/document/d/1VwiCcG2BQKD8-t-Yu5VfgXxJ1qGcWayaaTd4upHu4OI/edit), exportedTXT19621characters/354lines andDOCX with5embeddedimages. Originaltext retained`docs/content/three-lenses/USER_SCRIPT_VI.txt`; images visually mapped before integration.
- W1v1commit`89a8f8b`→candidate`f99ea8f`; enrichedv2`5a93202`→`dbb5016`. Adaptations`VI_AUTHORING.json`/`EN_NARRATIVE.json` use rhetorical questions, image-led attention and transitions. No invented witnessquotes, namedresidents, incidents or exact unknown dates. Original16QA/evidence preserved; observation instructions kept, banner tiedto2026photo.
- Sourcefactchecks: archives1890steel/1917expansionplan; corporation1996; HoanKiem1999restoration andDSVH2004listing; fire1994/rebuild1995 crosscheckedVnExpress/HoanKiem. These are sourceddemo claims, notofficialsitemanager approval. PreserveMMoriginaldateuncertainty,whitehorselegend,fountainunknown,individualstallagesunknown.
- BạchMãcoordinatesnull. Other2inheritpreviousOSMgeometry, notnewfieldsurvey orroute. Photo rights have not been independentlyverified; images are suppliedforrequestedprivatedemo. Humanreview remains explicitlypending.

## Independent content verification

W1 ran Node against realcandidateproduction`parseDatasetV2`, `canonicalDatasetJson` and`findAnswer`, notworkerprovidedmockresults.

- Bothlocales acceptedbyexistingV2parser, withouttextcap/schemachanges; largestv2chapter1776VI/1641ENchars, below2000.
- CorecanonicalrevisionVI`32e1553d86fa0ab109c75a161ce90a39c61a244fe441f5eab0d4f298f7b9197d`; EN`8c996ce9c61225bc442b603c700238d2dc169666742d37152fafb637eb0e8120`; matchescompanion.datasetRevision inboth.
- CompanionpayloadwithoutscriptRevision/datasetRevision hashes toscriptRevision; core.scriptRevision matches. Thusadditionalchapters/transitions/closing content isboundbycore revision.
- All5chapter.qaIds arrays cover16uniqueQA. Firstchapterfor eachnode equalscorestory byte-for-byte. NodeIDs preservedbutcollectionscoped.
- **96canonical+aliasutterances** returnedexpectedanswerIDs (32canonical+64aliases). **32wrongnodecanonicalqueries** remainedunknown. Allfollowups resolveinsidephysicalnode; anunsupportedqueryremainsunknown. This is textmatcher evidence, notSTTaccuracy.
- Human-readableVIpreview:`docs/content/three-lenses/STORY_PREVIEW_VI.md`.

## Reviews returned to W2 (resolved; see final verification report)

1. Guard initially allowedmissingmode/locale/revision/coremetadata; requirefailclosedscoping andintegritythatactuallygatesUI, withnegativeandtamperingtests. Live mustneverreceivebundledcompanionfallback.
2. Newrealcard had fabricated250mdistance/popularity/moodmetadata; omit/relabelwithoutclaimingGPSorfieldaudio.
3. Introplayback mustrequestkindintro. Everychapter/segmentselection mustcancelpendingplaybackevenifnotyetplaying; clearoldanswerwhereappropriatetoalignreadtext/audio/source. Requiredeferredpromise regression.

No W1 edits to worker-ownedappsource. Fixes committed by W2 and reviewed/cherry-picked narrowly; W1 independently checked the final candidate. Pending audio cancellation, replay after chapter selection, source-kind precedence, photo scoping, companion payload and localization findings are resolved. Historical delivery alone was not treated as proof of a fix.

## Audio target and current evidence

Exactly28tracks/locale,56newMP3: intro1+fullchapterstory5+corecaption3+transitionstory2+closingstory1+answer16. VIEneu3.7.1existingĐoanTrang / Kokoro0.9.4existingaf_heart; source/displaytext andspokenmappertrackedseparately. Newassetpath`mobile/assets/voice/three-lenses/`, staticcatalog`mobile/src/voice/threeLensesCatalog.ts`, lookupadditionownedW3.

W3 final voice commit`5460567`→candidate`c18fcc3`; scoped intro hook/test`cceb211`→`7209771`. Models remain pinned: VieNeu3.7.1 Đoan Trang, Kokoro0.9.4 af_heart; actual Python3.12.13. Manifest SHA256`e9a7d38dffa5fc90c9e8b7cc2fdf9d7e91d4bd28657716170c2dfcab985c3d1e`. Full worker measurements and per-track provenance: `tools/voice/THREE_LENSES_VOICE_REPORT.md` and `mobile/assets/voice/three-lenses/manifest.json`.

W1 independently ran on candidate,19/10/2026:

- `three_lenses.py audit`: **56/56** full MP3 decode, metadata/revision/text/asset hash checks passed.
- `python -B -m unittest test_three_lenses test_post8_probe test_post8_remaining`: **16/16** passed using the existing backend worker virtualenv; no dependency installation or model change.
- All**100 old MP3** Git blob hashes equal baseline`5d1984e`; `mobile/assets/sounds/prologue_door.wav` also unchanged.
- Production voice hook lifecycle tests**9/9** passed after scoped intro integration, including kind/current physical node guard, native error latch and deferred scope cancellation.

All 28 clips together total VI777.450s and EN804.401s, including the16optional Q&A answers in each language. These totals are not a continuous walking itinerary. VI render stopwatch530.8s; EN observed file timestamp span626.316s, not a stopwatch. No clipped samples in worker audit; EN RMS approximately−26.77…−26.07dBFS, VI−20.91…−19.12dBFS. Human pronunciation, loudness preference and new-corpus ASR accuracy remain untested; tracks are provisional, `humanApproved:false`, not selected for shipping. Do not advertise the source document's5–7minute estimate as measured final duration.

## QA and environment limits

- W4 OpenCodecannotproviderequiredMuseSpark1.3Free: currentproviderlistlacksit; configuredsessionwasDeepSeekV4.1FlashFree. Noquotaexhaustionwasobserved, soAGENTSautomaticquota-fallbackauthoritydoesnotapply. Workerperformedzeroreview/edits, reportedfailed andwasreleased; noMuseQAclaimed.
- W1continuescoordinatorreview andindependentchecks; thisdoesnotbecomeanindependentMuseaudit.
- No native rerun inthisscope. Previousemulatorlaunchwasrejected`blocked by policy`; noattemptthroughanotherworker/tool. Phone/iPhone/FPS/humanlisten remainpendingunlessnewactualevidenceisrecorded.
- Metro8081 restarted from integrated candidate; terminal`term_f7d36695-fc79-47b8-af23-099bcd2ed28b`. WiFiIPv4192.168.100.36 verified again. Android/iOS bundles and7sample assets HTTP200; details in final report. ExistingExpo.devpreviewisolderandnotupdatedbythiswork.

## Việc cần người dùng quyết / tự làm

- Cầnquyết: khôngcóquyếtđịnhchặntriểnkhaiđãgiao. KhôngtựđổimodelW4hoặctuyênbốnghiệmthuofficial.
- Cầntựlàm: ràsoátlờikể/nghegiọngbằngngườithật và xácnhậnquyềnảnh trước khidùngdemochínhthức/chiasẻrộng. Chưađượccoilàđãlàm; privateimplementationvẫntiếptục.
