import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Website } from '../../lib/types'

const statusColor: Record<string, string> = {
  published: 'text-green-400 border-green-400/40',
  draft: 'text-gray-400 border-gray-400/40',
  pending: 'text-yellow-400 border-yellow-400/40',
  archived: 'text-red-400 border-red-400/40',
}

export default function ManageWebsites() {
  const [sites, setSites] = useState<Website[]>([])
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const { profile } = useAuth()

  async function load() {
    const { data } = await supabase.from('websites').select('*, categories(*)').order('display_order')
    setSites((data as Website[]) ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    await supabase.from('websites').delete().eq('id', id)
    await supabase.from('audit_logs').insert({
      actor_id: profile?.id,
      action: 'website.delete',
      target_type: 'website',
      target_id: id,
    })
    setConfirmId(null)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Manage Websites</h1>
        <Link to="/admin/websites/new"><Button variant="primary">Add Website</Button></Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-violet/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-violet/20 text-left text-gray-400">
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Visits</th>
              <th className="p-3">Clicks</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id} className="border-b border-violet/10 text-gray-200">
                <td className="p-3">{site.title}</td>
                <td className="p-3 text-gray-400">{site.categories?.name ?? '—'}</td>
                <td className="p-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs ${statusColor[site.status]}`}>
                    {site.status}
                  </span>
                </td>
                <td className="p-3">{site.visits}</td>
                <td className="p-3">{site.clicks}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link to={`/admin/websites/${site.id}/edit`} className="text-violet hover:text-neon">Edit</Link>
                    {confirmId === site.id ? (
                      <>
                        <button onClick={() => handleDelete(site.id)} className="text-red-400">Confirm</button>
                        <button onClick={() => setConfirmId(null)} className="text-gray-500">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmId(site.id)} className="text-red-400/80 hover:text-red-400">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sites.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No websites yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
