# Frontend — BotStackHQ ComplianceStack CA Dashboard

React + TypeScript dashboard for Chartered Accountants, built with **Vite** and deployed as a static bundle to **S3 + CloudFront** in `ap-south-1`. Server state via **TanStack Query**, UI state via **Zustand**. Real-time updates over a WebSocket to API Gateway.

Architecture context: [`docs/BotStackHQ_ComplianceStack_Architecture_Decision_Document.md`](../../docs/BotStackHQ_ComplianceStack_Architecture_Decision_Document.md). Surface inventory (which screens, which roles): [`docs/BotStackHQ_MVP_Scope_Lock.md`](../../docs/BotStackHQ_MVP_Scope_Lock.md) §06. Agent rules: [`Claude.md`](Claude.md).

There is **no client-facing UI** in Phase 1 — clients interact with the platform via WhatsApp only.

## Setup

```bash
# From repo root
npm install

# Copy env template and point at your local/dev backend
cp apps/frontend/.env.example apps/frontend/.env
```

## Run

```bash
npm run dev     --workspace=@botstackhq/frontend   # Vite dev server (default :5173)
npm run build   --workspace=@botstackhq/frontend   # type-check + bundle to dist/
npm run preview --workspace=@botstackhq/frontend   # serve the built bundle locally
```

## Environment variables

Vite only exposes variables prefixed `VITE_` to client code, and **every value shipped is public** — never put secrets in `.env`. Full list in [`.env.example`](.env.example):

- `VITE_API_BASE_URL` — backend REST base (e.g. `http://localhost:3000/v1`)
- `VITE_WS_URL` — WebSocket endpoint for real-time updates
- `VITE_AUTHKIT_CLIENT_ID` / `VITE_AUTHKIT_DOMAIN` — WorkOS public auth config

## Tests & lint

```bash
npm run lint --workspace=@botstackhq/frontend
npm run test --workspace=@botstackhq/frontend   # placeholder until tests land
```
