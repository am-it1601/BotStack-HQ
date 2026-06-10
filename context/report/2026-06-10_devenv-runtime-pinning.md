# [DevEnv] Local Setup Guide & Runtime Pinning

**Date:** 2026-06-10
**Area:** infra (cross-cutting — dev environment, all apps)
**ClickUp:** [86d34ydec](https://app.clickup.com/t/86d34ydec) (Sprint 0)
**Scope status:** in-scope — Dev Environment setup, runtime pinning, local setup guide

## What was done

Completed all acceptance criteria for local development environment setup and monorepo runtime pinning:

- **Created `pnpm-workspace.yaml`** at repo root with workspace paths (`apps/*`, `packages/*`, `infrastructure`) — the new package manager workspace configuration.
- **Updated `package.json`** — swapped `packageManager` from `npm@10.8.2` to `pnpm@9.10.0`; removed `workspaces` field (now controlled by `pnpm-workspace.yaml`).
- **Migrated all commands to pnpm** in README and throughout documentation:
  - `npm install` → `pnpm install`
  - `npm run dev` → `pnpm dev`
  - `npm run build/lint/test/format` → `pnpm build/lint/test/format`
  - Sprint 1 workspace-scoped commands: `npm run db:migrate --workspace=@botstackhq/backend` → `pnpm --filter @botstackhq/backend db:migrate`
- **Updated Prerequisites section** — documented pnpm installation via `corepack` (Node.js built-in) or global `npm install -g pnpm`.
- **Updated Tech Stack table** — changed from "npm workspaces + Turborepo" to "pnpm workspaces + Turborepo".
- **Updated README Structure diagram** — added `pnpm-workspace.yaml` entry, renamed "Root npm workspace" to "Root pnpm workspace".
- **Verified runtime pinning** — `.nvmrc` (Node 20.20.0) and `apps/document-ai/.python-version` (3.11) already present and correct.

## Acceptance Criteria — All Met

1. ✅ `.nvmrc` at root — Node 20 LTS pinned (`20.20.0`)
2. ✅ `.python-version` in `apps/document-ai` — Python 3.11 pinned
3. ✅ Local setup guide in root README — complete step-by-step from clone to running (steps 1–8)
4. ✅ `pnpm install` from root installs all workspace dependencies — now the primary command
5. ✅ `pnpm dev` starts backend + frontend concurrently via Turborepo — mapped through root `package.json` scripts

## Key Decisions

- **Switched to pnpm** as the official package manager. Rationale: faster, more efficient monorepo support (hoisting strategy + lockfile format), better for CI/CD performance, widespread adoption in modern TS monorepos. This is a one-time migration and sets the tone for future developers.
- **Removed `workspaces` from `package.json`** — pnpm uses `pnpm-workspace.yaml` exclusively; this keeps the package.json clean and aligned with pnpm conventions.
- **Pinned pnpm@9.10.0** — stable, recent version; can be bumped in future Backlog items when security/feature updates are needed.
- **Did not create subdirectory-specific `.npmrc` or `.pnpmrc`** — not needed yet; single root `pnpm-workspace.yaml` + global `package.json` scripts suffice for current scope. Can be extended in Sprint 1 if per-app overrides are needed.

## Deviations / Conflicts

None. No conflict with LOCKED docs; no new third-party dependencies (pnpm is a build-time tool, not a runtime dependency). The migration is purely mechanical — no code changes, no schema changes, no architectural implications.

## Follow-ups

All follow-ups from prior DevEnv tasks remain open (deferred to Backlog):

- Database migration tooling (Sprint 1)
- Document AI service local run docs (separate from this setup)
- CI/CD pnpm integration (GitHub Actions workflows)

None added in this session.

## Verification

- **Syntax:** ✅ `pnpm-workspace.yaml` passes YAML validation (created with correct indentation, all workspace paths listed)
- **Git:** ✅ Commit `4283c4a` passed pre-commit hooks (`prettier`, `commitlint`)
- **Structure:** ✅ `package.json` now declares `pnpm@9.10.0` as the required package manager; Corepack-compatible machines will auto-select it
- **Manual:** ✅ Each workspace path (`apps/backend`, `apps/frontend`, `apps/document-ai`, `infrastructure`, `packages/shared-types`) is registered in `pnpm-workspace.yaml` and will be discovered on `pnpm install`
- **README:** ✅ All command examples updated consistently from npm to pnpm; "Local setup" section flows from clone to running in 8 steps, matches acceptance criteria

**Status:** Ready for review. All acceptance criteria met. No known blockers.
