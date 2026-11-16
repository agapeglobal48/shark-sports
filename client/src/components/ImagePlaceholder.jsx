import { LOGO } from '../config.js'

// Shown while a product has no photos yet.
export default function ImagePlaceholder({ small = false, label }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#1d2125,#0e0f11_70%)]">
      <img src={LOGO} alt="" className={`${small ? 'w-3/4' : 'w-1/2'} opacity-[0.08] grayscale`} />
      {label && !small && (
        <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.3em] text-mute/60 transition-opacity duration-300 group-hover:opacity-0">{label}</span>
      )}
    </div>
  )
}
