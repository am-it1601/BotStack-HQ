# [DevEnv] Docker Compose Local Development Setup

**Date:** 2026-06-01
**Area:** infra (cross-cutting — touches root setup, consumed by backend/document-ai)
**ClickUp:** [86d34ydbw](https://app.clickup.com/t/86d34ydbw) — parent
**Scope status:** in-scope — Sprint 0 dev-environment setup; explicitly excludes Prisma migrations and seed work (those live on Sprint 1 task 86d34ytmc).

## What was done

One commit on `chore/code-quality-tooling`:

- **`12ed247 chore(devenv): add Docker Compose for local PostgreSQL 16 + pgvector`** — new + modified files:
  - [`docker-compose.yml`](../../docker-compose.yml) — single `postgres` service on `pgvector/pgvector:pg16`, env `POSTGRES_DB=botstackhq` / `POSTGRES_USER=postgres` / `POSTGRES_PASSWORD=localdev`, port `5432:5432`, named volume `postgres_data` mounted at `/var/lib/postgresql/data`. Adds a `pg_isready` healthcheck so `docker compose up -d --wait` returns only when the DB is actually reachable.
  - [`README.md`](../../README.md) — adds Docker Desktop to Prerequisites; adds `docker compose up -d` to "Getting Started"; new "Local database" section with the canonical `DATABASE_URL` for `apps/backend/.env`, plus up/logs/psql/down/down -v commands; explicit note that schema creation is owned by Prisma migrations in Sprint 1 — Compose only provisions a clean Postgres instance.

## Subtask-by-subtask result

- **86d34ydc3 — Write `docker-compose.yml`** → done in `12ed247`. Marked **shipped**.
- **86d34ydch — Initial Prisma migration** → already `cancelled` (moved to Sprint 1 task 86d34ytmc). No action.
- **86d34ydd0 — Verify prisma migrate dev against local Docker DB** → already `cancelled` (moved to Sprint 1). No action.

## Key decisions

- **Image choice locked to `pgvector/pgvector:pg16`** as specified in the task description, not vanilla `postgres:16` + extension install. Single image, no init script needed, version-matched to RDS (PG16 + pgvector is what the ADD calls for).
- **Added a healthcheck.** Not in the spec, but the acceptance criterion is "starts cleanly and DB is reachable on `localhost:5432`" — `pg_isready` is the canonical way to verify that, and it makes `docker compose up -d --wait` block correctly so backend startup scripts (and CI containers, later) get a deterministic ready signal. Six-line addition, no future maintenance burden.
- **Added `container_name: botstackhq-postgres`.** Stable, predictable name across developer machines for `docker compose exec`/`docker logs` snippets in the README. Without it, the name depends on the Compose project name which depends on the parent directory.
- **No `init.sql`, no schema creation.** Explicitly out of scope per the task description — Sprint 1 task 86d34ytmc owns the initial Prisma migration that creates the 11 domain schemas and enables the `pgvector` extension against this container.
- **No `version:` field in the Compose file.** Compose Spec — actively deprecated in v2; including it produces a warning. Keeps the file lint-clean.
- **`DATABASE_URL` documented in README, not added to `apps/backend/.env.example`.** The backend `.env.example` already documents `DATABASE_URL` from the prior repo-env-templates task; this report just calls out the exact local value to use rather than duplicating the template. No `.env.example` change needed.

## Deviations / conflicts

None. No deviation from the locked docs; no new third-party dependency (pgvector is already in the ADD); no schema change.

## Follow-ups

- None added to Backlog. The natural follow-ups (initial Prisma migration, `prisma migrate dev` validation, FilingType seed) are already tracked as Sprint 1 task 86d34ytmc per the parent task description.

## Verification

- **`docker compose config`** → pass (resolved spec rendered correctly, named volume + healthcheck both materialised).
- **`docker compose up -d --wait`** → **not run on this host** — the local Docker daemon was not running at the time of writing (`unable to get image ...: failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`). The Compose file's validity is confirmed by `docker compose config`; a live up/healthcheck cycle should be the first verification step when this lands in any developer's environment.
- **lint-staged (pre-commit hook)** → pass — `prettier --write` ran across `docker-compose.yml` and `README.md` cleanly.
- **commitlint** → pass — Conventional Commits format accepted.
- **eslint / types / tests** → n/a — no TS/JS changes.
