import { NextRequest } from 'next/server'
import { generateObject } from 'ai'
import { models } from '@/lib/ai'
import { Database } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const GenerateKitSchema = z.object({
  job_id: z.string().uuid(),
  interview_type: z.enum(['technical', 'behavioral', 'system_design', 'cultural_fit']).optional().default('technical'),
  seniority_level: z.enum(['junior', 'mid', 'senior', 'principal']).optional().default('mid')
})

const InterviewKitSchema = z.object({
  job_title: z.string(),
  interview_type: z.string(),
  duration_minutes: z.number(),
  sections: z.array(z.object({
    name: z.string(),
    duration_minutes: z.number(),
    questions: z.array(z.object({
      question: z.string(),
      purpose: z.string(),
      expected_signals: z.array(z.string()),
      follow_ups: z.array(z.string())
    }))
  })),
  evaluation_rubric: z.array(z.object({
    criteria: z.string(),
    levels: z.object({
      excellent: z.string(),
      good: z.string(),
      average: z.string(),
      poor: z.string()
    })
  })),
  tips_for_interviewer: z.array(z.string()),
  red_flags: z.array(z.string())
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_id, interview_type, seniority_level } = GenerateKitSchema.parse(body)

    // Get job details
    const job = await Database.getJob(job_id)

    const result = await generateObject({
      model: models.normal,
      system: `You are an expert interview designer. Create a comprehensive interview kit that helps interviewers conduct effective, structured interviews.

      The kit should include:
      1. Well-crafted questions that reveal key competencies
      2. Clear evaluation criteria and rubrics
      3. Practical tips for interviewers
      4. Red flags to watch for
      
      Tailor everything to the specific role and seniority level.`,
      prompt: `Job: ${job.title} (${job.level || seniority_level})
      Requirements: ${job.jd_text}
      
      Interview Type: ${interview_type}
      Seniority Level: ${seniority_level}
      
      Create a comprehensive interview kit for this role.`,
      schema: InterviewKitSchema
    })

    // Store the kit
    const { data: kit, error } = await supabaseAdmin
      .from('interview_kits')
      .insert({
        job_id,
        kit_json: result.object
      })
      .select('*')
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      kit: result.object,
      kit_id: kit.id
    }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Generate interview kit error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate interview kit' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
