# W4 content review — fiction EN + pilot VI/EN (Post8-T2 gate)

Task `task_2ad0e9c43760`. Baseline `91ddfbd`; reviewed SHAs `cde7d22` (spec +
fiction EN), `bb7abaf` + `939d8b1` (pilot copy + glossary). Source ledger:
W1 `POST8_SOURCE_LEDGER.md`; W4 source report `b1f4fbd` (retained, re-verified
below where the copy makes new use of sources). Method: file diff/read +
programmatic parity checks + targeted Jina/web reads (no installs/logins).
No product code/data/audio edits. W1 fixes copy, then materializes JSON.

## 1. fiction.en.json (cde7d22) vs data/demo.json — supported, publishable as draft

- Parity exact: 6/6 nodes, 21/21 QA, IDs/order/meta (visitMinutes/available/
  visited)/geometry/tags identical; followUps all resolve, none dangling.
- Limits: story/answer ≤2000, caption ≤220 (maxima checked); aliases 3 each
  (within 1..7); tags identical set both locales (`gioi thieu,an thuc,huong dan,
  chuyen xua,kham pha tu do`); intro evidence present; schemaVersion 2 +
  locale/collectionId per spec §2.
- No new history: no year/place/person anchors outside the fiction in any EN
  story/caption/answer (checked); disclaimer labels original fiction, not history.
- Proper nouns/glossary: An/Lâm/Hương/Nhi keep diacritics; `Mr Lâm` per glossary;
  food glosses match (`bún ốc; rice noodle dish with snails`, `bougainvillea`,
  `sweet black bean chè`, never tea). Spelling consistently British
  (recognise/favourite, no US mixing) — fine, just keep it consistent in TTS text.
- EN reads naturally (checked full file); no word-for-word stiffness found.
- Verdict: **supported**. Bạch Mã node (`oldquarter-bach-ma` path aside) — first
  vertical point review: BM story/caption/Q1–3 complete, legend explicit, geometry
  null/null, all claims trace to BM1/BM2. **Complete + publishable after review.**

## 2. Pilot copy (bb7abaf + 939d8b1) — supported with one wording fix

- BM: address/guardian/legend-framing/observe all trace to BM1 + BM2 primary
  (BM2 read directly 2026-10-16 after Jina-422). No dates used — correctly avoids
  the 865/866/1010 conflicts. Geometry null/null correct (OSM has no Bạch Mã
  geometry after 2 queries — no mock). **Supported.**
- MM: form/life/1999 trace to MM1 + MM2; 2004 dates and hours excluded. Geometry
  way/323366879 verified durable (page live, v7, “Heritage House”, addr 87/Mã Mây).
  **One fix (W1):** story says sources place the house “trong thế kỷ mười chín”,
  but MM2's range runs into the early 20th c. (“cuối TK19, đầu TK20”). Recommend
  “khoảng cuối thế kỷ 19, đầu thế kỷ 20” + keep the early/late disagreement
  explicit, in VI/EN story and mm-restore answer. Not a reject.
- DX: position/trade trace to DX1; food list 2024-dated with non-independence
  noted; prices/hours/tenure/safety/allergy excluded; Q3 refusal correct.
  Geometry marketplace way/1212230635 (Nominatim-verified; retail way correctly
  not mixed in). **Supported.** `939d8b1` removal of the dating-disagreement
  sentence reviewed — safe, consistent with the DX-timeline reject.
- OSM attribution present in both disclaimers (© contributors + ODbL +
  copyright URL). New exclusion to record: way/323366879 carries a crowd
  `opening_hours=08:30-17:00` tag — must never be cited as current hours.
- VI/EN parity: same facts, same certainty, legend labels both sides, food
  dating both sides, geometry both sides. No empty QA (9/9 answered + sourced).
- Limits: stories ≤869 chars, captions ≤120, answers ≤303, disclaimers ≤436 —
  all inside §2 caps. 16 tracks/locale as specified.
- Verdict: **supported after the one MM wording fix**; remaining two points
  reviewable in the same pass, no fourth point needed.

## 3. Items explicitly not claimed (kept out — correct)

Superlatives (“cổ nhất”), festival-day precision, 2004 recognition dates,
current stalls/hours/prices/ingredients, vendor names as recommendations,
allergy/diet safety, walking ETAs/navigation, Bạch Mã coordinates, reused
source photos (no license), fiction characters/places as history.

## 4. Pending (not W4 scope to close)

TTS/EN audio probes, STT EN, device/iPhone evidence, on-site geometry survey
for Bạch Mã, 2026 freshness re-check of food/operating claims before any
“đang mở” wording.
