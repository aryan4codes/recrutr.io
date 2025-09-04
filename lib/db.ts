import { supabaseAdmin } from './supabase-admin'

export class Database {
  static async getJob(id: string) {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async getCandidate(id: string) {
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createApplication(jobId: string, candidateId: string, score?: number) {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        job_id: jobId,
        candidate_id: candidateId,
        score,
        stage: 'shortlisted'
      })
      .select('*')
      .single()
    
    if (error) throw error
    return data
  }

  static async updateApplicationScore(applicationId: string, score: number, explanation: any) {
    const { error } = await supabaseAdmin
      .from('applications')
      .update({
        score,
        explanation_json: explanation,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
    
    if (error) throw error
  }

  static async getInterviewers() {
    const { data, error } = await supabaseAdmin
      .from('interviewers')
      .select('*')
    
    if (error) throw error
    return data
  }

  static async logAuditEvent(actor: string, action: string, entity: string, entityId: string, payload: any) {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        actor,
        action,
        entity,
        entity_id: entityId,
        payload_json: payload
      })
    
    if (error) throw error
  }
}
