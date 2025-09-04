import { NextRequest } from 'next/server'
import { GoogleCalendarAdapter } from '@/lib/calendar'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { AuditLogger } from '@/lib/audit'
import { z } from 'zod'

const CreateEventSchema = z.object({
  application_id: z.string().uuid(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  attendees: z.array(z.string().email()),
  description: z.string().optional(),
  panel_data: z.any().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { application_id, title, start, end, attendees, description, panel_data } = CreateEventSchema.parse(body)

    // Create calendar event (stub implementation)
    const calendarEvent = await GoogleCalendarAdapter.createEvent({
      title,
      start,
      end,
      attendees,
      description
    })

    // Store interview record
    const { data: interview, error } = await supabaseAdmin
      .from('interviews')
      .insert({
        application_id,
        panel_json: panel_data,
        start,
        end,
        status: 'scheduled',
        calendar_event_id: calendarEvent.id
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
    await AuditLogger.logInterviewScheduled(
      'system', // Would be actual user ID
      application_id,
      { interview_id: interview.id, calendar_event_id: calendarEvent.id }
    )

    return new Response(JSON.stringify({ 
      interview,
      calendar_event: calendarEvent
    }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Create event error:', error)
    return new Response(JSON.stringify({ error: 'Failed to create interview event' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
