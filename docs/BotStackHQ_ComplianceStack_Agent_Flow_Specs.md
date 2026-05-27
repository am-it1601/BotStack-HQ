# BotStackHQ — Agent Flow Specs
### ComplianceStack — Phase 1 MVP
**CipherCru Innovations | 2026**
**Status: ✅ Locked**
**Scope: ComplianceStack MVP — CA / Legal Compliance Workflow Automation**

**Document Chain:** [BotStackHQ Product Overview](Product_Overview.md) → [ADD](BotStackHQ_ComplianceStack_Architecture_Decision_Document.md) → [Actor Definition](BotStackHQ_Actor_Definition_Document_ComplianceStack.md) → [Filing & Compliance Reference](BotStackHQ_Filing_Compliance_Reference.md) → **Agent Flow Specs** *(this document)*

---

## Purpose

This document defines every conversation flow the AI agent handles in ComplianceStack Phase 1. Each flow includes the trigger, conversation script, expected client responses, branching logic, success conditions, failure conditions, and escalation rules. These flows are the direct input for LLM prompt design, WhatsApp message template creation, and workflow engine state machine implementation.

---

## Table of Contents

0. Agent Design Decisions
1. Agent Persona & Language Configuration
2. Flow Index
3. Flow 01 — Client Onboarding Welcome
4. Flow 02 — Input Collection (GST Filings)
5. Flow 03 — Input Collection (Direct Tax Filings)
6. Flow 04 — Document Collection & Validation
7. Flow 05 — Reminder Sequence
8. Flow 06 — Filing Confirmation Delivery
9. Flow 07 — Client Query Handling
10. Flow 08 — Escalation to Human
11. Flow 09 — Language Change Request
12. Flow 10 — Filing Status Enquiry
13. Message Template Reference
14. Escalation Rules Reference

---

## 00 Agent Design Decisions

All decisions locked. Reference these before implementing any flow.

| Decision | Rule |
|----------|------|
| **Agent persona** | Default: Named assistant "Arya". CA configures name, greeting style, firm name per workspace |
| **Language** | CA sets default per client at onboarding. Client can change during conversation. Stored per client record |
| **Escalation threshold** | Default: Try once more, then escalate. CA configures per workspace (immediate / once / twice) |
| **Immediate escalation triggers** | Angry / abusive message, legal threat language, client explicitly requests human — regardless of threshold |
| **Multi-GSTIN** | Each GSTIN gets its own independent conversation thread and input collection flow |
| **Per-GSTIN messaging** | Phase 1: all messages to primary client WhatsApp. Phase 2: per-GSTIN contact |
| **Template language** | Meta message templates required per language — pre-approval needed per language per template |
| **Tone** | Professional, warm, concise. Never robotic. Never uses compliance jargon without explanation |

---

## 01 Agent Persona & Language Configuration

### Default Persona
```
Name:         Arya
Greeting:     "Hi [Client Name], I'm Arya, your compliance 
               assistant from [CA Firm Name]."
Sign-off:     "— Arya, [CA Firm Name]"
Tone:         Professional, warm, helpful
```

### CA Customisation (per workspace)
| Config Field | Default | CA Can Change |
|-------------|---------|--------------|
| Assistant name | Arya | ✅ Yes |
| Greeting style | "Hi [Name], I'm [Assistant], your compliance assistant from [Firm]" | ✅ Yes |
| Firm name displayed | As registered in workspace | ✅ Yes |
| Sign-off | "— [Assistant Name], [Firm Name]" | ✅ Yes |
| Escalation threshold | Try once | ✅ Yes |

### Language Handling
```
Client language determined by:
  1. CA sets default at onboarding (e.g. Gujarati)
  2. Client can override at any time by:
     → Replying in a different language
     → Explicitly saying "Please communicate in Hindi"
     → Sending a language change request

On language change detection:
  Agent acknowledges in new language
  Updates client language preference in RDS
  All subsequent messages in new language
  CA notified of language change on dashboard

Supported languages (Phase 1):
  English, Hindi, Gujarati, Marathi, Tamil,
  Telugu, Kannada, Bengali, Punjabi

Meta template approval required per language.
```

---

## 02 Flow Index

| Flow | Trigger | Primary Actor | Channel |
|------|---------|--------------|---------|
| 01 — Client Onboarding Welcome | CA onboards client | Client | WhatsApp |
| 02 — Input Collection (GST) | EventBridge T-12 trigger | Client | WhatsApp |
| 03 — Input Collection (Direct Tax) | EventBridge T-20 trigger | Client | WhatsApp |
| 04 — Document Collection & Validation | Client sends document | Client | WhatsApp |
| 05 — Reminder Sequence | No response at T-7, T-3 | Client | WhatsApp |
| 06 — Filing Confirmation | CA marks filing complete | Client | WhatsApp |
| 07 — Client Query | Client sends inbound query | Client | WhatsApp |
| 08 — Escalation to Human | Agent cannot resolve | Support Staff / CA | Dashboard |
| 09 — Language Change | Client replies in different language | Client | WhatsApp |
| 10 — Filing Status Enquiry | Client asks filing status | Client | WhatsApp |

### Out of Scope — Pilot Build

The following flows are explicitly deferred from Phase 1 pilot. Do not implement.

| Flow | Filing | Reason | Phase |
|------|--------|--------|-------|
| Input Collection — GSTR-9 | Annual GST return | Deferred — not in pilot scope | Phase 2 |
| Input Collection — GSTR-9C | GST reconciliation statement | Deferred — not in pilot scope | Phase 2 |

---

## 03 Flow 01 — Client Onboarding Welcome

### Trigger
CA Owner completes client onboarding in dashboard. Client record created, filing calendar generated.

### Purpose
Introduce the agent to the client. Set expectations for how communication will work. Confirm WhatsApp number is active and client is reachable.

### Flow

```
SYSTEM: Client onboarded → send welcome message

AGENT → CLIENT:
  "Hi [Client Name], I'm Arya, your compliance assistant 
   from [CA Firm Name]. 👋

   I'll be helping [CA Name] keep your compliance filings 
   on track. I'll reach out before each due date to collect 
   the documents and details needed — so nothing gets missed.

   You can also ask me anytime:
   • What filings are coming up
   • What documents you need to submit
   • Status of your filed returns

   Just reply here on WhatsApp whenever you need.

   Is this a good number to reach you on for compliance 
   updates? Please reply Yes to confirm. 🙏"

CLIENT RESPONSE:
  → "Yes" / "Haan" / Affirmative
      Agent: "Perfect, [Client Name]! I've noted this number. 
              You'll hear from me before each filing due date.
              Have a great day! 😊"
      Status: onboarding_confirmed
      CA dashboard: client status updated to active

  → No response within 48 hours
      Agent sends one follow-up:
      "Hi [Client Name], just checking — is this the right 
       WhatsApp number for compliance updates from 
       [CA Firm Name]? Please reply Yes to confirm."

  → No response after follow-up (48 more hours)
      CA Owner notified: "Client [Name] has not confirmed 
      WhatsApp number. Please verify contact details."
      Status: onboarding_pending_confirmation
```

### Success Condition
Client replies affirmatively. Status = `onboarding_confirmed`.

### Failure Condition
No response after two attempts. CA notified. Status = `onboarding_pending_confirmation`.

### Meta Template Required
`client_onboarding_welcome` — per language

---

## 04 Flow 02 — Input Collection (GST Filings)

### Trigger
EventBridge Scheduler fires at T-12 days before GSTR-1 deadline (or configured lead time per CA).

### Purpose
Collect sales register, invoices, and supporting data from client needed for GSTR-1 filing. GSTR-3B collection triggered separately after GSTR-1 is filed.

### Applies To
Each active GSTIN per client — separate flow per GSTIN.

### Flow

```
SYSTEM: EventBridge trigger → Workflow Engine
  → Fetch client details, GSTIN, filing period, CA name
  → Generate input collection message
  → Dispatch via WhatsApp

AGENT → CLIENT (GSTR-1 — T-12):
  "Hi [Client Name], I'm Arya from [CA Firm Name]. 👋

   Your GSTR-1 for [Month/Quarter] [Year] is due on 
   [Due Date].

   To file on time, [CA Name] needs the following from you 
   by [Input Deadline = Due Date - 5 days]:

   📋 *Documents needed:*
   1. Sales register / invoices for [Period]
      (Excel, PDF, or Tally export)
   2. Credit / debit notes issued (if any)
   3. Export invoice details (if applicable)

   📌 *GSTIN:* [GSTIN]
   📌 *Period:* [Month/Quarter Year]

   Please reply here or send the files directly on WhatsApp.

   Need help with the format? Just ask! 🙏"

CLIENT RESPONSE:

  → Sends document(s)
      → Trigger Flow 04 — Document Collection & Validation

  → Sends text confirmation ("sending shortly", "will share today")
      Agent: "Thank you, [Client Name]! Please share by 
              [Input Deadline] so [CA Name] has time to review.
              Looking forward to it! 😊"
      Status: inputs_acknowledged
      Schedule T-7 reminder if no document received

  → Asks a question ("what format?", "which invoices?")
      → Trigger Flow 07 — Client Query Handling
      → Return to input collection after query resolved

  → No response
      → Trigger Flow 05 — Reminder Sequence at T-7

AFTER GSTR-1 FILED:
  System detects GSTR-1 status = filed
  Trigger GSTR-3B input collection (T-8 days before GSTR-3B due):

AGENT → CLIENT (GSTR-3B — after GSTR-1 filed):
  "Hi [Client Name], your GSTR-1 for [Period] has been 
   filed. ✅

   Next up: GSTR-3B is due on [Due Date].

   [CA Name] needs the following by [Input Deadline]:

   📋 *Documents needed:*
   1. Purchase register for [Period]
      (for Input Tax Credit reconciliation)
   2. RCM purchase details (if any)
   3. Confirmation of tax payment availability
      (Cash / Credit ledger balance)

   📌 *GSTIN:* [GSTIN]
   📌 *Period:* [Month/Quarter Year]

   Please share here on WhatsApp. 🙏"
```

### Status Transitions
| Status | Meaning |
|--------|---------|
| `input_collection_triggered` | Message sent to client |
| `inputs_acknowledged` | Client replied but no doc yet |
| `inputs_received` | Document(s) received, pending validation |
| `inputs_complete` | All required docs validated |
| `inputs_overdue` | T-3 passed, no inputs received |

### Success Condition
Client submits all required documents. Validation passes. Status = `inputs_complete`. CA notified.

### Failure Condition
No inputs after T-3 escalation. Status = `inputs_overdue`. CA notified via WhatsApp (Priority client) or dashboard.

### Meta Templates Required
`gstr1_input_collection`, `gstr3b_input_collection` — per language

---

## 05 Flow 03 — Input Collection (Direct Tax Filings)

### Trigger
EventBridge Scheduler fires at configured lead time before filing deadline.

**Lead times by filing:**
| Filing | Lead Time |
|--------|-----------|
| ITR (non-audit) | T-20 days |
| ITR (audit) | T-20 days (after tax audit complete) |
| Tax Audit | T-30 days |
| TDS Return 24Q / 26Q | T-12 days |
| Advance Tax | T-10 days |

### Flow (ITR — example)

```
AGENT → CLIENT (ITR — T-20):
  "Hi [Client Name], your Income Tax Return (ITR) for 
   FY [Year] is due on [Due Date].

   To prepare your return, [CA Name] needs the following 
   documents by [Input Deadline]:

   📋 *Documents needed:*
   [Dynamically generated based on entity type and 
    applicable ITR form — see Filing & Compliance Reference 
    Section 08 for inputs per filing]

   Please send the files here on WhatsApp or let me know 
   if you need help with any of these. 🙏

   📌 *PAN:* [PAN]
   📌 *Assessment Year:* [AY]"

CLIENT RESPONSE:
  → Same branching as Flow 02
     (document → Flow 04, query → Flow 07, 
      no response → Flow 05)
```

### Flow (Advance Tax — T-10)

```
AGENT → CLIENT:
  "Hi [Client Name], the [1st/2nd/3rd/4th] installment of 
   Advance Tax for FY [Year] is due on [Due Date].

   To calculate your advance tax liability, [CA Name] needs:

   📋 *Details needed:*
   1. Estimated income for FY [Year] (updated figure)
   2. Expected deductions (80C, 80D, etc.)
   3. Previous advance tax paid this year
      ([Amount] as per our records — please confirm)

   Please reply here with the updated details. 🙏"
```

### Flow (TDS Return — T-12)

```
AGENT → CLIENT:
  "Hi [Client Name], your TDS Return ([24Q/26Q]) for 
   [Quarter] [Year] is due on [Due Date].

   [CA Name] needs the following by [Input Deadline]:

   📋 *Documents needed:*
   1. Deductee payment register for [Quarter]
      (name, PAN, amount paid, TDS deducted)
   2. TDS payment challans (BSR code, date, 
      serial number, amount)
   3. Any corrections to previous quarters (if applicable)

   Please send here on WhatsApp. 🙏"
```

### Meta Templates Required
`itr_input_collection`, `advance_tax_input_collection`, `tds_input_collection` — per language

---

## 06 Flow 04 — Document Collection & Validation

### Trigger
Client sends a document (PDF, Excel, image) via WhatsApp in response to an input collection request.

### Purpose
Receive the document, upload to S3, trigger Document AI extraction, validate completeness against filing checklist, respond to client with result.

### Flow

```
CLIENT → AGENT: [sends document]

SYSTEM:
  Webhook Handler detects media attachment
  Downloads from Meta API → uploads to S3
  S3 key written to RDS document record
  SQS → Document AI Lambda triggered

AGENT → CLIENT (immediate acknowledgement):
  "Thank you, [Client Name]! I've received your document. 
   Let me check it — I'll get back to you shortly. 🔍"

DOCUMENT AI PROCESSING:
  Extract structured fields
  Validate against filing checklist

OUTCOME A — Document complete and valid:

  AGENT → CLIENT:
    "✅ Your [Document Name] looks good, [Client Name]!
     
     Here's what I've noted:
     • [Key field 1]: [Extracted value]
     • [Key field 2]: [Extracted value]
     • Period: [Filing period]
     
     [If more documents needed:]
     I still need one more thing from you:
     [Next document in checklist]
     
     [If all documents complete:]
     That's everything [CA Name] needs for your 
     [Filing Name] — [Period]. I'll let them know 
     right away! 🎉"

  SYSTEM (if all complete):
    Status = inputs_complete
    CA notified (dashboard + WhatsApp if priority client)
    Structured data summary sent to CA

OUTCOME B — Document incomplete or incorrect:

  AGENT → CLIENT:
    "Thanks for sending that, [Client Name]. I've checked 
     your document but noticed a few things that need 
     attention:

     ⚠️ *Issues found:*
     [Specific field missing / incorrect — listed clearly]
     
     For example:
     • GSTIN appears to be missing on page 2
     • Period covered is [X] but we need [Y]
     • Invoice numbers are missing for [specific entries]

     Could you please send a corrected version or 
     the missing details? Happy to help if you have 
     questions! 🙏"

  Status = document_incomplete
  Checklist updated — remaining items tracked

OUTCOME C — Unreadable / corrupted document:

  AGENT → CLIENT:
    "Hi [Client Name], I wasn't able to read the file you 
     sent. It may be corrupted or in an unsupported format.

     Could you please try sending it again as:
     • PDF (preferred)
     • Excel (.xlsx)
     • Clear photo (if physical document)

     Sorry for the inconvenience! 🙏"

  Status = document_unreadable
  Logged for CA visibility
```

### Supported Document Formats
PDF, Excel (.xlsx, .xls), JPEG, PNG

### Unsupported Formats
ZIP files, password-protected PDFs, Word documents (.docx) — agent requests resubmission in supported format.

### Success Condition
All required documents received and validated. Status = `inputs_complete`. CA notified.

---

## 07 Flow 05 — Reminder Sequence

### Trigger
No client response or incomplete inputs at T-7 and T-3 checkpoints.

### Reminder Cadence
| Checkpoint | Message Type | CA Notification |
|-----------|-------------|----------------|
| T-7 days | Gentle reminder | Dashboard only |
| T-3 days | Urgent reminder + CA alert | Dashboard + WhatsApp (Priority) |
| T-1 day | Final reminder | Dashboard + WhatsApp (all clients) |

### Flow

```
T-7 REMINDER:

AGENT → CLIENT:
  "Hi [Client Name], just a friendly reminder — 
   your [Filing Name] for [Period] is due on [Due Date].

   I'm still waiting for:
   [List of pending documents / inputs]

   Please send them here when you get a chance. 
   No rush yet — but sooner is better! 😊"

---

T-3 REMINDER (Urgent):

AGENT → CLIENT:
  "Hi [Client Name], this is an important reminder. ⚠️

   Your [Filing Name] for [Period] is due in just 
   3 days — on [Due Date].

   I still need the following from you urgently:
   [List of pending documents / inputs]

   Please send these today or tomorrow so [CA Name] 
   has time to prepare your filing. A delay may 
   result in a late filing penalty.

   If you have any questions, just reply here 
   or I can connect you with [CA Name] directly. 🙏"

SYSTEM:
  CA notified — dashboard alert
  If Priority client → CA WhatsApp notification:
    "[Client Name]'s [Filing Name] inputs are still 
     pending. Due date: [Date]. Please follow up."

---

T-1 REMINDER (Final):

AGENT → CLIENT:
  "Hi [Client Name], final reminder — your [Filing Name] 
   is due *tomorrow* on [Due Date]. 🚨

   Pending from you:
   [List of pending documents / inputs]

   Please send immediately. If you need urgent help, 
   reply here and I'll connect you with [CA Name] 
   right away."

SYSTEM:
  CA notified — dashboard alert + WhatsApp (all clients):
    "URGENT: [Client Name]'s [Filing Name] inputs still 
     pending. Due tomorrow. Immediate follow-up needed."

---

POST DEADLINE — No inputs received:

AGENT → CLIENT:
  "Hi [Client Name], the due date for your [Filing Name] 
   ([Period]) has passed and we haven't received the 
   required documents yet.

   Please share them as soon as possible. [CA Name] 
   will assess if a late filing is still possible and 
   advise on next steps.

   Please reply here or contact [CA Name] directly."

SYSTEM:
  Status = inputs_overdue
  CA escalation alert — high priority
  Filing status = at_risk
```

---

## 08 Flow 06 — Filing Confirmation Delivery

### Trigger
CA Owner (or approved Junior CA) marks filing as complete in dashboard — enters ARN and filing date.

### Purpose
Immediately notify the client that their filing has been completed. Provide ARN and filing details. Eliminate reverse follow-up.

### Flow

```
SYSTEM:
  Filing status updated to filed
  ARN and filing date recorded
  Confirmation Agent triggered

AGENT → CLIENT:
  "Hi [Client Name], great news! ✅

   Your [Filing Name] for [Period] has been successfully 
   filed by [CA Name].

   📋 *Filing Details:*
   • Filing: [Filing Name]
   • Period: [Period]
   • Filed on: [Date]
   • ARN / Acknowledgement No.: [ARN]
   • Filed by: [CA Name / Firm Name]

   Please save this for your records. 

   If you have any questions about this filing, 
   feel free to ask me here. Have a great day! 😊

   — Arya, [CA Firm Name]"

SYSTEM:
  Audit log entry written (immutable):
    client_id, filing_id, ARN, filed_date, 
    confirmation_sent_at, delivery_status
  CA dashboard — filing status = confirmed ✅
  WebSocket push — dashboard updates live

CLIENT RESPONSE (optional):
  → "Thank you" / Acknowledgement
      Agent: "You're welcome, [Client Name]! 
              Let me know if you need anything. 😊"

  → Query about the filing
      → Trigger Flow 07 — Client Query Handling

  → Dispute / concern
      → Trigger Flow 08 — Escalation to Human
```

### Meta Template Required
`filing_confirmation` — per language

---

## 09 Flow 07 — Client Query Handling

### Trigger
Client sends an inbound query — filing status, document requirements, deadline questions, general compliance queries.

### Query Categories

| Category | Examples | Handling |
|---------|---------|---------|
| Filing status | "Was my GST filed?", "What's the status?" | Fetch from RDS → answer directly |
| Document requirements | "What do I need for ITR?", "Which invoices?" | RAG from Filing & Compliance Reference |
| Deadline query | "When is my next filing due?" | Fetch from filing calendar → answer |
| General compliance | "What is GSTR-3B?", "What is advance tax?" | RAG from knowledge base |
| Payment / fee query | "How much is your fee?" | Escalate to CA — agent does not answer |
| Out of scope | Personal matters, non-compliance topics | Politely decline, offer to help with compliance |

### Flow

```
CLIENT → AGENT: [sends query]

AGENT: Classifies intent using LLM

INTENT: Filing status query
  SYSTEM: Fetch latest filing status from RDS
  AGENT → CLIENT:
    "Hi [Client Name], here's the status of your 
     recent filings:

     [Filing Name] — [Period]: [Status]
     [Filing Name] — [Period]: [Status]

     [If pending:]
     Your [Filing Name] is coming up on [Due Date]. 
     I'll reach out before then for the required documents.

     Anything else I can help with? 😊"

INTENT: Document requirement query
  SYSTEM: RAG retrieval from Filing & Compliance Reference
  AGENT → CLIENT:
    "For your [Filing Name], [CA Name] typically needs:

     [Dynamically generated list from knowledge base]

     I'll send you a detailed checklist when it's time 
     to collect documents. Want me to send it now? 😊"

INTENT: Deadline query
  SYSTEM: Fetch upcoming deadlines from filing calendar
  AGENT → CLIENT:
    "Hi [Client Name], here are your upcoming filing 
     deadlines:

     📅 [Filing Name] — Due: [Date]
     📅 [Filing Name] — Due: [Date]
     📅 [Filing Name] — Due: [Date]

     I'll reach out before each deadline to collect 
     what's needed. Nothing to worry about! 😊"

INTENT: Fee / payment query
  AGENT → CLIENT:
    "For questions about fees or payments, I'll need 
     to connect you with [CA Name] directly. Let me 
     flag this for them — they'll get back to you shortly."
  SYSTEM: Escalation triggered → CA dashboard alert

INTENT: Out of scope
  AGENT → CLIENT:
    "I'm specialised in compliance and filing matters 
     for [CA Firm Name], so I may not be the best help 
     for that question! 😊

     If you have any questions about your filings, 
     deadlines, or documents — I'm here. Is there 
     anything compliance-related I can help with?"

UNRESOLVED after first attempt (default threshold):
  → Trigger Flow 08 — Escalation to Human
```

---

## 10 Flow 08 — Escalation to Human

### Trigger
- Agent cannot resolve after configured retry attempts
- Angry / abusive message detected
- Legal threat or dispute language detected
- Client explicitly requests human ("talk to CA", "connect me to someone")
- Fee / payment query
- Filing dispute

### Flow

```
AGENT → CLIENT:
  "I want to make sure you get the right help here, 
   [Client Name]. Let me connect you with someone 
   from [CA Firm Name] — they'll be with you shortly.

   Thank you for your patience! 🙏"

SYSTEM:
  Conversation status = escalated
  Dashboard alert → Support Staff + CA Owner
  If Priority client → WhatsApp to CA Owner:
    "Escalation: [Client Name] needs human assistance.
     Reason: [Escalation reason]
     Last message: [Client's last message]"
  Conversation thread locked for human takeover
  Agent paused — does not respond further until 
    human resolves or re-activates agent

HUMAN (Support Staff / CA / Junior CA) RESPONDS:
  Via dashboard live chat → message delivered to client
  Conversation marked as in_human_handling

POST RESOLUTION:
  Human marks conversation resolved
  Agent re-activated for future workflow messages
  Escalation reason and resolution logged in audit trail
```

### Immediate Escalation Triggers (Bypass Threshold)
```
Anger / abuse detected:
  AGENT → CLIENT:
    "I understand you may be frustrated, [Client Name]. 
     Let me connect you with [CA Name] directly — 
     they'll be able to help you personally. 🙏"
  → Immediate escalation

Legal threat detected:
  AGENT → CLIENT:
    "I've noted your concern, [Client Name], and will 
     make sure [CA Name] is aware immediately. 
     They will be in touch with you shortly."
  → Immediate escalation + CA Owner WhatsApp alert
  → Compliance flag raised on client record

Client requests human:
  AGENT → CLIENT:
    "Of course, [Client Name]! I'll connect you with 
     [CA Name] right away. 😊"
  → Immediate escalation
```

---

## 11 Flow 09 — Language Change Request

### Trigger
- Client replies in a different language than currently configured
- Client explicitly requests a language change

### Flow

```
DETECTION: Client sends message in different language
  OR client says "Please communicate in Hindi" etc.

AGENT → CLIENT (in detected / requested language):
  "[Language-appropriate greeting], [Client Name]!
   I've switched to [Language] for our conversation. 
   I'll use this going forward. 🙏"

SYSTEM:
  Client language preference updated in RDS
  CA dashboard notification:
    "[Client Name] has changed communication language 
     to [Language]"
  All future messages in new language
  Meta template selection updated to language variant

FALLBACK — Language not supported:
  AGENT → CLIENT (in English):
    "Hi [Client Name], I'm sorry — I currently support 
     [list of supported languages]. 
     I'll continue in English for now. 
     Please let me know if you'd prefer another 
     supported language. 🙏"
```

---

## 12 Flow 10 — Filing Status Enquiry

### Trigger
Client proactively asks about the status of a specific filing or all filings.

### Flow

```
CLIENT → AGENT: "Was my GST filed?" / "What's my filing status?"

SYSTEM: Fetch all active filings for client from RDS

AGENT → CLIENT:
  "Hi [Client Name], here's a summary of your 
   current filing status:

   *GST Filings (GSTIN: [GSTIN]):*
   ✅ GSTR-1 [Month/Quarter Year] — Filed on [Date] | ARN: [ARN]
   ✅ GSTR-3B [Month/Quarter Year] — Filed on [Date] | ARN: [ARN]
   🔄 GSTR-1 [Next Period] — Due [Date] | Inputs pending

   *Direct Tax:*
   ✅ TDS Return Q[X] — Filed on [Date]
   📅 Advance Tax — Next due: [Date]
   📅 ITR FY[Year] — Due [Date]

   I'll reach out before each due date to collect 
   what's needed. Anything else? 😊"

IF MULTI-GSTIN:
  Separate status block per GSTIN
  Clearly labelled by GSTIN and state
```

---

## 13 Message Template Reference

All outbound messages initiated by the agent (not in response to a client message) require pre-approved Meta WhatsApp message templates. Conversational replies do not require templates.

| Template Name | Flow | Variables | Languages Needed |
|--------------|------|-----------|-----------------|
| `client_onboarding_welcome` | Flow 01 | client_name, assistant_name, ca_firm_name, ca_name | All supported |
| `gstr1_input_collection` | Flow 02 | client_name, period, due_date, input_deadline, gstin, assistant_name, ca_firm_name | All supported |
| `gstr3b_input_collection` | Flow 02 | client_name, period, due_date, input_deadline, gstin, assistant_name, ca_firm_name | All supported |
| `itr_input_collection` | Flow 03 | client_name, itr_form, assessment_year, due_date, input_deadline, pan | All supported |
| `tds_input_collection` | Flow 03 | client_name, form_type, quarter, due_date, input_deadline, tan | All supported |
| `advance_tax_input_collection` | Flow 03 | client_name, installment_no, due_date, fy | All supported |
| `reminder_gentle` | Flow 05 (T-7) | client_name, filing_name, period, due_date, pending_items | All supported |
| `reminder_urgent` | Flow 05 (T-3) | client_name, filing_name, period, due_date, pending_items | All supported |
| `reminder_final` | Flow 05 (T-1) | client_name, filing_name, period, due_date | All supported |
| `filing_confirmation` | Flow 06 | client_name, filing_name, period, filed_date, arn, ca_name, ca_firm_name | All supported |

---

## 14 Escalation Rules Reference

| Scenario | Threshold Applied | CA Notification | Client Message |
|---------|-----------------|----------------|---------------|
| Agent cannot resolve query | Configurable (default: 1 retry) | Dashboard alert | Connects to human |
| Angry / abusive message | Immediate — no retry | Dashboard + WhatsApp (all) | Empathetic handoff |
| Legal threat / dispute | Immediate — no retry | Dashboard + WhatsApp (all) + compliance flag | Acknowledgement |
| Client requests human | Immediate — no retry | Dashboard alert | Friendly handoff |
| Fee / payment query | Immediate — no retry | Dashboard alert | Redirects to CA |
| Inputs overdue (post deadline) | N/A — workflow trigger | Dashboard + WhatsApp (all) | Post-deadline message |
| Document unreadable (3 attempts) | After 3 failed attempts | Dashboard alert | Format guidance |

---

*This document defines all agent conversation flows for BotStackHQ ComplianceStack Phase 1. Any new flow or modification to an existing flow must be documented here before implementation. Prompt templates and Meta message template content are derived directly from this document.*
*CipherCru Innovations | BotStackHQ | 2026 | Confidential*
