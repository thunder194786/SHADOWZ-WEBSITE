import { useEffect, useState } from 'react'
import StatCard from '../../components/StatCard'
import { supabase } from '../../lib/supabase'

interface Counts {
  totalWebsites: number
  published: number
  draft: number
  pending: number
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  totalVisits: number
  totalClicks: number
}

export default function Overview() {
  const [counts, setCounts] = useState<Counts | null>(null)

  useEffect(() => {
    async function load() {
      const [
        { count: totalWebsites },
        { count: published },
        { count: draft },
        { count: pending },
        { count: totalUsers },
        { count: activeUsers },
        { count: bannedUsers },
        { data: siteRows },
      ] = await Promise.all([
        supabase.from('websites').select('*', { count: 'exact', head: true }),
        supabase.from('websites').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('websites').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('websites').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'banned'),
        supabase.from('websites').select('visits, clicks'),
      ])

      const totalVisits = (siteRows ?? []).reduce((s, r: { visits: number }) => s + (r.visits || 0), 0)
      const totalClicks = (siteRows ?? []).reduce((s, r: { clicks: number }) => s + (r.clicks || 0), 0)

      setCounts({
        totalWebsites: totalWebsites ?? 0,
        published: published ?? 0,
        draft: draft ?? 0,
        pending: pending ?? 0,
        totalUsers: totalUsers ?? 0,
        activeUsers: activeUsers ?? 0,
        bannedUsers: bannedUsers ?? 0,
        totalVisits,
        totalClicks,
      })
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Total Websites" value={counts?.totalWebsites ?? '—'} />
        <StatCard label="Published" value={counts?.published ?? '—'} />
        <StatCard label="Draft" value={counts?.draft ?? '—'} />
        <StatCard label="Pending" value={counts?.pending ?? '—'} />
        <StatCard label="Total Users" value={counts?.totalUsers ?? '—'} />
        <StatCard label="Active Users" value={counts?.activeUsers ?? '—'} />
        <StatCard label="Banned Users" value={counts?.bannedUsers ?? '—'} />
        <StatCard label="Total Visits" value={counts?.totalVisits ?? '—'} />
        <StatCard label="Website Clicks" value={counts?.totalClicks ?? '—'} />
      </div>
    </div>
  )
}
