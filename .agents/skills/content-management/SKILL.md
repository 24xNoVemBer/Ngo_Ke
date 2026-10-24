---
name: content-management
description: Safely add, revise, reorder, archive, or validate Ngõ Kể alley content packs and their catalog, chapters, Q&A, sources, and media references. Use for repository content operations, not for mobile UI-only changes.
---

# Ngõ Kể content management

The editable content catalog is `content/alleys/catalog.json`; each managed pack is an `alley.json` below `content/alleys/`. The legacy `data/demo.json` is a separate, explicitly simulated fixture.

## Choose the mode

- **Audit/plan:** inspect `docs/CONTENT_MANAGEMENT.md`, the catalog, and the target pack; do not write.
- **Implementation:** require explicit content-change approval. Use `node tools/content.mjs` rather than hand-editing catalog lifecycle fields when its supported command fits.
- **Validation:** run `node tools/content.mjs validate`, then `node tools/content.mjs check`; run `node tools/content.mjs generate` only when the static Metro registry must be refreshed.

## Rules that protect the registry

1. Preserve unique alley, chapter, and Q&A IDs; preserve chapter order and keep follow-ups inside the same chapter.
2. Add only approved local media with attribution and licence. Do not borrow Demo media or audio for another alley.
3. Keep `fieldVerification: required` with null chapter coordinates and QR payloads. Only fully verified chapters may carry their exact versioned payload `ngo-ke://v1/alley/<alley-id>/node/<node-id>`.
4. Use `chapter ... remove --delete` only when the tool’s reference guard permits it. It never authorizes automatic media/source deletion.
5. Review the generated `mobile/src/data/generatedContentRegistry.ts`; it is generated output, not a hand-maintained content source.

Do not use content operations to alter app logic, publish an alley, or turn sourced-preview material into verified material without the required approval.
