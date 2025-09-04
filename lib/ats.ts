// ATS integration stubs - extend as needed

export interface ATSCandidate {
  id: string
  name: string
  email: string
  phone?: string
  resumeUrl?: string
  stage: string
  appliedAt: string
}

export interface ATSJob {
  id: string
  title: string
  description: string
  location?: string
  department?: string
  isActive: boolean
}

export class LeverAdapter {
  static async getCandidates(jobId?: string): Promise<ATSCandidate[]> {
    // Stub implementation - would integrate with Lever API
    return [
      {
        id: 'lever-candidate-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        stage: 'applied',
        appliedAt: new Date().toISOString()
      }
    ]
  }

  static async getJobs(): Promise<ATSJob[]> {
    // Stub implementation
    return [
      {
        id: 'lever-job-1',
        title: 'Software Engineer',
        description: 'We are looking for a talented software engineer...',
        location: 'San Francisco, CA',
        department: 'Engineering',
        isActive: true
      }
    ]
  }

  static async updateCandidateStage(candidateId: string, stage: string): Promise<void> {
    // Stub implementation - would update candidate stage in Lever
    console.log(`Updating candidate ${candidateId} to stage ${stage}`)
  }
}

export class GreenhouseAdapter {
  static async getCandidates(jobId?: string): Promise<ATSCandidate[]> {
    // Stub implementation - would integrate with Greenhouse API
    return LeverAdapter.getCandidates(jobId)
  }

  static async getJobs(): Promise<ATSJob[]> {
    // Stub implementation
    return LeverAdapter.getJobs()
  }

  static async updateCandidateStage(candidateId: string, stage: string): Promise<void> {
    // Stub implementation
    return LeverAdapter.updateCandidateStage(candidateId, stage)
  }
}
