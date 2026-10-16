CREATE TABLE publication_v2 (
  locale TEXT PRIMARY KEY CHECK (locale IN ('vi', 'en')),
  collection_id TEXT NOT NULL CHECK (length(collection_id) BETWEEN 1 AND 128),
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  payload_sha256 TEXT NOT NULL CHECK (length(payload_sha256) = 64),
  imported_at TEXT NOT NULL
) STRICT;
