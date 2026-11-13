import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../components/Container'
import Button from '../components/Button'
import StatCard from '../components/StatCard'
import { supabase } from '../lib/supabase'

interface Stats {
  totalWebsites: number
  publishedWebsites: number
  newWebsites: number
  totalUsers: number
  totalVisits: number
  totalClicks: number
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function loadStats() {
      const [{ count: total }, { count: published }, { count: newCount }, { count: users }, { data: siteRows }] =
        await Promise.all([
          supabase.from('websites').select('*', { count: 'exact', head: true }),
          supabase.from('websites').select('*', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('websites').select('*', { count: 'exact', head: true }).eq('is_new', true),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('websites').select('visits, clicks'),
        ])

      const totalVisits = (siteRows ?? []).reduce((sum, r: { visits: number }) => sum + (r.visits || 0), 0)
      const totalClicks = (siteRows ?? []).reduce((sum, r: { clicks: number }) => sum + (r.clicks || 0), 0)

      setStats({
        totalWebsites: total ?? 0,
        publishedWebsites: published ?? 0,
        newWebsites: newCount ?? 0,
        totalUsers: users ?? 0,
        totalVisits,
        totalClicks,
      })
    }
    loadStats()
  }, [])

  return (
    <div>
      <Container>
        <div className="text-center py-20 md:py-28">
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-wide text-neon drop-shadow-[0_0_15px_rgba(176,38,255,0.6)]">
            SHADOWZ HUB
          </h1>
          <p className="mt-4 text-gray-300 text-lg max-w-xl mx-auto">
            All Our Websites, One Place. Browse, discover, and jump straight into every project
            in the SHADOWZ network from a single hub.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/websites"><Button variant="primary">Explore Websites</Button></Link>
            <Link to="/about"><Button variant="outline">Learn More</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pb-20">
          <StatCard label="Total Websites" value={stats?.totalWebsites ?? '—'} />
          <StatCard label="Published" value={stats?.publishedWebsites ?? '—'} />
          <StatCard label="New Websites" value={stats?.newWebsites ?? '—'} />
          <StatCard label="Registered Users" value={stats?.totalUsers ?? '—'} />
          <StatCard label="Total Visits" value={stats?.totalVisits ?? '—'} />
          <StatCard label="Total Clicks" value={stats?.totalClicks ?? '—'} />
        </div>
      </Container>
    </div>
  )
}
