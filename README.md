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
├── package.json          → Root npm workspace
└── turbo.json            → Turborepo task pipeline
```

## Tech Stack (per ADD — LOCKED)

| Layer          | Choice                                                          |
| -------------- | --------------------------------------------------------------- |
| Backend        | NestJS (Node.js / TypeScript) on AWS Lambda                     |
| Frontend       | React + TypeScript + TanStack Query + Zustand, built with Vite  |
| Document AI    | Python FastAPI (PyMuPDF, pdfplumber, Unstructured, pytesseract) |
| Infrastructure | AWS CDK (TypeScript), region `ap-south-1` (Mumbai)              |
| Monorepo       | npm workspaces + Turborepo                                      |

## Prerequisites

- Node.js >= 20
- npm >= 10
- Python >= 3.11 (for the Document AI service)
- AWS CLI configured against an `ap-south-1` profile (for `infrastructure/` work)

## Getting Started

```bash
# Install all workspace dependencies
npm install

# Copy env templates per app and fill in local values
cp apps/backend/.env.example     apps/backend/.env
cp apps/frontend/.env.example    apps/frontend/.env
cp apps/document-ai/.env.example apps/document-ai/.env

# Build every app/package via Turborepo
npm run build        # → turbo run build

# Other pipelines
npm run lint
npm run test
npm run dev          # runs each app's dev task
npm run format
```

Each app's `.env.example` is the canonical list of variables it expects, with descriptions. Real values live in `.env` (gitignored). Production secrets live in **AWS Secrets Manager** — see each app's README for the secret naming convention.

## Per-app commands

Run a task for a single workspace with Turborepo filters:

```bash
npx turbo run build --filter=@botstackhq/backend
npx turbo run dev   --filter=@botstackhq/frontend
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
