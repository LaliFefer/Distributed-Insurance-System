export function SkeletonBar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-3 rounded-sm border border-[var(--border-dim)] shimmer-bg animate-shimmer ${className}`}
    />
  )
}
