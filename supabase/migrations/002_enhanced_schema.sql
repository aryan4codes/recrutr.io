-- Enhanced recrutr.io database schema
-- Enable extensions
create extension if not exists vector;
create extension if not exists pgcrypto;
create extension if not exists pg_trgm; -- For fuzzy text search

-- Organizations/Companies
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique,
  logo_url text,
  industry text,
  size_range text check (size_range in ('1-10', '11-50', '51-200', '201-1000', '1001+')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Users (HR, Recruiters, Hiring Managers)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text not null check (role in ('admin', 'hr', 'recruiter', 'hiring_manager')),
  organization_id uuid references organizations(id) on delete cascade,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enhanced Jobs table
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  jd_text text not null,
  jd_embedding vector(3072),
  location text,
  location_type text check (location_type in ('remote', 'hybrid', 'onsite')),
  level text check (level in ('intern', 'entry', 'mid', 'senior', 'staff', 'principal', 'director', 'vp', 'c-level')),
  department text,
  employment_type text check (employment_type in ('full-time', 'part-time', 'contract', 'internship')),
  salary_min integer,
  salary_max integer,
  currency text default 'USD',
  organization_id uuid references organizations(id) on delete cascade,
  created_by uuid references users(id),
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- halfvec generated column for indexing
  jd_embedding_h halfvec(3072) generated always as (jd_embedding::halfvec(3072)) stored
);

-- Job requirements (must-haves vs nice-to-haves)
create table if not exists job_requirements (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  requirement text not null,
  type text not null check (type in ('must_have', 'nice_to_have')),
  category text check (category in ('skill', 'experience', 'education', 'certification')),
  weight real default 1.0,
  created_at timestamptz default now()
);

-- Job responsibilities
create table if not exists job_responsibilities (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  responsibility text not null,
  priority integer default 1,
  created_at timestamptz default now()
);

-- Job competencies with weights
create table if not exists job_competencies (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  competency text not null,
  level_required text check (level_required in ('beginner', 'intermediate', 'advanced', 'expert')),
  weight real default 1.0,
  is_core boolean default false,
  created_at timestamptz default now()
);

-- Enhanced Candidates table
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  phone text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  location text,
  current_title text,
  current_company text,
  years_experience integer,
  expected_salary_min integer,
  expected_salary_max integer,
  availability text check (availability in ('immediate', '2weeks', '1month', '3months')),
  visa_status text,
  resume_text text,
  resume_url text,
  resume_embedding vector(3072),
  source text check (source in ('direct', 'referral', 'linkedin', 'job_board', 'recruiter')),
  tags text[], -- for custom tagging
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- halfvec generated column for indexing
  resume_embedding_h halfvec(3072) generated always as (resume_embedding::halfvec(3072)) stored
);

-- Candidate experience
create table if not exists candidate_experience (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  company text not null,
  title text not null,
  start_date date,
  end_date date,
  is_current boolean default false,
  description text,
  achievements text[],
  technologies text[],
  created_at timestamptz default now()
);

-- Candidate education
create table if not exists candidate_education (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  institution text not null,
  degree text,
  field_of_study text,
  grade text,
  start_date date,
  end_date date,
  is_current boolean default false,
  achievements text[],
  created_at timestamptz default now()
);

-- Candidate skills with proficiency
create table if not exists candidate_skills (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  skill text not null,
  proficiency text check (proficiency in ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience integer,
  is_verified boolean default false,
  source text check (source in ('resume', 'assessment', 'interview', 'manual')),
  created_at timestamptz default now(),
  unique(candidate_id, skill)
);

-- Candidate certifications
create table if not exists candidate_certifications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  name text not null,
  issuer text,
  issue_date date,
  expiry_date date,
  credential_id text,
  credential_url text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- Candidate projects
create table if not exists candidate_projects (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  name text not null,
  description text,
  technologies text[],
  start_date date,
  end_date date,
  project_url text,
  github_url text,
  achievements text[],
  created_at timestamptz default now()
);

-- Enhanced Applications table
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  candidate_id uuid references candidates(id) on delete cascade,
  stage text default 'applied' check (stage in ('applied', 'screening', 'phone_screen', 'technical', 'onsite', 'offer', 'hired', 'rejected', 'withdrawn')),
  score real check (score >= 0 and score <= 100),
  match_explanation jsonb,
  feedback jsonb,
  applied_by uuid references users(id), -- who added this candidate
  current_interviewer uuid references users(id),
  next_action text,
  next_action_date timestamptz,
  rejection_reason text,
  offer_details jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(job_id, candidate_id)
);

-- Interview rounds
create table if not exists interview_rounds (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  round_number integer not null,
  type text not null check (type in ('screening', 'technical', 'behavioral', 'system_design', 'cultural_fit', 'final')),
  scheduled_at timestamptz,
  duration_minutes integer default 60,
  interviewer_ids uuid[],
  meeting_link text,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  feedback jsonb,
  score real check (score >= 0 and score <= 10),
  recommendation text check (recommendation in ('strong_hire', 'hire', 'no_hire', 'strong_no_hire')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Application stage history (audit trail)
create table if not exists application_stage_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  changed_by uuid references users(id),
  reason text,
  notes text,
  created_at timestamptz default now()
);

-- Saved searches for recruiters
create table if not exists saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  search_params jsonb not null,
  is_alert boolean default false,
  alert_frequency text check (alert_frequency in ('daily', 'weekly', 'monthly')),
  last_run_at timestamptz,
  created_at timestamptz default now()
);

-- Tags for flexible categorization
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  color text default '#6366f1',
  category text check (category in ('job', 'candidate', 'skill', 'general')),
  organization_id uuid references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- Many-to-many: jobs <-> tags
create table if not exists job_tags (
  job_id uuid references jobs(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (job_id, tag_id)
);

-- Many-to-many: candidates <-> tags
create table if not exists candidate_tags (
  candidate_id uuid references candidates(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (candidate_id, tag_id)
);

-- Performance indexes
create index if not exists idx_jobs_organization on jobs(organization_id);
create index if not exists idx_jobs_created_by on jobs(created_by);
create index if not exists idx_jobs_active on jobs(is_active) where is_active = true;
create index if not exists idx_jobs_level on jobs(level);
create index if not exists idx_jobs_location_type on jobs(location_type);
create index if not exists idx_jobs_title_gin on jobs using gin(to_tsvector('english', title));

create index if not exists idx_candidates_email on candidates(email);
create index if not exists idx_candidates_active on candidates(is_active) where is_active = true;
create index if not exists idx_candidates_experience on candidates(years_experience);
create index if not exists idx_candidates_location on candidates(location);
create index if not exists idx_candidates_name_gin on candidates using gin(to_tsvector('english', name));

create index if not exists idx_applications_job on applications(job_id);
create index if not exists idx_applications_candidate on applications(candidate_id);
create index if not exists idx_applications_stage on applications(stage);
create index if not exists idx_applications_score on applications(score desc);

create index if not exists idx_candidate_skills_skill on candidate_skills(skill);
create index if not exists idx_candidate_skills_proficiency on candidate_skills(proficiency);

-- Vector indexes (use halfvec since >2000 dims)
create index if not exists idx_jobs_embed_hnsw
  on jobs using hnsw (jd_embedding_h halfvec_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists idx_candidates_embed_hnsw
  on candidates using hnsw (resume_embedding_h halfvec_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Text search indexes
create index if not exists idx_jobs_text_search on jobs using gin(to_tsvector('english', title || ' ' || coalesce(summary, '') || ' ' || jd_text));
create index if not exists idx_candidates_text_search on candidates using gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(resume_text, '')));

-- Fuzzy search indexes
create index if not exists idx_jobs_title_trgm on jobs using gin(title gin_trgm_ops);
create index if not exists idx_candidates_name_trgm on candidates using gin(name gin_trgm_ops);

-- Enhanced RPC: Advanced candidate search with multiple filters
create or replace function search_candidates_advanced(
  job_uuid uuid default null,
  skills_filter text[] default null,
  min_experience integer default null,
  max_experience integer default null,
  location_filter text default null,
  availability_filter text default null,
  k integer default 30
)
returns table(
  candidate_id uuid,
  name text,
  email text,
  location text,
  years_experience integer,
  current_title text,
  vector_score float4,
  skill_match_count integer,
  total_score float4
)
language sql stable as $$
  with candidate_scores as (
    select 
      c.id,
      c.name,
      c.email,
      c.location,
      c.years_experience,
      c.current_title,
      case 
        when job_uuid is not null and j.jd_embedding_h is not null and c.resume_embedding_h is not null
        then (1 - (c.resume_embedding_h <=> j.jd_embedding_h))::float4
        else 0.5::float4
      end as vector_score,
      case 
        when skills_filter is not null
        then (
          select count(*)::integer
          from candidate_skills cs
          where cs.candidate_id = c.id
          and cs.skill = any(skills_filter)
        )
        else 0
      end as skill_match_count
    from candidates c
    left join jobs j on j.id = job_uuid
    where c.is_active = true
    and (min_experience is null or c.years_experience >= min_experience)
    and (max_experience is null or c.years_experience <= max_experience)
    and (location_filter is null or c.location ilike '%' || location_filter || '%')
    and (availability_filter is null or c.availability = availability_filter)
  )
  select 
    cs.id,
    cs.name,
    cs.email,
    cs.location,
    cs.years_experience,
    cs.current_title,
    cs.vector_score,
    cs.skill_match_count,
    (
      cs.vector_score * 0.6 + 
      least(cs.skill_match_count::float / greatest(array_length(skills_filter, 1), 1), 1.0) * 0.4
    )::float4 as total_score
  from candidate_scores cs
  order by total_score desc
  limit k;
$$;

-- RPC: Get candidate skills summary
create or replace function get_candidate_skills_summary(candidate_uuid uuid)
returns table(
  skill text,
  proficiency text,
  years_experience integer,
  source text
)
language sql stable as $$
  select skill, proficiency, years_experience, source
  from candidate_skills
  where candidate_id = candidate_uuid
  order by 
    case proficiency
      when 'expert' then 4
      when 'advanced' then 3
      when 'intermediate' then 2
      when 'beginner' then 1
    end desc,
    years_experience desc nulls last;
$$;

-- RPC: Get job requirements summary
create or replace function get_job_requirements_summary(job_uuid uuid)
returns table(
  requirement text,
  type text,
  category text,
  weight real
)
language sql stable as $$
  select requirement, type, category, weight
  from job_requirements
  where job_id = job_uuid
  order by type, weight desc;
$$;

-- Updated triggers for updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_jobs_updated_at before update on jobs
  for each row execute procedure update_updated_at_column();

create trigger update_candidates_updated_at before update on candidates
  for each row execute procedure update_updated_at_column();

create trigger update_applications_updated_at before update on applications
  for each row execute procedure update_updated_at_column();

create trigger update_organizations_updated_at before update on organizations
  for each row execute procedure update_updated_at_column();

create trigger update_users_updated_at before update on users
  for each row execute procedure update_updated_at_column();

-- Automatic stage history tracking
create or replace function track_application_stage_change()
returns trigger as $$
begin
  if old.stage is distinct from new.stage then
    insert into application_stage_history (application_id, from_stage, to_stage, changed_by)
    values (new.id, old.stage, new.stage, new.current_interviewer);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger track_application_stage_changes
  after update on applications
  for each row execute procedure track_application_stage_change();
