import type { ReactNode } from 'react'

export default function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-violet/30 bg-surface2/50 backdrop-blur-xl p-6 shadow-[0_0_25px_rgba(124,58,237,0.15)] transition-all duration-300 hover:border-neon/50 hover:shadow-[0_0_30px_rgba(176,38,255,0.25)] ${className}`}
    >
      {children}
    </div>
  )
}
