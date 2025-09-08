import { z } from 'zod'

// Job-related schemas
export const Job = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  jd_text: z.string(),
  jd_embedding: z.any().optional(), // vector type
  location: z.string().optional(),
  level: z.string().optional(),
  status: z.enum(['active', 'paused', 'closed', 'draft']).default('active'),
  department: z.string().optional(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']).default('full-time'),
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const JD = z.object({
  title: z.string(),
  summary: z.string(),
  location: z.string().optional(),
  level: z.string().optional(),
  must_haves: z.array(z.string()),
  nice_to_haves: z.array(z.string()),
  responsibilities: z.array(z.string()),
  competencies: z.array(z.string())
})

export const JobCompetency = z.object({
  job_id: z.string().uuid(),
  competency: z.string(),
  weight: z.number().default(1.0)
})

// Enhanced Candidate schemas
export const CandidateBase = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  resume_text: z.string().optional(),
  resume_embedding: z.any().optional(), // vector type
  location: z.string().optional(),
  linkedin: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  summary: z.string().optional(),
  years_of_experience: z.number().int().min(0).optional(),
  current_company: z.string().optional(),
  current_position: z.string().optional(),
  preferred_location: z.string().optional(),
  salary_expectation: z.string().optional(),
  availability: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const CandidateExperience = z.object({
  id: z.string().uuid().optional(),
  candidate_id: z.string().uuid(),
  company: z.string(),
  position: z.string(),
  duration: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  is_current: z.boolean().default(false),
  created_at: z.string().datetime().optional()
})

export const CandidateEducation = z.object({
  id: z.string().uuid().optional(),
  candidate_id: z.string().uuid(),
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  year: z.string().optional(),
  graduation_date: z.string().date().optional(),
  gpa: z.string().optional(),
  created_at: z.string().datetime().optional()
})

export const CandidateSkill = z.object({
  candidate_id: z.string().uuid(),
  skill: z.string(),
  source: z.string().optional()
})

export const CandidateProject = z.object({
  id: z.string().uuid().optional(),
  candidate_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  project_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  created_at: z.string().datetime().optional()
})

export const CandidateCertification = z.object({
  id: z.string().uuid().optional(),
  candidate_id: z.string().uuid(),
  certification_name: z.string(),
  issuing_organization: z.string().optional(),
  issue_date: z.string().date().optional(),
  expiry_date: z.string().date().optional(),
  credential_id: z.string().optional(),
  credential_url: z.string().url().optional(),
  created_at: z.string().datetime().optional()
})

export const CandidateLanguage = z.object({
  id: z.string().uuid().optional(),
  candidate_id: z.string().uuid(),
  language: z.string(),
  proficiency: z.enum(['native', 'fluent', 'conversational', 'basic']).optional(),
  created_at: z.string().datetime().optional()
})

// Complete candidate profile with all related data
export const CandidateProfile = z.object({
  candidate: CandidateBase,
  experience: z.array(CandidateExperience).optional(),
  education: z.array(CandidateEducation).optional(),
  skills: z.array(CandidateSkill).optional(),
  projects: z.array(CandidateProject).optional(),
  certifications: z.array(CandidateCertification).optional(),
  languages: z.array(CandidateLanguage).optional()
})

// Application schemas
export const Application = z.object({
  id: z.string().uuid().optional(),
  job_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
  stage: z.string().default('applied'),
  score: z.number().min(0).max(1).optional(),
  explanation_json: z.any().optional(), // jsonb type
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const ShortlistItem = z.object({
  candidate_id: z.string().uuid(),
  score: z.number(),
  reasons: z.array(z.string()),
  evidence: z.array(z.object({ text: z.string(), line_no: z.number().optional() }))
})

// Interview schemas
export const InterviewPanel = z.object({
  interviewers: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    role: z.string(),
    competencies: z.array(z.string())
  })),
  duration_minutes: z.number(),
  format: z.enum(['technical', 'behavioral', 'system_design', 'cultural_fit'])
})

export const InterviewSlot = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  available_interviewers: z.array(z.string().uuid())
})

// AI parsing schemas for resume extraction
export const ResumeParsingResult = z.object({
  // Basic candidate info
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  summary: z.string().optional(),
  years_of_experience: z.number().int().min(0).optional(),
  current_company: z.string().optional(),
  current_position: z.string().optional(),
  
  // Structured data arrays
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    duration: z.string().optional(),
    description: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_current: z.boolean().default(false)
  })).optional(),
  
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    year: z.string().optional(),
    graduation_date: z.string().optional(),
    gpa: z.string().optional()
  })).optional(),
  
  skills: z.array(z.object({
    skill: z.string(),
    source: z.string().optional()
  })).optional(),
  
  projects: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    project_url: z.string().optional(),
    github_url: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional()
  })).optional(),
  
  certifications: z.array(z.object({
    certification_name: z.string(),
    issuing_organization: z.string().optional(),
    issue_date: z.string().optional(),
    expiry_date: z.string().optional(),
    credential_id: z.string().optional(),
    credential_url: z.string().optional()
  })).optional(),
  
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.enum(['native', 'fluent', 'conversational', 'basic']).optional()
  })).optional()
})

// Search and analytics schemas
export const CandidateSearchResult = z.object({
  candidate_id: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().optional(),
  location: z.string().optional(),
  current_company: z.string().optional(),
  years_experience: z.number().optional(),
  score: z.number()
})

// Export all types
export type JobType = z.infer<typeof Job>
export type JDType = z.infer<typeof JD>
export type JobCompetencyType = z.infer<typeof JobCompetency>
export type CandidateBaseType = z.infer<typeof CandidateBase>
export type CandidateExperienceType = z.infer<typeof CandidateExperience>
export type CandidateEducationType = z.infer<typeof CandidateEducation>
export type CandidateSkillType = z.infer<typeof CandidateSkill>
export type CandidateProjectType = z.infer<typeof CandidateProject>
export type CandidateCertificationType = z.infer<typeof CandidateCertification>
export type CandidateLanguageType = z.infer<typeof CandidateLanguage>
export type CandidateProfileType = z.infer<typeof CandidateProfile>
export type ApplicationType = z.infer<typeof Application>
export type ShortlistItemType = z.infer<typeof ShortlistItem>
export type InterviewPanelType = z.infer<typeof InterviewPanel>
export type InterviewSlotType = z.infer<typeof InterviewSlot>
export type ResumeParsingResultType = z.infer<typeof ResumeParsingResult>
export type CandidateSearchResultType = z.infer<typeof CandidateSearchResult>
