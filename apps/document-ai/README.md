# Document AI Service

Internal Python FastAPI service for compliance document extraction and validation (ADD §08). Packaged as a Docker container image for AWS Lambda; invoked by the NestJS backend via the async document-processing queue (not exposed through API Gateway).

## Local development

```bash
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

## Build / test in the monorepo

A `package.json` is present so Turborepo can orchestrate this service alongside
the TypeScript apps:

- `build` → `python -m compileall -q app` (byte-compile check; no install required)
- `test` → placeholder (wire up `pytest` as tests are added)
