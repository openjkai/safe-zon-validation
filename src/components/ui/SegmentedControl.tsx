export interface SegmentedOption<T> {
  value: T
  label: string
}

export interface SegmentedControlProps<T> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  labelId: string
  hint?: string
}

const OPTION_BASE =
  'flex-1 px-4 py-2.5 text-sm font-medium rounded-md border-none cursor-pointer transition-all'
const OPTION_ACTIVE = 'text-primary-foreground bg-primary'
const OPTION_INACTIVE = 'text-muted-foreground bg-transparent hover:text-foreground hover:bg-muted'

export function SegmentedControl<T extends string | number | boolean>({
  options,
  value,
  onChange,
  label,
  labelId,
  hint,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted-foreground font-medium" id={labelId}>
        {label}
      </span>
      <div
        className="flex rounded-lg bg-muted p-1"
        role="group"
        aria-labelledby={labelId}
      >
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            className={`${OPTION_BASE} ${opt.value === value ? OPTION_ACTIVE : OPTION_INACTIVE}`}
            onClick={() => onChange(opt.value)}
            aria-pressed={opt.value === value}
            aria-label={opt.label}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hint && <span className="text-sm text-muted-foreground leading-snug">{hint}</span>}
    </div>
  )
}
