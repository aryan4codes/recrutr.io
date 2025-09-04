import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { embedText } from '@/lib/embeddings'
import { upsertCandidateEmbedding } from '@/lib/vector'
import { z } from 'zod'

const ParseResumeSchema = z.object({
  file_url: z.string().url().optional(),
  resume_text: z.string().optional(),
  candidate_name: z.string().optional(),
  candidate_email: z.string().email().optional()
}).refine(data => data.file_url || data.resume_text, {
  message: "Either file_url or resume_text must be provided"
})

// Simple text-based parser (stub implementation)
function parseResumeText(text: string) {
  // Basic regex patterns for common resume elements
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  
  // Extract name (heuristic: first line or first few words)
  const lines = text.split('\n').filter(line => line.trim())
  const nameMatch = lines[0]?.match(/^([A-Za-z\s]{2,30})/)
  
  // Extract skills (look for common skill section headers)
  const skillsMatch = text.match(/(?:Skills?|Technologies?|Technical Skills?)[\s\n]*:?\s*([^\n]+(?:\n[^\n]+)*)/i)
  let skills: string[] = []
  
  if (skillsMatch) {
    skills = skillsMatch[1]
      .split(/[,\n•\-\|]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 30)
      .slice(0, 20) // Limit to 20 skills
  }

  return {
    name: nameMatch?.[1]?.trim() || null,
    email: emailMatch?.[0] || null,
    phone: phoneMatch?.[0] || null,
    skills,
    raw_text: text
  }
}

// Sanitize incoming text to avoid JSON/Unicode escape issues
function sanitizeResumeInput(raw: string): string {
  if (!raw) return ''
  // Normalize to NFC
  let cleaned = raw.normalize('NFC')
  // Replace any lone backslashes that are not valid JSON escapes
  cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
  // Remove NULL chars which Postgres rejects
  cleaned = cleaned.replace(/\u0000/g, '')
  // Replace unpaired surrogates
  cleaned = cleaned.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '�')
  return cleaned
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { file_url, resume_text, candidate_name, candidate_email } = ParseResumeSchema.parse(body)

    let textToParse = resume_text ? sanitizeResumeInput(resume_text) : undefined

    // If file_url provided, fetch and extract text (stub)
    if (file_url && !resume_text) {
      // In a real implementation, this would:
      // 1. Download the file from the URL
      // 2. Use PDF parsing libraries (pdf-parse, pdf2pic) or OCR
      // 3. Extract plain text
      
      // For now, return an error asking for text input
      return new Response(JSON.stringify({ 
        error: 'File parsing not implemented. Please provide resume_text directly.' 
      }), { 
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    if (!textToParse) {
      return new Response(JSON.stringify({ 
        error: 'No resume text provided' 
      }), { 
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    // Parse the resume text
    const parsed = parseResumeText(textToParse)

    // Create candidate record
    const candidateData = {
      name: candidate_name || parsed.name,
      email: candidate_email || parsed.email,
      phone: parsed.phone,
      resume_text: parsed.raw_text
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

    // Store skills
    if (parsed.skills.length > 0) {
      const skillInserts = parsed.skills.map(skill => ({
        candidate_id: candidate.id,
        skill,
        source: 'resume_parser'
      }))

      await supabaseAdmin
        .from('candidate_skills')
        .insert(skillInserts)
    }

    // Generate and store embedding
    try {
      const embedding = await embedText(parsed.raw_text)
      await upsertCandidateEmbedding(candidate.id, embedding)
    } catch (embeddingError) {
      console.error('Failed to generate embedding:', embeddingError)
      // Continue without embedding
    }

    return new Response(JSON.stringify({ 
      candidate,
      parsed_data: {
        skills: parsed.skills,
        extracted_name: parsed.name,
        extracted_email: parsed.email,
        extracted_phone: parsed.phone
      }
    }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Parse resume error:', error)
    return new Response(JSON.stringify({ error: 'Failed to parse resume' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
