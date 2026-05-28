# Backend — BotStackHQ ComplianceStack

NestJS (TypeScript) business-logic API for the ComplianceStack platform. Deployed to **AWS Lambda** behind API Gateway (REST + WebSocket) in `ap-south-1`. Locally runs on Express via `nest start`.

Architecture context lives in [`docs/BotStackHQ_ComplianceStack_Architecture_Decision_Document.md`](../../docs/BotStackHQ_ComplianceStack_Architecture_Decision_Document.md); agent rules in [`Claude.md`](Claude.md).

## Setup

```bash
# From repo root
npm install

# Copy env template and fill in local values
cp apps/backend/.env.example apps/backend/.env
```

Open `.env` and set at minimum `DATABASE_URL` (point at a local Postgres with the `pgvector` extension), `AUTHKIT_*` (your dev WorkOS workspace), and `DOCUMENTS_S3_BUCKET` (your dev bucket).

## Run

```bash
# Dev server with watch reload (port from .env PORT, default 3000)
npm run start:dev --workspace=@botstackhq/backend

# One-shot build
npm run build --workspace=@botstackhq/backend
```

All routes are prefixed `/v1` (see [`src/main.ts`](src/main.ts)). Responses use the `{ data, meta, error }` envelope.

## Environment variables

The full set with descriptions lives in [`.env.example`](.env.example). Highlights:

- `DATABASE_URL` / `DATABASE_SECRET_NAME` — local URL vs. prod Secrets Manager ref
- `AUTHKIT_*` — WorkOS auth (JWT verification at API Gateway)
- `DOCUMENTS_S3_BUCKET` — uploads from clients via WhatsApp
- `SQS_*_QUEUE_URL` — document processing, WhatsApp dispatch, LLM jobs
- `OPENAI_API_KEY_SECRET_NAME` / `ANTHROPIC_API_KEY_SECRET_NAME` — LLM provider secrets

**Production secrets must come from AWS Secrets Manager**, not raw env vars (ADD §16.3).

## Tests & lint

```bash
npm run lint --workspace=@botstackhq/backend
npm run test --workspace=@botstackhq/backend   # placeholder until tests land
```
