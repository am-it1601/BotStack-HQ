# BotStackHQ — MVP Scope Lock
### ComplianceStack — Phase 1 MVP
**CipherCru Innovations | 2026**
**Status: ✅ Locked**
**Scope: ComplianceStack MVP — CA / Legal Compliance Workflow Automation**

**Document Chain:** [BotStackHQ Product Overview](Product_Overview.md) → [ADD](BotStackHQ_ComplianceStack_Architecture_Decision_Document.md) → [Actor Definition](BotStackHQ_Actor_Definition_Document_ComplianceStack.md) → [Filing & Compliance Reference](BotStackHQ_Filing_Compliance_Reference.md) → [Agent Flow Specs](BotStackHQ_ComplianceStack_Agent_Flow_Specs.md) → [Data Model](BotStackHQ_Data_Model_Phase_1.md) → **MVP Scope Lock** *(this document)*

---

## Purpose

This document defines the exact feature set for BotStackHQ ComplianceStack Phase 1 MVP. Every capability is explicitly marked IN, OUT, or PARTIAL. Nothing is built outside this document without a formal scope change. This is the single source of truth for what ships to internal QA, beta testing, and pilot users.

---

## Delivery Timeline

| Phase | Weeks | Activity | Audience |
|-------|-------|----------|---------|
| **Development** | Weeks 1–8 | MVP build — all IN scope features | Engineering team |
| **Internal QA** | Weeks 9–10 | Functional testing, bug fixes, edge case validation | Internal team |
| **Beta Testing** | Weeks 11–12 | End-to-end testing with internal design partners | Close circle (5–6 users) |
| **Pilot Launch** | Week 13+ | Live with external design partners | CA design partners |

---

## Filing Scope

### In Scope — Pilot Build

| Filing | Type | Frequency | Notes |
|--------|------|-----------|-------|
| **GSTR-1** | GST | Monthly (monthly filers first) | Full input collection + confirmation |
| **GSTR-3B** | GST | Monthly | Triggered after GSTR-1 filed — dependency enforced |
| **TDS Return 24Q** | Direct Tax | Quarterly | Salary TDS |
| **TDS Return 26Q** | Direct Tax | Quarterly | Non-salary TDS |

### Out of Scope — Deferred to Post-Pilot

| Filing | Reason | Target |
|--------|--------|--------|
| GSTR-1 Quarterly (QRMP) | Monthly filers validated first | Phase 2 |
| GSTR-3B Quarterly (QRMP) | Monthly filers validated first | Phase 2 |
| GSTR-9 | Annual — not in 12-week window | Phase 2 |
| GSTR-9C | Annual — not in 12-week window | Phase 2 |
| ITR (all types) | Annual — deferred post-pilot | Phase 2 |
| Advance Tax | Quarterly — deferred post-pilot | Phase 2 |
| Tax Audit | Annual — deferred post-pilot | Phase 2 |
| TDS Certificate (Form 16 / 16A) | Depends on TDS return — Phase 2 | Phase 2 |

---

## Table of Contents

1. Scope Summary
2. Platform Core — In / Out
3. ComplianceStack Features — In / Out
4. Actor & Permission Features — In / Out
5. WhatsApp & Communication — In / Out
6. Dashboard & UI — In / Out
7. Document AI — In / Out
8. Integrations — In / Out
9. Analytics & Monitoring — In / Out
10. Infrastructure & DevOps — In / Out
11. Out of Scope — Master List
12. Scope Change Process

---

## 01 Scope Summary

| Category | In | Partial | Out |
|---------|-----|---------|-----|
| Platform Core | 6 | 2 | 2 |
| ComplianceStack Features | 8 | 2 | 4 |
| Actor & Permissions | 4 | 1 | 2 |
| WhatsApp & Communication | 5 | 1 | 3 |
| Dashboard & UI | 6 | 2 | 3 |
| Document AI | 3 | 1 | 2 |
| Integrations | 3 | 0 | 4 |
| Analytics & Monitoring | 3 | 2 | 2 |
| Infrastructure & DevOps | 6 | 0 | 1 |
| **Total** | **44** | **11** | **23** |

---

## 02 Platform Core — In / Out

| Feature | Status | Notes |
|---------|--------|-------|
| AI Agent Engine (conversation, memory, context, multi-turn) | ✅ IN | Full |
| LLM Orchestration (LangChain.js, GPT-4o primary, Claude fallback) | ✅ IN | Full |
| RAG / Knowledge Base (pgvector, semantic search, embeddings) | ✅ IN | Full |
| Workflow Engine (EventBridge triggers, state machine, SQS) | ✅ IN | Full |
| Omnichannel Router (WhatsApp + REST API) | ⚠️ PARTIAL | WhatsApp + REST only. Slack, email — Phase 3 |
| Multi-tenant Workspace (domain schemas, RLS, workspace isolation) | ✅ IN | Full |
| Human Handoff (live takeover, escalation, conversation lock) | ✅ IN | Full |
| Multi-agent coordination | ⚠️ PARTIAL | Single agent per conversation. Multi-agent logic — Phase 2 |
| White-label agent UI | ❌ OUT | Phase 3 |
| Agent marketplace / templates | ❌ OUT | Phase 4 |

---

## 03 ComplianceStack Features — In / Out

| Feature | Status | Notes |
|---------|--------|-------|
| Filing calendar engine (GSTR-1, GSTR-3B, TDS 24Q/26Q) | ✅ IN | 4 filing types. 3-month rolling window |
| Filing dependency enforcement (GSTR-3B waits for GSTR-1) | ✅ IN | Full dependency chain for in-scope filings |
| Automated input collection workflow | ✅ IN | Per filing per client per GSTIN |
| Multi-stage reminder sequence (T-7, T-3, T-1, post-deadline) | ✅ IN | Full |
| Client onboarding welcome flow | ✅ IN | WhatsApp number confirmation |
| Post-filing confirmation delivery (ARN, date, filing details) | ✅ IN | Full |
| Priority client flag + WhatsApp escalation routing | ✅ IN | Manual flag, priority-based notification routing |
| Filing approval workflow (Junior CA submits, CA Owner approves) | ✅ IN | Full approval + rejection flow |
| GSTR-1 Quarterly / QRMP filing cycle | ❌ OUT | Monthly filers first. QRMP — Phase 2 |
| GSTR-9 / GSTR-9C annual flows | ❌ OUT | Phase 2 |
| ITR input collection flows | ❌ OUT | Phase 2 |
| Advance Tax input collection | ❌ OUT | Phase 2 |
| Multi-GSTIN per client | ⚠️ PARTIAL | Data model supports it. Phase 1: up to 3 GSTINs per client in pilot. Full multi-GSTIN UI — Phase 2 |
| GSTIN flexible addition (add after onboarding) | ✅ IN | CA can add GSTINs at any time |
| Deadline manual override (CA override + audit log) | ✅ IN | Full |
| Filing status enquiry (client WhatsApp query) | ✅ IN | Full |

---

## 04 Actor & Permission Features — In / Out

| Feature | Status | Notes |
|---------|--------|-------|
| CA Owner — full workspace access | ✅ IN | Full |
| Junior CA — assigned client access, filing submission | ✅ IN | Full |
| Support Staff — read + escalated conversation response | ✅ IN | Full |
| Client — WhatsApp interaction only | ✅ IN | Full |
| RBAC (role-based access control via AuthKit) | ✅ IN | 3 roles: CA_OWNER, JUNIOR_CA, SUPPORT_STAFF |
| Support Staff visibility filters (by client / filing type) | ❌ OUT | Phase 2 — all clients visible in Phase 1 |
| Agency Admin role | ❌ OUT | Phase 2 |
| Client portal (web login) | ❌ OUT | Phase 2 — WhatsApp only in Phase 1 |
| Team invitation flow | ⚠️ PARTIAL | CA Owner can invite team members. Bulk invite — Phase 2 |

---

## 05 WhatsApp & Communication — In / Out

| Feature | Status | Notes |
|---------|--------|-------|
| Meta WhatsApp Cloud API integration | ✅ IN | Full — inbound + outbound |
| Message templates (pre-approved, per filing type) | ✅ IN | All 10 templates from Agent Flow Specs |
| Multi-language support (9 languages) | ✅ IN | Meta template approval per language required |
| Language auto-detection + client preference update | ✅ IN | Full |
| Document upload via WhatsApp (PDF, Excel, image) | ✅ IN | Full |
| Delivery receipt tracking (sent / delivered / read / failed) | ✅ IN | Full |
| Per-GSTIN WhatsApp contact mapping | ❌ OUT | Phase 2 — all messages to primary number in Phase 1 |
| Email channel | ❌ OUT | Phase 3 |
| Slack channel | ❌ OUT | Phase 3 |
| Agent persona customisation (name, greeting, sign-off) | ⚠️ PARTIAL | Name configurable. Full greeting editor — Phase 2 |

---

## 06 Dashboard & UI — In / Out

| Feature | Status | Notes |
|---------|--------|-------|
| CA filing calendar dashboard (all clients, all filings, status) | ✅ IN | Full — colour-coded status per filing |
| Client management (onboard, edit, configure filings) | ✅ IN | Full |
| Conversation monitor (view all conversations, live messages) | ✅ IN | Full |
| Human takeover (live chat from dashboard) | ✅ IN | Full |
| Document viewer (uploaded docs + extraction results) | ✅ IN | Full |
| Team management (invite, assign roles, assign clients) | ✅ IN | Full |
| Filing approval queue (CA Owner reviews Junior CA submissions) | ✅ IN | Full |
| Basic analytics (filing completion rate, response times) | ⚠️ PARTIAL | Core metrics only. Full analytics — Phase 3 |
| Workspace settings (agent name, escalation threshold, language) | ⚠️ PARTIAL | Core settings. Full customisation — Phase 2 |
| White-label dashboard branding | ❌ OUT | Phase 3 |
| Client portal (web-based client login) | ❌ OUT | Phase 2 |
| Mobile app | ❌ OUT | Phase 3 |

---

## 07 Document AI — In / Out

| Feature | Status | Notes |
|---------|--------|-------|
| PDF text extraction (PyMuPDF + pdfplumber) | ✅ IN | Full |
| OCR for scanned documents (pytesseract) | ✅ IN | Full |
| Field extraction per document type (GSTIN, ARN, turnover, TDS) | ✅ IN | All document types in Filing & Compliance Reference Section 09 |
| Document completeness validation against filing checklist | ✅ IN | Full |
| Document resubmission flow (agent requests correction) | ✅ IN | Full |
| Excel / spreadsheet parsing | ⚠️ PARTIAL | Basic column extraction. Complex multi-sheet parsing — Phase 2 |
| Password-protected PDF handling | ❌ OUT | Phase 2 — agent requests unprotected version |
| Bulk document upload (multiple files in one message) | ❌ OUT | Phase 2 — one document per message in Phase 1 |

---

## 08 Integrations — In / Out

| Integration | Status | Notes |
|------------|--------|-------|
| Meta WhatsApp Cloud API | ✅ IN | Full |
| AuthKit (WorkOS) | ✅ IN | Full |
| AWS (Lambda, RDS, S3, EventBridge, SQS, CloudWatch) | ✅ IN | Full stack |
| OpenAI (GPT-4o + embeddings) | ✅ IN | Full |
| Anthropic Claude Sonnet (fallback) | ✅ IN | Full |
| Tally integration | ❌ OUT | Phase 2 — clients export manually for Phase 1 |
| Zoho Books integration | ❌ OUT | Phase 2 |
| CRM integration (HubSpot, Zoho CRM) | ❌ OUT | LeadStack Phase 2 |
| Calendar integration (Google Calendar) | ❌ OUT | Phase 2 |
| TRACES portal integration (Form 16 download) | ❌ OUT | Phase 2 |
| GST portal API integration | ❌ OUT | Not available via public API — manual filing remains |
| Zapier / Make connectors | ❌ OUT | Phase 3 |

---

## 09 Analytics & Monitoring — In / Out

| Feature | Status | Notes |
|---------|--------|-------|
| CloudWatch logs + alerts | ✅ IN | Full |
| AWS X-Ray distributed tracing | ✅ IN | Full |
| Usage tracking (all 7 metrics) | ✅ IN | Real-time, per workspace, per month |
| CA-facing audit trail (business events) | ✅ IN | Full — exportable per client per period |
| Internal audit log (all system events) | ✅ IN | Full — append-only, 7-year retention |
| Filing completion rate dashboard | ⚠️ PARTIAL | Basic metric. Trend analysis — Phase 3 |
| Client response time analytics | ⚠️ PARTIAL | Basic metric. Detailed breakdown — Phase 3 |
| Agent performance analytics (resolution rate, escalation rate) | ❌ OUT | Phase 3 |
| Billing dashboard (usage vs plan) | ❌ OUT | Phase 2 |

---

## 10 Infrastructure & DevOps — In / Out

| Feature | Status | Notes |
|---------|--------|-------|
| AWS Lambda (NestJS backend, serverless) | ✅ IN | Full |
| RDS PostgreSQL + pgvector (domain schemas) | ✅ IN | Full |
| S3 (document storage, frontend hosting) | ✅ IN | Full |
| EventBridge Scheduler + SQS | ✅ IN | Full |
| CloudFront (dashboard CDN) | ✅ IN | Full |
| GitHub Actions CI/CD pipeline | ✅ IN | Full — dev, staging, production |
| AWS CDK (infrastructure as code) | ✅ IN | Full |
| Multi-AZ RDS | ❌ OUT | Single-AZ for pilot. Multi-AZ at GA launch |

---

## 11 Out of Scope — Master List

Everything in this list is explicitly not built in Phase 1. Any request to include these requires a formal scope change.

### Filings Deferred
- GSTR-1 / GSTR-3B Quarterly (QRMP scheme)
- GSTR-9, GSTR-9C (annual GST)
- All ITR forms (ITR-1 through ITR-7)
- Advance Tax (all 4 installments)
- Tax Audit (Form 3CA/3CB + 3CD)
- TDS Certificates (Form 16 / 16A)

### Features Deferred
- Agency Admin role and multi-workspace management
- Client web portal (web-based client login)
- White-label branding (dashboard + agent UI)
- Per-GSTIN WhatsApp contact mapping
- Support Staff visibility filters
- Mobile app (iOS / Android)
- Email and Slack channels
- Agent marketplace / template library
- Multi-agent coordination
- Billing dashboard and subscription management UI
- Full analytics suite (trend analysis, cohort reports)
- Agent performance analytics

### Integrations Deferred
- Tally, Zoho Books, other accounting software
- CRM integrations (HubSpot, Zoho CRM)
- Calendar integrations
- TRACES portal
- Zapier / Make / n8n connectors
- Third-party tool connectors

---

## 12 Scope Change Process

Any request to add, remove, or modify scope during the 12-week delivery window follows this process:

```
Request raised (by Amit / design partner feedback)
  ↓
Assess impact:
  → Does it affect the data model? → High impact
  → Does it affect agent flows? → Medium impact
  → Does it affect UI only? → Low impact
  ↓
Decision:
  High impact  → Defer to Phase 2 unless critical
  Medium impact → Evaluate against timeline
  Low impact   → Can be absorbed if < 4 hours work
  ↓
If accepted:
  → Update relevant document(s) first
  → Update this Scope Lock
  → Then implement
  
Rule: No code is written for out-of-scope features
      regardless of how simple they seem.
```

---

*This document is the authoritative scope definition for BotStackHQ ComplianceStack Phase 1 MVP. Any deviation from this scope requires a formal update to this document before implementation begins.*
*CipherCru Innovations | BotStackHQ | 2026 | Confidential*
