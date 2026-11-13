import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '../components/Container'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError(err.message)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <Container>
        <div className="py-20 max-w-md mx-auto text-center">
          <GlassCard>
            <p className="text-gray-300">Your password has been updated.</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
          </GlassCard>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-16 max-w-md mx-auto">
        <h1 className="font-heading text-3xl font-bold text-white mb-6 text-center">Reset Password</h1>
        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              required
              className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button variant="primary" className="w-full" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </GlassCard>
      </div>
    </Container>
  )
}
