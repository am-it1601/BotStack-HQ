# BotStackHQ — Monorepo

AI Agent Operating Platform. This repository contains the **ComplianceStack — Phase 1 MVP** build: a bilateral AI-powered compliance workflow automation platform for Chartered Accountants and Legal Service Providers.

See [`docs/Product_Overview.md`](docs/Product_Overview.md) and the locked [Architecture Decision Document](docs/BotStackHQ_ComplianceStack_Architecture_Decision_Document.md) for product and architecture context.

## Structure

```
botstackhq/
├── apps/
│   ├── backend/          → NestJS on AWS Lambda (TypeScript)
│   ├── frontend/         → React + Vite CA dashboard (TypeScript)
│   └── document-ai/      → Python FastAPI document extraction service
├── infrastructure/       → AWS CDK (TypeScript) — infrastructure as code
├── packages/
│   └── shared-types/     → Shared TypeScript types across the stack
├── .github/workflows/    → CI/CD pipelines (GitHub Actions)
├── .husky/               → Git pre-commit hooks
├── package.json          → Root pnpm workspace
├── pnpm-workspace.yaml   → pnpm workspace configuration
└── turbo.json            → Turborepo task pipeline
```

## Tech Stack (per ADD — LOCKED)

| Layer          | Choice                                                          |
| -------------- | --------------------------------------------------------------- |
| Backend        | NestJS (Node.js / TypeScript) on AWS Lambda                     |
| Frontend       | React + TypeScript + TanStack Query + Zustand, built with Vite  |
| Document AI    | Python FastAPI (PyMuPDF, pdfplumber, Unstructured, pytesseract) |
| Infrastructure | AWS CDK (TypeScript), region `ap-south-1` (Mumbai)              |
| Monorepo       | pnpm workspaces + Turborepo                                     |

## Prerequisites

- **Node.js 20 LTS** — version pinned in [`.nvmrc`](.nvmrc); run `nvm use` (or `fnm use`) at the repo root to select it.
- **pnpm >= 9** — fast, efficient package manager for this monorepo. Enable via **corepack** (recommended):
  ```bash
  corepack enable
  ```
  This activates Node.js's built-in package manager support and uses the pinned pnpm version (`9.10.0`) from `package.json`.
  - Alternative: `npm install -g pnpm` (global install).
- **Python 3.11** (Document AI service) — version pinned in [`apps/document-ai/.python-version`](apps/document-ai/.python-version); `pyenv` selects it automatically inside that folder.
- **Docker Desktop** (or Docker Engine + Compose v2) — runs the local PostgreSQL instance.
- **AWS CLI v2** configured against an `ap-south-1` profile (only needed for `infrastructure/` work).

## Local setup — clone to running in under 30 minutes

The canonical path to a working local environment. It targets the runtimes pinned in
[`.nvmrc`](.nvmrc) (Node 20 LTS) and [`apps/document-ai/.python-version`](apps/document-ai/.python-version) (Python 3.11).

**1. Clone the repo**

```bash
git clone <repo-url> botstackhq && cd botstackhq
```

**2. Select the pinned runtimes**

```bash
nvm use            # reads .nvmrc → Node 20 LTS  (run `nvm install` first if not installed)
# Python 3.11 (Document AI) is pinned in apps/document-ai/.python-version;
# pyenv users: `pyenv install 3.11` once, then it auto-selects inside that folder.
```

**3. Install all workspace dependencies** — one command installs the whole monorepo

```bash
pnpm install       # pnpm workspaces → apps/*, packages/*, and infrastructure
```

**4. Configure environment variables**

```bash
cp apps/backend/.env.example     apps/backend/.env
cp apps/frontend/.env.example    apps/frontend/.env
cp apps/document-ai/.env.example apps/document-ai/.env
```

Each app's `.env.example` is the canonical, documented list of variables it expects. Fill in local
values; real secrets are never committed (see [Secrets](#secrets)).

**5. Start the local database**

```bash
docker compose up -d        # PostgreSQL 16 + pgvector on localhost:5432 — see "Local database" below
```

**6. Run database migrations** _(Sprint 1)_

```bash
pnpm --filter @botstackhq/backend db:migrate        # Prisma migrate
```

**7. Seed baseline data** _(Sprint 1)_

```bash
pnpm --filter @botstackhq/backend db:seed           # seed dev data
```

> **Steps 6–7 land in Sprint 1.** Prisma migrations/seed tooling lives in `apps/backend` and does not
> exist yet — until then the Compose Postgres comes up empty and these steps are no-ops. They are
> documented here so the end-to-end flow is complete the moment that tooling lands.

**8. Run the apps**

```bash
pnpm dev                    # Start both backend (NestJS, :3000) + frontend (Vite, :5173) concurrently
pnpm dev:backend            # Start backend only
pnpm dev:frontend           # Start frontend only
```

The Python Document AI service runs separately — see [Document AI (Python)](#document-ai-python).

### All root commands

**Development:**

```bash
pnpm dev                    # turbo run dev — start all apps concurrently
pnpm dev:backend            # turbo run dev --filter=@botstackhq/backend — start backend only
pnpm dev:frontend           # turbo run dev --filter=@botstackhq/frontend — start frontend only
```

**Building & checking:**

```bash
pnpm build                  # turbo run build — build every app/package
pnpm lint                   # turbo run lint
pnpm test                   # turbo run test
pnpm format                 # prettier across the repo
pnpm format:check           # check formatting without writing
```

**Dependency management:**

```bash
pnpm install                # Install all workspace dependencies
pnpm update                 # Update all dependencies (all workspaces)
pnpm update:backend         # pnpm --filter @botstackhq/backend update
pnpm update:frontend        # pnpm --filter @botstackhq/frontend update
```

Each app's `.env.example` is the canonical list of variables it expects, with descriptions. Real values live in `.env` (gitignored). Production secrets live in **AWS Secrets Manager** — see each app's README for the secret naming convention.

## Local database

A root-level [`docker-compose.yml`](docker-compose.yml) provisions a local PostgreSQL 16 instance with the [`pgvector`](https://github.com/pgvector/pgvector) extension available — the same major version and extension set we run on AWS RDS in `ap-south-1`. Run the full stack locally without touching cloud resources.

**Connection string for `apps/backend/.env`:**

```
DATABASE_URL=postgresql://postgres:localdev@localhost:5432/botstackhq?schema=public
```

**Usage:**

```bash
# Start the database in the background (first run pulls the image)
docker compose up -d

# Watch logs
docker compose logs -f postgres

# Open a psql shell
docker compose exec postgres psql -U postgres -d botstackhq

# Stop the container (data preserved in the postgres_data volume)
docker compose down

# Stop and wipe the database (deletes the volume — fresh state next start)
docker compose down -v
```

Schema creation is handled by **Prisma migrations** in `apps/backend` (Sprint 1) — not by an `init.sql` in this Compose file. Compose's only responsibility is to give you a clean Postgres instance on `localhost:5432`. Once the migration tooling lands, you'll run `prisma migrate dev` against this same container.

## Per-app commands

**Quick scripts** (recommended — use these first):

```bash
pnpm dev:backend            # Start backend only
pnpm dev:frontend           # Start frontend only
pnpm update:backend         # Update backend dependencies
pnpm update:frontend        # Update frontend dependencies
```

**Advanced: Turborepo filters** (for any task):

```bash
npx turbo run build --filter=@botstackhq/backend
npx turbo run dev   --filter=@botstackhq/frontend
npx turbo run lint  --filter=@botstackhq/backend
```

### Document AI (Python)

```bash
cd apps/document-ai
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Code Quality Hooks

Every commit runs through two Husky hooks:

- **`pre-commit`** → `lint-staged` lints and formats only the files staged in the current commit:
  - `*.{ts,tsx,js,jsx,cjs,mjs}` → `eslint --fix --max-warnings 0` then `prettier --write`
  - `*.{json,md,yml,yaml}` → `prettier --write`
  - `apps/document-ai/**/*.py` → `python -m ruff check --fix`
- **`commit-msg`** → `commitlint` validates the message against [Conventional Commits](https://www.conventionalcommits.org/).

CI runs the full `turbo run lint` across every workspace on every PR — so even if a developer bypasses the local hook with `--no-verify`, broken code can't merge.

## Commit Convention

This repo enforces [Conventional Commits](https://www.conventionalcommits.org/) via [commitlint](https://commitlint.js.org/) wired into a Husky `commit-msg` hook ([commitlint.config.js](commitlint.config.js)). Non-conforming commit messages are rejected.

Format:

```
<type>(<optional-scope>): <subject>

<optional body>

<optional footer>
```

Allowed `<type>` values: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`.

Examples:

```
feat(backend): add filing calendar engine
fix(frontend): correct status badge color for overdue filings
chore: bump turbo to 2.9.16
docs(add): clarify reminder cadence
```

## Deployment

All AWS resources are provisioned via **AWS CDK** in [`infrastructure/`](infrastructure/) — region **`ap-south-1` (Mumbai)** is locked by data residency. There is **no manual AWS console configuration**: if a resource isn't in CDK, it doesn't exist.

Three environments are parameterized in the CDK app: `development`, `staging`, `production`.

### Provision / update infrastructure

```bash
cd infrastructure
npm run synth        # synthesize CloudFormation
npm run diff         # diff against the deployed stack
npm run deploy       # deploy current synth
```

### Application deploys (CI/CD)

Application code ships via **GitHub Actions** workflows in [`.github/workflows/`](.github/workflows). Branch strategy is `main` → production, `staging` → staging, feature branches → PR previews where applicable.

| App                | Artifact                      | Target                              |
| ------------------ | ----------------------------- | ----------------------------------- |
| `apps/backend`     | Lambda (zip via `nest build`) | API Gateway (REST + WebSocket)      |
| `apps/frontend`    | Static bundle (`vite build`)  | S3 + CloudFront (OAC)               |
| `apps/document-ai` | Container image (ECR)         | Containerized Lambda, async via SQS |

### Secrets

All production secrets — DB credentials, AuthKit/WorkOS API key, WhatsApp tokens, OpenAI/Anthropic keys — live in **AWS Secrets Manager** and are referenced by name in each app's environment (see the `_SECRET_NAME` variables in each app's `.env.example`). Plaintext secrets are never committed and never set as raw Lambda env vars.

See [`docs/BotStackHQ_ComplianceStack_Architecture_Decision_Document.md`](docs/BotStackHQ_ComplianceStack_Architecture_Decision_Document.md) §15–18 for the authoritative CI/CD, monitoring, and security/residency design.
