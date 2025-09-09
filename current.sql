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
