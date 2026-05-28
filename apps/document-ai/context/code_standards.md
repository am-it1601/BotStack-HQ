# Code Standards — Document AI (Python)

Extends `../../context/code_standards.md`. Read that first. Python-specific rules below.

---

## Language & tooling

- **Python 3.11+.** Type hints on all function signatures — no untyped public functions.
- **Formatting/lint:** Black + Ruff (or repo equivalent). Code must pass before "done".
- **Naming:** `snake_case` for functions/vars/modules, `PascalCase` for classes, `UPPER_SNAKE` for constants. Files `snake_case.py`.
- Use `pydantic` models for the event input and the extraction output contract — validate at the boundary.

## Structure

- FastAPI app thin; extraction logic in dedicated modules (`extractors/`, `pipeline/`, `models/`).
- Each extraction stage is a pure-ish function: input → output, no hidden global state.
- Separate document-type-specific extractors; share common primitives.

## Contracts

- Input (SQS event) and output (`DocumentExtraction`-shaped) are pydantic models matching the Data Model doc. Don't drift from the backend's expected shape.
- Enum-like statuses (`UPLOADED/PROCESSING/EXTRACTED/INCOMPLETE/UNREADABLE/VALIDATED`) match the Data Model `DocumentStatus` values exactly.

## Reliability

- Wrap external operations (S3 fetch, OCR) with explicit error handling; classify failures into `UNREADABLE`/`INCOMPLETE` rather than raising raw.
- Log with structured context (`workspace_id`, `document_id`) — never log document contents (PII / compliance data).
- Clean up temp files in a `finally`.
- Functions idempotent and side-effect-free except the defined result write.

## Performance / Lambda

- Mind container image weight and cold start — lazy-import heavy libs (e.g. OCR) so non-OCR paths stay fast.
- No unbounded in-memory loads for large PDFs — stream/iterate pages.

## Testing

- `pytest`. Fixtures per document type. Cover the degraded-input and idempotency cases (see ai_workflow).
- No network in unit tests — mock S3.
