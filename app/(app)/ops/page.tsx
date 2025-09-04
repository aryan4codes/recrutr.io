'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase-client'

interface PipelineMetric {
  job_id: string
  stage: string
  count: number
  avg_age_days?: number
  snapshot_date: string
}

interface NudgeEvent {
  id: string
  job_id: string
  to_email: string
  message: string
  sent_at: string
}

export default function OpsPage() {
  const [metrics, setMetrics] = useState<PipelineMetric[]>([])
  const [nudges, setNudges] = useState<NudgeEvent[]>([])
  const [ownerEmail, setOwnerEmail] = useState('hiring-manager@company.com')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMetrics()
    loadNudges()
  }, [])

  async function loadMetrics() {
    try {
      const { data, error } = await supabase
        .from('pipeline_metrics')
        .select('*')
        .order('snapshot_date', { ascending: false })
        .limit(50)

      if (error) throw error
      setMetrics(data || [])
    } catch (error) {
      console.error('Error loading metrics:', error)
    }
  }

  async function loadNudges() {
    try {
      const { data, error } = await supabase
        .from('nudge_events')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setNudges(data || [])
    } catch (error) {
      console.error('Error loading nudges:', error)
    }
  }

  async function sendManualNudge() {
    if (!ownerEmail.trim()) {
      alert('Please provide email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tools/nudge-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_email: ownerEmail,
          context: 'Manual pipeline review requested'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`Nudge sent successfully!\n\nMessage: ${data.message}`)
        loadNudges() // Refresh the nudges list
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error sending nudge:', error)
      alert('Failed to send nudge')
    } finally {
      setLoading(false)
    }
  }

  async function runAutomatedNudges() {
    setLoading(true)
    try {
      const response = await fetch('/api/tools/nudge-owner', {
        method: 'GET'
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`Automated nudges processed: ${data.processed} applications reviewed`)
        loadNudges()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error running automated nudges:', error)
      alert('Failed to run automated nudges')
    } finally {
      setLoading(false)
    }
  }

  // Group metrics by stage for display
  const stageGroups = metrics.reduce((acc, metric) => {
    if (!acc[metric.stage]) {
      acc[metric.stage] = []
    }
    acc[metric.stage].push(metric)
    return acc
  }, {} as Record<string, PipelineMetric[]>)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pipeline Operations</h1>
        <p className="text-muted-foreground">
          Monitor SLAs, pipeline health, and automated nudges
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Metrics</CardTitle>
            <CardDescription>
              Current candidate counts by stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stageGroups).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pipeline metrics available
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(stageGroups).map(([stage, stageMetrics]) => {
                  const totalCount = stageMetrics.reduce((sum, m) => sum + m.count, 0)
                  const avgAge = stageMetrics.reduce((sum, m) => sum + (m.avg_age_days || 0), 0) / stageMetrics.length
                  
                  return (
                    <div key={stage} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium capitalize">{stage.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">
                          Avg age: {avgAge.toFixed(1)} days
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {totalCount}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nudge Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Nudge Management</CardTitle>
            <CardDescription>
              Send manual or automated pipeline nudges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Owner Email</label>
              <Input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="hiring-manager@company.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={sendManualNudge}
                disabled={loading || !ownerEmail.trim()}
              >
                {loading ? 'Sending...' : 'Send Manual Nudge'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={runAutomatedNudges}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Run Automated Nudges'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Nudges */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Nudges</CardTitle>
          <CardDescription>
            Latest automated and manual nudges sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nudges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No nudges sent yet
            </div>
          ) : (
            <div className="space-y-3">
              {nudges.map((nudge) => (
                <div key={nudge.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{nudge.to_email}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {nudge.message}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(nudge.sent_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
