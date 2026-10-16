"""Compare explicit English and Vietnamese ASR on a local synthetic sample."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from pathlib import Path

CODEWORD_SPELLING = re.compile(
    r"\bletter\s+(?:[0-9A-F]{2,4}\b|1(?:\s+[0-9A-F]\b){1,7}|1\s+[0-9A-Z]{2,5}\b)",
    re.IGNORECASE,
)


def unicode_codeword_spellings(text: str) -> list[str]:
    return [match.group(0) for match in CODEWORD_SPELLING.finditer(text)]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def transcribe_pair(audio_path: Path, model_path: Path, locales: tuple[str, ...]) -> dict[str, object]:
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"
    from faster_whisper import WhisperModel

    model = WhisperModel(str(model_path), device="cpu", compute_type="int8")
    results = []
    for locale in locales:
        segments, info = model.transcribe(
            str(audio_path), language=locale, beam_size=5, vad_filter=True
        )
        text = " ".join(segment.text.strip() for segment in segments).strip()
        results.append({
            "requestedLanguage": locale,
            "reportedLanguage": info.language,
            "languageProbability": round(float(info.language_probability), 4),
            "transcript": text,
            "unicodeCodewordSpellings": unicode_codeword_spellings(text) if locale == "en" else [],
        })
    return {
        "engine": "faster-whisper",
        "modelPath": str(model_path),
        "audioPath": str(audio_path),
        "audioSha256": sha256_file(audio_path),
        "results": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audio", type=Path, required=True)
    parser.add_argument("--model-path", type=Path, required=True)
    parser.add_argument("--language", choices=("en", "vi"), action="append")
    args = parser.parse_args()
    if not args.audio.is_file() or not args.model_path.is_dir():
        raise SystemExit("--audio must be a local file and --model-path a local model directory")
    locales = tuple(args.language or ("en", "vi"))
    report = transcribe_pair(args.audio.resolve(), args.model_path.resolve(), locales)
    report_path = args.audio.resolve().parent / f"asr-results-{args.audio.stem}.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    summaries = ", ".join(
        f"{row['requestedLanguage']}->{row['reportedLanguage']} words={len(str(row['transcript']).split())}"
        for row in report["results"]
    )
    print(f"ASR results saved to {report_path}; {summaries}")
    english = next((row for row in report["results"] if row["requestedLanguage"] == "en"), None)
    if english and english["unicodeCodewordSpellings"]:
        raise SystemExit("English ASR detected Unicode codeword spellings: " + "; ".join(english["unicodeCodewordSpellings"]))


if __name__ == "__main__":
    main()
