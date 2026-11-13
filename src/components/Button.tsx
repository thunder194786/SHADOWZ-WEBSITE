import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'outline'
}

export default function Button({ children, variant = 'primary', className = '', ...rest }: ButtonProps) {
  const base = 'px-6 py-2.5 rounded-lg font-body font-semibold text-sm transition-all duration-200'
  const styles =
    variant === 'primary'
      ? 'bg-neon text-white shadow-[0_0_20px_rgba(176,38,255,0.5)] hover:shadow-[0_0_30px_rgba(176,38,255,0.8)] hover:-translate-y-0.5'
      : 'border border-violet text-gray-200 hover:bg-violet/10 hover:border-neon'

  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  )
}
