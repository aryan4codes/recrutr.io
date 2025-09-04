import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Webhook handler for Supabase realtime events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, table, record, old_record } = body

    console.log(`Webhook received: ${type} on ${table}`)

    // Handle different event types
    switch (table) {
      case 'applications':
        await handleApplicationChange(type, record, old_record)
        break
      
      case 'interviews':
        await handleInterviewChange(type, record, old_record)
        break
        
      case 'jobs':
        await handleJobChange(type, record, old_record)
        break
        
      default:
        console.log(`Unhandled table: ${table}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}

async function handleApplicationChange(type: string, record: any, old_record?: any) {
  // Update pipeline metrics when application stage changes
  if (type === 'UPDATE' && record.stage !== old_record?.stage) {
    await updatePipelineMetrics(record.job_id)
  }
  
  // Send notifications for status changes
  if (type === 'UPDATE' && record.stage === 'rejected') {
    // Could send rejection email or update ATS
    console.log(`Application ${record.id} rejected`)
  }
}

async function handleInterviewChange(type: string, record: any, old_record?: any) {
  // Send reminders for upcoming interviews
  if (type === 'INSERT' && record.status === 'scheduled') {
    const interviewTime = new Date(record.start)
    const reminderTime = new Date(interviewTime.getTime() - 24 * 60 * 60 * 1000) // 24h before
    
    console.log(`Interview ${record.id} scheduled for ${interviewTime}`)
    // Schedule reminder notification
  }
}

async function handleJobChange(type: string, record: any, old_record?: any) {
  // Initialize pipeline metrics for new jobs
  if (type === 'INSERT') {
    await initializePipelineMetrics(record.id)
  }
}

async function updatePipelineMetrics(jobId: string) {
  // Count applications by stage
  const { data: stageCounts } = await supabaseAdmin
    .from('applications')
    .select('stage')
    .eq('job_id', jobId)

  const metrics = stageCounts?.reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Update or insert metrics
  for (const [stage, count] of Object.entries(metrics)) {
    await supabaseAdmin
      .from('pipeline_metrics')
      .upsert({
        job_id: jobId,
        stage,
        count,
        snapshot_date: new Date().toISOString().split('T')[0]
      })
  }
}

async function initializePipelineMetrics(jobId: string) {
  const initialStages = ['applied', 'screening', 'shortlisted', 'interview_scheduled', 'interview_completed', 'offer', 'hired', 'rejected']
  
  const metrics = initialStages.map(stage => ({
    job_id: jobId,
    stage,
    count: 0,
    avg_age_days: 0,
    snapshot_date: new Date().toISOString().split('T')[0]
  }))

  await supabaseAdmin
    .from('pipeline_metrics')
    .insert(metrics)
}
