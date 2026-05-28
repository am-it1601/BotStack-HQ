# Code Standards — Monorepo-Wide

**Scope:** Baseline standards for all code in `botstackhq`, regardless of language or app.
Sub-project `code_standards.md` files add language-specific rules; they extend (never relax) these.

---

## 1. Non-Negotiables

These apply everywhere — backend, frontend, Python, infra:

1. **Tenant isolation:** Any data access scoped to a tenant uses `workspace_id` sourced from the authenticated context (JWT claims). Never from request body, query string, or URL path.
2. **No secrets in source.** Use env vars / AWS Secrets Manager. `.env` files are git-ignored.
3. **All timestamps UTC, ISO 8601.** Field names `created_at`, `updated_at`, `deleted_at`.
4. **Soft deletes only.** Set `deleted_at`; never hard-delete domain rows. (Exception: temp processing files.)
5. **UUID v4 for all primary keys.**
6. **No code for out-of-scope features.** See MVP Scope Lock.

---

## 2. Naming

| Thing                        | Convention                     | Example                              |
| ---------------------------- | ------------------------------ | ------------------------------------ |
| TypeScript files             | `kebab-case.ts`                | `filing-calendar.service.ts`         |
| Classes / types / interfaces | `PascalCase`                   | `FilingRecord`, `WorkspaceMember`    |
| Variables / functions        | `camelCase`                    | `getUpcomingFilings()`               |
| Constants / enums values     | `UPPER_SNAKE_CASE`             | `FILING_STATUS`, `INPUTS_OVERDUE`    |
| DB tables / models (Prisma)  | `PascalCase` singular          | `Client`, `FilingRecord`             |
| DB columns                   | `snake_case`                   | `workspace_id`, `effective_due_date` |
| Python files / modules       | `snake_case.py`                | `document_extractor.py`              |
| Python functions / vars      | `snake_case`                   | `extract_fields()`                   |
| API routes                   | `kebab-case`, plural resources | `/v1/filing-records`                 |
| Branches                     | `<type>/<short-desc>`          | `feat/filing-calendar`               |

Enum values must match the Data Model enum reference exactly (e.g. `FilingStatus`, `WorkflowStatus`). Do not invent new values.

---

## 3. Project Conventions

- **Language:** TypeScript everywhere except the Document AI service (Python 3.11+).
- **Shared types** live in `packages/@botstackhq/shared-types`. Anything crossing the backend↔frontend boundary (DTOs, enums, API envelopes) is defined there once.
- **API response envelope** is uniform across the stack: `{ data, meta, error }`. Detail in `apps/backend/context/api_rules.md`.
- **Pagination:** cursor-based, never offset. (Detail in api_rules.)
- **Errors:** Fail loud in dev, fail safe in prod. Never swallow errors silently. Log with `workspace_id` + `user_id` context where available.
- **Issue Fixes** - Fix root causes — do not layer workarounds.

---

## 4. Code Quality Bar

- **Functions do one thing.** If a function needs a comment to explain a section, that section is probably its own function.
- **No dead code, no commented-out blocks.** Delete it; git remembers.
- **Comments explain _why_, not _what_.** The code says what. keep pricise and shorter comment
- **No magic numbers/strings.** Use named constants or enums.
- **Guard clauses over nested conditionals.** Return early.
- **Prefer composition and proven patterns** over abstraction built for hypothetical futures. Build for Phase 1 scope, leave clean seams for Phase 2 — but don't build Phase 2.

---

## 5. Testing Baseline

- Business logic (services, workflow state transitions, filing/dependency rules) **must** have unit tests.
- Tenant isolation paths **must** have a test proving cross-workspace access is rejected.
- Tests live next to source (`*.spec.ts`) or in the app's test convention (see sub-project standards).
- A task is not "done" until lint, types, and the relevant tests pass.

---

## 6. Dependencies

- **No new runtime dependency without flagging** (see ai-workflow Hard Stops). The ADD locks the stack.
- Prefer the standard library / already-present packages.
- Pin versions. No floating `^`/`~` ranges on anything security- or behavior-sensitive.

---

## 7. Commits & PRs

- **Conventional Commits**, enforced by commitlint (`build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test`).
- One logical change per commit. Scope the type to the app where useful: `feat(backend):`, `fix(frontend):`.
- Keep diffs minimal and focused. Don't bundle reformatting with logic changes.
