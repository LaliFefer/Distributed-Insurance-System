export type PolicyRow = {
  id: number
  holder: string
  premium: number
  coverage: string
  status: string
  outboxStatus: string
  eventId: string | null
}

export type PaymentEventStatus = {
  state: string
  paymentId: number
  eventId: string
  policyNumber: string
  amount: number
  customerId: number
}

async function safeJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) {
    return null
  }
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function fetchPolicies(): Promise<PolicyRow[] | null> {
  try {
    const res = await fetch('/api/policies', { signal: AbortSignal.timeout(8000) })
    return safeJson<PolicyRow[]>(res)
  } catch {
    return null
  }
}

export type PaymentListRow = {
  id: number
  eventId: string
  policyNumber: string
  amount: number
  customerId: number
}

export async function fetchPayments(): Promise<PaymentListRow[] | null> {
  try {
    const res = await fetch('/api/payments', { signal: AbortSignal.timeout(8000) })
    return safeJson<PaymentListRow[]>(res)
  } catch {
    return null
  }
}

export async function fetchPaymentByEvent(eventId: string): Promise<PaymentEventStatus | null> {
  try {
    const res = await fetch(`/api/payment/event/${eventId}`, { signal: AbortSignal.timeout(8000) })
    if (res.status === 404) {
      return null
    }
    return safeJson<PaymentEventStatus>(res)
  } catch {
    return null
  }
}

export async function createPolicy(body: Record<string, unknown>): Promise<{
  id: number
  eventId?: string
} | null> {
  try {
    const res = await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      return null
    }
    return (await res.json()) as { id: number; eventId?: string }
  } catch {
    return null
  }
}

export async function fetchPolicyServiceUp(): Promise<boolean> {
  try {
    const r = await fetch('/api/policies', { method: 'GET', signal: AbortSignal.timeout(4000) })
    return r.ok
  } catch {
    return false
  }
}

export async function fetchPaymentServiceUp(): Promise<boolean> {
  try {
    const r = await fetch('/api/payments', { method: 'GET', signal: AbortSignal.timeout(4000) })
    return r.ok
  } catch {
    return false
  }
}

export async function fetchKafkaUp(): Promise<boolean> {
  try {
    const r = await fetch('/api/monitor/kafka', { signal: AbortSignal.timeout(4000) })
    if (!r.ok) {
      return false
    }
    const j = (await r.json()) as { status?: string }
    return j.status === 'UP'
  } catch {
    return false
  }
}
