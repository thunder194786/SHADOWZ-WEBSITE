import { useEffect, useState } from 'react'
import Container from './Container'
import { supabase } from '../lib/supabase'

export default function Footer() {
  const [footerText, setFooterText] = useState('SHADOWZ HUB. All our websites, one place.')

  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'general')
      .single()
      .then(({ data }) => {
        const text = (data?.value as { footerText?: string } | null)?.footerText
        if (text) setFooterText(text)
      })
  }, [])

  return (
    <footer className="border-t border-violet/20 mt-24 py-8">
      <Container>
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {footerText}
        </p>
      </Container>
    </footer>
  )
}
