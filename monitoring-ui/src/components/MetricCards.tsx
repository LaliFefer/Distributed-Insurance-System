type Props = {
  total: number
  processed: number
  pending: number
  failed: number
}

export function MetricCards({ total, processed, pending, failed }: Props) {
  const cards = [
    { label: 'TOTAL POLICIES', value: total },
    { label: 'PROCESSED', value: processed },
    { label: 'PENDING', value: pending },
    { label: 'FAILED', value: failed },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="glass rounded-lg px-4 py-4">
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/40 mb-2">{c.label}</div>
          <div className="font-mono text-2xl text-white tabular-nums">{c.value}</div>
        </div>
      ))}
    </div>
  )
}
