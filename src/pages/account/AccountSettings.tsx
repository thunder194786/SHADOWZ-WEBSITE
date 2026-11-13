import { useState } from 'react'
import Container from '../../components/Container'
import GlassCard from '../../components/GlassCard'
import Button from '../../components/Button'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function AccountSettings() {
  const { profile, refreshProfile } = useAuth()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleUpdateUsername() {
    setError('')
    setMessage('')
    if (!profile) return
    const { error: err } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', profile.id)
    if (err) {
      setError(err.message)
      return
    }
    await refreshProfile()
    setMessage('Username updated.')
  }

  async function handleChangePassword() {
    setError('')
    setMessage('')
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) {
      setError(err.message)
      return
    }
    setNewPassword('')
    setMessage('Password changed.')
  }

  return (
    <Container>
      <div className="py-12 max-w-2xl mx-auto space-y-6">
        <h1 className="font-heading text-3xl font-bold text-white">Account Settings</h1>

        {message && <p className="text-sm text-green-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <GlassCard>
          <h2 className="font-heading text-lg text-neon mb-4">Update Username</h2>
          <div className="flex gap-3">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white focus:border-neon focus:outline-none"
            />
            <Button variant="primary" onClick={handleUpdateUsername}>Save</Button>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-heading text-lg text-neon mb-4">Change Password</h2>
          <div className="flex gap-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="flex-1 rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
            />
            <Button variant="primary" onClick={handleChangePassword}>Update</Button>
          </div>
        </GlassCard>
      </div>
    </Container>
  )
}
