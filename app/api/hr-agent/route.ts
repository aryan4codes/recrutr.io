import { NextRequest } from 'next/server'
import { generateText, generateObject, tool } from 'ai'
import { models } from '@/lib/ai'
import { searchCandidates } from '@/lib/vector'
import { Database } from '@/lib/db'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    const result = await generateText({
      model: models.small,
      system: `You are a recruiting copilot AI assistant. You help with various recruiting tasks:

1. **Job Creation**: When given job requirements text, use the parse_job_requirements tool to extract structured information like job title, experience level, skills, and generate a comprehensive job description.

2. **Candidate Search**: Use vector_search to find matching candidates for job positions.

3. **Data Retrieval**: Get detailed information about jobs and candidates using the appropriate tools.

IMPORTANT: When returning job descriptions, return ONLY the clean job description content without any preamble, explanatory text, or markdown formatting. Do not include phrases like "Here is the structured information..." or "This comprehensive job description...". Just return the job content directly.

Always be concise, actionable, and return structured data through the answer tool. When parsing job requirements, extract ALL relevant details including experience level mapping (3-5 years → "Mid-level"), location, skills, and generate professional content.`,
      maxSteps: 8,
      tools: {
        vector_search: tool({
          description: 'Return top candidates for a job id',
          parameters: z.object({
            job_id: z.string().describe('The job ID to search candidates for'),
            topK: z.number().optional().describe('Number of top candidates to return')
          }),
          execute: async ({ job_id, topK = 30 }) => {
            const candidates = await searchCandidates(job_id, topK)
            return { candidates }
          }
        }),
        
        get_job_details: tool({
          description: 'Get details about a specific job',
          parameters: z.object({
            job_id: z.string().describe('The job ID to get details for')
          }),
          execute: async ({ job_id }) => {
            const job = await Database.getJob(job_id)
            return { job }
          }
        }),

        get_candidate_details: tool({
          description: 'Get details about a specific candidate',
          parameters: z.object({
            candidate_id: z.string().describe('The candidate ID to get details for')
          }),
          execute: async ({ candidate_id }) => {
            const candidate = await Database.getCandidate(candidate_id)
            return { candidate }
          }
        }),

        parse_job_requirements: tool({
          description: 'Parse job requirements text and generate structured job information',
          parameters: z.object({
            requirements_text: z.string().describe('The raw job requirements text to parse')
          }),
          execute: async ({ requirements_text }) => {
            const jobSchema = z.object({
              job_title: z.string().describe('Extracted job title (e.g., Senior Backend Engineer)'),
              level: z.string().describe('Experience level (e.g., Junior, Mid-level, Senior, Staff, Principal)'),
              location: z.string().nullable().optional().describe('Job location if mentioned (e.g., San Francisco, Remote, Hybrid)'),
              experience_years: z.string().nullable().optional().describe('Years of experience mentioned (e.g., 3-5 years, 5+ years)'),
              required_skills: z.array(z.string()).describe('List of required technical skills'),
              preferred_skills: z.array(z.string()).describe('List of preferred/nice-to-have skills'),
              team_department: z.string().nullable().optional().describe('Team or department mentioned'),
              job_summary: z.string().describe('Brief 2-3 sentence summary of the role'),
              key_responsibilities: z.array(z.string()).describe('List of 4-6 key responsibilities'),
              qualifications: z.array(z.string()).describe('List of required qualifications'),
              company_benefits: z.array(z.string()).optional().describe('Any benefits or perks mentioned')
            })

            const result = await generateObject({
              model: models.normal,
              schema: jobSchema,
              system: `You are an expert HR assistant that parses job requirements and extracts structured information.

Experience Level Mapping:
- 0-2 years → "Junior" or "Entry-level"
- 2-4 years → "Mid-level" 
- 4-7 years → "Senior"
- 7+ years → "Staff" or "Principal"

IMPORTANT: For optional fields (location, experience_years, team_department):
- If information is not available, omit the field entirely or use undefined
- Do NOT use null values
- If location is not mentioned, omit the location field
- If team/department is not mentioned, omit the team_department field

Extract all relevant information from the job requirements text and generate a comprehensive, well-structured job posting.`,
              prompt: `Parse the following job requirements and extract structured information:

"${requirements_text}"

Make sure to:
1. Extract the exact experience level mentioned and map it appropriately
2. Identify all technical skills, frameworks, and tools
3. Generate professional job responsibilities and qualifications
4. Create a compelling job summary
5. Include any team/department context

Return ONLY the structured data without any explanatory text or markdown formatting.`
            })

            return result.object
          }
        }),

        answer: tool({
          description: 'Return the final structured answer',
          parameters: z.object({
            action: z.string().describe('The action performed'),
            data: z.any().describe('The structured result data'),
            summary: z.string().describe('Human readable summary')
          }),
          execute: async ({ action, data, summary }) => {
            return { action, data, summary }
          }
        })
      },
      prompt
    })

    return new Response(JSON.stringify({
      response: result.text,
      toolResults: result.toolResults
    }), { 
      headers: { 'content-type': 'application/json' } 
    })
  } catch (error) {
    console.error('HR Agent error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' } 
    })
  }
}
