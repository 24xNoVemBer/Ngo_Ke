# EN pronunciation review — Kokoro/Misaki Vietnamese diacritics (W4, readonly)

Task `task_e780affc6457`. W3 probe evidence (kept, not re-run):
`backend-luna/tools/voice/.cache/post8-probe/asr-results.json` — EN transcript
of the Bạch Mã sample reads codewords aloud: “Haen Letter 1 ED9” (= Hà Nội),
“B Letter 1 E A 1 C H Ma” (= Bạch Mã), “Letter 1 ED7” (= Đỗ/Đồng-class),
“Ma Mei” (= Mã Mây), “Bun … Letter 1 E A 3” (= bún chả), “Bon Tom” (= bánh tôm).
ASR evidence only — explicitly not human pronunciation QC.

## Cause (reproduced against W3's installed runtime, read-only)

- Runtime: `backend-luna/tools/voice/.venv/Scripts/python.exe` (3.12.13),
  packages `misaki-0.9.4` + `kokoro-0.9.4` (W3 tree; main-tree 3.11 venv left
  untouched). Ran with `-B`, `PYTHONDONTWRITEBYTECODE=1`, `PYTHONUTF8=1`,
  stdout to Temp only; no downloads, no writes to W3 tree.
- Code path: `misaki/en.py:495 G2P.__init__ (trf=False)` →
  `en.py:653 __call__` → espeak-ng fallback (`misaki/espeak.py:13
  EspeakFallback`, “used as a last resort for English”).
- Observed outputs (`G2P(trf=False)` phoneme strings):
  `Hà Nội` → `❓ ❓`; `Bạch Mã` → `❓ ❓`; `Đồng Xuân` → `❓ ❓`;
  `bún ốc` / `bún chả` / `bánh tôm` → `❓ ❓`; `Mã Mây` → `❓ ❓`;
  control `Hello world` → perfect phones; `Long Đỗ` → `Long` correct + `❓`.
- Mechanism: every Vietnamese-diacritic token falls to UNK; Kokoro then
  verbalizes the unknown as Unicode codepoint names (“Letter 1ED9”…). Where
  folding accidentally succeeds it still mispronounces (`Ma Mei`, `Bon Tom`).
- Separate hygiene note: W3's `syntheticCheck` input text in `results.json` is
  already mojibake — fix probe-input encoding independently; it is not the
  phoneme cause.

## Recommendation (W3 implements, Root decides mapping)

- Minimal explicit pronunciation lexicon for known proper names/foods, applied
  ONLY at the TTS frontend (e.g. Hà Nội, Bạch Mã, Long Đỗ, Đồng Xuân, Mã Mây,
  bún chả/ốc, bánh tôm, nộm, chè…): each entry needs knowledgeable approval of
  the respelling — never global diacritic stripping to claim QC (folding is
  what produced “Ma Mei”/“Bon Tom”).
- Preserve display/source text and its textHash byte-for-byte (glossary:
  diacritics stay in UI); record `spokenText` + its hash separately per track
  so display, matcher and audio-input provenance never mix.
- No bulk/production audio until the mapping is reviewed; same 2 presets only.
