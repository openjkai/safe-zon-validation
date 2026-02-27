const KBD_CLASS =
  'inline-block px-2 py-1 mx-0.5 font-mono text-xs bg-muted border border-border rounded-md'

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className={KBD_CLASS}>{children}</kbd>
}
