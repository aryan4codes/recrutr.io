import { supabaseAdmin } from './supabase-admin'

export async function searchCandidates(jobId: string, topK = 30) {
  const { data, error } = await supabaseAdmin.rpc('search_candidates', { 
    job: jobId, 
    k: topK 
  })
  
  if (error) throw error
  return data
}

export async function upsertJobEmbedding(jobId: string, embedding: number[]) {
  const { error } = await supabaseAdmin
    .from('jobs')
    .update({ jd_embedding: `[${embedding.join(',')}]` })
    .eq('id', jobId)
  
  if (error) throw error
}

export async function upsertCandidateEmbedding(candidateId: string, embedding: number[]) {
  const { error } = await supabaseAdmin
    .from('candidates')
    .update({ resume_embedding: `[${embedding.join(',')}]` })
    .eq('id', candidateId)
  
  if (error) throw error
}
