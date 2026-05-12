import { Activity } from 'lucide-react'

export type ServiceId = 'policy' | 'payment' | 'kafka'

type Props = {
  status: Record<ServiceId, boolean>
}

function Pill({ label, online }: { label: string; online: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 h-8 glass rounded-full">
      <span className="relative flex h-2.5 w-2.5">
        {online ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-pulseRing rounded-full bg-accent/40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </>
        ) : (
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500/80" />
        )}
      </span>
      <span className="font-mono text-[11px] tracking-wide text-white/70">{label}</span>
      {!online && (
        <span className="ml-1 flex items-center gap-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-400/90">
          <Activity className="h-3 w-3" />
          SERVICE OFFLINE
        </span>
      )}
    </div>
  )
}

export function ServiceHealthBar({ status }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-8 border-b border-[var(--border-dim)] glass flex items-center px-4 gap-3">
      <Pill label="POLICY" online={status.policy} />
      <Pill label="PAYMENT" online={status.payment} />
      <Pill label="KAFKA" online={status.kafka} />
    </header>
  )
}
