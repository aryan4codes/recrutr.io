import { Database } from './db'

export interface AuditEvent {
  actor: string
  action: string
  entity: string
  entityId: string
  payload: any
  timestamp?: string
}

export class AuditLogger {
  static async log(event: AuditEvent): Promise<void> {
    try {
      await Database.logAuditEvent(
        event.actor,
        event.action,
        event.entity,
        event.entityId,
        event.payload
      )
    } catch (error) {
      console.error('Failed to log audit event:', error)
      // Don't throw - audit logging should not break the main flow
    }
  }

  static async logJobCreation(actorId: string, jobId: string, jobData: any): Promise<void> {
    await this.log({
      actor: actorId,
      action: 'CREATE_JOB',
      entity: 'job',
      entityId: jobId,
      payload: { jobData }
    })
  }

  static async logCandidateShortlist(actorId: string, jobId: string, candidates: any[]): Promise<void> {
    await this.log({
      actor: actorId,
      action: 'SHORTLIST_CANDIDATES',
      entity: 'job',
      entityId: jobId,
      payload: { 
        candidateCount: candidates.length,
        candidateIds: candidates.map(c => c.id)
      }
    })
  }

  static async logInterviewScheduled(actorId: string, applicationId: string, interviewData: any): Promise<void> {
    await this.log({
      actor: actorId,
      action: 'SCHEDULE_INTERVIEW',
      entity: 'application',
      entityId: applicationId,
      payload: { interviewData }
    })
  }

  static async logFeedbackSubmitted(actorId: string, interviewId: string, feedback: any): Promise<void> {
    await this.log({
      actor: actorId,
      action: 'SUBMIT_FEEDBACK',
      entity: 'interview',
      entityId: interviewId,
      payload: { feedback }
    })
  }

  static async logPromptCall(model: string, promptHash: string, tokenUsage: { input: number; output: number }, toolCalls?: any[]): Promise<void> {
    // Log to prompt_logs table for monitoring AI usage
    try {
      const { supabaseAdmin } = await import('./supabase-admin')
      await supabaseAdmin.from('prompt_logs').insert({
        model,
        prompt_hash: promptHash,
        tokens_in: tokenUsage.input,
        tokens_out: tokenUsage.output,
        tool_calls_json: toolCalls,
        masked: false // Set based on whether PII was redacted
      })
    } catch (error) {
      console.error('Failed to log prompt call:', error)
    }
  }
}
