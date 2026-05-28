# Document AI Service

Internal Python FastAPI service for compliance document extraction and validation (ADD §08). Packaged as a Docker container image for AWS Lambda; invoked by the NestJS backend via the async document-processing queue (not exposed through API Gateway).

## Local development

```bash
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate
pip install -r requirements.txt

# Copy env template and fill in local values
cp .env.example .env

uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

## Environment variables

Full list with descriptions in [`.env.example`](.env.example). Highlights:

- `AWS_REGION` — `ap-south-1` (locked by data residency)
- `DOCUMENTS_S3_BUCKET` — bucket the backend uploads client documents to; this service only reads keys under `workspaces/{workspace_id}/...`
- `SQS_DOC_PROCESSING_QUEUE_URL` — the queue this Lambda is triggered by
- `OPENAI_API_KEY_SECRET_NAME` — Secrets Manager ref for the OpenAI key in prod; for local dev only, `OPENAI_API_KEY` can hold a plain value

Production secrets must come from AWS Secrets Manager (ADD §16.3).

## Build / test in the monorepo

A `package.json` is present so Turborepo can orchestrate this service alongside
the TypeScript apps:

- `build` → `python -m compileall -q app` (byte-compile check; no install required)
- `test` → placeholder (wire up `pytest` as tests are added)
