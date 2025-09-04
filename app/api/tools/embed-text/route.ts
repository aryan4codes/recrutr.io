import { NextRequest } from 'next/server'
import { embedTexts, embedText } from '@/lib/embeddings'
import { z } from 'zod'

const EmbedSchema = z.object({
  texts: z.array(z.string()).optional(),
  text: z.string().optional()
}).refine(data => data.texts || data.text, {
  message: "Either 'texts' or 'text' must be provided"
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { texts, text } = EmbedSchema.parse(body)

    if (texts) {
      const vectors = await embedTexts(texts)
      return new Response(JSON.stringify({ vectors }), {
        headers: { 'content-type': 'application/json' }
      })
    } else {
      const vector = await embedText(text!)
      return new Response(JSON.stringify({ vector }), {
        headers: { 'content-type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('Embed text error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate embeddings' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}
