import { NextRequest } from 'next/server'
import { generateObject } from 'ai'
import { models } from '@/lib/ai'
import { Database } from '@/lib/db'
import { z } from 'zod'

const DesignPanelSchema = z.object({
  job_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
  interview_type: z.enum(['technical', 'behavioral', 'system_design', 'cultural_fit']).optional()
})

const InterviewPanelSchema = z.object({
  panel_composition: z.array(z.object({
    interviewer_id: z.string(),
    name: z.string(),
    role: z.string(),
    focus_areas: z.array(z.string()),
    duration_minutes: z.number()
  })),
  total_duration_minutes: z.number(),
  interview_flow: z.array(z.object({
    stage: z.string(),
    duration_minutes: z.number(),
    objectives: z.array(z.string()),
    interviewer: z.string()
  })),
  suggested_questions: z.array(z.object({
    category: z.string(),
    question: z.string(),
    expected_depth: z.enum(['junior', 'mid', 'senior', 'principal'])
  })),
  evaluation_criteria: z.array(z.object({
    skill: z.string(),
    weight: z.number(),
    rubric: z.string()
  }))
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_id, candidate_id, interview_type = 'technical' } = DesignPanelSchema.parse(body)

    // Get job, candidate, and available interviewers
    const [job, candidate, interviewers] = await Promise.all([
      Database.getJob(job_id),
      Database.getCandidate(candidate_id),
      Database.getInterviewers()
    ])

    const result = await generateObject({
      model: models.normal,
      system: `You are an expert interview coordinator. Design an optimal interview panel based on:
      
      1. Job requirements and seniority level
      2. Candidate background and strengths  
      3. Available interviewer expertise
      4. Interview type and format
      
      Create a balanced panel that covers all key competencies while being efficient.`,
      prompt: `Job: ${job.title} (${job.level})
      Requirements: ${job.jd_text}
      
      Candidate: ${candidate.name}
      Background: ${candidate.resume_text?.substring(0, 500)}...
      
      Available Interviewers:
      ${interviewers.map(i => `- ${i.name} (${i.seniority}, ${i.team}): ${i.competencies?.join(', ')}`).join('\n')}
      
      Interview Type: ${interview_type}
      
      Design an optimal interview panel and process.`,
      schema: InterviewPanelSchema
    })

    return new Response(JSON.stringify({ 
      panel: result.object 
    }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Design panel error:', error)
    return new Response(JSON.stringify({ error: 'Failed to design interview panel' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
