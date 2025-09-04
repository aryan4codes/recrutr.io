import { NextRequest } from 'next/server'
import { generateText } from 'ai'
import { models } from '@/lib/ai'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const NudgeSchema = z.object({
  job_id: z.string().uuid().optional(),
  stage: z.string().optional(),
  owner_email: z.string().email(),
  context: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_id, stage, owner_email, context } = NudgeSchema.parse(body)

    // Get pipeline metrics if job_id provided
    let pipelineData = null
    if (job_id) {
      const { data } = await supabaseAdmin
        .from('pipeline_metrics')
        .select('*')
        .eq('job_id', job_id)
        .order('snapshot_date', { ascending: false })
        .limit(1)

      pipelineData = data?.[0]
    }

    // Generate contextual nudge message
    const result = await generateText({
      model: models.small,
      system: `You are a recruiting operations assistant. Generate brief, actionable nudges to help hiring managers stay on top of their pipelines.

      Focus on:
      - Urgent actions needed
      - Pipeline health insights  
      - Specific next steps
      - Encouraging but professional tone
      
      Keep messages under 150 words.`,
      prompt: `Context: ${context || 'General pipeline check-in'}
      
      ${pipelineData ? `Pipeline Status:
      - Stage: ${pipelineData.stage}
      - Count: ${pipelineData.count} candidates
      - Average age: ${pipelineData.avg_age_days} days` : ''}
      
      Generate a helpful nudge message for the hiring manager.`
    })

    // Store nudge event
    const { data: nudge, error } = await supabaseAdmin
      .from('nudge_events')
      .insert({
        job_id,
        to_email: owner_email,
        message: result.text
      })
      .select('*')
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    // In a real implementation, this would send email via:
    // - SendGrid, Resend, or similar service
    // - Slack notification
    // - In-app notification
    
    console.log(`Nudge sent to ${owner_email}: ${result.text}`)

    return new Response(JSON.stringify({ 
      nudge,
      message: result.text,
      sent: true
    }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Nudge owner error:', error)
    return new Response(JSON.stringify({ error: 'Failed to send nudge' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}

// Cron job handler for automated nudges
export async function GET() {
  try {
    // Find stale pipeline stages (could be enhanced with more sophisticated logic)
    const { data: staleStages } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        stage,
        updated_at,
        jobs!inner(id, title, created_by)
      `)
      .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 days old
      .in('stage', ['shortlisted', 'interview_scheduled', 'interview_completed'])

    if (staleStages && staleStages.length > 0) {
      // Group by job and send nudges
      const jobGroups = staleStages.reduce((acc: Record<string, { job: any; applications: any[] }>, app: any) => {
        const jobRecord = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs
        if (!jobRecord || !jobRecord.id) {
          return acc
        }
        const jobId = jobRecord.id as string
        if (!acc[jobId]) {
          acc[jobId] = {
            job: jobRecord,
            applications: []
          }
        }
        acc[jobId].applications.push(app)
        return acc
      }, {})

      for (const [jobId, group] of Object.entries(jobGroups) as any) {
        const nudgeText = `Pipeline Update Needed: ${group.job.title} has ${group.applications.length} applications in stale stages. Please review and take action.`
        
        await supabaseAdmin
          .from('nudge_events')
          .insert({
            job_id: jobId,
            to_email: 'hiring-manager@company.com', // Would come from job.created_by lookup
            message: nudgeText
          })
      }
    }

    return new Response(JSON.stringify({ 
      processed: staleStages?.length || 0,
      message: 'Automated nudges processed'
    }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Automated nudge error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process automated nudges' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
