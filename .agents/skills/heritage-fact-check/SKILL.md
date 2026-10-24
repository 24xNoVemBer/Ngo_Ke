---
name: heritage-fact-check
description: Review or prepare historical, cultural, and heritage claims for Ngõ Kể content, Q&A, or narration when source provenance and claim status must be checked. Do not use for fictional demo copy that is already explicitly labelled simulated.
---

# Heritage fact check

Use this skill before proposing or editing factual content for an alley. The product may contain fictional Demo content and sourced previews; never merge their status.

## Evidence review

1. Read the relevant alley file under `content/alleys/`, then its Q&A/source records. For the legacy fictional experience, read `data/README.md` instead.
2. Classify each statement as one of: directly supported fact, clearly attributed oral account/legend, editorial interpretation, field observation, or unsupported. Do not convert one class into another.
3. Trace each factual Q&A answer to its `sourceIds`; report absent, unknown, contradictory, or overly broad source links. Preserve the exact approved answer—this app does not generate free-form answers.
4. For new content, prepare a review list containing claim, source ID/URL, source date or access date when available, status, and unresolved conflict. Do not invent a source, citation, historic event, or location.

## Boundaries

- Read `docs/DATA_COLLECTION_GUIDE.md` for the project’s evidence and review rules. Read `docs/CONTENT_MANAGEMENT.md` before a content mutation.
- `contentStatus`, `classification`, `visibility`, and `fieldVerification` describe different states. Do not mark `draft`, `sourced_preview`, or field-unverified material as verified or published without explicit approval.
- An audit is read-only. Request explicit authorization before editing content, and run the content validation workflow afterward.
