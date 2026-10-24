---
name: mobile-ux-qa
description: Audit or regression-test Ngõ Kể’s native mobile journeys, interaction states, and accessibility affordances for demo readiness. Use for UX review, device test planning, or a reported mobile interaction problem; do not use to introduce unapproved UX features.
---

# Mobile UX QA

Use `docs/TEST_REPORT.md`, `agent_docs/testing.md`, and `mobile/README.md` as the evidence baseline. Preserve the current design language unless a change is explicitly approved.

## Audit workflow

1. State whether the work is audit-only, a test plan, or an approved bug fix. An audit reports evidence and recommendations; it does not change UI.
2. Walk the relevant path with state transitions, including first entry, loading/empty/error, denial/fallback, Back, and return to the prior screen. For the core demo, use the documented introduction → question → topic → recommendation → confirm → narration → follow-up flow.
3. Inspect native concerns that matter to the reported path: safe area, scroll/clipping at configured font scale, touchability, keyboard overlap, labels, camera exit, and mode/alley reset. Do not invent numeric accessibility thresholds.
4. Classify findings as defect, verified limitation, untested device scenario, or optional enhancement. Keep simulator/browser evidence separate from real Android/iPhone evidence.

## Known boundaries

- Do not claim real offline first launch, QR scan, GPS candidate, soft keyboard, screen-reader, or iOS behavior without its recorded device evidence.
- Camera/QR/GPS failures must leave a usable manual/text fallback. Live mode never masks an error by displaying Demo content.
- For approved UI fixes, rerun focused tests plus the applicable `mobile` test, typecheck, and lint commands; report residual device coverage honestly.
