import { BrainCircuit } from 'lucide-react'

interface LogoLoaderProps {
  text?: string
  subtext?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullScreen?: boolean
  className?: string
  showBrandText?: boolean
}

export function LogoLoader({
  text = 'Loading EduPath...',
  subtext,
  size = 'md',
  fullScreen = false,
  className = '',
  showBrandText = true
}: LogoLoaderProps) {
  // Size metrics
  const sizeConfig = {
    sm: {
      box: 'h-10 w-10 rounded-xl',
      orbit: 'h-14 w-14 -m-2',
      orbitInner: 'h-12 w-12 -m-1',
      icon: 20,
      title: 'text-base',
      text: 'text-xs',
      subtext: 'text-[10px]'
    },
    md: {
      box: 'h-14 w-14 rounded-2xl',
      orbit: 'h-20 w-20 -m-3',
      orbitInner: 'h-16 w-16 -m-1',
      icon: 28,
      title: 'text-lg',
      text: 'text-xs font-semibold',
      subtext: 'text-[11px]'
    },
    lg: {
      box: 'h-20 w-20 rounded-3xl',
      orbit: 'h-28 w-28 -m-4',
      orbitInner: 'h-24 w-24 -m-2',
      icon: 40,
      title: 'text-2xl',
      text: 'text-sm font-semibold',
      subtext: 'text-xs'
    },
    xl: {
      box: 'h-24 w-24 rounded-3xl',
      orbit: 'h-36 w-36 -m-6',
      orbitInner: 'h-30 w-30 -m-3',
      icon: 48,
      title: 'text-3xl',
      text: 'text-base font-bold',
      subtext: 'text-sm'
    }
  }[size]

  const loaderContent = (
    <div className={`flex flex-col items-center justify-center text-center select-none animate-fadeIn ${className}`}>
      {/* Logo & Animated Orbit Container */}
      <div className="relative flex items-center justify-center my-3">
        {/* Soft Background Radial Aura Glow */}
        <div className="absolute inset-0 bg-indigo-500/25 rounded-full blur-2xl animate-pulse-glow pointer-events-none" />

        {/* Outer Counter-Rotating Orbit Ring */}
        <div 
          className={`absolute ${sizeConfig.orbit} rounded-full border border-dashed border-indigo-400/40 animate-orbit-reverse pointer-events-none`}
        />

        {/* Primary Spinning Orbit Ring with Gradient Spinner Border */}
        <div 
          className={`absolute ${sizeConfig.orbitInner} rounded-full border-2 border-transparent border-t-indigo-600 border-r-violet-500 animate-orbit pointer-events-none`}
        />

        {/* Core Logo Badge */}
        <div className={`
          relative z-10 ${sizeConfig.box} 
          bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 
          text-white flex items-center justify-center 
          shadow-lg shadow-indigo-500/35 
          animate-logo-breathing
        `}>
          <BrainCircuit size={sizeConfig.icon} className="text-white drop-shadow-sm" />
        </div>
      </div>

      {/* Brand Title (Optional) */}
      {showBrandText && (
        <div className={`mt-3 font-display font-black tracking-tight text-slate-900 flex items-center gap-1 ${sizeConfig.title}`}>
          EduPath<span className="text-indigo-600 text-xs font-mono font-bold">AI</span>
        </div>
      )}

      {/* Status Text & Dynamic Dot Animation */}
      {text && (
        <div className={`mt-1.5 text-slate-600 flex items-center justify-center gap-1.5 ${sizeConfig.text}`}>
          <span>{text}</span>
          <span className="inline-flex gap-0.5 items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse delay-100" />
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse delay-200" />
          </span>
        </div>
      )}

      {/* Subtext */}
      {subtext && (
        <div className={`mt-1 text-slate-400 ${sizeConfig.subtext}`}>
          {subtext}
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white/95 border border-slate-200/90 p-8 sm:p-10 rounded-[32px] shadow-2xl max-w-sm w-full backdrop-blur-xl">
          {loaderContent}
        </div>
      </div>
    )
  }

  return loaderContent
}

export default LogoLoader
