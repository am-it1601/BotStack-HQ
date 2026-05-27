# BotStackHQ — Filing & Compliance Reference
### ComplianceStack — Phase 1 MVP
**CipherCru Innovations | 2026**
**Status: 🔄 In Progress**
**Scope: ComplianceStack MVP — CA / Legal Compliance Workflow Automation**

**Document Chain:** [BotStackHQ Product Overview](Product_Overview.md) → [ADD](BotStackHQ_ComplianceStack_Architecture_Decision_Document.md) → [Actor Definition](BotStackHQ_Actor_Definition_Document_ComplianceStack.md) → **Filing & Compliance Reference** *(this document)*

---

## Purpose

This document is the authoritative domain knowledge reference for all compliance filings handled by BotStackHQ ComplianceStack Phase 1. It defines filing types, applicability by entity type, deadlines, dependency chains, required inputs per filing, and document types accepted. The filing calendar engine, agent collection flows, and workflow engine are built directly from this document. No compliance rule is assumed or hardcoded outside this reference.

---

## 00 Key Design Decisions

These decisions are locked and must be reflected in the filing calendar engine, data model, and agent flow specs.

### Deadline Handling
- All filing deadlines are **static dates** hardcoded in the filing calendar engine
- **CA Owner can manually override** any deadline per client per filing when government extensions are announced
- Every override is logged in the audit trail with timestamp and reason
- Override does not affect other clients — it is per client per filing per period

### State of GST Registration
- Each GST registration captures the **state of registration** at the time of adding the GSTIN
- State determines the correct GSTR-3B due date for QRMP filers:
  - **Category I states** → 22nd of month following quarter end
  - **Category II states** → 24th of month following quarter end
  - **Monthly filers** → 20th (state-independent)
- State list and category classification maintained as a reference table in the system

### Multi-GSTIN per Client
- One client can have **multiple GSTIN registrations** — one per state of operation
- Each GSTIN is a **separate registration** with its own independent filing calendar
- GSTR-1, GSTR-3B, GSTR-9, GSTR-9C are filed **separately per GSTIN**
- Agent sends **separate input collection messages per GSTIN per filing** — never consolidated
- Phase 1: All GSTIN messages go to the **primary client WhatsApp number**
- Phase 2: Per-GSTIN contact mapping — different coordinator per state receives their own messages

### GSTIN Addition — Flexible Onboarding
GSTINs can be added to a client at any time — not just during initial onboarding. Three valid scenarios:

| Scenario | Description |
|----------|-------------|
| **Partial onboarding** | Client has multiple GSTINs, CA onboards one initially, adds others when engagement expands |
| **Full onboarding** | All GSTINs added at client onboarding from the start |
| **Business expansion** | Client expands to new states — CA adds new GSTIN to existing client record at any time |

**Rules:**
- Each new GSTIN addition auto-generates its own filing calendar from the addition date
- Existing GSTIN calendars are unaffected when new ones are added
- CA Owner manages GSTIN additions — Junior CA cannot add or remove GSTINs
- Each GSTIN has its own status: `active` / `inactive` / `surrendered`

---

## Table of Contents

0. Key Design Decisions
1. Phase 1 Filing Scope
2. Entity Type Definitions
3. Filing × Entity Applicability Matrix
4. GST Core Set — Filing Details
   - 4.1 GSTR-1
   - 4.2 GSTR-3B
   - 4.3 GSTR-9
   - 4.4 GSTR-9C
5. Direct Tax Set — Filing Details
   - 5.1 TDS Return (24Q / 26Q)
   - 5.2 TDS Certificate (Form 16 / 16A)
   - 5.3 Advance Tax
   - 5.4 ITR — Individual (ITR-1, ITR-2, ITR-3)
   - 5.5 ITR — Business / Firm (ITR-4, ITR-5)
   - 5.6 ITR — Company (ITR-6)
   - 5.7 ITR — Trust / NGO (ITR-7)
   - 5.8 Tax Audit (Form 3CA / 3CB + 3CD)
6. Filing Dependency Chain
7. Filing Calendar — Master Schedule
8. Input Collection Reference
9. Document Types Reference

---

## 01 Phase 1 Filing Scope

### GST Core Set
| Filing | Type | Frequency |
|--------|------|-----------|
| GSTR-1 | GST — Outward supplies | Monthly / Quarterly |
| GSTR-3B | GST — Summary return + tax payment | Monthly / Quarterly |
| GSTR-9 | GST — Annual return | Yearly |
| GSTR-9C | GST — Reconciliation statement | Yearly (Turnover > ₹5 Cr) |

### Direct Tax Set
| Filing | Type | Frequency |
|--------|------|-----------|
| TDS Return 24Q | Direct Tax — Salary TDS | Quarterly |
| TDS Return 26Q | Direct Tax — Non-salary TDS | Quarterly |
| Form 16 | Direct Tax — TDS Certificate (Salary) | Yearly |
| Form 16A | Direct Tax — TDS Certificate (Non-salary) | Quarterly |
| Advance Tax | Direct Tax — Advance tax payment | Quarterly |
| ITR-1 (Sahaj) | Direct Tax — Individual (Salaried) | Yearly |
| ITR-2 | Direct Tax — Individual / HUF (Capital gains) | Yearly |
| ITR-3 | Direct Tax — Individual / HUF (Business income) | Yearly |
| ITR-4 (Sugam) | Direct Tax — Individual / HUF / Firm (Presumptive) | Yearly |
| ITR-5 | Direct Tax — Firm / LLP / AOP / BOI | Yearly |
| ITR-6 | Direct Tax — Company | Yearly |
| ITR-7 | Direct Tax — Trust / NGO / Political party | Yearly |
| Form 3CA + 3CD | Direct Tax — Tax Audit (Non-company) | Yearly |
| Form 3CB + 3CD | Direct Tax — Tax Audit (Company / others) | Yearly |

---

## 02 Entity Type Definitions

Each client in ComplianceStack is assigned an entity type at onboarding. Entity type determines which filings are applicable, which deadlines apply, and which ITR form is used.

| Entity Type | Description | GST Applicable | TDS Applicable | ITR Form |
|------------|-------------|---------------|---------------|---------|
| **Individual** | Salaried or self-employed person | Optional (if turnover threshold crossed) | If deducting TDS | ITR-1 / ITR-2 / ITR-3 |
| **HUF** | Hindu Undivided Family | Optional | If deducting TDS | ITR-2 / ITR-3 |
| **Proprietorship** | Single-owner business | Yes (if registered) | If deducting TDS | ITR-3 / ITR-4 |
| **Partnership Firm** | Two or more partners | Yes (if registered) | If deducting TDS | ITR-5 |
| **LLP** | Limited Liability Partnership | Yes (if registered) | If deducting TDS | ITR-5 |
| **Private Limited Company** | Incorporated company | Yes | Yes (mandatory) | ITR-6 |
| **Trust / NGO** | Charitable or religious trust | Optional | If deducting TDS | ITR-7 |

> **Implementation note:** Entity type is set by the CA at client onboarding. The filing calendar engine uses entity type + GST registration status + TDS registration status + turnover to determine which filings apply to each client. Not all filings apply to every client.

---

## 03 Filing × Entity Applicability Matrix

✅ = Mandatory | ⚠️ = Conditional | ❌ = Not applicable

| Filing | Individual | HUF | Proprietorship | Partnership | LLP | Pvt Ltd | Trust/NGO |
|--------|-----------|-----|---------------|-------------|-----|---------|----------|
| **GSTR-1** | ⚠️ If GST registered | ⚠️ | ✅ If registered | ✅ If registered | ✅ If registered | ✅ | ⚠️ |
| **GSTR-3B** | ⚠️ If GST registered | ⚠️ | ✅ If registered | ✅ If registered | ✅ If registered | ✅ | ⚠️ |
| **GSTR-9** | ⚠️ If GST registered | ⚠️ | ✅ If registered | ✅ If registered | ✅ If registered | ✅ | ⚠️ |
| **GSTR-9C** | ⚠️ Turnover > ₹5Cr | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ Turnover > ₹5Cr | ⚠️ |
| **TDS 24Q** | ⚠️ If employer | ⚠️ | ⚠️ If employer | ⚠️ | ⚠️ | ✅ | ⚠️ |
| **TDS 26Q** | ⚠️ If deductor | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| **Form 16** | ⚠️ If employer | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| **Form 16A** | ⚠️ If deductor | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| **Advance Tax** | ⚠️ Tax > ₹10K | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| **ITR-1** | ⚠️ Salaried | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **ITR-2** | ⚠️ Capital gains | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **ITR-3** | ⚠️ Business income | ⚠️ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ITR-4** | ⚠️ Presumptive | ⚠️ | ⚠️ Presumptive | ❌ | ❌ | ❌ | ❌ |
| **ITR-5** | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **ITR-6** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **ITR-7** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Tax Audit** | ⚠️ Turnover > threshold | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

---

## 04 GST Core Set — Filing Details

---

### 4.1 GSTR-1

**What it is:**
Statement of outward supplies. Reports all sales made by the taxpayer during the period. Auto-populates GSTR-2B for the buyer.

**Who files:**
All regular GST-registered taxpayers. Quarterly filers under QRMP scheme file quarterly with monthly IFF (Invoice Furnishing Facility) optional.

**Frequency:**
| Taxpayer Type | Frequency | Due Date |
|--------------|-----------|---------|
| Turnover > ₹5 Cr | Monthly | 11th of following month |
| Turnover ≤ ₹5 Cr (QRMP) | Quarterly | 13th of month following quarter end |

**Dependency:**
GSTR-1 must be filed BEFORE GSTR-3B. GSTR-3B cannot be accurately filed without GSTR-1 data.

**Required inputs from client:**
- Sales invoices (B2B and B2C) for the period
- Credit / debit notes issued
- Export invoices (if applicable)
- Nil-rated and exempt supply details
- HSN summary of goods / services sold

**Documents accepted:**
- Sales register (Excel / PDF)
- Tally export
- ERP export
- Individual invoice copies (if no register)

**Key validations:**
- GSTIN of buyers (B2B transactions)
- Invoice date falls within the filing period
- HSN codes present for applicable turnover thresholds
- No duplicate invoice numbers

---

### 4.2 GSTR-3B

**What it is:**
Monthly / quarterly summary return. Reports net outward supplies, input tax credit (ITC) claimed, and net GST payable. Tax must be paid before or at the time of filing.

**Who files:**
All regular GST-registered taxpayers.

**Frequency:**
| Taxpayer Type | Frequency | Due Date |
|--------------|-----------|---------|
| Turnover > ₹5 Cr | Monthly | 20th of following month |
| Turnover ≤ ₹5 Cr (QRMP) — Category I states | Quarterly | 22nd of month following quarter end |
| Turnover ≤ ₹5 Cr (QRMP) — Category II states | Quarterly | 24th of month following quarter end |

**Dependency:**
GSTR-1 must be filed first. GSTR-2B (auto-drafted) must be reviewed before claiming ITC in GSTR-3B.

**Required inputs from client:**
- Outward supply summary (from GSTR-1 — if already filed, auto-available)
- Purchase register for ITC reconciliation
- Input tax credit to be claimed
- Reverse charge mechanism (RCM) purchases
- Tax payment details (cash / credit ledger balance)

**Documents accepted:**
- Purchase register (Excel / PDF)
- Tally / ERP export
- Bank statement (for payment confirmation)

**Key validations:**
- GSTR-1 filed for the same period
- ITC claimed does not exceed GSTR-2B auto-drafted credit
- Tax liability reconciles with GSTR-1 outward supplies
- RCM liability correctly computed

---

### 4.3 GSTR-9

**What it is:**
Annual return. Consolidates all monthly / quarterly GSTR-1 and GSTR-3B filings for the financial year. Reconciles outward supplies, ITC, and tax paid.

**Who files:**
All regular GST-registered taxpayers with turnover above ₹2 Cr. Optional for turnover below ₹2 Cr.

**Frequency:** Yearly

**Due Date:** 31st December following the end of the financial year
*(e.g. GSTR-9 for FY 2025-26 due 31st December 2026)*

**Dependency:**
All GSTR-1 and GSTR-3B for the financial year must be filed before GSTR-9.

**Required inputs from client:**
- Confirmation that all monthly/quarterly returns are filed
- Any amendments or corrections to previously filed data
- ITC reversals if any
- Annual turnover confirmation
- HSN-wise summary of supplies

**Documents accepted:**
- Annual sales register
- Annual purchase register
- Reconciliation statement (if prepared separately)

---

### 4.4 GSTR-9C

**What it is:**
Reconciliation statement between audited annual accounts and GSTR-9. Requires certification by a CA or CMA.

**Who files:**
Taxpayers with aggregate annual turnover exceeding ₹5 Cr.

**Frequency:** Yearly

**Due Date:** 31st December (same as GSTR-9 — filed together)

**Dependency:**
GSTR-9 must be filed before or simultaneously with GSTR-9C. Audited financial statements required.

**Required inputs from client:**
- Audited financial statements (Balance Sheet, P&L)
- GSTR-9 data
- Reconciliation of turnover as per books vs. GST returns
- ITC reconciliation
- CA / auditor certification details

**Documents accepted:**
- Audited Balance Sheet (PDF)
- Audited P&L Statement (PDF)
- Trial balance

---

## 05 Direct Tax Set — Filing Details

---

### 5.1 TDS Return (24Q / 26Q)

**What it is:**
- **24Q:** TDS on salary payments. Filed by employers.
- **26Q:** TDS on non-salary payments (professional fees, rent, contractor payments, etc.)

**Who files:**
Any entity that deducts TDS — employers (24Q), businesses making specified payments (26Q).

**Frequency:** Quarterly

**Due Dates:**
| Quarter | Period | Due Date |
|---------|--------|---------|
| Q1 | April – June | 31st July |
| Q2 | July – September | 31st October |
| Q3 | October – December | 31st January |
| Q4 | January – March | 31st May |

**Required inputs from client:**
- Deductee details (PAN, name, payment type)
- Amount paid / credited to each deductee
- TDS deducted per deductee
- Challan details (BSR code, date, serial number, amount)
- Corrections to previous quarters (if any)

**Documents accepted:**
- TDS payment challans (PDF)
- Deductee payment register (Excel)
- Bank statements showing TDS payments
- Tally / payroll software export

---

### 5.2 TDS Certificate (Form 16 / 16A)

**What it is:**
- **Form 16:** Issued by employer to employee. Certifies TDS deducted on salary. Contains Part A (TDS details) and Part B (salary breakdown).
- **Form 16A:** Issued for non-salary TDS (professional fees, rent, etc.)

**Who issues:**
Any TDS deductor after filing their TDS return.

**Frequency:**
- Form 16: Yearly — issued by 15th June
- Form 16A: Quarterly — issued within 15 days of TDS return due date

**Dependency:**
TDS return (24Q / 26Q) must be filed before certificates can be generated.

**Required inputs from client:**
- Confirmation that TDS return is filed
- Employee / deductee details for certificate generation
- TRACES login credentials (for downloading Form 16 / 16A from portal)

---

### 5.3 Advance Tax

**What it is:**
Tax paid in advance during the financial year based on estimated income. Applicable when estimated tax liability exceeds ₹10,000 for the year.

**Who pays:**
All assessees except senior citizens (age ≥ 60) with no business income.

**Frequency:** Quarterly installments

**Due Dates & Installments:**
| Installment | Due Date | Minimum % of Total Tax |
|------------|---------|----------------------|
| 1st | 15th June | 15% |
| 2nd | 15th September | 45% (cumulative) |
| 3rd | 15th December | 75% (cumulative) |
| 4th | 15th March | 100% |

**Required inputs from client:**
- Estimated income for the year
- Expected deductions (80C, 80D, etc.)
- Previous advance tax paid (for subsequent installments)
- Business income projections (for business entities)

**Documents accepted:**
- Previous year ITR (for baseline)
- Advance tax challan copies (for confirmation)
- Income estimate statement

---

### 5.4 ITR — Individual (ITR-1, ITR-2, ITR-3)

**ITR-1 (Sahaj):**
- Salaried individuals with income from salary, one house property, other sources
- Total income up to ₹50 lakh
- Not applicable if foreign income, capital gains, or business income exists

**ITR-2:**
- Individuals and HUF with capital gains
- More than one house property
- Foreign income or assets
- No business / professional income

**ITR-3:**
- Individuals and HUF with income from business or profession
- Partners in a firm

**Due Dates:**
| Assessee | Due Date |
|---------|---------|
| Non-audit cases | 31st July |
| Audit cases | 31st October |
| Transfer pricing cases | 30th November |

**Required inputs from client:**
- Form 16 (salary income)
- Bank interest certificates
- Capital gains statements (broker / demat account)
- House property details (rent received, loan interest)
- Investment proofs (80C, 80D, 80G, etc.)
- Foreign asset details (if any)
- Previous year ITR copy

**Documents accepted:**
- Form 16 (PDF)
- Form 26AS / AIS / TIS download
- Bank statements (PDF)
- Capital gains statement from broker (PDF / Excel)
- Loan certificate (PDF)

---

### 5.5 ITR — Business / Firm (ITR-4, ITR-5)

**ITR-4 (Sugam):**
- Individuals, HUF, and firms (not LLP) with presumptive business income
- Turnover up to ₹2 Cr (business) or ₹50 lakh (profession)

**ITR-5:**
- Firms, LLPs, AOP, BOI
- Not applicable for companies or individuals

**Due Dates:**
| Assessee | Due Date |
|---------|---------|
| Non-audit | 31st July |
| Audit required | 31st October |

**Required inputs from client:**
- Profit & Loss statement
- Balance Sheet
- Partner details and profit sharing ratio (for firms / LLP)
- Capital account details
- Bank statements
- TDS certificates (Form 16A)
- Investment details

**Documents accepted:**
- Audited financial statements (PDF)
- Tally export
- Partnership deed (for firms)
- LLP agreement

---

### 5.6 ITR — Company (ITR-6)

**What it is:**
Income tax return for all companies except those claiming exemption under Section 11.

**Due Dates:**
| Company Type | Due Date |
|-------------|---------|
| Non-audit (rare) | 31st July |
| Audit required | 31st October |
| Transfer pricing | 30th November |

**Required inputs from client:**
- Audited financial statements (mandatory)
- Directors' report
- Depreciation schedule
- Advance tax / TDS payment details
- MAT computation (if applicable)
- Related party transactions

**Documents accepted:**
- Audited Balance Sheet + P&L (PDF)
- Tax audit report (Form 3CA/3CB + 3CD)
- Board resolution

---

### 5.7 ITR — Trust / NGO (ITR-7)

**What it is:**
Return for entities required to file under Sections 139(4A), 139(4B), 139(4C), 139(4D) — trusts, political parties, research institutions, universities.

**Due Date:** 31st October

**Required inputs from client:**
- Audited financial statements
- 12A / 80G registration details
- Application of income details
- Corpus fund details
- Foreign contribution details (FCRA, if applicable)

**Documents accepted:**
- Audited accounts (PDF)
- Registration certificates (12A, 80G, FCRA)
- Trust deed

---

### 5.8 Tax Audit (Form 3CA / 3CB + 3CD)

**What it is:**
Audit of accounts by a Chartered Accountant. Mandatory when turnover / gross receipts exceed specified thresholds.

**Forms:**
- **Form 3CA + 3CD:** When accounts are audited under another law (e.g. Companies Act)
- **Form 3CB + 3CD:** When accounts are not required to be audited under any other law

**Applicability Thresholds:**
| Assessee | Turnover Threshold |
|---------|-------------------|
| Business | ₹1 Cr (₹10 Cr if 95%+ transactions are digital) |
| Profession | ₹50 lakh |
| Presumptive scheme opted out | Applicable regardless of turnover |

**Due Date:** 30th September (report must be filed before ITR due date)

**Dependency:**
Tax audit report must be completed and filed BEFORE ITR filing for audit cases.

**Required inputs from client:**
- Complete books of accounts
- Audited financial statements
- Bank statements (all accounts)
- Fixed asset register
- Loan details
- Related party transactions
- Previous year tax audit report

**Documents accepted:**
- Tally data / ERP export
- Audited financial statements (PDF)
- Bank statements (PDF / Excel)
- All supporting vouchers and records

---

## 06 Filing Dependency Chain

Filing order matters. The system must enforce dependencies — a downstream filing cannot be triggered until its upstream dependency is confirmed filed.

```
GST Monthly / Quarterly Cycle:
  GSTR-1 (sales data) → filed first
    ↓ auto-populates GSTR-2B (system generated — no filing)
  GSTR-3B (summary + payment) → filed after GSTR-1
    ↓
  [Repeat monthly or quarterly]

GST Annual Cycle:
  All GSTR-1 + GSTR-3B for FY → must be complete
    ↓
  GSTR-9 (annual return)
    ↓ (if turnover > ₹5 Cr)
  GSTR-9C (reconciliation) → filed with or after GSTR-9

Direct Tax Annual Cycle:
  Books of accounts finalised
    ↓ (if audit applicable)
  Tax Audit (Form 3CA/3CB + 3CD) → due 30th September
    ↓
  ITR filing → due 31st October (audit) / 31st July (non-audit)

TDS Cycle (Quarterly):
  TDS deducted and paid via challan
    ↓
  TDS Return (24Q / 26Q) → quarterly
    ↓
  TDS Certificate (Form 16 / 16A) → generated after return filed

Advance Tax (Quarterly):
  Income estimated
    ↓
  Advance tax paid (15 Jun / 15 Sep / 15 Dec / 15 Mar)
    ↓ (feeds into)
  ITR → advance tax paid credited at time of filing
```

### Dependency Rules for Filing Calendar Engine

| Filing | Depends On | Cannot Trigger Until |
|--------|-----------|---------------------|
| GSTR-3B | GSTR-1 (same period) | GSTR-1 status = filed |
| GSTR-9 | All GSTR-1 + GSTR-3B for FY | All monthly/quarterly returns = filed |
| GSTR-9C | GSTR-9 | GSTR-9 status = filed |
| ITR (audit) | Tax Audit report | Tax audit status = completed |
| Form 16 | TDS Return 24Q | 24Q status = filed |
| Form 16A | TDS Return 26Q | 26Q status = filed |
| Advance Tax installment | Previous installment | Previous installment = paid (for 2nd, 3rd, 4th) |

---

## 07 Filing Calendar — Master Schedule

### GST Filing Calendar

| Filing | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|--------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| GSTR-1 (Monthly) | 11 | 11 | 11 | 11 | 11 | 11 | 11 | 11 | 11 | 11 | 11 | 11 |
| GSTR-3B (Monthly) | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 |
| GSTR-1 (Quarterly — QRMP) | — | — | 13* | — | — | 13* | — | — | 13* | — | — | 13* |
| GSTR-3B (Quarterly — Cat I) | — | — | 22* | — | — | 22* | — | — | 22* | — | — | 22* |
| GSTR-3B (Quarterly — Cat II) | — | — | 24* | — | — | 24* | — | — | 24* | — | — | 24* |
| GSTR-9 | — | — | — | — | — | — | — | — | — | — | — | 31 |
| GSTR-9C | — | — | — | — | — | — | — | — | — | — | — | 31 |

*Quarter-end month due date

### Direct Tax Filing Calendar

| Filing | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|--------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| Advance Tax — 1st | — | — | — | — | — | 15 | — | — | — | — | — | — |
| Advance Tax — 2nd | — | — | — | — | — | — | — | — | 15 | — | — | — |
| Advance Tax — 3rd | — | — | — | — | — | — | — | — | — | — | — | 15 |
| Advance Tax — 4th | — | — | 15 | — | — | — | — | — | — | — | — | — |
| TDS Return Q1 (24Q/26Q) | — | — | — | — | — | — | 31 | — | — | — | — | — |
| TDS Return Q2 (24Q/26Q) | — | — | — | — | — | — | — | — | — | 31 | — | — |
| TDS Return Q3 (24Q/26Q) | 31 | — | — | — | — | — | — | — | — | — | — | — |
| TDS Return Q4 (24Q/26Q) | — | — | — | — | 31 | — | — | — | — | — | — | — |
| Form 16A (Q1) | — | — | — | — | — | — | 15 | — | — | — | — | — |
| Form 16A (Q2) | — | — | — | — | — | — | — | — | — | 15 | — | — |
| Form 16A (Q3) | 15 | — | — | — | — | — | — | — | — | — | — | — |
| Form 16A (Q4) | — | — | — | — | — | 15 | — | — | — | — | — | — |
| Form 16 (Salary) | — | — | — | — | — | 15 | — | — | — | — | — | — |
| Tax Audit Report | — | — | — | — | — | — | — | — | 30 | — | — | — |
| ITR (Non-audit) | — | — | — | — | — | — | 31 | — | — | — | — | — |
| ITR (Audit) | — | — | — | — | — | — | — | — | — | 31 | — | — |
| ITR (Transfer pricing) | — | — | — | — | — | — | — | — | — | — | 30 | — |

---

## 08 Input Collection Reference

This section defines what the agent must collect from each client per filing. Used directly by the AI agent to generate structured input collection messages.

| Filing | Inputs Required from Client | Lead Time |
|--------|---------------------------|-----------|
| **GSTR-1** | Sales register / invoices for period, credit/debit notes, export invoice details | T-12 days |
| **GSTR-3B** | Purchase register for ITC, RCM purchase details, confirmation GSTR-1 is filed | T-8 days (after GSTR-1 filed) |
| **GSTR-9** | Confirmation all returns filed, amendment details, ITC reversal details | T-30 days |
| **GSTR-9C** | Audited financial statements, turnover reconciliation | T-20 days (after GSTR-9 inputs) |
| **TDS 24Q/26Q** | Deductee payment register, challan details, correction details | T-12 days |
| **Form 16/16A** | Confirmation TDS return filed, deductee list for certificate generation | T-5 days (after TDS return filed) |
| **Advance Tax** | Income estimate, expected deductions, previous installment details | T-10 days |
| **ITR (all types)** | All income documents, investment proofs, Form 26AS confirmation | T-20 days |
| **Tax Audit** | Complete books, bank statements, fixed asset register, loan details | T-30 days |

---

## 09 Document Types Reference

Documents accepted by the system per filing type. Used by the Document AI extraction engine to classify and process uploaded files.

| Document | Filing(s) | Format Accepted | Key Extracted Fields |
|----------|-----------|----------------|---------------------|
| Sales Register | GSTR-1 | Excel, PDF, Tally export | Invoice nos., GSTIN, taxable value, tax amount, period |
| Purchase Register | GSTR-3B | Excel, PDF, Tally export | Supplier GSTIN, invoice nos., ITC amount, period |
| GST Registration Certificate | All GST | PDF | GSTIN, legal name, trade name, registration date |
| GSTR-1 Filed Acknowledgement | GSTR-3B | PDF | ARN, GSTIN, period, filing date |
| Audited Balance Sheet | GSTR-9C, ITR-6, Tax Audit | PDF | Total assets, liabilities, turnover, period |
| Audited P&L Statement | GSTR-9C, ITR-6, Tax Audit | PDF | Revenue, expenses, net profit, period |
| TDS Payment Challan | TDS 24Q/26Q | PDF | BSR code, date, serial no., amount, TAN |
| Form 26AS / AIS | ITR (all) | PDF | TDS deducted, advance tax paid, TAN details |
| Form 16 | ITR-1, ITR-2, ITR-3 | PDF | Employer TAN, PAN, salary, TDS deducted, period |
| Form 16A | ITR (all), 26Q | PDF | Deductor TAN, deductee PAN, payment nature, TDS |
| Bank Statement | All | PDF, Excel | Account no., transactions, closing balance, period |
| Capital Gains Statement | ITR-2, ITR-3 | PDF, Excel | Scrip name, buy/sell date, cost, proceeds, gain |
| Loan Certificate | ITR-1, ITR-2, ITR-3 | PDF | Loan account, principal, interest, lender details |
| Partnership Deed | ITR-5 | PDF | Partners, profit sharing ratio, firm PAN |
| LLP Agreement | ITR-5 | PDF | Partners, designated partners, profit sharing |
| Trust Deed | ITR-7 | PDF | Trust name, trustees, objects, registration |
| Tax Audit Report (3CD) | ITR (audit) | PDF | Clause-wise details, turnover, depreciation, loans |

---

*This document is the authoritative compliance reference for BotStackHQ ComplianceStack Phase 1. Any change to filing rules, deadlines, or input requirements must be updated here before changes are made to the filing calendar engine, agent flows, or workflow engine.*
*CipherCru Innovations | BotStackHQ | 2026 | Confidential*
