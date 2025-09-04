import { z } from 'zod'

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

export const ShortlistItem = z.object({
  candidate_id: z.string().uuid(),
  score: z.number(),
  reasons: z.array(z.string()),
  evidence: z.array(z.object({ text: z.string(), line_no: z.number().optional() }))
})

export const CandidateProfile = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  resume_text: z.string(),
  skills: z.array(z.string()).optional()
})

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

export type JDType = z.infer<typeof JD>
export type ShortlistItemType = z.infer<typeof ShortlistItem>
export type CandidateProfileType = z.infer<typeof CandidateProfile>
export type InterviewPanelType = z.infer<typeof InterviewPanel>
export type InterviewSlotType = z.infer<typeof InterviewSlot>
