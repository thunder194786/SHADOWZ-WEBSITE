import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Profile, UserRole } from '../../lib/types'

const ALL_ROLES: UserRole[] = ['member', 'moderator', 'administrator', 'admin', 'owner']

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  member: 'Browse websites, manage own account.',
  moderator: 'All Member permissions, plus content moderation tools.',
  administrator: 'All Moderator permissions, plus website review access.',
  admin: 'Manage websites, categories, users, and view admin statistics.',
  owner: 'Full platform control, including assigning Owner and Admin roles.',
}

export default function Roles() {
  const [users, setUsers] = useState<Profile[]>([])
  const { profile: me } = useAuth()

  async function load() {
    const { data } = await supabase.from('profiles').select('*').order('role', { ascending: false })
    setUsers((data as Profile[]) ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleChange(userId: string, newRole: UserRole) {
    if (!me || me.role !== 'owner') return
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    await supabase.from('audit_logs').insert({
      actor_id: me.id,
      action: 'user.role_change',
      target_type: 'profile',
      target_id: userId,
      details: { new_role: newRole },
    })
    load()
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-2">Roles & Permissions</h1>
      <p className="text-sm text-gray-500 mb-6">Only the Owner can grant or revoke the Owner or Admin role.</p>

      <div className="grid md:grid-cols-5 gap-3 mb-8">
        {ALL_ROLES.map((r) => (
          <div key={r} className="rounded-xl border border-violet/20 p-4">
            <p className="text-xs font-bold uppercase text-neon mb-1">{r}</p>
            <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[r]}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-violet/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-violet/20 text-left text-gray-400">
              <th className="p-3">Username</th>
              <th className="p-3">Current Role</th>
              <th className="p-3">Assign Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-violet/10 text-gray-200">
                <td className="p-3">{u.username}</td>
                <td className="p-3 text-violet uppercase text-xs">{u.role}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    disabled={me?.id === u.id}
                    onChange={(e) => handleChange(u.id, e.target.value as UserRole)}
                    className="rounded border border-violet/30 bg-surface2/50 px-2 py-1 text-xs text-white disabled:opacity-40"
                  >
                    {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
