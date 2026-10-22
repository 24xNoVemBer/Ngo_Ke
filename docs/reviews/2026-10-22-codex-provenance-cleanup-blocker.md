# Provenance UI cleanup — incomplete checkpoint

The user requested removing simulated-content and source/provenance text across the native UI in Vietnamese and English. Antigravity owns frontend implementation; Codex coordinates. Dataset metadata, evidence and validation must remain unchanged.

Antigravity dispatch `ctx_a6c1d2ecaa07` on task `task_9cca57200656` stopped after a real provider quota error, before tests/report and worker_done. Terminal error: Individual quota reached, reset in 167h23m55s, ID `e4ad104a-b969-48e2-9a56-b86838f18b2f-223`. The final error was observed before coordinator worker-stop closed the exact worker terminal. All partial edits remain in the worktree.

Coordinator checks after the stop:

- `npm test` in mobile: 328 tests, 324 pass, 4 fail, zero skipped.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 1, one unused-variable error in NotebookDrawerModal.tsx.
- `git diff --check`: exit 0.

Failing tests concern Notebook live empty feedback, Notebook LIVE mode badge, AlleySelect gpsLocationName, and Home simulated-duration text. Inspect actual behavior before updating expectations: mode controls and GPS location feedback must remain functional. The requested Live + reviewed regression test has not yet been delivered.

No independent Claude rereview has run against this partial state. The previous 328/328 result applies to the earlier Landing version. Claude remains explicitly retained for the requested rereview after implementation finishes. No commit, push, deployment, dependency change or rollback was performed. Native visual checks remain pending.

Continuing implementation with another FE owner or model needs a new user instruction: current project ownership reserves FE for Antigravity and automatic quota fallback authorization only covers OpenCode. No substitute worker was launched.
