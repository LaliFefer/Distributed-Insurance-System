export type KafkaUiState = 'IDLE' | 'SENDING' | 'CONSUMED'

export function KafkaStateCell({ state }: { state: KafkaUiState }) {
  if (state === 'CONSUMED') {
    return (
      <span className="font-mono text-xs text-accent tracking-tight inline-flex items-center gap-1">
        <span aria-hidden>✓</span> PROCESSED
      </span>
    )
  }
  if (state === 'SENDING') {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1 h-2 overflow-hidden rounded-sm border border-[var(--border-dim)] bg-black/30 w-28">
          <span className="w-1/3 bg-accent/80 animate-slide" />
          <span className="w-1/3 bg-accent/50 animate-slide [animation-delay:120ms]" />
          <span className="w-1/3 bg-accent/30 animate-slide [animation-delay:240ms]" />
        </div>
        <span className="font-mono text-[10px] tracking-widest text-accent/90">PUBLISHING</span>
      </div>
    )
  }
  return <span className="font-mono text-xs text-white/35">—</span>
}
