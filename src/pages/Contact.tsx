import { useEffect, useState } from 'react'
import Container from '../components/Container'
import GlassCard from '../components/GlassCard'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [publicEmail, setPublicEmail] = useState('')

  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'general')
      .single()
      .then(({ data }) => {
        const addr = (data?.value as { contactEmail?: string } | null)?.contactEmail
        if (addr) setPublicEmail(addr)
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const { error: err } = await supabase.from('contact_messages').insert({ name, email, message })
    if (err) {
      setError('Something went wrong. Please try again.')
      return
    }
    setSent(true)
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <Container>
      <div className="py-16 max-w-xl mx-auto">
        <h1 className="font-heading text-3xl font-bold text-white mb-2">Contact Us</h1>
        {publicEmail && (
          <p className="text-sm text-gray-400 mb-6">
            Or email us directly at <a href={`mailto:${publicEmail}`} className="text-neon hover:underline">{publicEmail}</a>
          </p>
        )}
        <GlassCard>
          {sent ? (
            <p className="text-gray-300">Thanks for reaching out — we'll get back to you soon.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message"
                required
                rows={5}
                className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-neon focus:outline-none"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button variant="primary" className="w-full" type="submit">Send Message</Button>
            </form>
          )}
        </GlassCard>
      </div>
    </Container>
  )
}
