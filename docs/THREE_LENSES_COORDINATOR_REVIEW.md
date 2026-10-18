# Ba lát cắt phố cổ — coordinator review

Date19/10/2026. **In progress: content frozen v2; app integration and56-track render not yet accepted.** Do not read the content checks below as final device/audio acceptance.

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

## Reviews returned to W2 (pending verified fix)

1. Guard initially allowedmissingmode/locale/revision/coremetadata; requirefailclosedscoping andintegritythatactuallygatesUI, withnegativeandtamperingtests. Live mustneverreceivebundledcompanionfallback.
2. Newrealcard had fabricated250mdistance/popularity/moodmetadata; omit/relabelwithoutclaimingGPSorfieldaudio.
3. Introplayback mustrequestkindintro. Everychapter/segmentselection mustcancelpendingplaybackevenifnotyetplaying; clearoldanswerwhereappropriatetoalignreadtext/audio/source. Requiredeferredpromise regression.

No W1 edits to worker-ownedappsource. Findings sentdurablyviaOrca; deliveryalone isnot proof offix.

## Audio target and current evidence

Exactly28tracks/locale,56newMP3: intro1+fullchapterstory5+corecaption3+transitionstory2+closingstory1+answer16. VIEneu3.7.1existingĐoanTrang / Kokoro0.9.4existingaf_heart; source/displaytext andspokenmappertrackedseparately. Newassetpath`mobile/assets/voice/three-lenses/`, staticcatalog`mobile/src/voice/threeLensesCatalog.ts`, lookupadditionownedW3.

W3preflightverifiedcachedpinnedmodels andactualPython3.12.13environment (READMErecipe3.11isnotactualruntime). Generator/tests reuseexistingpipeline; initial11Pythonpreflighttests passedaccordingtoW3. First2ENMP3s exist: intro62.875s, BạchMãchapter96.325s, fromv2revision. **Full56decode/manifest/hash/old100preservation remainspending.** Do notadvertiseoriginalGoogleDoc5–7minuteestimateasmeasuredfinalduration.

## QA and environment limits

- W4 OpenCodecannotproviderequiredMuseSpark1.3Free: currentproviderlistlacksit; configuredsessionwasDeepSeekV4.1FlashFree. Noquotaexhaustionwasobserved, soAGENTSautomaticquota-fallbackauthoritydoesnotapply. Workerperformedzeroreview/edits, reportedfailed andwasreleased; noMuseQAclaimed.
- W1continuescoordinatorreview andindependentchecks; thisdoesnotbecomeanindependentMuseaudit.
- No native rerun inthisscope. Previousemulatorlaunchwasrejected`blocked by policy`; noattemptthroughanotherworker/tool. Phone/iPhone/FPS/humanlisten remainpendingunlessnewactualevidenceisrecorded.
- Metro8081 notrunningatinitial19/10check. WiFiIPv4192.168.100.36retained; demo mustberestartedfromacceptedcandidateafterintegration, notWIP. ExistingExpo.devpreviewisolderandnotupdatedbythiswork.

## Việc cần người dùng quyết / tự làm

- Cầnquyết: khôngcóquyếtđịnhchặntriểnkhaiđãgiao. KhôngtựđổimodelW4hoặctuyênbốnghiệmthuofficial.
- Cầntựlàm: ràsoátlờikể/nghegiọngbằngngườithật và xácnhậnquyềnảnh trước khidùngdemochínhthức/chiasẻrộng. Chưađượccoilàđãlàm; privateimplementationvẫntiếptục.
