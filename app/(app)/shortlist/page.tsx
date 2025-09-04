'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase-client'

interface Job {
  id: string
  title: string
}

interface CandidateMatch {
  candidate_id: string
  name: string
  email: string
  score: number
}

export default function ShortlistPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [candidates, setCandidates] = useState<CandidateMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadJobs()
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

  async function searchCandidates() {
    if (!selectedJobId) {
      alert('Please select a job')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tools/vector-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: selectedJobId,
          topK: 10
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setCandidates(data.rows || [])
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error searching candidates:', error)
      alert('Failed to search candidates')
    } finally {
      setLoading(false)
    }
  }

  async function explainCandidate(candidateId: string) {
    if (!selectedJobId) return

    setGenerating(true)
    try {
      const response = await fetch('/api/tools/explain-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: selectedJobId,
          candidate_id: candidateId
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Show explanation in an alert for now (would be a modal in production)
        const explanation = data.explanation
        alert(`Candidate Analysis:
        
Overall Score: ${(explanation.overall_score * 100).toFixed(1)}%
Fit Summary: ${explanation.fit_summary}
Recommendation: ${explanation.recommendation}

Strengths:
${explanation.strengths?.join('\n- ') || 'None listed'}

Concerns:
${explanation.concerns?.join('\n- ') || 'None listed'}`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error explaining candidate:', error)
      alert('Failed to generate explanation')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Shortlisting</h1>
        <p className="text-muted-foreground">
          Use AI to rank and explain candidate matches for your jobs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Selection</CardTitle>
          <CardDescription>
            Select a job to find the best matching candidates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
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
            
            <Button 
              onClick={searchCandidates}
              disabled={!selectedJobId || loading}
            >
              {loading ? 'Searching...' : 'Find Candidates'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Candidate Matches</CardTitle>
            <CardDescription>
              Top {candidates.length} candidates ranked by AI similarity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate, index) => (
                  <TableRow key={candidate.candidate_id}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{candidate.name || 'Unknown'}</TableCell>
                    <TableCell>{candidate.email || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(candidate.score || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">
                          {((candidate.score || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => explainCandidate(candidate.candidate_id)}
                          disabled={generating}
                        >
                          {generating ? 'Analyzing...' : 'Explain'}
                        </Button>
                        <Button variant="outline" size="sm">
                          Shortlist
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
