'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase-client'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Bot, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  jd_text: string
  location: string
  level: string
  department: string
  employment_type: string
  status: string
  created_at: string
  updated_at: string
}

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [jdText, setJdText] = useState('')
  const [location, setLocation] = useState('')
  const [level, setLevel] = useState('')
  const [department, setDepartment] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (jobId) {
      loadJob()
    }
  }, [jobId])

  async function loadJob() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) throw error

      setJob(data)
      // Populate form fields
      setTitle(data.title || '')
      setJdText(data.jd_text || '')
      setLocation(data.location || '')
      setLevel(data.level || '')
      setDepartment(data.department || '')
      setEmploymentType(data.employment_type || '')
      setStatus(data.status || 'active')
      
    } catch (error) {
      console.error('Error loading job:', error)
      alert('Error loading job. Please try again.')
      router.push('/jobs')
    } finally {
      setLoading(false)
    }
  }

  async function saveJob() {
    if (!title || !jdText) {
      alert('Please provide both title and job description')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/tools/create-or-update-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: {
            id: jobId, // Include ID for update
            title,
            jd_text: jdText,
            location: location || null,
            level: level || null,
            department: department || null,
            employment_type: employmentType || null,
            status: status || 'active'
          }
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('Job updated successfully!')
        router.push('/jobs')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving job:', error)
      alert('Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  async function regenerateWithAI() {
    if (!title) {
      alert('Please provide a job title to regenerate with AI')
      return
    }

    setRegenerating(true)
    try {
      const prompt = `Update and improve this job description: ${title}${location ? ` in ${location}` : ''}${level ? ` at ${level} level` : ''}. Current description: ${jdText}`
      
      const response = await fetch('/api/hr-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      const data = await response.json()
      
      if (data.structuredData) {
        const jobData = data.structuredData
        
        // Update fields with AI suggestions
        if (jobData.role_title && jobData.role_title !== 'not provided') {
          setTitle(jobData.role_title)
        }
        if (jobData.level && jobData.level !== 'not provided') {
          setLevel(jobData.level)
        }
        if (jobData.location && jobData.location !== 'not provided') {
          setLocation(jobData.location)
        }
        if (jobData.description) {
          setJdText(jobData.description)
        }
      } else {
        alert('Failed to regenerate with AI. Please try again.')
      }
      
    } catch (error) {
      console.error('Error regenerating with AI:', error)
      alert('Error regenerating with AI. Please try again.')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <Link href="/jobs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Job</h1>
            <p className="text-gray-600">
              Last updated: {new Date(job.updated_at || job.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={regenerateWithAI}
            disabled={regenerating || saving}
          >
            {regenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bot className="h-4 w-4 mr-2" />
            )}
            {regenerating ? 'Regenerating...' : 'Improve with AI'}
          </Button>
          
          <Button 
            onClick={saveJob}
            disabled={saving || !title || !jdText}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential job details and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Job Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, Remote"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Level
                  </label>
                  <Input
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="e.g. Senior, Mid-level"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Department
                  </label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering, Product"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Employment Type
                  </label>
                  <Input
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    placeholder="e.g. full-time, contract"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Detailed description of the role, responsibilities, and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description *
                </label>
                <Textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={20}
                  placeholder="Enter the complete job description..."
                  className="w-full font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {jdText.length} characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Status */}
          <Card>
            <CardHeader>
              <CardTitle>Job Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant={status === 'active' ? 'secondary' : status === 'paused' ? 'outline' : 'default'}>
                  {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Updated</span>
                <span className="text-sm">
                  {new Date(job.updated_at || job.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Job ID</span>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {job.id.slice(0, 8)}...
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                View Applications
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Find Candidates
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Generate Interview Kit
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                Archive Job
              </Button>
            </CardContent>
          </Card>

          {/* AI Assistance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Use AI to improve your job description, suggest better wording, or update requirements.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={regenerateWithAI}
                disabled={regenerating}
              >
                {regenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4 mr-2" />
                )}
                Improve with AI
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
