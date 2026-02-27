const BASE_CLASS =
  'flex-1 px-3.5 py-2.5 text-sm font-medium text-overlay-text rounded-lg cursor-pointer transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2'

const PRIMARY_CLASS = `${BASE_CLASS} bg-slate-400/15 border border-[rgba(148,163,184,0.15)] hover:bg-slate-400/25 hover:border-slate-400/30`
const SECONDARY_CLASS = `${BASE_CLASS} bg-slate-400/10 border border-slate-400/20 hover:bg-slate-400/25`

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? PRIMARY_CLASS : SECONDARY_CLASS
  return <button type="button" className={`${variantClass} ${className ?? ''}`} {...props} />
}
