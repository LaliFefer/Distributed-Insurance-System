import { useMemo } from 'react'
import type { PolicyRow } from '../api/clients'
import { KafkaStateCell, type KafkaUiState } from './KafkaStateCell'
import { SkeletonBar } from './SkeletonBar'

type Props = {
  policies: PolicyRow[] | undefined
  /** True until the first successful policies fetch completes */
  isPending: boolean
  paymentEventIds: Set<string>
  sendingEventIds: Set<string>
  onNewPolicy: () => void
}

function resolveKafkaState(row: PolicyRow, paymentEventIds: Set<string>, sending: Set<string>): KafkaUiState {
  const eid = row.eventId
  if (!eid) {
    return 'IDLE'
  }
  if (paymentEventIds.has(eid)) {
    return 'CONSUMED'
  }
  if (sending.has(eid)) {
    return 'SENDING'
  }
  if (row.outboxStatus === 'PROCESSED') {
    return 'SENDING'
  }
  return 'IDLE'
}

export function PolicyTable({
  policies,
  isPending,
  paymentEventIds,
  sendingEventIds,
  onNewPolicy,
}: Props) {
  const rows = useMemo(() => policies ?? [], [policies])

  return (
    <div className="glass rounded-lg overflow-hidden border border-[var(--border-dim)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-dim)]">
        <h2 className="font-mono text-xs tracking-[0.25em] text-white/50">POLICY STREAM</h2>
        <button
          type="button"
          onClick={onNewPolicy}
          className="font-mono text-xs px-3 py-1.5 border border-accent/50 text-accent hover:bg-accent/10 transition-colors"
        >
          NEW POLICY
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="text-white/40 border-b border-[var(--border-dim)]">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">HOLDER</th>
              <th className="px-4 py-3 font-medium">PREMIUM</th>
              <th className="px-4 py-3 font-medium">COVERAGE</th>
              <th className="px-4 py-3 font-medium">STATUS</th>
              <th className="px-4 py-3 font-medium">KAFKA</th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border-dim)]">
                  <td className="px-4 py-3" colSpan={6}>
                    <SkeletonBar className="w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-white/35" colSpan={6}>
                  No policies yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const k = resolveKafkaState(row, paymentEventIds, sendingEventIds)
                return (
                  <tr key={row.id} className="border-b border-[var(--border-dim)] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/80 tabular-nums">{row.id}</td>
                    <td className="px-4 py-3 text-white/80">{row.holder}</td>
                    <td className="px-4 py-3 text-accent/90 tabular-nums">{Number(row.premium).toFixed(2)}</td>
                    <td className="px-4 py-3 text-white/55">{row.coverage}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.status === 'ACTIVE'
                            ? 'text-accent/90'
                            : 'text-amber-300/80'
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <KafkaStateCell state={k} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
