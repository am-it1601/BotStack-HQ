# Claude.md — Document AI (Python FastAPI)

**You are working in the document extraction service.** Router for this workspace — read first, load only what's relevant.

---

## What this app is

Python 3.11+ FastAPI microservice for document extraction. Deployed as a containerized Lambda (image via ECR). Triggered async by the backend over SQS after a document lands in S3. Stack: PyMuPDF, pdfplumber, Unstructured, pytesseract. Reads documents from S3, extracts structured fields, writes results back (consumed by backend → `DocumentExtraction`).

It exists **because** Python is the right tool for document AI — it is deliberately the only non-TypeScript service. Keep its surface narrow: ingest → extract → return structured fields. No business/compliance logic here.

---

## Context loading — read in this order

1. **Always:** `../../context/ai-workflow.md` + `../../context/code_standards.md`
2. **Always for this app:** `context/ai_workflow.md` + `context/code_standards.md`
3. **If you need the document/extraction data shape:** `/docs/BotStackHQ_Data_Model_Phase_1.md` (Document / DocumentExtraction entities) + `/docs/BotStackHQ_Filing_Compliance_Reference.md` (document types per filing)

**Do NOT load:** frontend or backend API context, `ui_system.md`. This service has a narrow, well-defined contract.

---

## Non-negotiables for this app

- **No business logic.** Filing rules, dependencies, workflow state — none of that lives here. This service extracts fields and reports confidence. Decisions belong to the backend.
- **Stateless.** All input via the triggering event + S3; all output written back. No local persistence.
- **Tenant-safe paths.** Only read the S3 key handed to you (`workspaces/{workspace_id}/...`). Never list/scan across prefixes.
- **Temp files are ephemeral** — clean up; the 24h lifecycle policy is a backstop, not a license to leave litter.
- **Map outputs to the `DocumentExtraction` shape** the backend expects; surface `INCOMPLETE`/`UNREADABLE` states honestly rather than guessing.

## Report + Backlog

Report → `../../context/report/`. Deferrals → `../../context/Backlog.md`.
