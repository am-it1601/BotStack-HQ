# Backlog — Deferred Items & Action Tracking

**Purpose:** Single tracking file for work that is postponed, discovered, or deferred during agent sessions. Nothing gets silently dropped. Every agent appends here; no one deletes entries — they move them to `Done`.

---

## How to use

When you defer work, discover tech debt, or push something out of scope, append a row to **Open**. Use this format:

```
- [ ] [AREA] <concise description> — reason deferred — (raised: YYYY-MM-DD, by: <task slug>)
```

`AREA` = `backend | frontend | document-ai | infra | data-model | cross`

When an item is completed, move the line to **Done** and check it: `- [x] ...— (done: YYYY-MM-DD)`.

If an item is a **scope change** (requires touching a LOCKED doc), tag it `[SCOPE-CHANGE]` — these need Amit's sign-off before any code, per the Scope Lock change process.

---

## Open

<!-- Append new items below this line -->

- [ ] [infra] Point the registered `botstackhq.com` nameservers at the deployed Route 53 zone's NS (Registered domains → Edit name servers) — one-time operator step after `cdk deploy BotStackHqDns`; NS values are in the `HostedZoneNameServers` output — deferred: requires deploy + console/registrar access — (raised: 2026-06-04, by: domain-dns-setup)
- [ ] [infra] Add subdomain alias (A/AAAA) records — `dashboard` → CloudFront, `api`/`wh` → API Gateway custom domains — deferred: targets don't exist until the CloudFront-hosting and API Gateway tasks land; wire records in those stacks — (raised: 2026-06-04, by: domain-dns-setup)
- [ ] [infra] Multi-env subdomain/zone strategy (delegated sub-zones per env vs. env-prefixed records under the apex zone) — deferred: Sprint 0 provisions the single apex zone + production subdomains only; `domainName` is context-parameterized as the seam — (raised: 2026-06-04, by: domain-dns-setup)
- [ ] [infra] Populate all `botstackhq/dev/*` secrets with real values — deferred: the `key.yml`/`populate-secrets.cjs` workflow was retired (2026-06-04) and the dev secrets reset to placeholders. Enter real values manually (AWS Console or `aws secretsmanager put-secret-value`) when needed: OpenAI/Anthropic keys, AuthKit `clientId`+`apiKey`+`webhookSecret` (webhookSecret issued in WorkOS dashboard), WhatsApp `accessToken`+`verifyToken`+`phoneNumberId`+`businessAccountId` (Meta fields depend on Meta Developer app, ClickUp 86d34yd6c) — (raised: 2026-06-04, by: third-party-secrets-population; updated: 2026-06-04)
- [ ] [infra] Provision + populate **staging** Secrets Manager secrets — deferred: only the `BotStackHqBootstrap-dev` stack is deployed. Deploy the bootstrap stack for staging, then enter real values manually per the dev approach above — (raised: 2026-06-04, by: third-party-secrets-population; updated: 2026-06-04)
- [ ] [infra] Grant the `botstackhq-cdk-deployer` user (or a dedicated ops role) `secretsmanager:GetSecretValue`+`PutSecretValue` on `botstackhq/*` — deferred: deployer policy currently lacks it, so secret population required the `bruno-onb-dev` admin profile; needs root/admin to add a policy version — (raised: 2026-06-04, by: third-party-secrets-population)
- [ ] [infra] Provision a dedicated **non-superuser application DB role** for RDS and have the backend connect as it — required because RLS is bypassed by superusers/owners (verified locally: `postgres` superuser sees all rows; isolation only enforced when connecting as a NOSUPERUSER role). The `workspace_isolation` policies are already correct; only the connecting role is missing. Belongs to RDS ticket 86d34yr3z — (raised: 2026-06-08, by: local-prisma-setup)
- [ ] [backend] Wire per-request tenant context — set `SET LOCAL app.workspace_id = '<workspace_id from JWT>'` in a transaction-scoped Prisma middleware/interceptor so RLS activates per request — deferred: depends on auth/JWT, not built yet. Until then RLS is enforced in the DB but the API sets no workspace context (fail-closed: queries return nothing) — (raised: 2026-06-08, by: local-prisma-setup)
- [ ] [backend] Seed the global `public.FilingType` master table (and any baseline knowledge docs) — deferred: seed values come from the Filing & Compliance Reference; out of scope for schema setup — (raised: 2026-06-08, by: local-prisma-setup)
- [ ] [backend] Decide whether Data Model enums should be mirrored into `packages/shared-types` (per backend code standards "import, don't duplicate") vs. consuming Prisma-generated enums — deferred: no frontend consumer yet — (raised: 2026-06-08, by: local-prisma-setup)
- [ ] [data-model] Doc inconsistency: §2.1 `Workspace` relation list omits the inverse of `GSTRegistration.workspace`; Prisma requires it (added as `gst_registrations` — a virtual relation field, no DB column). Harmless; fold into the doc on its next revision — (raised: 2026-06-08, by: local-prisma-setup)
- [ ] [infra] Run the Prisma initial migration (`prisma migrate deploy`) against RDS — RDS is private (no public access, no NAT), so this must run from inside the VPC (SSM bastion / CodeBuild-in-VPC / one-off migration Lambda). This is what lands the 11 schemas + pgvector + RLS on RDS, completing the schema/pgvector/RLS acceptance criteria of 86d34yr3z — (raised: 2026-06-08, by: rds-provisioning)
- [ ] [infra] Optional RDS observability (ADD §16): CPU alarm → existing `alertsTopic`, and Performance Insights — omitted from 86d34yr3z to keep the data-tier diff focused — (raised: 2026-06-08, by: rds-provisioning)
- [ ] [infra] Production bundling for the backend Lambda in `BotStackHqApiStack` — the code asset currently points at `apps/backend/dist` (compiled JS only, no `node_modules`/Prisma engine), enough to synth but not to run. Replace with a real bundle (esbuild/Docker bundling incl. Prisma query engine for `linux-arm64`) before any API deploy — (raised: 2026-06-09, by: nestjs-scaffold)
- [ ] [infra] Attach the backend Lambda to the platform VPC + `BotStackHqDataStack.dbClientSecurityGroup` so it can reach RDS — left decoupled in the scaffold to avoid cross-stack deploy-order coupling while the data tier is undeployed — (raised: 2026-06-09, by: nestjs-scaffold)
- [ ] [infra] Add the AuthKit JWT Lambda authorizer to the REST API and `$connect` route, plus API Gateway usage-plan rate limiting (ADD §05) — scaffold maps routes with no authorizer yet — (raised: 2026-06-09, by: nestjs-scaffold)
- [ ] [backend] Implement WebSocket handling in the backend Lambda — `$connect`/`$disconnect`/`$default` are mapped to the NestJS Lambda, but serverless-express handles HTTP only; add a WS event branch + RDS connection-state persistence (api_rules §2) — (raised: 2026-06-09, by: nestjs-scaffold)
- [ ] [data-model] Doc/task inconsistency: ClickUp 86d34ytmy lists an `agent` module not present in ADD §04's module list. Scaffolded `AgentModule` per the task (agent orchestration has its own Flow Specs doc); fold `agent` into ADD §04 on its next revision — (raised: 2026-06-09, by: nestjs-scaffold)

---

## Done

<!-- Completed items moved here -->
