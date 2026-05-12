# Insurance Monitoring UI

React **18** + **Vite** + **TypeScript** dashboard for the insurance-system backend: policy table, metrics, health pills, optional real-time feed, and **SpringDoc**-compatible flows.

## Stack

- **Tailwind CSS v3** — glass / “precision instrument” theme
- **TanStack Query** — polling (`/api/policies` every 5s, payments every 5s)
- **Lucide React** — icons
- **@microsoft/signalr** — optional hub when `VITE_SIGNALR_URL` is set; otherwise **WebSocket** JSON to `ws://…/ws/monitor` (Spring `policy-service`)

## Dev

From repo root (policy **8081**, payment **8082** running locally):

```bash
cd monitoring-ui
npm install
npm run dev
```

Vite proxies:

| Path | Target |
|------|--------|
| `/api/policies`, `/api/monitor` | `http://127.0.0.1:8081` (avoids `localhost` → `::1` vs IPv4-only JVM on Windows) |
| `/api/payments`, `/api/payment` | `http://127.0.0.1:8082` |
| `/ws` | HTTP target `http://127.0.0.1:8081` with `ws: true` (upgrade to `/ws/monitor`) |

## Build

```bash
npm run build
```

Preview: `npm run preview`

## Env (optional)

- `VITE_SIGNALR_URL` — ASP.NET Core SignalR hub URL; if unset, the UI uses the Spring WebSocket JSON stream.
