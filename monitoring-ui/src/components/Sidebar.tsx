import { ActivitySquare, CreditCard, FileText, LayoutDashboard, ScrollText } from 'lucide-react'

export type NavKey = 'dashboard' | 'policies' | 'payments' | 'logs'

type Props = {
  active: NavKey
  onNavigate: (key: NavKey) => void
}

const items: { key: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'policies', label: 'Policies', icon: FileText },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'logs', label: 'Logs', icon: ScrollText },
]

export function Sidebar({ active, onNavigate }: Props) {
  return (
    <aside className="fixed left-0 top-8 bottom-0 w-[216px] z-30 border-r border-[var(--border-dim)] glass flex flex-col pt-6 px-4">
      <div className="font-mono text-lg tracking-tight text-accent mb-10 select-none">INS//</div>
      <nav className="flex flex-col gap-1">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md border text-left font-mono text-xs tracking-wide transition-colors ${
                isActive
                  ? 'border-accent/40 bg-accent/5 text-accent'
                  : 'border-transparent text-white/60 hover:text-white/85 hover:border-[var(--border-dim)]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>
      <div className="mt-auto pb-6 pt-6 border-t border-[var(--border-dim)]">
        <div className="flex items-center gap-2 text-[10px] font-mono text-white/35">
          <ActivitySquare className="h-3.5 w-3.5" />
          MONITOR v1
        </div>
      </div>
    </aside>
  )
}
