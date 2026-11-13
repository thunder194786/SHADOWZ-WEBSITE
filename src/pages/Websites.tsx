import { useEffect, useState } from 'react'
import Container from '../components/Container'
import WebsiteCard from '../components/WebsiteCard'
import { supabase } from '../lib/supabase'
import type { Category, Website } from '../lib/types'

const PAGE_SIZE = 9

export default function Websites() {
  const [sites, setSites] = useState<Website[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories((data as Category[]) ?? [])
    })
  }, [])

  useEffect(() => {
    async function loadSites() {
      setLoading(true)
      let query = supabase
        .from('websites')
        .select('*, categories(*)', { count: 'exact' })
        .eq('status', 'published')

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`)
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      query = query.order('created_at', { ascending: sort === 'oldest' })

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      query = query.range(from, to)

      const { data, count } = await query
      setSites((data as Website[]) ?? [])
      setTotalCount(count ?? 0)
      setLoading(false)
    }
    loadSites()
  }, [search, categoryId, sort, page])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <Container>
      <div className="py-12">
        <h1 className="font-heading text-3xl font-bold text-white mb-2">Websites</h1>
        <p className="text-gray-400 mb-8">Browse every published site in the SHADOWZ network.</p>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value) }}
            placeholder="Search websites..."
            className="flex-1 rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
          />
          <select
            value={categoryId}
            onChange={(e) => { setPage(1); setCategoryId(e.target.value) }}
            className="rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white focus:border-neon focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
            className="rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white focus:border-neon focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading...</p>
        ) : sites.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No websites found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sites.map((site) => (
              <WebsiteCard key={site.id} site={site} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-violet/30 px-4 py-2 text-sm text-gray-300 disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-violet/30 px-4 py-2 text-sm text-gray-300 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Container>
  )
}
