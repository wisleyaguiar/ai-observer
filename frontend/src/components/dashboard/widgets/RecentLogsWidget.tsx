import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/lib/api'
import { formatRelativeTime, getSeverityColor, cn } from '@/lib/utils'
import { getServiceDisplayName } from '@/lib/metricMetadata'
import type { LogRecord } from '@/types/logs'
import type { WidgetConfig } from '@/types/dashboard'

interface RecentLogsWidgetProps {
  title: string
  config: WidgetConfig
  fromTime: Date
  toTime: Date
}

// Prefer the human-readable payload a log carries: the prompt text (when Claude Code
// is started with OTEL_LOG_USER_PROMPTS=1), otherwise the event name / body.
function getLogLine(log: LogRecord): string {
  const attrs = log.logAttributes || {}
  const prompt = attrs.prompt
  if (prompt && prompt !== '<REDACTED>') return prompt
  return attrs['event.name'] || log.body || '(empty)'
}

function getLogMeta(log: LogRecord): string {
  const attrs = log.logAttributes || {}
  const parts = [getServiceDisplayName(log.serviceName)]
  if (attrs.prompt_length) parts.push(`${attrs.prompt_length} chars`)
  if (attrs['session.id']) parts.push(`session ${attrs['session.id'].slice(0, 8)}`)
  return parts.join(' · ')
}

export function RecentLogsWidget({ title, config, fromTime, toTime }: RecentLogsWidgetProps) {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<LogRecord[]>([])
  const [loading, setLoading] = useState(true)

  const from = fromTime.toISOString()
  const to = toTime.toISOString()
  const service = config.service
  const search = config.logSearch

  useEffect(() => {
    // Keep the previous rows visible while refetching - avoids a loading flash
    // every time the dashboard time range changes.
    const controller = new AbortController()
    api
      .getLogs(
        { service: service || undefined, search: search || undefined, from, to, limit: 20 },
        { signal: controller.signal }
      )
      .then((res) => setLogs(res.logs || []))
      .catch(() => {
        if (!controller.signal.aborted) setLogs([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [service, search, from, to])

  const handleClick = () => {
    const params = new URLSearchParams()
    if (service) params.set('service', service)
    if (search) params.set('search', search)
    navigate(`/logs?${params.toString()}`)
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2">{title}</CardTitle>
        <CardDescription>
          {search ? `Logs matching "${search}"` : 'Recent log records'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {loading ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Loading...</p>
            ) : logs.length ? (
              logs.map((log, i) => (
                <div
                  key={`${log.timestamp}-${i}`}
                  className="flex items-start justify-between gap-3 py-2 px-2 -mx-2 border-b last:border-0 cursor-pointer rounded-md hover:bg-accent transition-colors"
                  onClick={handleClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleClick()
                    }
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Badge className={cn('shrink-0', getSeverityColor(log.severityText || ''))}>
                      {log.severityText || 'UNKNOWN'}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm line-clamp-2 break-words">{getLogLine(log)}</p>
                      <p className="text-xs text-muted-foreground">{getLogMeta(log)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                    {formatRelativeTime(log.timestamp)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No logs in the selected time range
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
