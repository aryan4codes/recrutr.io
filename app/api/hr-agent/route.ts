import { NextRequest } from 'next/server'
import { generateObject } from 'ai'
import { models } from '@/lib/ai'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    // Define the structured schema for job requirements
    const jobSchema = z.object({
      role_title: z.string().describe('Extracted job title (e.g., Senior Backend Engineer)'),
      location: z.string().describe('Job location (use "not provided" if not mentioned)'),
      level: z.string().describe('Experience level (use "not provided" if not mentioned)'),
      description: z.string().describe('Complete job description including summary, responsibilities, and qualifications')
    })

    const result = await generateObject({
      model: models.normal,
      schema: jobSchema,
      schemaName: 'JobRequirements',
      schemaDescription: 'Structured job requirements extracted from natural language input',
      system: `You are an expert HR assistant that parses job requirements and returns structured job information.

Experience Level Mapping:
- 0-2 years → "Entry-level"
- 2-4 years → "Mid-level" 
- 4-7 years → "Senior"
- 7+ years → "Staff/Principal"

IMPORTANT OUTPUT FORMAT:
- role_title: Extract or generate appropriate job title
- location: Extract location or return "not provided"
- level: Extract experience level or return "not provided"
- description: Generate a comprehensive job description that includes:
  * Job summary
  * Key responsibilities 
  * Required qualifications
  * Preferred skills
  * Any other relevant details

If any field cannot be determined from the input, return "not provided" for that field.`,
      prompt: `Parse the following job requirements and extract structured information:

"${prompt}"

Return the information in the exact format specified with proper field names: role_title, location, level, and description.`
    })

    return new Response(JSON.stringify({
      response: 'Job requirements parsed successfully',
      structuredData: result.object,
      usage: result.usage
    }), { 
      headers: { 'content-type': 'application/json' } 
    })
  } catch (error) {
    console.error('HR Agent error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      structuredData: null 
    }), { 
      status: 500,
      headers: { 'content-type': 'application/json' } 
    })
  }
}
