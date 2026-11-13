import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Container from '../components/Container'
import Button from '../components/Button'
import GlassCard from '../components/GlassCard'
import { supabase } from '../lib/supabase'
import type { Website } from '../lib/types'

export default function WebsiteDetails() {
  const { slug } = useParams<{ slug: string }>()
  const [site, setSite] = useState<Website | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('websites')
        .select('*, categories(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
      setSite((data as Website) ?? null)
      setLoading(false)
      if (data) {
        await supabase.rpc('increment_website_counter', { site_id: data.id, column_name: 'visits' })
      }
    }
    if (slug) load()
  }, [slug])

  async function handleVisit() {
    if (!site) return
    await supabase.rpc('increment_website_counter', { site_id: site.id, column_name: 'clicks' })
  }

  async function submitReport() {
    if (!site || !reportReason.trim()) return
    await supabase.from('reports').insert({
      website_id: site.id,
      reason: reportReason.trim(),
      status: 'open',
    })
    setReportSent(true)
    setReportReason('')
  }

  if (loading) {
    return <Container><p className="text-gray-500 text-center py-20">Loading...</p></Container>
  }

  if (!site) {
    return (
      <Container>
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">Website not found.</p>
          <Link to="/websites"><Button variant="outline">Back to Websites</Button></Link>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-12 max-w-3xl mx-auto">
        <Link to="/websites" className="text-sm text-gray-400 hover:text-neon">← Back to Websites</Link>

        <GlassCard className="mt-6">
          <div className="h-56 -m-6 mb-6 overflow-hidden rounded-t-2xl bg-surface">
            {site.thumbnail_url && (
              <img src={site.thumbnail_url} alt={site.title} className="h-full w-full object-cover" />
            )}
          </div>

          <div className="flex items-center gap-3 mb-3">
            {site.logo_url && <img src={site.logo_url} alt="" className="h-10 w-10 rounded" />}
            <h1 className="font-heading text-2xl font-bold text-white">{site.title}</h1>
          </div>

          {site.categories?.name && (
            <span className="inline-block mb-4 rounded-full border border-violet/40 px-3 py-0.5 text-xs text-violet">
              {site.categories.name}
            </span>
          )}

          <p className="text-gray-300 leading-relaxed mb-6">{site.description}</p>

          <p className="text-xs text-gray-500 mb-6">
            Added on {new Date(site.created_at).toLocaleDateString()}
          </p>

          <div className="flex flex-wrap gap-3">
            <a href={site.url} target="_blank" rel="noopener noreferrer" onClick={handleVisit}>
              <Button variant="primary">Visit Website</Button>
            </a>
            <Button variant="outline" onClick={() => setReportOpen((v) => !v)}>
              Report an issue
            </Button>
          </div>

          {reportOpen && (
            <div className="mt-6 border-t border-violet/20 pt-6">
              {reportSent ? (
                <p className="text-sm text-gray-400">Thanks — your report has been submitted.</p>
              ) : (
                <>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="What's wrong with this listing?"
                    className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
                    rows={3}
                  />
                  <div className="mt-3">
                    <Button variant="primary" onClick={submitReport}>Submit Report</Button>
                  </div>
                </>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </Container>
  )
}
