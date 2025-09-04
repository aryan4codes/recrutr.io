import { NextRequest } from 'next/server'
import { GoogleCalendarAdapter } from '@/lib/calendar'
import { z } from 'zod'

const FindSlotSchema = z.object({
  attendee_emails: z.array(z.string().email()),
  duration_minutes: z.number().min(15).max(480),
  start_date: z.string(),
  end_date: z.string(),
  timezone: z.string().optional().default('UTC')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { attendee_emails, duration_minutes, start_date, end_date, timezone } = FindSlotSchema.parse(body)

    // Use Google Calendar adapter (stub implementation)
    const availableSlots = await GoogleCalendarAdapter.findAvailableSlots(
      attendee_emails,
      duration_minutes,
      start_date,
      end_date
    )

    // Filter to business hours (9 AM - 6 PM)
    const businessHourSlots = availableSlots.filter(slot => {
      const startHour = new Date(slot.start).getHours()
      return startHour >= 9 && startHour <= 17
    })

    return new Response(JSON.stringify({ 
      slots: businessHourSlots.slice(0, 10), // Return top 10 slots
      timezone 
    }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Find slot error:', error)
    return new Response(JSON.stringify({ error: 'Failed to find available slots' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
