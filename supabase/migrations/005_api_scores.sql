-- 005_api_scores.sql
-- API Agent-Readiness Score — 9-axes scoring results

CREATE TABLE IF NOT EXISTS api_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scan_submissions(id) ON DELETE SET NULL,
  domain TEXT NOT NULL,

  total_score INTEGER NOT NULL,
  max_possible_score INTEGER NOT NULL DEFAULT 100,
  band TEXT NOT NULL CHECK (band IN ('not_ready', 'partial', 'dev_ready', 'strong', 'agent_ready')),
  has_spec BOOLEAN NOT NULL DEFAULT false,
  spec_format TEXT CHECK (spec_format IN ('openapi3', 'swagger', NULL)),

  -- Full per-axis breakdown
  axis_scores JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Aggregated insights
  top_blockers TEXT[] DEFAULT '{}',
  fastest_fixes TEXT[] DEFAULT '{}',

  -- Quick-access aggregate fields
  endpoint_count INTEGER,
  operation_id_coverage REAL,  -- 0.0–1.0
  schema_coverage REAL,        -- 0.0–1.0

  scored_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_scores_domain ON api_scores (domain, scored_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_scores_scan ON api_scores (scan_id);
CREATE INDEX IF NOT EXISTS idx_api_scores_band ON api_scores (band);

-- RLS: readable by anyone, writable only by service role
ALTER TABLE api_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_scores_select" ON api_scores
  FOR SELECT USING (true);

CREATE POLICY "api_scores_insert" ON api_scores
  FOR INSERT WITH CHECK (true);
