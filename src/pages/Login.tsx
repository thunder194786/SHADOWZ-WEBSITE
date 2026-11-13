import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Container from '../components/Container'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { bannedMessage, clearBannedMessage } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/account')
  }

  return (
    <Container>
      <div className="py-16 max-w-md mx-auto">
        <h1 className="font-heading text-3xl font-bold text-white mb-6 text-center">Login</h1>
        {bannedMessage && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {bannedMessage}
          </div>
        )}
        <GlassCard>
          <form onSubmit={(e) => { clearBannedMessage(); handleSubmit(e) }} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button variant="primary" className="w-full" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 flex justify-between text-sm text-gray-400">
            <Link to="/forgot-password" className="hover:text-neon">Forgot password?</Link>
            <Link to="/signup" className="hover:text-neon">Create account</Link>
          </div>
        </GlassCard>
      </div>
    </Container>
  )
}
