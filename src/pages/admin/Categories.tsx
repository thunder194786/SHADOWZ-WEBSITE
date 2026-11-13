import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../lib/types'

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories((data as Category[]) ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) return
    const { error: err } = await supabase.from('categories').insert({ name: name.trim(), slug: slugify(name) })
    if (err) {
      setError(err.message)
      return
    }
    setName('')
    load()
  }

  async function handleDelete(id: string) {
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-6">Categories</h1>

      <form onSubmit={handleAdd} className="flex gap-3 mb-6 max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
        />
        <Button variant="primary" type="submit">Add</Button>
      </form>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <div className="rounded-xl border border-violet/20 divide-y divide-violet/10 max-w-md">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 text-sm text-gray-200">
            {c.name}
            <button onClick={() => handleDelete(c.id)} className="text-red-400/80 hover:text-red-400 text-xs">Delete</button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="p-4 text-center text-gray-500 text-sm">No categories yet.</p>
        )}
      </div>
    </div>
  )
}
