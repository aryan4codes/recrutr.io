import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { AuditLogger } from '@/lib/audit'
import { z } from 'zod'

const FeedbackSchema = z.object({
  interview_id: z.string().uuid(),
  interviewer_id: z.string().uuid(),
  ratings: z.record(z.string(), z.number().min(1).max(5)),
  notes: z.string(),
  recommendation: z.enum(['strong_hire', 'hire', 'no_hire', 'strong_no_hire']),
  overall_rating: z.number().min(1).max(5)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { interview_id, interviewer_id, ratings, notes, recommendation, overall_rating } = FeedbackSchema.parse(body)

    // Store feedback
    const { data: feedback, error } = await supabaseAdmin
      .from('interview_feedback')
      .insert({
        interview_id,
        interviewer_id,
        ratings_json: { 
          individual_ratings: ratings,
          overall_rating,
          recommendation
        },
        notes
      })
      .select('*')
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    // Log audit event
    await AuditLogger.logFeedbackSubmitted(
      interviewer_id,
      interview_id,
      { recommendation, overall_rating }
    )

    // Check if all interviewers have submitted feedback
    const { data: allFeedback } = await supabaseAdmin
      .from('interview_feedback')
      .select('*')
      .eq('interview_id', interview_id)

    // Update interview status if complete
    if (allFeedback && allFeedback.length > 0) {
      const avgRating = allFeedback.reduce((sum, f) => sum + (f.ratings_json.overall_rating || 0), 0) / allFeedback.length
      
      await supabaseAdmin
        .from('interviews')
        .update({ 
          status: 'completed'
        })
        .eq('id', interview_id)

      // Update application stage based on feedback
      const { data: interview } = await supabaseAdmin
        .from('interviews')
        .select('application_id')
        .eq('id', interview_id)
        .single()

      if (interview) {
        const newStage = avgRating >= 3.5 ? 'interview_passed' : 'rejected'
        await supabaseAdmin
          .from('applications')
          .update({ stage: newStage })
          .eq('id', interview.application_id)
      }
    }

    return new Response(JSON.stringify({ 
      feedback,
      summary: {
        feedback_count: allFeedback?.length || 0,
        average_rating: allFeedback?.length ? 
          allFeedback.reduce((sum, f) => sum + (f.ratings_json.overall_rating || 0), 0) / allFeedback.length : 
          overall_rating
      }
    }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Record feedback error:', error)
    return new Response(JSON.stringify({ error: 'Failed to record feedback' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
