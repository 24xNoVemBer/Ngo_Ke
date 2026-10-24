---
name: field-data-validation
description: Validate proposed Ngõ Kể field-survey data—coordinates, QR payloads, photos, permissions, provenance, and survey evidence—before it can change a content pack’s physical-data status. Use for GPS/QR/photo survey intake and field-readiness review.
---

# Field data validation

This skill protects the boundary between simulated fixtures, sourced previews, and field-verified content. Read `docs/DATA_COLLECTION_GUIDE.md`, `docs/CONTENT_MANAGEMENT.md`, and the target `content/alleys/<id>/alley.json`.

## Intake checklist

1. For every chapter, collect the location, reported accuracy, survey date/time, and enough evidence to identify the physical point. A map pin or user-supplied alley reference is not chapter-level field verification.
2. For every QR, confirm the exact approved payload: `ngo-ke://v1/alley/<alley-id>/node/<node-id>`. Unknown or malformed QR values must not become links or change a selected chapter.
3. For every photo, record local asset path, creator/attribution, licence or permission, date/source, and whether people or restricted property require additional consent. Do not treat illustrative images as geolocation proof.
4. Reconcile all chapter evidence before proposing a status change. Partial evidence keeps the pack field-unverified and physical QR/GPS disabled.

## Validation and handoff

- Produce a per-chapter table of evidence received, gaps, and proposed status; label all unresolved items clearly.
- Only after explicit approval may a content update set verified coordinates/payloads. Then run `node tools/content.mjs validate` and `node tools/content.mjs check`.
- Device tests must record actual platform/device/OS, permission outcome, GPS accuracy and QR result without exposing raw location or private images unnecessarily. Emulator mocks do not prove field behavior.
- Do not fabricate survey data, derive coordinates from an online map, or claim user research/field verification that has not occurred.
