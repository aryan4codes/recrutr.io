'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Users, X, CheckCircle, AlertCircle } from 'lucide-react'

type UploadMode = 'text' | 'single' | 'bulk'
type FileStatus = 'pending' | 'processing' | 'completed' | 'error'

interface UploadFile {
  file: File
  id: string
  status: FileStatus
  result?: any
  error?: string
}

export default function UploadResumePage() {
  const [mode, setMode] = useState<UploadMode>('text')
  const [resumeText, setResumeText] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  // File upload states
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [bulkResults, setBulkResults] = useState<any[]>([])
  
  const router = useRouter()

  // File processing functions
  const processFileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string)
        } else {
          reject('Failed to read file')
        }
      }
      reader.onerror = () => reject('Error reading file')
      reader.readAsDataURL(file)
    })
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject('Failed to read file as text')
        }
      }
      reader.onerror = () => reject('Error reading file')
      
      if (file.type === 'text/plain') {
        reader.readAsText(file)
      } else {
        // For now, just read as text. In production, you'd want proper PDF/DOC parsing
        reader.readAsText(file)
      }
    })
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type === 'text/plain' || 
      file.type === 'application/pdf' ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx')
    )

    const newFiles: UploadFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    }))

    if (mode === 'single' && newFiles.length > 0) {
      setUploadFiles([newFiles[0]]) // Only keep first file for single mode
    } else {
      setUploadFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id))
  }

  async function processResume() {
    if (!resumeText.trim()) {
      alert('Please provide resume text')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/tools/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeText,
          candidate_name: candidateName || undefined,
          candidate_email: candidateEmail || undefined
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
        alert(`Candidate profile created! ID: ${data.candidate.id}`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error processing resume:', error)
      alert('Failed to process resume')
    } finally {
      setProcessing(false)
    }
  }

  async function processSingleFile() {
    if (uploadFiles.length === 0) {
      alert('Please upload a file first')
      return
    }

    const file = uploadFiles[0]
    setProcessing(true)
    
    try {
      // Update file status to processing
      setUploadFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing' as FileStatus } : f
      ))

      // For PDF and supported files, send as FormData to new OpenAI responses API
      if (file.file.type === 'application/pdf' || file.file.type.includes('doc')) {
        const formData = new FormData()
        formData.append('file', file.file)
        if (candidateName) formData.append('candidate_name', candidateName)
        if (candidateEmail) formData.append('candidate_email', candidateEmail)
        
        const response = await fetch('/api/tools/parse-resume', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        
        if (response.ok) {
          setUploadFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'completed' as FileStatus, result: data } : f
          ))
          setResult(data)
          alert(`Candidate profile created! ID: ${data.candidate.id}`)
        } else {
          setUploadFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error' as FileStatus, error: data.error } : f
          ))
          alert(`Error: ${data.error}`)
        }
      } else {
        // For text files, extract text first
        const resumeText = await extractTextFromFile(file.file)
        
        const response = await fetch('/api/tools/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_text: resumeText,
            candidate_name: candidateName || undefined,
            candidate_email: candidateEmail || undefined
          })
        })

        const data = await response.json()
        
        if (response.ok) {
          setUploadFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'completed' as FileStatus, result: data } : f
          ))
          setResult(data)
          alert(`Candidate profile created! ID: ${data.candidate.id}`)
        } else {
          setUploadFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error' as FileStatus, error: data.error } : f
          ))
          alert(`Error: ${data.error}`)
        }
      }
    } catch (error) {
      console.error('Error processing file:', error)
      setUploadFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'error' as FileStatus, error: 'Failed to process file' } : f
      ))
      alert('Failed to process file')
    } finally {
      setProcessing(false)
    }
  }

  async function processBulkFiles() {
    if (uploadFiles.length === 0) {
      alert('Please upload files first')
      return
    }

    setBulkProcessing(true)
    const results: any[] = []

    for (const file of uploadFiles) {
      try {
        // Update file status to processing
        setUploadFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'processing' as FileStatus } : f
        ))

        let response: Response

        // For PDF and supported files, send as FormData to new OpenAI responses API
        if (file.file.type === 'application/pdf' || file.file.type.includes('doc')) {
          const formData = new FormData()
          formData.append('file', file.file)
          
          response = await fetch('/api/tools/parse-resume', {
            method: 'POST',
            body: formData
          })
        } else {
          // For text files, extract text first
          const resumeText = await extractTextFromFile(file.file)
          
          response = await fetch('/api/tools/parse-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText })
          })
        }

        const data = await response.json()
        
        if (response.ok) {
          setUploadFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'completed' as FileStatus, result: data } : f
          ))
          results.push({ ...data, filename: file.file.name })
        } else {
          setUploadFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error' as FileStatus, error: data.error } : f
          ))
        }
      } catch (error) {
        console.error('Error processing file:', file.file.name, error)
        setUploadFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'error' as FileStatus, error: 'Failed to process file' } : f
        ))
      }
    }

    setBulkResults(results)
    setBulkProcessing(false)
    alert(`Processed ${results.length} candidates successfully!`)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Resumes</h1>
        <p className="text-muted-foreground">
          Add candidates to your database by uploading resumes or entering text manually
        </p>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Method</CardTitle>
          <CardDescription>Choose how you want to add candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={mode === 'text' ? 'default' : 'outline'}
              onClick={() => setMode('text')}
              className="h-auto p-4 flex-col gap-2"
            >
              <FileText className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Manual Text</div>
                <div className="text-xs text-muted-foreground">Paste resume text</div>
              </div>
            </Button>
            
            <Button
              variant={mode === 'single' ? 'default' : 'outline'}
              onClick={() => setMode('single')}
              className="h-auto p-4 flex-col gap-2"
            >
              <Upload className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Single Upload</div>
                <div className="text-xs text-muted-foreground">Upload one resume file</div>
              </div>
            </Button>
            
            <Button
              variant={mode === 'bulk' ? 'default' : 'outline'}
              onClick={() => setMode('bulk')}
              className="h-auto p-4 flex-col gap-2"
            >
              <Users className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Bulk Upload</div>
                <div className="text-xs text-muted-foreground">Upload multiple resumes</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'text' && 'Resume Information'}
              {mode === 'single' && 'Single Resume Upload'}
              {mode === 'bulk' && 'Bulk Resume Upload'}
            </CardTitle>
            <CardDescription>
              {mode === 'text' && 'Provide the candidate\'s resume text and basic information'}
              {mode === 'single' && 'Upload a single resume file to create one candidate profile'}
              {mode === 'bulk' && 'Upload multiple resume files to create a candidate pipeline'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === 'text' && (
              <>
                <div>
                  <label className="text-sm font-medium">Candidate Name (Optional)</label>
                  <Input
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Will be extracted from resume if not provided"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email (Optional)</label>
                  <Input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="Will be extracted from resume if not provided"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Resume Text</label>
                  <Textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={12}
                    placeholder="Paste the resume text here..."
                  />
                </div>

                <Button 
                  onClick={processResume} 
                  disabled={!resumeText.trim() || processing}
                  className="w-full"
                >
                  {processing ? 'Processing...' : 'Process Resume'}
                </Button>
              </>
            )}

            {(mode === 'single' || mode === 'bulk') && (
              <>
                {(mode === 'single') && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Candidate Name (Optional)</label>
                      <Input
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="Will be extracted from resume if not provided"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Email (Optional)</label>
                      <Input
                        type="email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="Will be extracted from resume if not provided"
                      />
                    </div>
                  </>
                )}

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {mode === 'single' ? 'Drop resume file here' : 'Drop resume files here'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF, DOC, DOCX, and TXT files
                  </p>
                  <input
                    type="file"
                    multiple={mode === 'bulk'}
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Choose Files
                    </label>
                  </Button>
                </div>

                {/* File List */}
                {uploadFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Uploaded Files</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadFiles.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 p-2 border rounded">
                          <div className="flex-1 text-sm truncate">{file.file.name}</div>
                          <div className="flex items-center gap-1">
                            {file.status === 'pending' && <div className="w-2 h-2 bg-gray-400 rounded-full" />}
                            {file.status === 'processing' && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
                            {file.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {file.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mode === 'single' && (
                  <Button 
                    onClick={processSingleFile} 
                    disabled={uploadFiles.length === 0 || processing}
                    className="w-full"
                  >
                    {processing ? 'Processing...' : 'Process Resume'}
                  </Button>
                )}

                {mode === 'bulk' && (
                  <Button 
                    onClick={processBulkFiles} 
                    disabled={uploadFiles.length === 0 || bulkProcessing}
                    className="w-full"
                  >
                    {bulkProcessing ? 'Processing Files...' : `Process ${uploadFiles.length} Resumes`}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              {mode === 'bulk' ? 'Candidate pipeline creation progress' : 'Extracted information and candidate profile'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'bulk' ? (
              <div className="space-y-4">
                {bulkResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Process resumes to see candidate pipeline here
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-medium">
                      Created {bulkResults.length} candidate profiles
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {bulkResults.map((result, index) => (
                        <div key={index} className="p-3 border rounded text-sm">
                          <div className="font-medium">{result.filename}</div>
                          <div className="text-muted-foreground">
                            {result.candidate.name || 'Name not found'} • {result.candidate.email || 'Email not found'}
                          </div>
                          <div className="text-xs text-muted-foreground">ID: {result.candidate.id}</div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={() => router.push('/candidates')}
                      className="w-full"
                    >
                      View All Candidates
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div>
                {!result ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Process a resume to see extracted information here
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Candidate Profile</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <div><strong>ID:</strong> {result.candidate.id}</div>
                        <div><strong>Name:</strong> {result.candidate.name || 'Not found'}</div>
                        <div><strong>Email:</strong> {result.candidate.email || 'Not found'}</div>
                        <div><strong>Phone:</strong> {result.candidate.phone || 'Not found'}</div>
                      </div>
                      
                      {result.missing_fields && result.missing_fields.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Missing Information</span>
                          </div>
                          <p className="text-xs text-yellow-700 mb-2">
                            Please manually add the following information to complete the profile:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.missing_fields.map((field: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.additional_info && Object.keys(result.additional_info).length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-green-800 mb-2">Additional Information Extracted</h4>
                          <div className="space-y-1 text-xs">
                            {result.additional_info.location && (
                              <div><strong>Location:</strong> {result.additional_info.location}</div>
                            )}
                            {result.additional_info.linkedin && (
                              <div><strong>LinkedIn:</strong> <a href={result.additional_info.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.additional_info.linkedin}</a></div>
                            )}
                            {result.additional_info.portfolio && (
                              <div><strong>Portfolio:</strong> <a href={result.additional_info.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.additional_info.portfolio}</a></div>
                            )}
                            {result.additional_info.summary && (
                              <div><strong>Summary:</strong> <span className="text-gray-600">{result.additional_info.summary}</span></div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {result.structured_data?.skills?.length > 0 && (
                      <div>
                        <h3 className="font-medium">Extracted Skills</h3>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.structured_data.skills.map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.structured_data?.experience?.length > 0 && (
                      <div>
                        <h3 className="font-medium">Work Experience</h3>
                        <div className="mt-2 space-y-2">
                          {result.structured_data.experience.slice(0, 3).map((exp: any, index: number) => (
                            <div key={index} className="text-sm border rounded p-2">
                              <div className="font-medium">{exp.position} at {exp.company}</div>
                              <div className="text-muted-foreground text-xs">{exp.duration}</div>
                            </div>
                          ))}
                          {result.structured_data.experience.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{result.structured_data.experience.length - 3} more positions
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {result.structured_data?.education?.length > 0 && (
                      <div>
                        <h3 className="font-medium">Education</h3>
                        <div className="mt-2 space-y-1">
                          {result.structured_data.education.slice(0, 2).map((edu: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                              <div className="text-muted-foreground text-xs">{edu.institution} {edu.year && `(${edu.year})`}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button 
                        onClick={() => router.push('/candidates')}
                        className="w-full"
                      >
                        View All Candidates
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
