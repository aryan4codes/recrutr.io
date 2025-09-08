import { NextRequest } from 'next/server'
import OpenAI from "openai"
import { supabaseAdmin } from '@/lib/supabase-admin'
import { embedText } from '@/lib/embeddings'
import { upsertCandidateEmbedding } from '@/lib/vector'
import { z } from 'zod'

const openai = new OpenAI()

// Schema for structured resume parsing - simplified to match typical database structure
const ResumeSchema = z.object({
  personal_info: z.object({
    name: z.string().describe('Full name of the candidate'),
    email: z.string().email().optional().describe('Email address if found'),
    phone: z.string().optional().describe('Phone number if found'),
    location: z.string().describe('Location/address (use "not provided" if not found)'),
    linkedin: z.string().describe('LinkedIn profile URL (use "not provided" if not found)'),
    portfolio: z.string().describe('Portfolio/website URL (use "not provided" if not found)')
  }),
  summary: z.string().describe('Professional summary or objective (use "not provided" if not found)'),
  experience: z.array(z.object({
    company: z.string().describe('Company name'),
    position: z.string().describe('Job title/position'),
    duration: z.string().describe('Employment duration (e.g., 2020-2023)'),
    description: z.string().optional().describe('Job description and achievements')
  })).describe('Work experience entries'),
  education: z.array(z.object({
    institution: z.string().describe('Educational institution name'),
    degree: z.string().describe('Degree or qualification'),
    field: z.string().optional().describe('Field of study'),
    year: z.string().optional().describe('Graduation year or duration')
  })).describe('Education entries'),
  skills: z.array(z.string()).describe('Technical and professional skills'),
  projects: z.array(z.object({
    name: z.string().describe('Project name'),
    description: z.string().describe('Project description'),
    technologies: z.array(z.string()).optional().describe('Technologies used')
  })).optional().describe('Notable projects'),
  certifications: z.array(z.string()).optional().describe('Professional certifications'),
  languages: z.array(z.string()).optional().describe('Languages spoken')
})

// Sanitize text to avoid JSON/Unicode issues
function sanitizeText(raw: string): string {
  if (!raw) return ''
  let cleaned = raw.normalize('NFC')
  cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
  cleaned = cleaned.replace(/\u0000/g, '')
  cleaned = cleaned.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '�')
  return cleaned
}

async function parseResumeWithOpenAI(content: string | { type: string, file_url: string }): Promise<z.infer<typeof ResumeSchema>> {
  const prompt = `You are an expert resume parser. Extract structured information from the provided resume content.

IMPORTANT: 
- Extract all available information accurately from the content
- For skills, include both technical and soft skills
- For experience, capture company, position, duration, and key achievements
- For education, include institution, degree, field of study, and graduation details
- If information is missing or unclear, return "not provided" for that specific field
- For optional arrays, return empty arrays if no data is found
- Return only valid, structured data in the exact JSON format specified

Please parse the resume and extract the following information in JSON format:
{
  "personal_info": {
    "name": "string",
    "email": "string (optional)",
    "phone": "string (optional)", 
    "location": "string",
    "linkedin": "string",
    "portfolio": "string"
  },
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "position": "string", 
      "duration": "string",
      "description": "string (optional)"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string (optional)",
      "year": "string (optional)"
    }
  ],
  "skills": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"] 
    }
  ],
  "certifications": ["string"],
  "languages": ["string"]
}`

  let input: any[]
  
  if (typeof content === 'string') {
    input = [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_text", text: `Resume content: ${content}` }
        ]
      }
    ]
  } else {
    input = [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { 
            type: "input_file",
            file_url: content.file_url
          }
        ]
      }
    ]
  }

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input
  })

  if (response.status !== "completed" || !response.output?.[0]) {
    throw new Error('Failed to get response from OpenAI')
  }

  const outputItem = response.output[0] as any
  if (!outputItem.content?.[0]?.text) {
    throw new Error('No text content in response')
  }

  const text = outputItem.content[0].text
  
  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in response')
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return ResumeSchema.parse(parsed)
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    throw new Error('Failed to parse structured data from response')
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type')
    
    let parsedResume: z.infer<typeof ResumeSchema>
    let candidateName: string | undefined
    let candidateEmail: string | undefined

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload with proper PDF support
      const formData = await req.formData()
      const file = formData.get('file') as File
      candidateName = formData.get('candidate_name') as string || undefined
      candidateEmail = formData.get('candidate_email') as string || undefined

      if (!file) {
        return new Response(JSON.stringify({ 
          error: 'No file provided' 
        }), { 
          status: 400,
          headers: { 'content-type': 'application/json' }
        })
      }

      // Convert file to base64 data URL for OpenAI
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const charArray = Array.from(uint8Array, byte => String.fromCharCode(byte))
      const binaryString = charArray.join('')
      const base64Data = btoa(binaryString)
      const fileDataUrl = `data:${file.type};base64,${base64Data}`

      // Process file with OpenAI responses API
      parsedResume = await parseResumeWithOpenAI({
        type: "input_file",
        file_url: fileDataUrl
      })
    } else {
      // Handle JSON request with text
      const body = await req.json()
      const resumeText = body.resume_text
      candidateName = body.candidate_name
      candidateEmail = body.candidate_email

      if (!resumeText) {
        return new Response(JSON.stringify({ 
          error: 'No resume text provided' 
        }), { 
          status: 400,
          headers: { 'content-type': 'application/json' }
        })
      }

      // Process text with OpenAI responses API
      const sanitizedText = sanitizeText(resumeText)
      parsedResume = await parseResumeWithOpenAI(sanitizedText)
    }

    // Create candidate record with only basic fields that likely exist in database
    const candidateData = {
      name: candidateName || parsedResume.personal_info.name,
      email: candidateEmail || parsedResume.personal_info.email,
      phone: parsedResume.personal_info.phone,
      resume_text: 'Parsed from uploaded file or text'
    }

    const { data: candidate, error } = await supabaseAdmin
      .from('candidates')
      .insert(candidateData)
      .select('*')
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    // Track any missing fields that couldn't be stored in the database
    const missingFields: string[] = []
    const additionalInfo: any = {}

    // Store additional info that might not be in the database
    if (parsedResume.personal_info.location && parsedResume.personal_info.location !== 'not provided') {
      additionalInfo.location = parsedResume.personal_info.location
    } else {
      missingFields.push('Location')
    }

    if (parsedResume.personal_info.linkedin && parsedResume.personal_info.linkedin !== 'not provided') {
      additionalInfo.linkedin = parsedResume.personal_info.linkedin
    } else {
      missingFields.push('LinkedIn')
    }

    if (parsedResume.personal_info.portfolio && parsedResume.personal_info.portfolio !== 'not provided') {
      additionalInfo.portfolio = parsedResume.personal_info.portfolio
    } else {
      missingFields.push('Portfolio')
    }

    if (parsedResume.summary && parsedResume.summary !== 'not provided') {
      additionalInfo.summary = parsedResume.summary
    } else {
      missingFields.push('Summary')
    }

    // Store skills
    if (parsedResume.skills.length > 0) {
      const skillInserts = parsedResume.skills.map(skill => ({
        candidate_id: candidate.id,
        skill: skill.trim(),
        source: 'ai_parser'
      }))

      await supabaseAdmin
        .from('candidate_skills')
        .insert(skillInserts)
    }

    // Store experience
    if (parsedResume.experience.length > 0) {
      const experienceInserts = parsedResume.experience.map(exp => ({
        candidate_id: candidate.id,
        company: exp.company,
        position: exp.position,
        duration: exp.duration,
        description: exp.description
      }))

      const { error } = await supabaseAdmin
        .from('candidate_experience')
        .insert(experienceInserts)

      if (error) {
        console.error('Failed to store experience:', error)
      }
    }

    // Store education
    if (parsedResume.education.length > 0) {
      const educationInserts = parsedResume.education.map(edu => ({
        candidate_id: candidate.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        year: edu.year
      }))

      const { error } = await supabaseAdmin
        .from('candidate_education')
        .insert(educationInserts)

      if (error) {
        console.error('Failed to store education:', error)
      }
    }

    // Generate and store embedding from the structured data
    try {
      const embeddingText = [
        parsedResume.personal_info.name,
        parsedResume.summary,
        parsedResume.skills.join(' '),
        parsedResume.experience.map(exp => `${exp.position} at ${exp.company}`).join(' '),
        parsedResume.education.map(edu => `${edu.degree} from ${edu.institution}`).join(' ')
      ].filter(Boolean).join(' ')

      const embedding = await embedText(embeddingText)
      await upsertCandidateEmbedding(candidate.id, embedding)
    } catch (embeddingError) {
      console.error('Failed to generate embedding:', embeddingError)
    }

    return new Response(JSON.stringify({ 
      candidate,
      structured_data: parsedResume,
      additional_info: additionalInfo,
      missing_fields: missingFields,
      success: true,
      message: missingFields.length > 0 
        ? `Candidate created successfully. Please manually fill: ${missingFields.join(', ')}`
        : 'Candidate created successfully with all available information'
    }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Parse resume error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to parse resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
