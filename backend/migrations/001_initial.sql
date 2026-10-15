CREATE TABLE nodes (
  id TEXT PRIMARY KEY CHECK (length(trim(id)) > 0),
  position INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  summary TEXT NOT NULL CHECK (length(trim(summary)) > 0),
  tags TEXT NOT NULL CHECK (json_valid(tags)),
  visit_minutes INTEGER NOT NULL CHECK (visit_minutes > 0),
  available INTEGER NOT NULL CHECK (available IN (0, 1)),
  visited INTEGER NOT NULL CHECK (visited IN (0, 1)),
  story TEXT NOT NULL CHECK (length(trim(story)) > 0),
  caption TEXT NOT NULL CHECK (length(trim(caption)) > 0),
  latitude REAL NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude REAL NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  review_status TEXT CHECK (review_status IS NULL OR review_status = 'approved'),
  updated_at TEXT,
  CHECK ((review_status IS NULL) = (updated_at IS NULL))
) STRICT;

CREATE TABLE qa (
  id TEXT PRIMARY KEY CHECK (length(trim(id)) > 0),
  position INTEGER NOT NULL UNIQUE,
  node_id TEXT NOT NULL REFERENCES nodes(id),
  question TEXT NOT NULL CHECK (length(trim(question)) > 0),
  answer TEXT NOT NULL CHECK (length(trim(answer)) > 0),
  aliases TEXT NOT NULL CHECK (json_valid(aliases)),
  evidence TEXT NOT NULL CHECK (json_valid(evidence) AND json_array_length(evidence) > 0),
  follow_ups TEXT NOT NULL CHECK (json_valid(follow_ups)),
  tags TEXT NOT NULL CHECK (json_valid(tags)),
  review_status TEXT CHECK (review_status IS NULL OR review_status = 'approved'),
  updated_at TEXT,
  CHECK ((review_status IS NULL) = (updated_at IS NULL))
) STRICT;

CREATE TABLE dataset (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  schema_version INTEGER NOT NULL CHECK (schema_version = 1),
  kind TEXT NOT NULL CHECK (kind IN ('simulated', 'reviewed')),
  disclaimer TEXT NOT NULL CHECK (length(trim(disclaimer)) > 0),
  intro_text TEXT NOT NULL CHECK (length(trim(intro_text)) > 0),
  intro_evidence TEXT NOT NULL CHECK (json_valid(intro_evidence) AND json_array_length(intro_evidence) > 0),
  intro_review_status TEXT CHECK (intro_review_status IS NULL OR intro_review_status = 'approved'),
  intro_updated_at TEXT,
  start_node_id TEXT NOT NULL REFERENCES nodes(id),
  imported_at TEXT NOT NULL,
  CHECK ((intro_review_status IS NULL) = (intro_updated_at IS NULL))
) STRICT;

CREATE INDEX qa_node_id ON qa(node_id);
