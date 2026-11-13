import { useState } from 'react'
import Container from '../components/Container'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reset-password`,
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setSent(true)
  }

  return (
    <Container>
      <div className="py-16 max-w-md mx-auto">
        <h1 className="font-heading text-3xl font-bold text-white mb-6 text-center">Forgot Password</h1>
        <GlassCard>
          {sent ? (
            <p className="text-gray-300 text-sm">
              If an account exists for that email, a reset link has been sent.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your account email"
                required
                className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button variant="primary" className="w-full" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </GlassCard>
      </div>
    </Container>
  )
}
