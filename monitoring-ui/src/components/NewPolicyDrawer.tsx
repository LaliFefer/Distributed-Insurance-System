import { X } from 'lucide-react'
import { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: {
    policyNumber: string
    amount: number
    customerId: number
    coverage: string
    effectiveDate: string
  }) => Promise<boolean>
}

export function NewPolicyDrawer({ open, onClose, onSubmit }: Props) {
  const [policyNumber, setPolicyNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [coverage, setCoverage] = useState('COMPREHENSIVE')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) {
    return null
  }

  const submit = async () => {
    setBusy(true)
    try {
      const ok = await onSubmit({
        policyNumber,
        amount: Number(amount),
        customerId: Number(customerId),
        coverage,
        effectiveDate,
      })
      if (ok) {
        setPolicyNumber('')
        setAmount('')
        setCustomerId('')
        setEffectiveDate('')
        onClose()
      }
    } finally {
      setBusy(false)
    }
  }

  const fieldClass =
    'w-full bg-transparent border-0 border-b border-[var(--border-dim)] py-2 font-mono text-sm text-white/90 outline-none focus:border-accent/60'
  const labelClass = 'font-mono text-[10px] tracking-[0.2em] text-white/35 block mb-2'

  return (
    <>
      <button
        type="button"
        aria-label="Close drawer overlay"
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 bottom-0 z-[70] w-[440px] glass-strong border-l border-[var(--border-dim)] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-dim)]">
          <h3 className="font-mono text-sm tracking-[0.2em] text-white/70">NEW POLICY</h3>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/80">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          <label className="block">
            <span className={labelClass}>POLICY NUMBER</span>
            <input className={fieldClass} value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
          </label>
          <label className="block">
            <span className={labelClass}>PREMIUM (USD)</span>
            <input
              className={fieldClass}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>CUSTOMER ID</span>
            <input
              className={fieldClass}
              type="number"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>COVERAGE</span>
            <select className={fieldClass} value={coverage} onChange={(e) => setCoverage(e.target.value)}>
              <option className="bg-surface text-white" value="COMPREHENSIVE">
                COMPREHENSIVE
              </option>
              <option className="bg-surface text-white" value="LIMITED">
                LIMITED
              </option>
              <option className="bg-surface text-white" value="CATASTROPHIC">
                CATASTROPHIC
              </option>
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>EFFECTIVE DATE</span>
            <input
              type="date"
              className={fieldClass}
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </label>
        </div>
        <div className="p-5 border-t border-[var(--border-dim)]">
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="w-full py-3 font-mono text-xs tracking-[0.25em] bg-accent text-void hover:bg-accent/90 transition-colors disabled:opacity-40"
          >
            {busy ? 'SUBMITTING…' : 'COMMIT'}
          </button>
        </div>
      </aside>
    </>
  )
}
