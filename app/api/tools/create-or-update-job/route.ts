import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { embedText } from '@/lib/embeddings'
import { upsertJobEmbedding } from '@/lib/vector'
import { AuditLogger } from '@/lib/audit'
import { z } from 'zod'

const JobSchema = z.object({
  id: z.string().optional(), // Include ID for updates
  title: z.string(),
  jd_text: z.string(),
  location: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  employment_type: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  created_by: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const { job } = await req.json()
    const validatedJob = JobSchema.parse(job)

    // Prepare job data (remove id from insert/update data)
    const { id: jobId, ...jobData } = validatedJob
    
    let data, error

    if (jobId) {
      // Update existing job
      const result = await supabaseAdmin
        .from('jobs')
        .update({
          ...jobData,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select('*')
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Create new job
      const result = await supabaseAdmin
        .from('jobs')
        .insert(jobData)
        .select('*')
        .single()
      
      data = result.data
      error = result.error
    }
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    // Generate and store embedding
    try {
      const embedding = await embedText(validatedJob.jd_text)
      await upsertJobEmbedding(data.id, embedding)
    } catch (embeddingError) {
      console.error('Failed to generate embedding:', embeddingError)
      // Continue without embedding - can be generated later
    }

    // Log audit event
    if (jobId) {
      // Log job update
      await AuditLogger.logJobCreation(
        validatedJob.created_by || 'anonymous',
        data.id,
        { ...validatedJob, action: 'update' }
      )
    } else {
      // Log job creation
      await AuditLogger.logJobCreation(
        validatedJob.created_by || 'anonymous',
        data.id,
        validatedJob
      )
    }

    return new Response(JSON.stringify({ job: data }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Create/update job error:', error)
    return new Response(JSON.stringify({ error: 'Failed to save job' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
