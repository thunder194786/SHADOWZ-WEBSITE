import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import GlassCard from '../../components/GlassCard'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Category, WebsiteStatus } from '../../lib/types'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uploadImage(file: File, folder: string): Promise<string> {
  const path = `${folder}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('shadowz-assets').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('shadowz-assets').getPublicUrl(path)
  return data.publicUrl
}

export default function AddWebsite() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<WebsiteStatus>('draft')
  const [isNew, setIsNew] = useState(true)
  const [displayOrder, setDisplayOrder] = useState(0)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [existingLogo, setExistingLogo] = useState<string | null>(null)
  const [existingThumb, setExistingThumb] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories((data as Category[]) ?? [])
    })
  }, [])

  useEffect(() => {
    if (!isEdit) return
    supabase.from('websites').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setTitle(data.title)
      setUrl(data.url)
      setDescription(data.description)
      setCategoryId(data.category_id ?? '')
      setStatus(data.status)
      setIsNew(data.is_new)
      setDisplayOrder(data.display_order)
      setExistingLogo(data.logo_url)
      setExistingThumb(data.thumbnail_url)
    })
  }, [id, isEdit])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      let logoUrl = existingLogo
      let thumbUrl = existingThumb
      if (logoFile) logoUrl = await uploadImage(logoFile, 'logos')
      if (thumbFile) thumbUrl = await uploadImage(thumbFile, 'thumbnails')

      const payload = {
        title,
        slug: slugify(title),
        url,
        description,
        category_id: categoryId || null,
        status,
        is_new: isNew,
        display_order: displayOrder,
        logo_url: logoUrl,
        thumbnail_url: thumbUrl,
      }

      if (isEdit) {
        const { error: err } = await supabase.from('websites').update(payload).eq('id', id)
        if (err) throw err
        await supabase.from('audit_logs').insert({
          actor_id: profile?.id,
          action: 'website.update',
          target_type: 'website',
          target_id: id,
        })
      } else {
        const { data: inserted, error: err } = await supabase
          .from('websites')
          .insert({ ...payload, created_by: profile?.id })
          .select()
          .single()
        if (err) throw err
        await supabase.from('audit_logs').insert({
          actor_id: profile?.id,
          action: 'website.create',
          target_type: 'website',
          target_id: inserted?.id,
        })
      }

      navigate('/admin/websites')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-6">
        {isEdit ? 'Edit Website' : 'Add Website'}
      </h1>
      <GlassCard className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Website Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
          </Field>

          <Field label="Website URL">
            <input value={url} onChange={(e) => setUrl(e.target.value)} required type="url" className={inputCls} />
          </Field>

          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className={inputCls} />
          </Field>

          <Field label="Category">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Logo">
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} className={inputCls} />
              {existingLogo && <img src={existingLogo} alt="" className="mt-2 h-10 w-10 rounded" />}
            </Field>
            <Field label="Thumbnail">
              <input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)} className={inputCls} />
              {existingThumb && <img src={existingThumb} alt="" className="mt-2 h-16 w-28 rounded object-cover" />}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Display Order">
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as WebsiteStatus)} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
            Show NEW badge
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Website'}
          </Button>
        </form>
      </GlassCard>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
