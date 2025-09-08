'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function NewJobPage() {
  const [idea, setIdea] = useState('Need a Backend Engineer (3–5 yrs) with Node.js and PostgreSQL experience for payments team...')
  const [jd, setJd] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [level, setLevel] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [showMissingFieldsPopup, setShowMissingFieldsPopup] = useState(false)
  
  const router = useRouter()

  async function generateJD() {
    setGenerating(true)
    try {
      const response = await fetch('/api/hr-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: idea
        })
      })

      const data = await response.json()
      console.log('HR Agent Response:', data) // For debugging
      
      // Extract structured data from the response
      const jobData = data.structuredData
      
      if (jobData) {
        // Check for missing critical fields using new field names
        const missing: string[] = []
        if (!jobData.role_title || jobData.role_title.trim() === '' || jobData.role_title === 'not provided') {
          missing.push('Job Title')
        }
        if (!jobData.level || jobData.level.trim() === '' || jobData.level === 'not provided') {
          missing.push('Experience Level')
        }
        if (!jobData.location || jobData.location.trim() === '' || jobData.location === 'not provided') {
          missing.push('Location')
        }
        
        // Auto-populate fields with new field names
        setTitle(jobData.role_title && jobData.role_title !== 'not provided' ? jobData.role_title : '')
        setLevel(jobData.level && jobData.level !== 'not provided' ? jobData.level : '')
        setLocation(jobData.location && jobData.location !== 'not provided' ? jobData.location : '')
        
        // Show popup if fields are missing
        if (missing.length > 0) {
          setMissingFields(missing)
          setShowMissingFieldsPopup(true)
        }
        
        // Use the complete description from the new format
        setJd(jobData.description || 'Failed to generate job description')
      } else {
        // Fallback to basic response or show error
        setJd(data.error || 'Failed to generate job description. Please try again.')
      }
      
    } catch (error) {
      console.error('Error generating JD:', error)
      setJd('Error generating job description. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function saveJob() {
    if (!title || !jd) {
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
            title,
            jd_text: jd,
            location: location || null,
            level: level || null
            // created_by is optional and will be null until user auth is implemented
          }
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`Job created successfully! ID: `)
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

  return (
    <div className="p-6 space-y-6">
      {/* Missing Fields Popup */}
      {showMissingFieldsPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Missing Information</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              The AI couldn't extract the following fields from your job description. Please fill them manually:
            </p>
            
            <ul className="list-disc list-inside mb-6 space-y-1">
              {missingFields.map((field, index) => (
                <li key={index} className="text-gray-700">
                  <span className="font-medium text-red-600">{field}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowMissingFieldsPopup(false)}
                className="flex-1"
              >
                Got it, I'll fill them
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">Job Description Architect</h1>
        <p className="text-muted-foreground">
          Describe your hiring need and let AI craft a professional job description
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Job Requirements</CardTitle>
            <CardDescription>
              Describe what you're looking for in natural language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Job Idea</label>
              <Textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={6}
                placeholder="Describe the role, required skills, experience level, team, etc..."
              />
            </div>
            
            <Button 
              onClick={generateJD} 
              disabled={!idea.trim() || generating}
              className="w-full"
            >
              {generating ? 'Generating...' : 'Generate Job Description'}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Job Description</CardTitle>
            <CardDescription>
              Review and edit the AI-generated job description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Job Title
                {missingFields.includes('Job Title') && (
                  <span className="text-red-500 ml-1">* (Please fill this field)</span>
                )}
              </label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  // Clear missing field indicator when user fills it
                  if (e.target.value.trim() && missingFields.includes('Job Title')) {
                    setMissingFields(prev => prev.filter(field => field !== 'Job Title'))
                  }
                }}
                placeholder="e.g. Senior Backend Engineer"
                className={missingFields.includes('Job Title') ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Location
                  {missingFields.includes('Location') && (
                    <span className="text-red-500 ml-1">* (Please fill this field)</span>
                  )}
                </label>
                <Input
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value)
                    // Clear missing field indicator when user fills it
                    if (e.target.value.trim() && missingFields.includes('Location')) {
                      setMissingFields(prev => prev.filter(field => field !== 'Location'))
                    }
                  }}
                  placeholder="e.g. San Francisco, Remote"
                  className={missingFields.includes('Location') ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Level
                  {missingFields.includes('Experience Level') && (
                    <span className="text-red-500 ml-1">* (Please fill this field)</span>
                  )}
                </label>
                <Input
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value)
                    // Clear missing field indicator when user fills it
                    if (e.target.value.trim() && missingFields.includes('Experience Level')) {
                      setMissingFields(prev => prev.filter(field => field !== 'Experience Level'))
                    }
                  }}
                  placeholder="e.g. Senior, SDE-2"
                  className={missingFields.includes('Experience Level') ? 'border-red-300 focus:border-red-500' : ''}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Job Description</label>
              <Textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={16}
                placeholder="Generated job description will appear here..."
              />
            </div>

            <Button 
              onClick={saveJob} 
              disabled={!jd || !title || saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save Job'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
