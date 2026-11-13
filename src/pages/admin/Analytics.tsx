import { useEffect, useState } from 'react'
import StatCard from '../../components/StatCard'
import { supabase } from '../../lib/supabase'
import type { Website } from '../../lib/types'

export default function Analytics() {
  const [mostVisited, setMostVisited] = useState<Website[]>([])
  const [recent, setRecent] = useState<Website[]>([])
  const [totalVisits, setTotalVisits] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    async function load() {
      const [{ data: topSites }, { data: recentSites }, { data: allSites }, { count: users }] = await Promise.all([
        supabase.from('websites').select('*').eq('status', 'published').order('visits', { ascending: false }).limit(5),
        supabase.from('websites').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(5),
        supabase.from('websites').select('visits, clicks'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ])
      setMostVisited((topSites as Website[]) ?? [])
      setRecent((recentSites as Website[]) ?? [])
      setTotalVisits((allSites ?? []).reduce((s, r: { visits: number }) => s + (r.visits || 0), 0))
      setTotalClicks((allSites ?? []).reduce((s, r: { clicks: number }) => s + (r.clicks || 0), 0))
      setTotalUsers(users ?? 0)
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-6">Analytics</h1>

      <div className="grid grid-cols-3 gap-4 mb-8 max-w-xl">
        <StatCard label="Total Visits" value={totalVisits} />
        <StatCard label="Website Clicks" value={totalClicks} />
        <StatCard label="Registered Accounts" value={totalUsers} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-heading text-lg text-neon mb-3">Most Visited</h2>
          <div className="rounded-xl border border-violet/20 divide-y divide-violet/10">
            {mostVisited.map((s) => (
              <div key={s.id} className="flex justify-between p-3 text-sm text-gray-200">
                <span>{s.title}</span>
                <span className="text-gray-500">{s.visits} visits</span>
              </div>
            ))}
            {mostVisited.length === 0 && <p className="p-4 text-center text-gray-500 text-sm">No data yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-lg text-neon mb-3">Recently Added</h2>
          <div className="rounded-xl border border-violet/20 divide-y divide-violet/10">
            {recent.map((s) => (
              <div key={s.id} className="flex justify-between p-3 text-sm text-gray-200">
                <span>{s.title}</span>
                <span className="text-gray-500">{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {recent.length === 0 && <p className="p-4 text-center text-gray-500 text-sm">No data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
