-- Minor improvements to your existing schema
-- These are additive changes that enhance functionality

-- 1. Add missing indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_job_id 
ON applications(job_id);

CREATE INDEX IF NOT EXISTS idx_applications_candidate_id 
ON applications(candidate_id);

CREATE INDEX IF NOT EXISTS idx_applications_stage 
ON applications(stage);

CREATE INDEX IF NOT EXISTS idx_applications_score 
ON applications(score DESC);

CREATE INDEX IF NOT EXISTS idx_job_competencies_job_id 
ON job_competencies(job_id);

-- 2. Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_applications_job_stage 
ON applications(job_id, stage);

CREATE INDEX IF NOT EXISTS idx_candidate_skills_skill 
ON candidate_skills(skill);

CREATE INDEX IF NOT EXISTS idx_candidate_skills_source 
ON candidate_skills(source);

CREATE INDEX IF NOT EXISTS idx_candidate_experience_current 
ON candidate_experience(candidate_id, is_current);

-- 3. Add constraints for data quality
ALTER TABLE applications 
ADD CONSTRAINT check_score_range 
CHECK (score IS NULL OR (score >= 0 AND score <= 1));

-- Only add constraints for columns that exist in your enhanced schema
ALTER TABLE candidate_languages 
ADD CONSTRAINT check_language_proficiency 
CHECK (proficiency IS NULL OR proficiency IN ('native', 'fluent', 'conversational', 'basic'));

-- 4. Add some useful columns with defaults
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS employment_type text DEFAULT 'full-time',
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add constraint for job status
ALTER TABLE jobs 
ADD CONSTRAINT check_job_status 
CHECK (status IN ('active', 'paused', 'closed', 'draft'));

-- Add constraint for employment type
ALTER TABLE jobs 
ADD CONSTRAINT check_employment_type 
CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance'));

-- 5. Add update trigger for jobs
CREATE TRIGGER update_jobs_updated_at 
BEFORE UPDATE ON jobs 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Enhanced search function with filters
CREATE OR REPLACE FUNCTION search_candidates_advanced(
    job_uuid uuid, 
    k int default 30,
    min_score float4 default 0.0,
    location_filter text default null,
    min_experience int default null
)
RETURNS TABLE(
    candidate_id uuid, 
    name text, 
    email text, 
    location text,
    current_company text,
    years_experience int,
    score float4
)
LANGUAGE sql STABLE AS $$
  SELECT c.id, c.name, c.email, c.location, c.current_company, c.years_of_experience,
         (1 - (c.resume_embedding_h <=> j.jd_embedding_h)) as score
  FROM candidates c
  JOIN jobs j ON j.id = job_uuid
  WHERE j.jd_embedding_h IS NOT NULL
    AND c.resume_embedding_h IS NOT NULL
    AND (1 - (c.resume_embedding_h <=> j.jd_embedding_h)) >= min_score
    AND (location_filter IS NULL OR c.location ILIKE '%' || location_filter || '%')
    AND (min_experience IS NULL OR c.years_of_experience >= min_experience)
  ORDER BY c.resume_embedding_h <=> j.jd_embedding_h
  LIMIT k;
$$;

-- 7. Function to get candidate summary with all related data
CREATE OR REPLACE FUNCTION get_candidate_summary(candidate_uuid uuid)
RETURNS json
LANGUAGE sql STABLE AS $$
  SELECT json_build_object(
    'candidate', row_to_json(c),
    'skills', COALESCE((
      SELECT json_agg(json_build_object(
        'skill', cs.skill,
        'source', cs.source
      )) FROM candidate_skills cs WHERE cs.candidate_id = candidate_uuid
    ), '[]'::json),
    'experience', COALESCE((
      SELECT json_agg(json_build_object(
        'company', ce.company,
        'position', ce.position,
        'duration', ce.duration,
        'description', ce.description,
        'is_current', ce.is_current,
        'start_date', ce.start_date,
        'end_date', ce.end_date
      ) ORDER BY ce.is_current DESC, ce.start_date DESC) 
      FROM candidate_experience ce WHERE ce.candidate_id = candidate_uuid
    ), '[]'::json),
    'education', COALESCE((
      SELECT json_agg(json_build_object(
        'institution', ed.institution,
        'degree', ed.degree,
        'field', ed.field,
        'year', ed.year,
        'gpa', ed.gpa
      )) FROM candidate_education ed WHERE ed.candidate_id = candidate_uuid
    ), '[]'::json),
    'projects', COALESCE((
      SELECT json_agg(json_build_object(
        'name', cp.name,
        'description', cp.description,
        'technologies', cp.technologies,
        'project_url', cp.project_url,
        'github_url', cp.github_url
      )) FROM candidate_projects cp WHERE cp.candidate_id = candidate_uuid
    ), '[]'::json),
    'certifications', COALESCE((
      SELECT json_agg(json_build_object(
        'certification_name', cc.certification_name,
        'issuing_organization', cc.issuing_organization,
        'issue_date', cc.issue_date,
        'expiry_date', cc.expiry_date
      )) FROM candidate_certifications cc WHERE cc.candidate_id = candidate_uuid
    ), '[]'::json),
    'languages', COALESCE((
      SELECT json_agg(json_build_object(
        'language', cl.language,
        'proficiency', cl.proficiency
      )) FROM candidate_languages cl WHERE cl.candidate_id = candidate_uuid
    ), '[]'::json)
  )
  FROM candidates c WHERE c.id = candidate_uuid;
$$;

-- 8. Add some useful materialized views for analytics (optional)
CREATE MATERIALIZED VIEW IF NOT EXISTS candidate_stats AS
SELECT 
    COUNT(*) as total_candidates,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as candidates_last_30_days,
    COUNT(CASE WHEN resume_embedding IS NOT NULL THEN 1 END) as candidates_with_embeddings,
    AVG(years_of_experience) as avg_years_experience,
    COUNT(DISTINCT location) as unique_locations,
    COUNT(DISTINCT current_company) as unique_companies
FROM candidates;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS candidate_stats_unique ON candidate_stats (total_candidates);

-- Function to refresh stats
CREATE OR REPLACE FUNCTION refresh_candidate_stats()
RETURNS void
LANGUAGE sql AS $$
  REFRESH MATERIALIZED VIEW candidate_stats;
$$;

-- 9. Add some helper functions for data cleanup
CREATE OR REPLACE FUNCTION normalize_skill_name(skill_text text)
RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT TRIM(LOWER(skill_text));
$$;

-- 10. Add RLS (Row Level Security) policies foundation (commented out for now)
-- Uncomment when you add user authentication

-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own jobs" ON jobs
--   FOR SELECT USING (created_by = auth.uid());

-- CREATE POLICY "Users can create jobs" ON jobs
--   FOR INSERT WITH CHECK (created_by = auth.uid());
