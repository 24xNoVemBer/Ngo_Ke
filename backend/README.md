# Ngõ Kể backend

Node 24 with built-in node:http and node:sqlite; no runtime dependencies. The read-only API exposes only GET /api/health, /api/ready, and /api/dataset.

From the repository root:

    npm ci --prefix backend
    npm --prefix backend run setup
    npm --prefix backend test
    npm --prefix backend start

The server binds to 127.0.0.1 by default. Set HOST=0.0.0.0 explicitly to allow LAN access. Startup never migrates or seeds the database.

The setup command imports data/demo.json as simulated data. It stays hidden from Live mode unless SERVE_SIMULATED_DATA=true; then the response still says kind: simulated. Reviewed V1 imports require --reviewed, complete approved metadata, and non-empty evidence. Replacing existing V1 content requires --replace; the CLI creates a SQLite backup before the transaction. `npm run migrate` also backs up a populated pre-migration database. Startup never migrates or imports data.

    npm --prefix backend run import -- /absolute/path/dataset.json --reviewed --replace

Post-8 schema 2 data is published as one validated VI/EN pair. Each input must be at most 512 KiB UTF-8; both use the same collection and logical node/QA structure. The first pair can be imported with:

    npm --prefix backend run import-localized -- --vi /absolute/path/old-quarter.vi.json --en /absolute/path/old-quarter.en.json

Repeating the same canonical pair is a no-op. Changing an existing pair requires `--replace`; the CLI creates a timestamped SQLite backup before the atomic replacement. The read-only API serves a selected locale at `/api/v2/dataset?locale=vi|en` and reports locale readiness at `/api/v2/ready?locale=vi|en`; simulated data remains hidden unless `SERVE_SIMULATED_DATA=true`.

The importer's review acknowledgement records an operator decision; it does not prove historical claims. No API key, chat, LLM, voice, or write endpoint is included.
