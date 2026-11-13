import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Report } from '../../lib/types'

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([])

  async function load() {
    const { data } = await supabase
      .from('reports')
      .select('*, websites(title)')
      .order('created_at', { ascending: false })
    setReports((data as Report[]) ?? [])
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: 'resolved' | 'dismissed') {
    await supabase.from('reports').update({ status }).eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-6">Reports</h1>

      <div className="rounded-xl border border-violet/20 divide-y divide-violet/10">
        {reports.map((r) => (
          <div key={r.id} className="p-4">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-semibold text-white">{r.websites?.title ?? 'Unknown website'}</span>
              <span
                className={
                  r.status === 'open'
                    ? 'text-xs text-yellow-400'
                    : r.status === 'resolved'
                    ? 'text-xs text-green-400'
                    : 'text-xs text-gray-500'
                }
              >
                {r.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">{r.reason}</p>
            <p className="text-xs text-gray-600 mb-2">{new Date(r.created_at).toLocaleString()}</p>
            {r.status === 'open' && (
              <div className="flex gap-3">
                <button onClick={() => updateStatus(r.id, 'resolved')} className="text-xs text-green-400 hover:underline">
                  Mark Resolved
                </button>
                <button onClick={() => updateStatus(r.id, 'dismissed')} className="text-xs text-gray-500 hover:underline">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
        {reports.length === 0 && <p className="p-6 text-center text-gray-500 text-sm">No reports yet.</p>}
      </div>
    </div>
  )
}
