/**
 * Compass indicator showing cardinal directions (N/S/E/W) to clarify arrow-key movement.
 * ↑ = N, ↓ = S, ← = W, → = E
 */
export function Compass() {
  return (
    <div
      className="absolute top-6 right-6 z-10 p-4 rounded-xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl"
      role="img"
      aria-label="Compass: arrow keys move tool in cardinal directions"
    >
      <p className="text-[11px] font-semibold text-muted-foreground text-center mb-3">
        Arrow keys ↑↓←→ move tool
      </p>
      <div className="relative w-[72px] h-[72px] mx-auto">
        <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-xs font-bold text-primary">N</span>
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">S</span>
        <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 text-xs font-medium text-muted-foreground">W</span>
        <span className="absolute right-0 top-1/2 translate-x-0.5 -translate-y-1/2 text-xs font-medium text-muted-foreground">E</span>
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="32" cy="32" r="28" opacity="0.2" />
          <circle cx="32" cy="32" r="24" opacity="0.35" />
          <line x1="32" y1="8" x2="32" y2="18" strokeWidth="2.5" opacity="0.95" />
          <line x1="32" y1="46" x2="32" y2="56" opacity="0.5" />
          <line x1="8" y1="32" x2="18" y2="32" opacity="0.5" />
          <line x1="46" y1="32" x2="56" y2="32" opacity="0.5" />
          <path d="M32 20 L35 32 L32 38 L29 32 Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1" />
          <path d="M32 38 L32 48" opacity="0.45" />
        </svg>
      </div>
    </div>
  )
}
