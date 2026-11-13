import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { AuditLog } from '../../lib/types'

export default function ActivityLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => setLogs((data as AuditLog[]) ?? []))
  }, [])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-6">Admin Activity Logs</h1>

      <div className="rounded-xl border border-violet/20 divide-y divide-violet/10">
        {logs.map((log) => (
          <div key={log.id} className="flex justify-between p-3 text-sm">
            <span className="text-gray-200">{log.action}</span>
            <span className="text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="p-6 text-center text-gray-500 text-sm">No activity recorded yet.</p>}
      </div>
    </div>
  )
}
