const BASE_CLASS =
  'px-3 py-2 text-xs font-medium rounded-md cursor-pointer transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2'

const PRIMARY_CLASS =
  'bg-primary text-primary-foreground border border-transparent hover:opacity-90'
const SECONDARY_CLASS = 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? PRIMARY_CLASS : SECONDARY_CLASS
  return (
    <button
      type="button"
      className={`${BASE_CLASS} ${variantClass} ${className ?? ''}`.trim()}
      {...props}
    />
  )
}
