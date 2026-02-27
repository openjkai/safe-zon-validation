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
  'flex-1 px-3 py-2 text-sm font-medium rounded-md border-none cursor-pointer transition-all'
const OPTION_ACTIVE = 'text-overlay-text bg-slate-400/20'
const OPTION_INACTIVE = 'text-overlay-muted bg-transparent hover:text-overlay-text'

export function SegmentedControl<T extends string | number | boolean>({
  options,
  value,
  onChange,
  label,
  labelId,
  hint,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-overlay-muted" id={labelId}>
        {label}
      </span>
      <div
        className="flex rounded-lg bg-slate-400/10 p-0.5"
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
      {hint && <span className="text-[11px] text-overlay-muted leading-snug">{hint}</span>}
    </div>
  )
}
