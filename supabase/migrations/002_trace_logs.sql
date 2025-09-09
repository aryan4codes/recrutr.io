-- Migration: Add trace_logs table for audit trail
-- Tracks all AI agent actions, tool calls, and outputs for transparency

CREATE TABLE public.trace_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  agent_name text NOT NULL,
  prompt text,
  tool_calls jsonb,
  output jsonb,
  sql_executed text,
  parameters jsonb,
  execution_time_ms integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trace_logs_pkey PRIMARY KEY (id),
  CONSTRAINT trace_logs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);

-- Add index for efficient queries by job_id and created_at
CREATE INDEX idx_trace_logs_job_id ON public.trace_logs(job_id);
CREATE INDEX idx_trace_logs_created_at ON public.trace_logs(created_at);

-- Add job_candidate_matches table for tracking candidate scoring
CREATE TABLE public.job_candidate_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  similarity_score real CHECK (similarity_score >= 0 AND similarity_score <= 1),
  rule_score real CHECK (rule_score >= 0 AND rule_score <= 1),
  final_score real CHECK (final_score >= 0 AND final_score <= 1),
  ranking_explanation jsonb,
  screening_summary text,
  top_skills jsonb,
  confidence integer CHECK (confidence >= 0 AND confidence <= 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT job_candidate_matches_pkey PRIMARY KEY (id),
  CONSTRAINT job_candidate_matches_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT job_candidate_matches_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id),
  CONSTRAINT job_candidate_matches_unique UNIQUE (job_id, candidate_id)
);

-- Add indexes for efficient querying
CREATE INDEX idx_job_candidate_matches_job_id ON public.job_candidate_matches(job_id);
CREATE INDEX idx_job_candidate_matches_final_score ON public.job_candidate_matches(final_score DESC);

-- Add vector search function for candidates
CREATE OR REPLACE FUNCTION search_candidates(
  query_embedding vector(3072),
  match_limit int DEFAULT 10,
  similarity_threshold float DEFAULT 0.1
)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  resume_text text,
  location text,
  years_of_experience integer,
  current_company text,
  current_position text,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    c.id,
    c.name,
    c.email,
    c.resume_text,
    c.location,
    c.years_of_experience,
    c.current_company,
    c.current_position,
    1 - (c.resume_embedding_h <=> query_embedding) AS similarity
  FROM candidates c
  WHERE 1 - (c.resume_embedding_h <=> query_embedding) > similarity_threshold
  ORDER BY c.resume_embedding_h <=> query_embedding
  LIMIT match_limit;
$$;