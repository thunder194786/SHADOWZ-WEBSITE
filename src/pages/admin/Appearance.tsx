import { useEffect, useState } from 'react'
import Button from '../../components/Button'
import GlassCard from '../../components/GlassCard'
import { supabase } from '../../lib/supabase'
import { applyAppearance } from '../../lib/theme'
import type { AppearanceSettings } from '../../lib/theme'

const DEFAULTS: Required<Omit<AppearanceSettings, 'logoUrl'>> = {
  surfaceColor: '#05020a',
  surface2Color: '#120a21',
  neonColor: '#b026ff',
  violetColor: '#7c3aed',
  homepageIntro: 'Welcome to SHADOWZ HUB — All Our Websites, One Place.',
}

export default function Appearance() {
  const [settings, setSettings] = useState<AppearanceSettings>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('platform_settings').select('value').eq('key', 'appearance').single().then(({ data }) => {
      if (data?.value) setSettings({ ...DEFAULTS, ...(data.value as AppearanceSettings) })
    })
  }, [])

  async function handleSave() {
    await supabase.from('platform_settings').upsert({ key: 'appearance', value: settings })
    applyAppearance(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function update<K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-6">Appearance Settings</h1>

      <GlassCard className="max-w-xl space-y-5">
        <ColorField label="Primary Background" value={settings.surfaceColor ?? DEFAULTS.surfaceColor} onChange={(v) => update('surfaceColor', v)} />
        <ColorField label="Secondary Background" value={settings.surface2Color ?? DEFAULTS.surface2Color} onChange={(v) => update('surface2Color', v)} />
        <ColorField label="Accent Color (Neon Purple)" value={settings.neonColor ?? DEFAULTS.neonColor} onChange={(v) => update('neonColor', v)} />
        <ColorField label="Secondary Accent (Violet)" value={settings.violetColor ?? DEFAULTS.violetColor} onChange={(v) => update('violetColor', v)} />

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Homepage Introduction</label>
          <textarea
            value={settings.homepageIntro ?? ''}
            onChange={(e) => update('homepageIntro', e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2.5 text-sm text-white focus:border-neon focus:outline-none"
          />
        </div>

        {saved && <p className="text-sm text-green-400">Saved and applied.</p>}
        <Button variant="primary" onClick={handleSave}>Save Appearance</Button>
      </GlassCard>
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 rounded border border-violet/30 bg-transparent" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-violet/30 bg-surface2/50 px-4 py-2 text-sm text-white focus:border-neon focus:outline-none"
        />
      </div>
    </div>
  )
}
