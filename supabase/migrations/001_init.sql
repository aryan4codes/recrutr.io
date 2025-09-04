-- Extensions
create extension if not exists vector;

-- Jobs
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  jd_text text not null,
  jd_embedding vector(3072),
  location text,
  level text,
  created_by uuid,
  created_at timestamptz default now()
);

create table if not exists job_competencies (
  job_id uuid references jobs(id) on delete cascade,
  competency text not null,
  weight real default 1.0
);

-- Candidates
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  resume_text text,
  resume_embedding vector(3072),
  created_at timestamptz default now()
);

create table if not exists candidate_docs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  file_path text not null,
  mime text,
  size bigint,
  uploaded_at timestamptz default now()
);

create table if not exists candidate_skills (
  candidate_id uuid references candidates(id) on delete cascade,
  skill text,
  source text
);

-- Applications
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  candidate_id uuid references candidates(id) on delete cascade,
  stage text default 'applied',
  score real,
  explanation_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Explanations
create table if not exists application_explanations (
  application_id uuid references applications(id) on delete cascade,
  competency text,
  evidence_json jsonb
);

-- Interviewers & Interviews
create table if not exists interviewers (
  id uuid primary key default gen_random_uuid(),
  name text, email text, team text, seniority text,
  competencies text[]
);

create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  panel_json jsonb,
  start timestamptz, end timestamptz,
  status text,
  calendar_event_id text
);

create table if not exists interview_kits (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  kit_json jsonb
);

create table if not exists interview_feedback (
  interview_id uuid references interviews(id) on delete cascade,
  interviewer_id uuid references interviewers(id) on delete cascade,
  ratings_json jsonb,
  notes text
);

-- Ops & Audit
create table if not exists pipeline_metrics (
  job_id uuid references jobs(id) on delete cascade,
  stage text,
  count integer,
  avg_age_days real,
  snapshot_date date
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  at timestamptz default now(),
  actor text,
  action text,
  entity text,
  entity_id uuid,
  payload_json jsonb
);

create table if not exists prompt_logs (
  id uuid primary key default gen_random_uuid(),
  at timestamptz default now(),
  model text,
  prompt_hash text,
  masked boolean,
  tokens_in integer,
  tokens_out integer,
  tool_calls_json jsonb
);

create table if not exists nudge_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  to_email text,
  message text,
  sent_at timestamptz default now()
);

-- Vector Indexes (cosine)
create index if not exists idx_jobs_embed on jobs using ivfflat (jd_embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_candidates_embed on candidates using ivfflat (resume_embedding vector_cosine_ops) with (lists = 100);

-- RPC: search candidates for a job (cosine distance)
create or replace function search_candidates(job uuid, k int default 30)
returns table(candidate_id uuid, name text, email text, dist float4)
language sql stable as $$
  select c.id, c.name, c.email,
    (1 - (c.resume_embedding <=> j.jd_embedding)) as score -- similarity
  from candidates c
  join jobs j on j.id = job
  where j.jd_embedding is not null and c.resume_embedding is not null
  order by c.resume_embedding <=> j.jd_embedding
  limit k;
$$;
