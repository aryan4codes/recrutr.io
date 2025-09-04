import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { embedText } from '@/lib/embeddings'
import { upsertJobEmbedding } from '@/lib/vector'
import { AuditLogger } from '@/lib/audit'
import { z } from 'zod'

const JobSchema = z.object({
  title: z.string(),
  jd_text: z.string(),
  location: z.string().optional(),
  level: z.string().optional(),
  created_by: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const { job } = await req.json()
    const validatedJob = JobSchema.parse(job)

    // Create or update job
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert(validatedJob)
      .select('*')
      .single()
    
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
    await AuditLogger.logJobCreation(
      validatedJob.created_by || 'anonymous',
      data.id,
      validatedJob
    )

    return new Response(JSON.stringify({ job: data }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Create job error:', error)
    return new Response(JSON.stringify({ error: 'Failed to create job' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
