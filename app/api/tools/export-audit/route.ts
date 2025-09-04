import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const ExportAuditSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  format: z.enum(['json', 'csv']).optional().default('json'),
  entity_type: z.string().optional(),
  actor: z.string().optional()
})

function arrayToCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { start_date, end_date, format, entity_type, actor } = ExportAuditSchema.parse(body)

    // Build query
    let query = supabaseAdmin
      .from('audit_logs')
      .select('*')
      .gte('at', start_date)
      .lte('at', end_date)
      .order('at', { ascending: false })

    if (entity_type) {
      query = query.eq('entity', entity_type)
    }

    if (actor) {
      query = query.eq('actor', actor)
    }

    const { data: auditLogs, error } = await query

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }

    // Also get prompt logs for AI usage
    const { data: promptLogs } = await supabaseAdmin
      .from('prompt_logs')
      .select('*')
      .gte('at', start_date)
      .lte('at', end_date)
      .order('at', { ascending: false })

    const exportData = {
      audit_logs: auditLogs || [],
      prompt_logs: promptLogs || [],
      export_metadata: {
        generated_at: new Date().toISOString(),
        start_date,
        end_date,
        total_audit_events: auditLogs?.length || 0,
        total_prompt_calls: promptLogs?.length || 0,
        filters: { entity_type, actor }
      }
    }

    if (format === 'csv') {
      // Create CSV exports for each table
      const auditCSV = arrayToCSV(auditLogs || [])
      const promptCSV = arrayToCSV(promptLogs || [])
      
      return new Response(JSON.stringify({
        audit_logs_csv: auditCSV,
        prompt_logs_csv: promptCSV,
        metadata: exportData.export_metadata
      }), {
        headers: { 
          'content-type': 'application/json',
          'content-disposition': `attachment; filename="audit-export-${Date.now()}.json"`
        }
      })
    }

    return new Response(JSON.stringify(exportData), {
      headers: { 
        'content-type': 'application/json',
        'content-disposition': `attachment; filename="audit-export-${Date.now()}.json"`
      }
    })
  } catch (error) {
    console.error('Export audit error:', error)
    return new Response(JSON.stringify({ error: 'Failed to export audit data' }), { 
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}

// GET endpoint for quick exports
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '30')
  const format = searchParams.get('format') || 'json'
  
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

  // Reuse POST logic
  return POST(new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      format
    })
  }))
}
