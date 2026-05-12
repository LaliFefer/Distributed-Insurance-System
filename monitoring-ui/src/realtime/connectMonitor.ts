import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

export type MonitorPayload = Record<string, unknown>

/**
 * Optional ASP.NET Core SignalR hub (set `VITE_SIGNALR_URL`).
 * This JVM backend pushes JSON over WebSocket at `/ws/monitor` — used as default transport.
 */
export async function connectMonitor(
  onMessage: (type: string, payload: MonitorPayload) => void
): Promise<() => void> {
  const hubUrl = import.meta.env.VITE_SIGNALR_URL as string | undefined
  if (hubUrl) {
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect()
      .build()
    connection.on('PolicyCreated', (payload: MonitorPayload) => onMessage('PolicyCreated', payload))
    connection.on('OutboxProcessed', (payload: MonitorPayload) => onMessage('OutboxProcessed', payload))
    try {
      await connection.start()
      return () => {
        void connection.stop()
      }
    } catch {
      // Fall back to Spring WebSocket JSON protocol
    }
  }

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const ws = new WebSocket(`${proto}//${window.location.host}/ws/monitor`)
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data as string) as { type: string; payload: MonitorPayload }
      if (data?.type && data.payload) {
        onMessage(data.type, data.payload)
      }
    } catch {
      /* ignore parse errors */
    }
  }
  return () => {
    ws.close()
  }
}
