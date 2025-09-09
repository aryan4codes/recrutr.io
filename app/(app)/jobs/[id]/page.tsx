'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase-client'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Users, Calendar, MapPin, Building, Briefcase } from 'lucide-react'
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

export default function ViewJobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

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
      
    } catch (error) {
      console.error('Error loading job:', error)
      alert('Error loading job. Please try again.')
      router.push('/jobs')
    } finally {
      setLoading(false)
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
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-gray-600">
              Created: {new Date(job.created_at).toLocaleDateString()}
              {job.updated_at && job.updated_at !== job.created_at && (
                <span> • Updated: {new Date(job.updated_at).toLocaleDateString()}</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/jobs/${job.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Job
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Complete role description and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {job.jd_text}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{job.location}</div>
                  </div>
                </div>
              )}

              {job.level && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Level</div>
                    <div className="font-medium">{job.level}</div>
                  </div>
                </div>
              )}

              {job.department && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Department</div>
                    <div className="font-medium">{job.department}</div>
                  </div>
                </div>
              )}

              {job.employment_type && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Employment Type</div>
                    <div className="font-medium capitalize">{job.employment_type}</div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="text-sm text-gray-500 mb-2">Status</div>
                <Badge variant={job.status === 'active' ? 'secondary' : job.status === 'paused' ? 'outline' : 'default'}>
                  {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Active'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                View Applications
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Find Candidates
              </Button>
              <Link href={`/jobs/${job.id}/edit`}>
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                Archive Job
              </Button>
            </CardContent>
          </Card>

          {/* Job Meta */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Job ID</span>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {job.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
              {job.updated_at && job.updated_at !== job.created_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm">
                    {new Date(job.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
