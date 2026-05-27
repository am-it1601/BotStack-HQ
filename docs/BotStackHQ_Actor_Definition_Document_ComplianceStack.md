# BotStackHQ — Actor Definition Document
### ComplianceStack — Phase 1 MVP
**CipherCru Innovations | 2026**
**Status: ✅ Locked**
**Scope: ComplianceStack MVP — CA / Legal Compliance Workflow Automation**

**Document Chain:** [BotStackHQ Product Overview](Product_Overview.md) → [ADD](BotStackHQ_ComplianceStack_Architecture_Decision_Document.md) → **Actor Definition Document** *(this document)*

---

## Purpose

This document formally defines every actor in the BotStackHQ ComplianceStack system — their identity, responsibilities, permissions, delegation boundaries, and interaction patterns. It is the authoritative reference for RBAC implementation, workflow engine delegation logic, and data model design. No actor-related assumption is made outside this document.

---

## Table of Contents

1. Actor Overview
2. Actor Definitions
   - 2.1 CA / Firm Owner
   - 2.2 Junior CA
   - 2.3 Support Staff
   - 2.4 Client (Mr. X)
   - 2.5 Agency Admin *(Phase 2 — defined for reference)*
3. Client Assignment Model
4. Delegation Model
5. Permission Matrix
6. Interaction Boundaries
7. Actor State & Lifecycle
8. Future Guardrails (Noted for Phase 2)

---

## 01 Actor Overview

ComplianceStack Phase 1 has four active actors. Agency Admin is defined for reference but not implemented until Phase 2.

| Actor | Type | Interacts Via | Phase |
|-------|------|--------------|-------|
| **CA / Firm Owner** | Internal — platform operator | Dashboard (web) | Phase 1 |
| **Junior CA** | Internal — delegated executor | Dashboard (web) | Phase 1 |
| **Support Staff** | Internal — operations | Dashboard (web) | Phase 1 |
| **Client** | External — end recipient | WhatsApp only | Phase 1 |
| **Agency Admin** | Internal — multi-workspace | Dashboard (web) | Phase 2 |

---

## 02 Actor Definitions

---

### 2.1 CA / Firm Owner

**Who they are:**
The senior Chartered Accountant who owns the BotStackHQ workspace. The CA is the economic buyer, the primary operator, and the ultimate authority on all filing and client decisions within their workspace.

**Real-world context:**
A CA managing 10–100 clients across monthly, quarterly, and yearly compliance cycles. Spends significant time chasing clients for inputs, filing reports on government portals, and sending confirmations. BotStackHQ automates the communication layer so the CA focuses exclusively on the actual filing act.

**Primary responsibilities:**
- Onboard and configure clients in the workspace
- Configure filing types and calendar settings per client
- Review and approve Junior CA filing submissions before marking complete
- Monitor all client filing statuses via dashboard
- Intervene in escalated conversations via human takeover
- Manage team members — add Junior CAs, Support Staff, set assignments
- Mark filings complete in BotStackHQ after filing on government portal (enters ARN)
- Configure workspace settings, WhatsApp integration, notification templates

**What BotStackHQ removes from the CA's workload:**
- Manual WhatsApp follow-ups to collect client inputs
- Remembering filing deadlines per client
- Sending post-filing confirmation messages
- Answering repetitive client queries ("what documents do I need?")
- Tracking filing status in Excel or notebooks
- Being blamed for delays caused by client unresponsiveness

**AuthKit Role:** `ca_owner`

---

### 2.2 Junior CA

**Who they are:**
A delegated filing executor operating under the CA / Firm Owner. Handles assigned clients and lower-decision filing tasks. Cannot act independently on filing completion — requires CA approval before a filing is marked complete.

**Real-world context:**
A junior or associate CA in the firm. Assigned specific clients or account types by the senior CA. Capable of managing the filing workflow end-to-end except for the final approval step, which always rests with the CA Owner.

**Primary responsibilities:**
- Manage filing workflows for assigned clients
- Collect and review client inputs on assigned filings
- Submit filing completion for CA approval (cannot mark complete independently)
- Respond to client queries on assigned clients via direct message or escalated conversation
- Trigger manual workflow steps on assigned clients when needed
- Monitor assigned client filing statuses

**Constraints:**
- Cannot see or act on unassigned clients
- Cannot onboard new clients
- Cannot configure workspace settings or filing calendar
- Cannot manage team members
- Cannot mark a filing as complete — submission goes to CA for approval
- Cannot send messages to clients outside assigned client list

**Client visibility:**
Only clients explicitly assigned to them by the CA Owner. Zero visibility on unassigned clients.

**AuthKit Role:** `junior_ca`

---

### 2.3 Support Staff

**Who they are:**
Non-CA operations team members responsible for client communication, human follow-up, and escalated conversation handling. They are not licensed to file reports and have no filing authority — their role is entirely communication and coordination.

**Real-world context:**
A receptionist, accounts assistant, or client relationship executive in the CA firm. Handles inbound client queries, responds to escalations when the agent cannot resolve, and ensures clients have submitted required documents. Acts as the human layer on top of the AI agent.

**Primary responsibilities:**
- Monitor all client conversations across the workspace
- Respond to escalated conversations (agent-to-human handoff)
- Follow up with clients who are unresponsive to agent reminders
- Confirm document receipt and communicate status to clients within escalated threads
- Flag issues to CA / Junior CA when client inputs are problematic

**Constraints:**
- Cannot send direct messages to clients — communication only within escalated conversation threads or via system-triggered messages
- Cannot file reports or submit filing completions
- Cannot onboard or configure clients
- Cannot assign Junior CAs to clients
- Cannot access workspace settings or billing
- Cannot trigger workflow steps

**Client visibility:**
All clients in the workspace — no assignment required. Support Staff see all conversations across all clients by default.

> **Phase 2 Note:** Guardrails to filter Support Staff visibility by client segment, filing type, or assigned team will be implemented in Phase 2. See Section 08.

**AuthKit Role:** `support_staff`

---

### 2.4 Client (Mr. X)

**Who they are:**
The CA's end client. A business owner or individual who has engaged the CA firm to handle their compliance obligations. Interacts with BotStackHQ exclusively via WhatsApp — they never log into the dashboard and are unaware of the platform's internal structure.

**Real-world context:**
A business owner managing multiple operational priorities. Compliance is handled by the CA but requires the client to periodically provide financial data, documents, and approvals. Currently loses track of deadlines, delays submissions, and blames the CA when penalties occur.

**Primary responsibilities (from the system's perspective):**
- Respond to agent input collection requests via WhatsApp
- Submit required documents (GST certificates, TDS certificates, invoices) via WhatsApp
- Respond to reminder messages before filing deadlines
- Receive and acknowledge post-filing confirmations
- Ask queries about filing status, document requirements, deadlines

**What the client experiences:**
- Proactive WhatsApp messages from the agent requesting inputs before deadlines
- Structured reminders if they don't respond
- A clear, specific list of what documents to submit
- Instant answers to compliance queries ("what do I need for GSTR-3B this month?")
- Automatic confirmation after each filing — ARN, filing date, period covered
- Never needs to chase the CA to know if their return was filed

**Constraints:**
- WhatsApp only — no dashboard access
- Sees only their own filing interactions — no visibility into other clients
- Cannot initiate filing workflows — only responds to agent-initiated conversations
- Cannot modify their own filing configuration

**Identity in system:**
Client is not an AuthKit user. Identified by WhatsApp number + workspace_id. Client record created and managed by CA during onboarding.

---

### 2.5 Agency Admin *(Phase 2 — defined for reference)*

**Who they are:**
An operator managing multiple CA firm workspaces under a single agency account. Relevant for AI automation agencies or large accounting networks managing BotStackHQ deployments for multiple CA firms.

**Phase 2 responsibilities (planned):**
- Create and manage multiple CA workspaces
- White-label configuration per workspace
- Centralised billing across workspaces
- Cross-workspace analytics and reporting
- Assign CA Owners to workspaces

**AuthKit Role:** `agency_admin` *(not implemented in Phase 1)*

---

## 03 Client Assignment Model

Client assignment determines visibility and action rights for Junior CAs. It does not affect Support Staff visibility.

### Assignment Rules

```
Client onboarded by CA Owner
  → Auto-assigned to CA Owner as primary (always, immutable)
  → Immediately visible to all Support Staff
  → NOT visible to any Junior CA until explicitly assigned

CA Owner assigns Junior CA(s) to client
  → One or more Junior CAs can be assigned per client
  → Assigned Junior CAs gain full visibility and action rights on that client
  → Assignment can be changed or revoked by CA Owner at any time
```

### Assignment Constraints

| Rule | Detail |
|------|--------|
| **Primary CA** | Always the CA Owner who onboarded the client. Cannot be changed or removed |
| **Junior CA assignment** | 1 to N Junior CAs per client — team accounts supported |
| **Support Staff** | No assignment needed — all clients visible by default |
| **Unassignment** | CA Owner can remove a Junior CA's assignment. Immediately revokes visibility |
| **Client transfer** | Transfer of primary CA ownership — deferred to Phase 2 |

### Visibility Summary

| Actor | Unassigned clients | Assigned clients | All clients |
|-------|-------------------|-----------------|-------------|
| CA Owner | ✅ Sees all | ✅ Sees all | ✅ |
| Junior CA | ❌ No visibility | ✅ Full visibility | ❌ |
| Support Staff | ✅ Sees all | ✅ Sees all | ✅ |
| Client | ❌ | Own record only | ❌ |

---

## 04 Delegation Model

### Filing Submission — Approval Flow

Junior CAs cannot independently mark a filing as complete. All filing completions require CA Owner approval.

```
Junior CA completes filing on government portal (external)
  → Junior CA submits filing for approval in BotStackHQ
    (enters ARN, filing date — status: pending_approval)
  → CA Owner notification (priority-based):
      Client is Priority → WhatsApp + Dashboard notification
      Client is not Priority → Dashboard notification only
  → CA Owner reviews and approves
    → Status updated: filed
    → Confirmation agent triggered → WhatsApp to client
  OR
  → CA Owner rejects with notes
    → Junior CA notified to re-examine
```

### Priority Client Flag

| Rule | Detail |
|------|--------|
| **Set by** | CA Owner — manually, per client |
| **When** | At onboarding or any time via client settings |
| **Effect** | Priority clients trigger WhatsApp notification to CA Owner on key events |
| **Default** | Non-priority unless explicitly flagged |
| **Future** | AI-based auto-promotion based on filing value, tenure, interaction pattern — Post Phase 1 |

**Events that trigger WhatsApp notification for Priority clients:**
- Junior CA submits filing for approval
- Client is unresponsive at T-3 escalation
- Document validation fails (incomplete submission)
- Client sends a message outside normal workflow (direct query)

### Conversation Handling — Escalation Flow

```
Agent handles client conversation (automated)
  → Agent cannot resolve → escalation triggered
  → Conversation flagged in dashboard
  → Support Staff / Junior CA / CA Owner can respond
    (based on role and client assignment)
  → Human responds within escalated thread
  → Agent resumes or conversation marked resolved
```

### Delegation Rules Summary

| Action | CA Owner | Junior CA | Support Staff |
|--------|---------|-----------|--------------|
| File on government portal | ✅ Independent | ✅ Independent (external act) | ❌ |
| Mark filing complete in BotStackHQ | ✅ Direct | ⚠️ Submit for approval | ❌ |
| Approve filing submission | ✅ Yes | ❌ No | ❌ No |
| Assign clients to Junior CA | ✅ Yes | ❌ No | ❌ No |
| Human takeover — own clients | ✅ Yes | ✅ Assigned only | ❌ |
| Human takeover — escalated | ✅ Yes | ✅ Assigned only | ✅ Escalated only |
| Send direct message to client | ✅ Yes | ✅ Assigned only | ❌ |
| Trigger manual workflow step | ✅ Yes | ✅ Assigned only | ❌ |

---

## 05 Permission Matrix

Full capability matrix across all Phase 1 actors.

| Capability | CA Owner | Junior CA | Support Staff | Client |
|-----------|---------|-----------|--------------|--------|
| **Workspace & Configuration** | | | | |
| Onboard clients | ✅ | ❌ | ❌ | ❌ |
| Flag client as Priority | ✅ | ❌ | ❌ | ❌ |
| Configure filing types per client | ✅ | ❌ | ❌ | ❌ |
| Configure filing calendar | ✅ | ❌ | ❌ | ❌ |
| Manage team members | ✅ | ❌ | ❌ | ❌ |
| Assign Junior CA to client | ✅ | ❌ | ❌ | ❌ |
| Workspace settings | ✅ | ❌ | ❌ | ❌ |
| WhatsApp / integration config | ✅ | ❌ | ❌ | ❌ |
| **Filing Operations** | | | | |
| View filing calendar | ✅ All | ✅ Assigned | ✅ All | ❌ |
| View filing status | ✅ All | ✅ Assigned | ✅ All | Own only (WA) |
| Submit filing for approval | ❌ (direct) | ✅ Assigned | ❌ | ❌ |
| Approve filing submission | ✅ | ❌ | ❌ | ❌ |
| Mark filing complete (direct) | ✅ | ❌ | ❌ | ❌ |
| Enter ARN + filing date | ✅ | ✅ (pending approval) | ❌ | ❌ |
| **Client Communication** | | | | |
| View all conversations | ✅ | ✅ Assigned | ✅ All | Own only (WA) |
| Send direct message to client | ✅ | ✅ Assigned | ❌ | ❌ |
| Respond to escalated conversation | ✅ | ✅ Assigned | ✅ Escalated | ❌ |
| Human takeover (live chat) | ✅ | ✅ Assigned | ✅ Escalated | ❌ |
| Trigger agent manually | ✅ | ✅ Assigned | ❌ | ❌ |
| **Documents** | | | | |
| View uploaded documents | ✅ All | ✅ Assigned | ✅ All | Own via WA |
| Download documents | ✅ | ✅ Assigned | ✅ | ❌ |
| **Analytics & Audit** | | | | |
| View analytics dashboard | ✅ Full | ✅ Assigned clients | ❌ | ❌ |
| View audit trail | ✅ Full | ✅ Assigned | ❌ | ❌ |
| Export audit log | ✅ | ❌ | ❌ | ❌ |
| **Billing** | | | | |
| View billing | ✅ | ❌ | ❌ | ❌ |
| Manage subscription | ✅ | ❌ | ❌ | ❌ |

---

## 06 Interaction Boundaries

### How Each Actor Interacts With the System

**CA Owner — Dashboard**
- Full workspace control via web dashboard
- Receives filing approval requests, escalation alerts, and input-complete notifications
- Acts as final authority on all filing confirmations to clients

**Junior CA — Dashboard**
- Restricted dashboard view — assigned clients only
- Receives delegated task notifications and filing assignment alerts
- Submits filing completions via dashboard — enters ARN, awaits CA approval

**Support Staff — Dashboard**
- Read-heavy dashboard usage — monitors conversations, flags issues
- Responds within escalated conversation threads
- Cannot initiate actions — reacts to escalations and flags

**Client — WhatsApp only**
- All interaction via WhatsApp conversation with the AI agent
- Receives proactive messages (input requests, reminders, confirmations)
- Sends replies and document uploads via WhatsApp
- Never aware of the internal platform structure

### Actor → System Interaction Map

```
CA Owner
  ↕ Dashboard (REST API + WebSocket)
  → Approves filings, manages clients, monitors all activity

Junior CA
  ↕ Dashboard (REST API + WebSocket)
  → Manages assigned clients, submits filings for approval

Support Staff
  ↕ Dashboard (REST API + WebSocket — read + escalation response)
  → Monitors conversations, responds to escalations

Client
  ↕ WhatsApp (Meta Cloud API)
  → Receives agent messages, sends inputs and documents
  → Never touches the dashboard
```

---

## 07 Actor State & Lifecycle

### Internal Actor (CA Owner / Junior CA / Support Staff)

```
Invited by CA Owner
  → AuthKit invitation sent
  → User sets password, completes onboarding
  → Role assigned (junior_ca / support_staff)
  → Active

Active
  → Performing role responsibilities
  → Can be reassigned or have clients re-assigned

Deactivated
  → CA Owner deactivates team member
  → AuthKit access revoked
  → Assigned clients remain — reassignment required
  → Audit trail preserved
```

### Client

```
Onboarded by CA Owner
  → Client record created in RDS
  → WhatsApp number registered to workspace
  → Filing calendar auto-generated
  → Assigned to CA Owner (primary, automatic)
  → Visible to Support Staff immediately
  → Status: active

Active
  → Participating in filing workflows
  → Receiving agent messages via WhatsApp

Inactive
  → CA marks client inactive (e.g. engagement ended)
  → Agent workflows paused
  → Historical data preserved
  → WhatsApp number released from workspace

Archived
  → Long-term storage — 7 years per compliance requirement
  → No active workflows
  → Audit trail accessible to CA Owner only
```

---

## 08 Future Guardrails — Phase 2

The following Support Staff visibility constraints are noted for Phase 2 implementation. Not in scope for Phase 1 MVP.

| Guardrail | Description | Phase |
|-----------|-------------|-------|
| **Client-level filter** | Restrict Support Staff visibility to specific assigned clients only | Phase 2 |
| **Filing-type filter** | Restrict Support Staff to specific filing types (e.g. GST only, not TDS) | Phase 2 |
| **Conversation-only access** | Support Staff sees conversations but not financial data or extracted document fields | Phase 2 |
| **Team-based visibility** | Support Staff grouped into teams — each team sees only their assigned client segment | Phase 2 |
| **Client transfer** | Transfer primary CA ownership from one CA Owner to another | Phase 2 |
| **Junior CA cross-workspace** | Junior CA operating across multiple workspaces under agency | Phase 2 |

---

*This document is the authoritative actor definition for BotStackHQ ComplianceStack Phase 1. Any change to actor responsibilities, permissions, or delegation logic requires a formal update to this document before implementation.*
*CipherCru Innovations | BotStackHQ | 2026 | Confidential*
