import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type LogContextValue = {
  lines: string[]
  push: (line: string) => void
}

const LogContext = createContext<LogContextValue | null>(null)

export function LogProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<string[]>([])

  const push = useCallback((line: string) => {
    const stamp = new Date().toISOString()
    setLines((prev) => [...prev.slice(-500), `[${stamp}] ${line}`])
  }, [])

  const value = useMemo(() => ({ lines, push }), [lines, push])

  return <LogContext.Provider value={value}>{children}</LogContext.Provider>
}

export function useLogs() {
  const ctx = useContext(LogContext)
  if (!ctx) {
    throw new Error('useLogs must be used within LogProvider')
  }
  return ctx
}
