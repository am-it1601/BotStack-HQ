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

| Layer | Choice |
|-------|--------|
| Backend | NestJS (Node.js / TypeScript) on AWS Lambda |
| Frontend | React + TypeScript + TanStack Query + Zustand, built with Vite |
| Document AI | Python FastAPI (PyMuPDF, pdfplumber, Unstructured, pytesseract) |
| Infrastructure | AWS CDK (TypeScript), region `ap-south-1` (Mumbai) |
| Monorepo | npm workspaces + Turborepo |

## Prerequisites

- Node.js >= 20
- npm >= 10
- Python >= 3.11 (for the Document AI service)

## Getting Started

```bash
# Install all workspace dependencies
npm install

# Build every app/package via Turborepo
npm run build        # → turbo run build

# Other pipelines
npm run lint
npm run test
npm run dev          # runs each app's dev task
npm run format
```

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
