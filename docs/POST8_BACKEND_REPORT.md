# Post-8 backend V2 implementation

## Delivered

- Added additive SQLite migration `002_publication_v2.sql`; migration 001 tables remain in place. `setup` and `migrate` back up populated databases before migration, and server startup still refuses to migrate.
- Added `import-localized --vi <file> --en <file> [--replace]`. It checks raw UTF-8 file size and the shared V2 parser/pair identity before writing, stores canonical JSON plus SHA-256, and inserts or replaces both locale rows in one transaction. Identical canonical pairs are no-ops; changed pairs require `--replace` and a timestamped SQLite backup.
- Added read-only `GET /api/v2/dataset?locale=vi|en` and `/api/v2/ready?locale=vi|en`. Both successful responses set matching `Content-Language`; ready returns `status`, `database`, dataset kind, `locale`, `collectionId`, and `schemaVersion: 2`. Invalid or incomplete pair/schema/hash states return `DATASET_INVALID`; database access failures return `DATABASE_UNAVAILABLE`; unpublished or hidden data returns `NO_REVIEWED_DATA`.
- Kept V1 endpoints and simulated-data visibility behavior; backend tests compare the V1 fixture and HTTP response before and after V2 publication. Added the CLI example and policy notes to `backend/README.md`.
- Kept localized import independent of V1 seeding: it validates both input files before mutating either V1 or V2 rows.

## Verification

- Runtime: Node `v24.14.1`, using built-in `node:sqlite` and `node:crypto`; no dependency installation.
- Command: `npm --prefix backend test` — **32 passed, 0 failed**. `git diff --check` passed.
- Tests cover the actual W1 `old-quarter-pilot` VI/EN pair (3 nodes and 9 QAs), locale-specific HTTP responses, simulated visibility, query/method validation, exact 512 KiB canonical UTF-8 boundary and over-limit rejection, pair mismatch, missing/partial rows, malformed JSON, corrupt schema and hashes, import and migration rollback, future-schema refusal, startup non-migration, and SQLite backup restore with V1 fixture equality plus both V2 hashes.
- Follow-up checks: `node --test mobile/tests/voiceSessionLifecycle.test.mjs mobile/tests/post8VoiceCatalogue.test.mjs` — **8 passed**; `npm --prefix mobile run typecheck` and `npm --prefix mobile run lint` passed. The hook test accepts a known Live English pilot story only at its collection, locale, revision, node, kind, and text hash, and rejects changed text.
- Canonical pair metadata from the tested pilot files: VI 15,738 bytes, SHA-256 `358209bc5bf8f14e47a3598b93644d168219d919dcb66d9eb1f7cbb7dbd2c94a`; EN 14,182 bytes, SHA-256 `d75fcc183863f7ea2ec3b24bba1c4664b762c6332f0eb768a3493d9e74089b83`.
- All database writes used temporary test databases. HTTP tests used ephemeral loopback ports; no main/user database or existing voice/Metro service was used.

## Remaining

The backend work does not complete W2 application integration, W4 review, or native/device QA. Live playback verification exercised the real hook/catalogue lookup with a test audio source; it does not verify native audio playback. This report does not claim that content, pronunciation, audio, or devices received human approval.
