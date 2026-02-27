const KBD_CLASS =
  'inline-block px-1.5 py-0.5 mx-0.5 font-mono text-[10px] bg-muted border border-border rounded'

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className={KBD_CLASS}>{children}</kbd>
}
