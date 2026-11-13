export interface AppearanceSettings {
  surfaceColor?: string
  surface2Color?: string
  neonColor?: string
  violetColor?: string
  homepageIntro?: string
  logoUrl?: string
}

function hexToRgbTriple(hex: string): string | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!match) return null
  const r = parseInt(match[1], 16)
  const g = parseInt(match[2], 16)
  const b = parseInt(match[3], 16)
  return `${r} ${g} ${b}`
}

export function applyAppearance(settings: AppearanceSettings) {
  const root = document.documentElement
  const map: [keyof AppearanceSettings, string][] = [
    ['surfaceColor', '--color-surface-rgb'],
    ['surface2Color', '--color-surface2-rgb'],
    ['neonColor', '--color-neon-rgb'],
    ['violetColor', '--color-violet-rgb'],
  ]
  for (const [key, cssVar] of map) {
    const hex = settings[key]
    if (typeof hex === 'string' && hex) {
      const rgb = hexToRgbTriple(hex)
      if (rgb) root.style.setProperty(cssVar, rgb)
    }
  }
}
