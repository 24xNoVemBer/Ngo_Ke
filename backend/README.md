# Ngõ Kể backend

Node 24 with built-in node:http and node:sqlite; no runtime dependencies. The read-only API exposes only GET /api/health, /api/ready, and /api/dataset.

From the repository root:

    npm ci --prefix backend
    npm --prefix backend run setup
    npm --prefix backend test
    npm --prefix backend start

The server binds to 127.0.0.1 by default. Set HOST=0.0.0.0 explicitly to allow LAN access. Startup never migrates or seeds the database.

The setup command imports data/demo.json as simulated data. It stays hidden from Live mode unless SERVE_SIMULATED_DATA=true; then the response still says kind: simulated. Reviewed imports require --reviewed, complete approved metadata, and non-empty evidence. Replacing existing content requires --replace; the CLI creates a SQLite backup before the transaction.

    npm --prefix backend run import -- /absolute/path/dataset.json --reviewed --replace

The importer's review acknowledgement records an operator decision; it does not prove historical claims. No API key, chat, LLM, voice, or write endpoint is included.
