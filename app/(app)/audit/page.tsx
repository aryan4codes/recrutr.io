'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AuditPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [format, setFormat] = useState<'json' | 'csv'>('json')
  const [entityType, setEntityType] = useState('')
  const [actor, setActor] = useState('')
  const [exporting, setExporting] = useState(false)
  const [lastExport, setLastExport] = useState<any>(null)

  async function exportAuditData() {
    if (!startDate || !endDate) {
      alert('Please provide both start and end dates')
      return
    }

    setExporting(true)
    try {
      const response = await fetch('/api/tools/export-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          format,
          entity_type: entityType || undefined,
          actor: actor || undefined
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setLastExport(data)
        
        // Download the data as a file
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-export-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        alert('Audit data exported successfully!')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error exporting audit data:', error)
      alert('Failed to export audit data')
    } finally {
      setExporting(false)
    }
  }

  async function quickExport(days: number) {
    setExporting(true)
    try {
      const response = await fetch(`/api/tools/export-audit?days=${days}&format=${format}`)
      const data = await response.json()
      
      if (response.ok) {
        setLastExport(data)
        
        // Download the data
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-export-last-${days}-days.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        alert(`Last ${days} days exported successfully!`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error in quick export:', error)
      alert('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit & Export</h1>
        <p className="text-muted-foreground">
          Export hiring data, audit trails, and AI usage logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Export */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Export</CardTitle>
            <CardDescription>
              Export audit data for a specific date range and filters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Format</label>
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Entity Type (Optional)</label>
              <Input
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                placeholder="e.g. job, candidate, application"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Actor (Optional)</label>
              <Input
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                placeholder="e.g. user-id or system"
              />
            </div>

            <Button 
              onClick={exportAuditData}
              disabled={exporting || !startDate || !endDate}
              className="w-full"
            >
              {exporting ? 'Exporting...' : 'Export Audit Data'}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Exports */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Exports</CardTitle>
            <CardDescription>
              Pre-configured exports for common time periods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => quickExport(7)}
              disabled={exporting}
              className="w-full"
            >
              Last 7 Days
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => quickExport(30)}
              disabled={exporting}
              className="w-full"
            >
              Last 30 Days
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => quickExport(90)}
              disabled={exporting}
              className="w-full"
            >
              Last 90 Days
            </Button>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Export Includes:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All audit events (job creation, candidate actions, etc.)</li>
                <li>• AI prompt usage logs with token counts</li>
                <li>• Tool invocation history</li>
                <li>• PII redaction status</li>
                <li>• Export metadata and filters applied</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Export Summary */}
      {lastExport && (
        <Card>
          <CardHeader>
            <CardTitle>Last Export Summary</CardTitle>
            <CardDescription>
              Summary of the most recent export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {lastExport.export_metadata?.total_audit_events || 0}
                </div>
                <div className="text-sm text-muted-foreground">Audit Events</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {lastExport.export_metadata?.total_prompt_calls || 0}
                </div>
                <div className="text-sm text-muted-foreground">AI Calls</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {lastExport.audit_logs?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Records</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {lastExport.export_metadata?.generated_at ? 
                    new Date(lastExport.export_metadata.generated_at).toLocaleDateString() : 
                    'N/A'
                  }
                </div>
                <div className="text-sm text-muted-foreground">Generated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
