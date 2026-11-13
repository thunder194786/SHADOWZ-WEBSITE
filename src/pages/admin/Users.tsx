import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { hasRole, ROLE_RANK } from '../../lib/types'
import type { Profile, UserRole } from '../../lib/types'

const ALL_ROLES: UserRole[] = ['member', 'moderator', 'administrator', 'admin', 'owner']

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([])
  const { profile: me } = useAuth()

  async function load() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers((data as Profile[]) ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleRoleChange(userId: string, newRole: UserRole) {
    if (!me) return
    // Only an Owner can grant or revoke the Owner role.
    if ((newRole === 'owner' || users.find((u) => u.id === userId)?.role === 'owner') && me.role !== 'owner') {
      return
    }
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

  async function handleBanToggle(userId: string, currentStatus: string) {
    if (!me) return
    const nextStatus = currentStatus === 'banned' ? 'active' : 'banned'
    await supabase.from('profiles').update({ status: nextStatus }).eq('id', userId)
    await supabase.from('audit_logs').insert({
      actor_id: me.id,
      action: nextStatus === 'banned' ? 'user.ban' : 'user.unban',
      target_type: 'profile',
      target_id: userId,
    })
    load()
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-6">Users</h1>

      <div className="overflow-x-auto rounded-xl border border-violet/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-violet/20 text-left text-gray-400">
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const canEditRole =
                me && me.id !== u.id && (u.role !== 'owner' || me.role === 'owner') && hasRole(me.role, 'admin')
              return (
                <tr key={u.id} className="border-b border-violet/10 text-gray-200">
                  <td className="p-3">{u.username}</td>
                  <td className="p-3 text-gray-400">{u.email}</td>
                  <td className="p-3">
                    {canEditRole ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="rounded border border-violet/30 bg-surface2/50 px-2 py-1 text-xs text-white"
                      >
                        {ALL_ROLES.filter((r) => me && (r !== 'owner' || me.role === 'owner')).map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs uppercase text-violet">{u.role}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={u.status === 'banned' ? 'text-red-400' : 'text-green-400'}>{u.status}</span>
                  </td>
                  <td className="p-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    {me && me.id !== u.id && ROLE_RANK[me.role] > ROLE_RANK[u.role] && (
                      <button
                        onClick={() => handleBanToggle(u.id, u.status)}
                        className="text-xs text-red-400/80 hover:text-red-400"
                      >
                        {u.status === 'banned' ? 'Unban' : 'Ban'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
