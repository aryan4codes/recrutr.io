import { NextRequest } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { embedText } from '@/lib/embeddings'
import { upsertCandidateEmbedding } from '@/lib/vector'
import { z } from 'zod'

const ResumeSchema = z.object({
  personal_info: z.object({
    name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    portfolio: z.string().optional().nullable()
  }),
  summary: z.string().optional().nullable(),
  experience: z.array(z.object({ 
    company: z.string(), 
    position: z.string(), 
    duration: z.string().optional().nullable(), 
    description: z.string().optional().nullable() 
  })).optional().default([]),
  education: z.array(z.object({ 
    institution: z.string(), 
    degree: z.string().optional().nullable(), 
    field: z.string().optional().nullable(), 
    year: z.string().optional().nullable() 
  })).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
})

function sanitizeText(raw: string): string {
  if (!raw) return ''
  return raw.normalize('NFC').replace(/\u0000/g, '')
}

async function parseTextWithOpenAI(content: string): Promise<z.infer<typeof ResumeSchema>> {
  const result = await generateObject({
    model: openai('gpt-4o'),
    messages: [
      { 
        role: 'user', 
        content: `Extract all information from this resume text and structure it properly:\n\n${content}` 
      }
    ],
    schema: ResumeSchema,
    temperature: 0.1,
  })
  
  return result.object
}

async function parsePDFWithOpenAI(file: File): Promise<z.infer<typeof ResumeSchema>> {
  console.log(`Processing PDF: ${file.name}, size: ${file.size}`)
  
  try {
    // Use the latest AI SDK with direct file support
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await generateObject({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this resume PDF and extract all information including personal details, work experience, education, and skills. Structure the data properly for a recruiting system.',
            },
            {
              type: 'file',
              data: buffer,
              mediaType: 'application/pdf',
            },
          ],
        },
      ],
      schema: ResumeSchema,
      temperature: 0.1,
    })

    console.log('Successfully parsed PDF with latest AI SDK')
    return result.object
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function GET() {
  return new Response(JSON.stringify({ 
    message: 'Parse resume API is working',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'content-type': 'application/json' }
  })
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    console.log('Request content type:', contentType)

    let parsedResume: z.infer<typeof ResumeSchema>
    let candidateName: string | undefined
    let candidateEmail: string | undefined

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      candidateName = (formData.get('candidate_name') as string) || undefined
      candidateEmail = (formData.get('candidate_email') as string) || undefined

      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), { 
          status: 400, 
          headers: { 'content-type': 'application/json' } 
        })
      }

      console.log(`Processing uploaded file: ${file.name}, type: ${file.type}, size: ${file.size}`)

      try {
        // Enable both PDF and text processing with the latest AI SDK
        if (file.type === 'application/pdf') {
          parsedResume = await parsePDFWithOpenAI(file)
        } else if (file.type === 'text/plain') {
          const text = await file.text()
          parsedResume = await parseTextWithOpenAI(sanitizeText(text))
        } else {
          return new Response(JSON.stringify({ 
            error: `Unsupported file type: ${file.type}. Please upload PDF or text files.` 
          }), { 
            status: 400, 
            headers: { 'content-type': 'application/json' } 
          })
        }
      } catch (aiError) {
        console.error('AI processing error:', aiError)
        return new Response(JSON.stringify({ 
          error: 'Failed to process file with AI', 
          details: aiError instanceof Error ? aiError.message : String(aiError) 
        }), { 
          status: 500, 
          headers: { 'content-type': 'application/json' } 
        })
      }
    } else {
      // Handle JSON request with text
      const body = await req.json()
      const resumeText = body.resume_text
      candidateName = body.candidate_name
      candidateEmail = body.candidate_email
      
      if (!resumeText) {
        return new Response(JSON.stringify({ error: 'No resume text provided' }), { 
          status: 400, 
          headers: { 'content-type': 'application/json' } 
        })
      }
      
      try {
        parsedResume = await parseTextWithOpenAI(sanitizeText(resumeText))
      } catch (aiError) {
        console.error('AI processing error:', aiError)
        return new Response(JSON.stringify({ 
          error: 'Failed to process text with AI', 
          details: aiError instanceof Error ? aiError.message : String(aiError) 
        }), { 
          status: 500, 
          headers: { 'content-type': 'application/json' } 
        })
      }
    }

    console.log('Successfully parsed resume data:', JSON.stringify(parsedResume, null, 2))

    // Use extracted name and email with priority to form data
    const finalName = candidateName || parsedResume.personal_info.name
    const finalEmail = candidateEmail || parsedResume.personal_info.email

    // Create a comprehensive summary
    const resumeSummary = [
      parsedResume.summary,
      parsedResume.experience.length > 0 ? 
        parsedResume.experience.map(exp => `${exp.position} at ${exp.company}`).slice(0, 3).join(', ') : null,
      parsedResume.education.length > 0 ? 
        parsedResume.education.map(edu => `${edu.degree || 'Degree'} from ${edu.institution}`).slice(0, 2).join(', ') : null
    ].filter(Boolean).join(' | ') || 'Professional resume'

    const candidateData: any = {
      name: finalName,
      email: finalEmail,
      phone: parsedResume.personal_info.phone || null,
      resume_text: resumeSummary,
      location: parsedResume.personal_info.location || null,
      linkedin: parsedResume.personal_info.linkedin || null,
      portfolio: parsedResume.personal_info.portfolio || null,
      summary: parsedResume.summary || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Inserting candidate data:', candidateData)

    const { data: candidate, error } = await supabaseAdmin
      .from('candidates')
      .insert(candidateData)
      .select('*')
      .single()
      
    if (error) {
      console.error('Database insertion error:', error)
      return new Response(JSON.stringify({ error: `Database error: ${error.message}` }), { 
        status: 400, 
        headers: { 'content-type': 'application/json' } 
      })
    }

    console.log('Successfully inserted candidate:', candidate.id)

    // Store related data in parallel
    const insertPromises = []

    // Store skills
    if (parsedResume.skills && parsedResume.skills.length > 0) {
      const skillsToInsert = parsedResume.skills.map(s => ({ 
        candidate_id: candidate.id, 
        skill: s.trim(), 
        source: 'ai_parser' 
      }))
      
      insertPromises.push(
        supabaseAdmin.from('candidate_skills').insert(skillsToInsert)
          .then(({ error }) => error && console.error('Skills insertion error:', error))
      )
    }

    // Store experience
    if (parsedResume.experience && parsedResume.experience.length > 0) {
      const experienceToInsert = parsedResume.experience.map(e => ({ 
        candidate_id: candidate.id, 
        company: e.company, 
        position: e.position, 
        duration: e.duration || null, 
        description: e.description || null 
      }))
      
      insertPromises.push(
        supabaseAdmin.from('candidate_experience').insert(experienceToInsert)
          .then(({ error }) => error && console.error('Experience insertion error:', error))
      )
    }

    // Store education
    if (parsedResume.education && parsedResume.education.length > 0) {
      const educationToInsert = parsedResume.education.map(ed => ({ 
        candidate_id: candidate.id, 
        institution: ed.institution, 
        degree: ed.degree || null, 
        field: ed.field || null, 
        year: ed.year || null 
      }))
      
      insertPromises.push(
        supabaseAdmin.from('candidate_education').insert(educationToInsert)
          .then(({ error }) => error && console.error('Education insertion error:', error))
      )
    }

    // Wait for all insertions to complete
    await Promise.all(insertPromises)

    // Generate embedding
    try {
      const embeddingText = [
        candidateData.name, 
        candidateData.summary, 
        (parsedResume.skills || []).join(' '), 
        (parsedResume.experience || []).map(e => `${e.position} at ${e.company} ${e.description || ''}`).join(' '),
        (parsedResume.education || []).map(e => `${e.degree || ''} ${e.field || ''} from ${e.institution}`).join(' ')
      ].filter(Boolean).join(' ')
      
      if (embeddingText.trim()) {
        const emb = await embedText(embeddingText)
        await upsertCandidateEmbedding(candidate.id, emb)
        console.log('Successfully generated and stored embedding')
      }
    } catch (e) {
      console.error('Embedding error (non-critical):', e)
    }

    return new Response(JSON.stringify({ 
      candidate, 
      structured_data: parsedResume, 
      success: true 
    }), { 
      headers: { 'content-type': 'application/json' } 
    })
  } catch (err) {
    console.error('Parse resume error:', err)
    return new Response(JSON.stringify({ 
      error: 'Failed to parse resume', 
      details: err instanceof Error ? err.message : String(err) 
    }), { 
      status: 500, 
      headers: { 'content-type': 'application/json' } 
    })
  }
}