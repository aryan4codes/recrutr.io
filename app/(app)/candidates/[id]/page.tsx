import { supabaseAdmin } from '@/lib/supabase-admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type Params = { params: { id: string } }

async function fetchCandidateProfile(id: string) {
  // Try RPC first (if database-improvements.sql was applied)
  const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_candidate_summary', {
    candidate_uuid: id,
  })

  if (!rpcError && rpcData) {
    // rpcData is already a JSON object with candidate + related arrays
    return rpcData as any
  }

  // Fallback to manual queries if RPC isn't available
  const profile: any = { candidate: null, skills: [], experience: [], education: [], projects: [], certifications: [], languages: [] }

  const { data: candidate } = await supabaseAdmin
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  profile.candidate = candidate

  // Helper to query optional tables gracefully
  async function safeSelect(table: string) {
    const { data, error } = await supabaseAdmin
      .from(table as any)
      .select('*')
      .eq('candidate_id', id)
    if (error) return []
    return data ?? []
  }

  profile.skills = await safeSelect('candidate_skills')
  profile.experience = await safeSelect('candidate_experience')
  profile.education = await safeSelect('candidate_education')
  profile.projects = await safeSelect('candidate_projects')
  profile.certifications = await safeSelect('candidate_certifications')
  profile.languages = await safeSelect('candidate_languages')

  return profile
}

export default async function CandidateProfilePage({ params }: Params) {
  const { id } = params
  const profile = await fetchCandidateProfile(id)

  if (!profile?.candidate) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Candidate not found</CardTitle>
            <CardDescription>The requested candidate does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/candidates" className="text-primary hover:underline">Back to candidates</Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const c = profile.candidate as any

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{c.name || 'Unnamed Candidate'}</h1>
          <p className="text-muted-foreground">
            {[c.email, c.phone, c.location].filter(Boolean).join(' • ') || 'No contact info'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            {c.linkedin && (
              <Link href={c.linkedin} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                LinkedIn
              </Link>
            )}
            {c.github_url && (
              <Link href={c.github_url} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                GitHub
              </Link>
            )}
            {c.portfolio && (
              <Link href={c.portfolio} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                Portfolio
              </Link>
            )}
          </div>
        </div>
        <Link href="/candidates" className="text-sm text-muted-foreground hover:underline">Back</Link>
      </div>

      {/* Summary */}
      {(c.summary || c.resume_text) && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-7">{c.summary || c.resume_text}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {Array.isArray(profile.skills) && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Total {profile.skills.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s: any, idx: number) => (
                <Badge key={`${s.skill}-${idx}`} variant="secondary">
                  {s.skill}
                  {s.source ? <span className="ml-2 opacity-60">({s.source})</span> : null}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {Array.isArray(profile.experience) && profile.experience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.experience
              .sort((a: any, b: any) => {
                // Try to sort current first then by start_date desc
                if (a.is_current && !b.is_current) return -1
                if (!a.is_current && b.is_current) return 1
                return (b.start_date || '').localeCompare(a.start_date || '')
              })
              .map((e: any, i: number) => (
                <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{e.position || e.title} {e.company ? `@ ${e.company}` : ''}</div>
                    {e.is_current ? <Badge>Current</Badge> : null}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {[e.duration, e.start_date, e.end_date].filter(Boolean).join(' • ')}
                  </div>
                  {e.description && <p className="mt-2 whitespace-pre-wrap">{e.description}</p>}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {Array.isArray(profile.education) && profile.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.education.map((ed: any, i: number) => (
              <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="font-medium">{ed.degree ? `${ed.degree} • ` : ''}{ed.institution}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {[ed.field, ed.year, ed.graduation_date].filter(Boolean).join(' • ')}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      {Array.isArray(profile.projects) && profile.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.projects.map((p: any, i: number) => (
              <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {[p.start_date, p.end_date].filter(Boolean).join(' • ')}
                </div>
                {p.description && <p className="mt-2 whitespace-pre-wrap">{p.description}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {(p.technologies || []).map((t: string, idx: number) => (
                    <Badge key={`${t}-${idx}`} variant="outline">{t}</Badge>
                  ))}
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  {p.project_url && (
                    <Link href={p.project_url} className="text-primary hover:underline" target="_blank" rel="noreferrer">Project</Link>
                  )}
                  {p.github_url && (
                    <Link href={p.github_url} className="text-primary hover:underline" target="_blank" rel="noreferrer">GitHub</Link>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Certifications & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.isArray(profile.certifications) && profile.certifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.certifications.map((cc: any, i: number) => (
                <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="font-medium">{cc.certification_name || cc.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {[cc.issuing_organization || cc.issuer, cc.issue_date, cc.expiry_date].filter(Boolean).join(' • ')}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {Array.isArray(profile.languages) && profile.languages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.languages.map((l: any, i: number) => (
                <Badge key={i} variant="secondary">
                  {l.language}{l.proficiency ? ` • ${l.proficiency}` : ''}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
