import { embed } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function embedTexts(texts: string[]) {
  const vectors: number[][] = []
  
  for (const text of texts) {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-large'),
      value: text,
    })
    vectors.push(embedding)
  }
  
  return vectors
}

export async function embedText(text: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-large'),
    value: text,
  })
  
  return embedding
}
