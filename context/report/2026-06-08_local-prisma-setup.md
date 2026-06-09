# Local Prisma Setup — Data Model Phase 1 (schemas + pgvector + RLS)

**Date:** 2026-06-08
**Area:** backend
**Scope status:** in-scope — implements the LOCKED Data Model (`docs/BotStackHQ_Data_Model_Phase_1.md`) and the locked DB decision (ADD §06). No deviation from locked docs.
**ClickUp:** prep for `86d34yr3z` ("[Infra] RDS PostgreSQL + Domain Schemas + pgvector"). The in-database DDL half of that ticket is built and proven locally here; RDS provisioning remains open on the ticket.

## Context

Ticket `86d34yr3z` bundles CDK RDS provisioning with in-database DDL (11 schemas, pgvector, RLS on tenant tables). The DDL cannot live in CDK — RLS can only be enabled on tables that exist, and tables/schemas come from Prisma migrations, which did not exist yet. Decision (Amit): build the Prisma migration layer locally first against the Docker `pgvector/pgvector:pg16` Postgres, then return to `86d34yr3z` to provision RDS and run the same migrations against it.

## What was done

- **`apps/backend/prisma/schema.prisma`** — full schema transcribed from the Data Model doc: 23 models, all enums, indexes, `multiSchema` over the 11 domain schemas (`public, workspace, client, filing, workflow, document, conversation, notification, audit, billing, knowledge`), `postgresqlExtensions` with `vector`, and `KnowledgeChunk.embedding Unsupported("vector(1536)")?`.
- **`apps/backend/prisma/migrations/20260608125723_init/migration.sql`** — Prisma-generated DDL (schemas, `CREATE EXTENSION vector`, 23 tables, indexes, FKs) plus a hand-authored MANUAL section for the two things Prisma can't express:
  - ivfflat index `knowledge_chunk_embedding_idx` (`vector_cosine_ops`, `lists = 100`) per Data Model §12.
  - RLS per Data Model §13: `ENABLE` + `FORCE ROW LEVEL SECURITY` and a `workspace_isolation` policy (`USING` + `WITH CHECK`) on all **20 tenant tables** (those with `workspace_id`). `public.FilingType` and `workspace.User` are excluded (no `workspace_id`, by design).
- **`apps/backend/src/prisma/prisma.service.ts` + `prisma.module.ts`** — `PrismaService` (connect/disconnect on Nest lifecycle), `@Global() PrismaModule`; imported into `app.module.ts`.
- **`apps/backend/package.json`** — added `@prisma/client` + `prisma` (^6.5.0; installed 6.19.3) and `db:generate|migrate|deploy|reset|studio` scripts.
- **`apps/backend/.env`** (gitignored) + corrected **`.env.example`** `DATABASE_URL` to match `docker-compose.yml` creds (`postgres:localdev`, was `botstackhq:botstackhq` which would not connect).

## Key decisions

- **RLS policy uses text comparison, not `::uuid`.** The doc's snippet casts `current_setting('app.workspace_id')::uuid`, but `String @default(uuid())` maps to a `text` column (no `@db.Uuid`), so `workspace_id` is `text`; `current_setting(...)` returns `text`. Using `current_setting('app.workspace_id', true)` (missing_ok) keeps it **fail-closed**: unset GUC → NULL → no rows visible/insertable.
- **`FORCE ROW LEVEL SECURITY` added** beyond the doc's `ENABLE`, so the policy binds the table owner too. Strengthens isolation; no model change.
- **`WITH CHECK` added** alongside `USING` so a tenant cannot insert rows for another workspace (verified). Faithful to §13's intent.
- **Enums get `@@schema(...)`** (required by multiSchema), assigned to the primary-consumer schema; cross-schema enum use (e.g. `filing.FilingRecord` → `notification.NotificationStatus`) works natively.

## Deviations / conflicts

- **Data Model §2.1 inconsistency (minor):** `Workspace`'s relation list omits the inverse of `GSTRegistration.workspace`. Prisma requires it; added `gst_registrations` (a virtual relation field — **no DB column**). Logged to Backlog `[data-model]` to fold into the doc later.
- No other deviations. No new tables/fields/enums beyond the doc.

## Follow-ups (logged to Backlog.md, 2026-06-08)

- `[infra]` Provision a dedicated **non-superuser app DB role** for RDS (RLS is bypassed by superusers — see Verification) — belongs to `86d34yr3z`.
- `[backend]` Per-request `SET LOCAL app.workspace_id` middleware (needs auth/JWT).
- `[backend]` Seed `public.FilingType` master (from Filing & Compliance Reference).
- `[backend]` Decide shared-types enum mirroring vs. Prisma-generated enums.

## Verification

- **lint:** pass (`eslint . --max-warnings 0`). **types/build:** pass (`nest build`). **prisma:** `validate` + `generate` clean; migration applied cleanly via `prisma migrate dev`.
- **DB checks (psql in container):** 11 schemas present; `vector` 0.8.2 installed; `KnowledgeChunk.embedding` = `vector(1536)` with `knowledge_chunk_embedding_idx` (ivfflat); 20 tables RLS `ENABLE`+`FORCE`; 20 `workspace_isolation` policies; `FilingType`/`User` correctly excluded; 23 base tables total.
- **Functional RLS test (as a NOSUPERUSER role):** workspace A sees only A's client (1), B only B's (1), no-context sees 0 (fail-closed), and a cross-tenant INSERT is rejected (`new row violates row-level security policy`). Note: the same test as the `postgres` superuser showed all rows — superusers bypass RLS, which is _why_ the prod app must connect as a non-superuser role (Backlog).
- Test data and the throwaway test role were rolled back; DB left clean (0 rows, role absent).
