import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  createPolicy,
  fetchKafkaUp,
  fetchPaymentByEvent,
  fetchPaymentServiceUp,
  fetchPayments,
  fetchPolicies,
  fetchPolicyServiceUp,
  type PaymentListRow,
} from './api/clients'
import { MetricCards } from './components/MetricCards'
import { NewPolicyDrawer } from './components/NewPolicyDrawer'
import { PolicyTable } from './components/PolicyTable'
import { ServiceHealthBar } from './components/ServiceHealthBar'
import { Sidebar, type NavKey } from './components/Sidebar'
import { useLogs } from './context/LogContext'
import { connectMonitor } from './realtime/connectMonitor'

function PaymentsView() {
  const q = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
    refetchInterval: 5000,
  })
  const rows = q.data as PaymentListRow[] | null | undefined
  return (
    <div className="glass rounded-lg border border-[var(--border-dim)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border-dim)] font-mono text-xs tracking-[0.25em] text-white/50">
        PAYMENTS
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="text-white/40 border-b border-[var(--border-dim)]">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">EVENT</th>
              <th className="px-4 py-2 text-left">POLICY #</th>
              <th className="px-4 py-2 text-left">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {!rows?.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-white/35">
                  {q.isLoading ? 'Loading…' : 'No payments recorded.'}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.eventId} className="border-b border-[var(--border-dim)]">
                  <td className="px-4 py-2 text-white/70 tabular-nums">{r.id}</td>
                  <td className="px-4 py-2 text-accent/80 truncate max-w-[220px]">{r.eventId}</td>
                  <td className="px-4 py-2 text-white/70">{r.policyNumber}</td>
                  <td className="px-4 py-2 text-white/70 tabular-nums">{r.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LogsView() {
  const { lines } = useLogs()
  return (
    <pre className="glass rounded-lg border border-[var(--border-dim)] p-4 h-[480px] overflow-auto font-mono text-[11px] text-white/60 whitespace-pre-wrap">
      {lines.length === 0 ? 'Awaiting telemetry…' : lines.join('\n')}
    </pre>
  )
}

export default function App() {
  const queryClient = useQueryClient()
  const { push } = useLogs()
  const [nav, setNav] = useState<NavKey>('dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sendingEventIds, setSendingEventIds] = useState<Set<string>>(new Set())

  const policiesQ = useQuery({
    queryKey: ['policies'],
    queryFn: fetchPolicies,
    refetchInterval: 5000,
  })

  const paymentsQ = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
    refetchInterval: 5000,
  })

  const healthQ = useQuery({
    queryKey: ['health'],
    queryFn: async () => ({
      policy: await fetchPolicyServiceUp(),
      payment: await fetchPaymentServiceUp(),
      kafka: await fetchKafkaUp(),
    }),
    refetchInterval: 10000,
  })

  const paymentEventIds = useMemo(() => {
    const s = new Set<string>()
    for (const row of paymentsQ.data ?? []) {
      if (row.eventId) {
        s.add(row.eventId)
      }
    }
    return s
  }, [paymentsQ.data])

  useEffect(() => {
    let dispose: (() => void) | undefined
    void connectMonitor((type, payload) => {
      push(`REALTIME ${type} ${JSON.stringify(payload)}`)
      void queryClient.invalidateQueries({ queryKey: ['policies'] })
      void queryClient.invalidateQueries({ queryKey: ['payments'] })
    }).then((d) => {
      dispose = d
    })
    return () => {
      dispose?.()
    }
  }, [push, queryClient])

  useEffect(() => {
    if (sendingEventIds.size === 0) {
      return
    }
    const timer = window.setInterval(() => {
      void (async () => {
        for (const eid of sendingEventIds) {
          try {
            const p = await fetchPaymentByEvent(eid)
            if (p?.state === 'PROCESSED') {
              setSendingEventIds((prev) => {
                const n = new Set(prev)
                n.delete(eid)
                return n
              })
              push(`PAYMENT CONSUMED eventId=${eid}`)
              void queryClient.invalidateQueries({ queryKey: ['payments'] })
              void queryClient.invalidateQueries({ queryKey: ['policies'] })
            }
          } catch {
            /* ignore */
          }
        }
      })()
    }, 2000)
    return () => window.clearInterval(timer)
  }, [sendingEventIds, push, queryClient])

  const policies = policiesQ.data ?? undefined

  const metrics = useMemo(() => {
    const total = policies?.length ?? 0
    let processed = 0
    for (const p of policies ?? []) {
      if (p.eventId && paymentEventIds.has(p.eventId)) {
        processed += 1
      }
    }
    const pending = Math.max(0, total - processed)
    return { total, processed, pending, failed: 0 }
  }, [policies, paymentEventIds])

  const handleCreate = async (payload: {
    policyNumber: string
    amount: number
    customerId: number
    coverage: string
    effectiveDate: string
  }) => {
    push(`POST /api/policies ${payload.policyNumber}`)
    const res = await createPolicy({
      policyNumber: payload.policyNumber,
      amount: payload.amount,
      customerId: payload.customerId,
      coverage: payload.coverage,
      effectiveDate: payload.effectiveDate,
    })
    if (!res?.eventId) {
      push('ERROR policy create failed or missing eventId')
      return false
    }
    setSendingEventIds((prev) => new Set(prev).add(res.eventId!))
    void queryClient.invalidateQueries({ queryKey: ['policies'] })
    return true
  }

  const health = healthQ.data ?? { policy: false, payment: false, kafka: false }

  return (
    <div className="min-h-screen bg-void text-white relative">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[420px] accent-glow z-0" />
      <div className="noise-overlay" />
      <ServiceHealthBar status={health} />
      <Sidebar active={nav} onNavigate={setNav} />
      <main className="pl-[216px] pt-8 min-h-screen relative z-10">
        <div className="px-6 pb-16 max-w-[1400px] mx-auto">
          {nav === 'dashboard' && (
            <div className="space-y-6">
              <MetricCards {...metrics} />
              <PolicyTable
                policies={policies}
                isPending={policiesQ.isPending}
                paymentEventIds={paymentEventIds}
                sendingEventIds={sendingEventIds}
                onNewPolicy={() => setDrawerOpen(true)}
              />
            </div>
          )}
          {nav === 'policies' && (
            <PolicyTable
              policies={policies}
              isPending={policiesQ.isPending}
              paymentEventIds={paymentEventIds}
              sendingEventIds={sendingEventIds}
              onNewPolicy={() => setDrawerOpen(true)}
            />
          )}
          {nav === 'payments' && <PaymentsView />}
          {nav === 'logs' && <LogsView />}
        </div>
      </main>
      <NewPolicyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
