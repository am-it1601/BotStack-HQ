# [Repo] Environment Templates, .gitignore & READMEs

**Date:** 2026-05-28
**Area:** cross-cutting (repo + every app)
**ClickUp:** [86d34yd19](https://app.clickup.com/t/86d34yd19) — parent
**Scope status:** in-scope — Sprint 0 repository setup, no production-feature work.

## What was done

Three commits on `chore/code-quality-tooling`:

1. **`352895a chore(repo): add per-app .env.example templates`** — new files:
   - [`apps/backend/.env.example`](../../apps/backend/.env.example) — runtime, AWS, RDS, AuthKit, S3, SQS, EventBridge, LLM provider, WhatsApp, internal-service-wiring vars. Production secrets are documented via `_SECRET_NAME` references (Secrets Manager) per ADD §16.3.
   - [`apps/frontend/.env.example`](../../apps/frontend/.env.example) — only public `VITE_` values (API URL, WS URL, AuthKit client ID/domain/redirect).
   - [`apps/document-ai/.env.example`](../../apps/document-ai/.env.example) — region, S3 bucket, SQS ingress, OpenAI key (Secrets Manager ref + local-dev plain var), Tesseract path.

2. **`1297a8d docs(repo): extend root README with env setup and deployment guide`** — updates [`README.md`](../../README.md):
   - Adds `cp .env.example .env` steps for each app to "Getting Started".
   - Adds a "Deployment" section covering CDK-provisioned infra in `ap-south-1`, three environments, CI/CD targets per app, and the Secrets Manager policy.

3. **`6fd950f docs(apps): add per-app READMEs (backend, frontend) and extend document-ai`** — new/updated files:
   - [`apps/backend/README.md`](../../apps/backend/README.md) — setup, run, env summary, lint/test.
   - [`apps/frontend/README.md`](../../apps/frontend/README.md) — setup, run, env summary, lint/test; flags that `VITE_` values are public.
   - [`apps/document-ai/README.md`](../../apps/document-ai/README.md) — adds `.env.example` reference + env-var section to the existing content.

## Subtask-by-subtask result

- **86d34yd20 — backend `.env.example`** → done in commit `352895a`. Marked **shipped**.
- **86d34yd2c — root `.gitignore`** → **already complete in prior commit.** Audit against the subtask checklist:
  - `node_modules/` ✓ (line 2)
  - `.env` + `.env.*` with `!.env.example` exception ✓ (lines 28–30)
  - `dist/` ✓ (line 5)
  - `__pycache__/` ✓ (line 16)
  - `.DS_Store` ✓ (line 40)
  - `cdk.out/` ✓ (line 9) — note: subtask text reads ".cdk.out" but the actual CDK output dir is `cdk.out` (no leading dot); current entry is correct.
  - No code change needed. Marked **shipped** with audit comment on the subtask.
- **86d34yd2n — root README.md** → done in commit `1297a8d`. Marked **shipped**.

## Key decisions

- **`_SECRET_NAME` convention for prod secrets.** Each backend/document-ai secret has two variables: a plain-value var for local dev (e.g. `DATABASE_URL`, `OPENAI_API_KEY`) and a `_SECRET_NAME` var pointing at AWS Secrets Manager for prod (e.g. `DATABASE_SECRET_NAME`). Codifies ADD §16.3 directly in the template instead of relying on docs people don't read.
- **Frontend `.env.example` carries only public values.** Called out explicitly in the file header that everything Vite exposes is shipped to the browser, to head off the predictable mistake of putting an AuthKit API key (vs. client ID) in `VITE_*`.
- **Bundled frontend/document-ai `.env.example` into the same commit as the backend subtask.** The parent task AC requires all three; they're the same kind of work and read cleanly as one diff. Subtask 86d34yd20 is the named owner.
- **Did not modify `.gitignore`.** Subtask text mentions ".cdk.out" but the canonical CDK output dir is `cdk.out`; the existing entry is correct. Documented in the audit comment rather than changing the file.

## Deviations / conflicts

None. All AC items satisfied; no doc deviation; no schema/dep changes.

## Follow-ups

- None added to Backlog. Real values for `AUTHKIT_*`, `DOCUMENTS_S3_BUCKET`, `SQS_*`, etc. land naturally when their owning Sprint 0 tasks ship ([AWS] Account Setup, [Accounts] Third-Party Service Account Setup, [Env] Staging Environment Bootstrap).

## Verification

- prettier: pass (lint-staged ran on all md files via the pre-commit hook for commits `1297a8d` and `6fd950f`).
- eslint: n/a — no TS/JS changes.
- types: n/a.
- tests: n/a — placeholder scripts only.
- manual: each new `.env.example` reviewed against the running scaffold code (`apps/backend/src/main.ts`, `apps/frontend/src/App.tsx`, `apps/document-ai/app/main.py`) and the ADD components.
