# AI Workflow — Document AI (Python)

App-specific agentic rules. Extends `../../context/ai-workflow.md`. Read that first.

---

## Before writing any code here

1. **Confirm it's an extraction concern.** If the task is really a workflow/filing/business-rule change, it belongs in the backend — stop and redirect, log to Backlog.
2. **Know the document type.** Which filing/document is this (per Filing & Compliance Reference)? Extraction logic is per document type.
3. **Know the output contract.** What does the backend expect to receive for `DocumentExtraction`? Match it exactly.

## Patterns to follow

- **Pipeline shape:** receive event → fetch from S3 (only the given key) → detect type → extract → validate completeness → return structured result + status + confidence. Each stage is a small, testable function.
- **Extraction strategy:** prefer text-layer extraction (PyMuPDF/pdfplumber); fall back to OCR (pytesseract) only when there's no usable text layer. Use Unstructured for messy/mixed layouts.
- **Honest status:** if fields are missing → `INCOMPLETE`; if the document can't be read → `UNREADABLE`. Never fabricate values to fill a field.
- **Confidence:** report per-field confidence where the method allows; the backend decides what to do with low confidence.
- **Idempotent:** re-processing the same document/key produces the same result and no side effects beyond writing the result.

## Constraints

- No outbound calls to WhatsApp, no DB writes to domain tables, no scheduling. This service does not talk to clients or own state.
- No new heavy dependency without flagging — container image size affects Lambda cold start.

## Testing focus

- Per document type: a fixture document → expected extracted fields.
- Degraded inputs: scanned/low-quality → correct `UNREADABLE`/`INCOMPLETE` classification, no crash.
- Idempotency: same input twice → identical output.

## When done

Report → `../../context/report/`. Deferrals → `../../context/Backlog.md`.
