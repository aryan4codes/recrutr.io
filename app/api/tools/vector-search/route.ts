import { NextRequest } from 'next/server'
import { searchCandidates } from '@/lib/vector'
import { z } from 'zod'

const SearchSchema = z.object({
  job_id: z.string().uuid(),
  topK: z.number().optional().default(30)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_id, topK } = SearchSchema.parse(body)

    const rows = await searchCandidates(job_id, topK)
    
    return new Response(JSON.stringify({ rows }), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('Vector search error:', error)
    return new Response(JSON.stringify({ error: 'Search failed' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
