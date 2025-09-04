import { NextRequest } from 'next/server'
import { generateObject } from 'ai'
import { models } from '@/lib/ai'
import { Database } from '@/lib/db'
import { redactPII } from '@/lib/redact'
import { z } from 'zod'

const ExplainSchema = z.object({
  job_id: z.string().uuid(),
  candidate_id: z.string().uuid()
})

const ExplanationSchema = z.object({
  overall_score: z.number().min(0).max(1),
  fit_summary: z.string(),
  competency_analysis: z.array(z.object({
    competency: z.string(),
    score: z.number().min(0).max(1),
    evidence: z.array(z.string()),
    gaps: z.array(z.string())
  })),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendation: z.enum(['strong_fit', 'moderate_fit', 'weak_fit', 'not_recommended'])
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_id, candidate_id } = ExplainSchema.parse(body)

    // Get job and candidate data
    const [job, candidate] = await Promise.all([
      Database.getJob(job_id),
      Database.getCandidate(candidate_id)
    ])

    // Redact PII from resume text for model input
    const redactedResume = redactPII(candidate.resume_text, { 
      emails: true, 
      phones: true, 
      names: false // Keep names for context
    })

    const result = await generateObject({
      model: models.normal,
      system: `You are an expert technical recruiter. Analyze how well this candidate fits the job requirements.
      
      Provide detailed, evidence-based analysis focusing on:
      1. Technical competencies match
      2. Experience level alignment  
      3. Domain expertise relevance
      4. Specific evidence from resume
      5. Potential gaps or concerns
      
      Be objective and thorough.`,
      prompt: `Job: ${job.title}
      Requirements: ${job.jd_text}
      
      Candidate Resume: ${redactedResume}
      
      Analyze the fit between this candidate and job requirements.`,
      schema: ExplanationSchema
    })

    // Store explanation
    await Database.updateApplicationScore(
      `${job_id}-${candidate_id}`, // This would be actual application ID
      result.object.overall_score,
      result.object
    )

    return new Response(JSON.stringify({ 
      explanation: result.object 
    }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Explain candidate error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate explanation' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
