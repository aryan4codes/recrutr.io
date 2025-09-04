import { openai } from '@ai-sdk/openai'

export const models = {
  small: openai('gpt-4o-mini'),
  normal: openai('gpt-4o'),
}
