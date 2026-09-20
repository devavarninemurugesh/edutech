import type { ReactNode } from 'react'

export function Card({ 
  children, 
  className = '', 
  onClick,
  hoverGlow = false 
}: { 
  children: ReactNode; 
  className?: string; 
  onClick?: () => void;
  hoverGlow?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`card p-6 ${hoverGlow ? 'hover:border-orange-500/40 hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function Progress({ 
  value, 
  variant = 'default' 
}: { 
  value: number; 
  variant?: 'default' | 'emerald' | 'amber' | 'cyan' 
}) {
  const clamped = Math.max(0, Math.min(100, value))
  
  const gradients = {
    default: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
    emerald: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
    amber: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
    cyan: 'linear-gradient(90deg, #06b6d4 0%, #38bdf8 100%)',
  }[variant]

  return (
    <div className="progress">
      <div style={{ width: `${clamped}%`, background: gradients }} />
    </div>
  )
}

export function Badge({ 
  children, 
  variant = 'default',
  className = ''
}: { 
  children: ReactNode; 
  variant?: 'default' | 'success' | 'warning' | 'info' | 'purple' | 'danger';
  className?: string;
}) {
  const styles = {
    default: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25',
    purple: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    info: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
  }[variant]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight border backdrop-blur-sm ${styles} ${className}`}>
      {children}
    </span>
  )
}

export function SkeletonLoader({ className = 'h-6 w-full' }: { className?: string }) {
  return <div className={`bg-slate-200 dark:bg-slate-800/50 animate-pulse rounded-xl border border-slate-300/40 dark:border-slate-800/40 ${className}`} />
}

export { LogoLoader } from './LogoLoader'

