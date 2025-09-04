'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase-client'

interface Job {
  id: string
  title: string
}

interface Candidate {
  id: string
  name: string
  email: string
}

interface CalendarSlot {
  start: string
  end: string
  available: boolean
}

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [availableSlots, setAvailableSlots] = useState<CalendarSlot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadJobs()
    loadCandidates()
  }, [])

  async function loadJobs() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  async function loadCandidates() {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, name, email')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCandidates(data || [])
    } catch (error) {
      console.error('Error loading candidates:', error)
    }
  }

  async function designPanel() {
    if (!selectedJobId || !selectedCandidateId) {
      alert('Please select both job and candidate')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tools/design-panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: selectedJobId,
          candidate_id: selectedCandidateId,
          interview_type: 'technical'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        const panel = data.panel
        alert(`Interview Panel Designed:

Duration: ${panel.total_duration_minutes} minutes

Panel Members:
${panel.panel_composition?.map((member: any) => 
  `- ${member.name} (${member.role}) - Focus: ${member.focus_areas?.join(', ')}`
).join('\n') || 'No panel members'}

Evaluation Criteria:
${panel.evaluation_criteria?.map((criteria: any) => 
  `- ${criteria.skill} (Weight: ${criteria.weight})`
).join('\n') || 'No criteria'}`)

        // Now find available slots
        await findSlots()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error designing panel:', error)
      alert('Failed to design interview panel')
    } finally {
      setLoading(false)
    }
  }

  async function findSlots() {
    try {
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000) // 2 weeks

      const response = await fetch('/api/tools/find-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendee_emails: ['interviewer1@company.com', 'interviewer2@company.com'], // Mock emails
          duration_minutes: 60,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setAvailableSlots(data.slots || [])
      }
    } catch (error) {
      console.error('Error finding slots:', error)
    }
  }

  async function scheduleInterview(slot: CalendarSlot) {
    if (!selectedJobId || !selectedCandidateId) return

    try {
      const candidate = candidates.find(c => c.id === selectedCandidateId)
      const job = jobs.find(j => j.id === selectedJobId)

      const response = await fetch('/api/tools/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: `${selectedJobId}-${selectedCandidateId}`, // Mock application ID
          title: `Interview: ${candidate?.name} - ${job?.title}`,
          start: slot.start,
          end: slot.end,
          attendees: [candidate?.email, 'interviewer1@company.com'],
          description: `Technical interview for ${job?.title} position`
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`Interview scheduled successfully! Event ID: ${data.calendar_event.id}`)
        setAvailableSlots([]) // Clear slots
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error scheduling interview:', error)
      alert('Failed to schedule interview')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Interview Scheduling</h1>
        <p className="text-muted-foreground">
          Design interview panels and schedule meetings automatically
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Setup</CardTitle>
          <CardDescription>
            Select job and candidate to design the optimal interview panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Job</label>
              <select 
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a job...</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Candidate</label>
              <select 
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a candidate...</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name || candidate.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button 
            onClick={designPanel}
            disabled={!selectedJobId || !selectedCandidateId || loading}
            className="w-full"
          >
            {loading ? 'Designing Panel...' : 'Design Interview Panel'}
          </Button>
        </CardContent>
      </Card>

      {availableSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
            <CardDescription>
              Choose from available interview slots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSlots.map((slot, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-medium">
                    {new Date(slot.start).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(slot.start).toLocaleTimeString()} - {new Date(slot.end).toLocaleTimeString()}
                  </div>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => scheduleInterview(slot)}
                  >
                    Schedule
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
