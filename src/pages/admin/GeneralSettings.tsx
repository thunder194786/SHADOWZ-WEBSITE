import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import GlassCard from '../../components/GlassCard'
import { supabase } from '../../lib/supabase'

interface GeneralSettingsValue {
  siteName: string
  footerText: string
  contactEmail: string
}

const DEFAULTS: GeneralSettingsValue = {
  siteName: 'SHADOWZ HUB',
  footerText: 'SHADOWZ HUB. All our websites, one place.',
  contactEmail: '',
}

export default function GeneralSettings() {
  const [settings, setSettings] = useState<GeneralSettingsValue>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('platform_settings').select('value').eq('key', 'general').single().then(({ data }) => {
      if (data?.value) setSettings({ ...DEFAULTS, ...(data.value as GeneralSettingsValue) })
    })
  }, [])

  async function handleSave() {
    await supabase.from('platform_settings').upsert({ key: 'general', value: settings })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-6">General Settings</h1>

      <GlassCard className="max-w-xl space-y-5">
        <Field label="Site Name">
          <input
            value={settings.siteName}
            onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))}
            className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white focus:border-neon focus:outline-none"
          />
        </Field>
        <Field label="Footer Text">
          <input
            value={settings.footerText}
            onChange={(e) => setSettings((s) => ({ ...s, footerText: e.target.value }))}
            className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white focus:border-neon focus:outline-none"
          />
        </Field>
        <Field label="Public Contact Email">
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings((s) => ({ ...s, contactEmail: e.target.value }))}
            className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white focus:border-neon focus:outline-none"
          />
        </Field>

        {saved && <p className="text-sm text-green-400">Saved.</p>}
        <Button variant="primary" onClick={handleSave}>Save Settings</Button>
      </GlassCard>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
