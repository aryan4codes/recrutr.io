-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  candidate_id uuid,
  stage text DEFAULT 'applied'::text,
  score real CHECK (score IS NULL OR score >= 0::double precision AND score <= 1::double precision),
  explanation_json jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id),
  CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.candidate_certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  certification_name text NOT NULL,
  issuing_organization text,
  issue_date date,
  expiry_date date,
  credential_id text,
  credential_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT candidate_certifications_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_certifications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id)
);
CREATE TABLE public.candidate_education (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  institution text NOT NULL,
  degree text NOT NULL,
  field text,
  year text,
  graduation_date date,
  gpa text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT candidate_education_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_education_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id)
);
CREATE TABLE public.candidate_experience (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  duration text,
  description text,
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT candidate_experience_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_experience_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id)
);
CREATE TABLE public.candidate_languages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  language text NOT NULL,
  proficiency text CHECK (proficiency IS NULL OR (proficiency = ANY (ARRAY['native'::text, 'fluent'::text, 'conversational'::text, 'basic'::text]))),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT candidate_languages_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_languages_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id)
);
CREATE TABLE public.candidate_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  technologies ARRAY,
  project_url text,
  github_url text,
  start_date date,
  end_date date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT candidate_projects_pkey PRIMARY KEY (id),
  CONSTRAINT candidate_projects_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id)
);
CREATE TABLE public.candidate_skills (
  candidate_id uuid,
  skill text,
  source text,
  CONSTRAINT candidate_skills_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id)
);
CREATE TABLE public.candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  email text,
  phone text,
  resume_text text,
  resume_embedding USER-DEFINED,
  created_at timestamp with time zone DEFAULT now(),
  resume_embedding_h USER-DEFINED DEFAULT (resume_embedding)::halfvec(3072),
  location text,
  linkedin text,
  portfolio text,
  summary text,
  years_of_experience integer,
  current_company text,
  current_position text,
  preferred_location text,
  salary_expectation text,
  availability text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT candidates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.job_competencies (
  job_id uuid,
  competency text NOT NULL,
  weight real DEFAULT 1.0,
  CONSTRAINT job_competencies_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  jd_text text NOT NULL,
  jd_embedding USER-DEFINED,
  location text,
  level text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  jd_embedding_h USER-DEFINED DEFAULT (jd_embedding)::halfvec(3072),
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'closed'::text, 'draft'::text])),
  department text,
  employment_type text DEFAULT 'full-time'::text CHECK (employment_type = ANY (ARRAY['full-time'::text, 'part-time'::text, 'contract'::text, 'internship'::text, 'freelance'::text])),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (id)
);

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