"""BotStackHQ ComplianceStack — Document AI service (FastAPI scaffold).

Phase 1 responsibility (ADD §08): extract structured fields from uploaded
compliance documents (GSTR-1/3B, TDS certificates, GST registration), run OCR
on scanned PDFs, and validate completeness against the filing checklist.

This service is internal only — it is invoked by the NestJS backend via the
async document-processing queue and is not exposed through API Gateway.
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="BotStackHQ Document AI",
    version="0.1.0",
    description="Internal document extraction and validation service.",
)


class HealthStatus(BaseModel):
    status: str = "ok"
    service: str = "document-ai"


@app.get("/health", response_model=HealthStatus)
def health() -> HealthStatus:
    """Liveness/readiness probe."""
    return HealthStatus()
