const BASE_CLASS =
  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium before:content-[""] before:w-2 before:h-2 before:rounded-full before:bg-current'

export function StatusBadge({ valid }: { valid: boolean }) {
  return (
    <span
      className={`${BASE_CLASS} ${
        valid
          ? 'bg-status-valid-bg text-status-valid-text'
          : 'bg-status-invalid-bg text-status-invalid-text'
      }`}
      role="status"
    >
      {valid ? 'Valid' : 'Invalid'}
    </span>
  )
}
