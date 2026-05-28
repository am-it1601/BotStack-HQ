# API Rules — REST / WebSocket / Events

Authoritative API design guide for the backend. Load only when the task touches an HTTP endpoint, WebSocket route, or event contract. Extends the ADD (Section 05, API Layer).

---

## 1. REST

- **Versioning:** every route prefixed `/v1/`.
- **Resource-based, plural, kebab-case:** `/v1/clients`, `/v1/filing-records`, `/v1/clients/{clientId}/filing-configs`.
- **HTTP verbs:** GET (read), POST (create), PATCH (partial update), PUT (full replace — rare), DELETE (soft-delete → sets `deleted_at`).
- **No verbs in paths.** Action-ish operations are sub-resources or state transitions: `POST /v1/filing-records/{id}/approve`, not `/approveFiling`.
- **Tenant context:** derived from JWT. **Never** accept `workspace_id` as a path/query/body param.

### Response envelope (uniform)

```jsonc
{
  "data": {
    /* resource or array */
  },
  "meta": { "cursor": "...", "hasMore": true }, // present on lists / when relevant
  "error": null, // null on success
}
```

On error:

```jsonc
{
  "data": null,
  "meta": null,
  "error": { "code": "FILING_DEPENDENCY_UNMET", "message": "...", "details": {} },
}
```

- `error.code` is a stable UPPER_SNAKE string (clients switch on it). `message` is human-readable. Never leak stack traces or SQL.

### Pagination

- **Cursor-based only.** Never offset/limit.
- Query: `?limit=<n>&cursor=<opaque>`. Response `meta`: `{ cursor, hasMore }`.
- Default `limit` 25, max 100.

### Status codes

| Code | Use                                                             |
| ---- | --------------------------------------------------------------- |
| 200  | OK (read/update)                                                |
| 201  | Created                                                         |
| 202  | Accepted (async accepted, e.g. queued doc processing)           |
| 204  | No content (soft-delete)                                        |
| 400  | Validation error                                                |
| 401  | Missing/invalid auth                                            |
| 403  | Authenticated but not permitted (RBAC)                          |
| 404  | Not found _or_ cross-tenant (don't reveal existence)            |
| 409  | State conflict (e.g. dependency unmet, duplicate filing period) |
| 422  | Semantically invalid (business rule)                            |
| 429  | Rate limited                                                    |
| 5xx  | Server error — generic message only                             |

- **Cross-tenant access returns 404, not 403** — never confirm a resource in another workspace exists.

### Conventions

- Timestamps ISO 8601 UTC in all payloads.
- IDs are UUID v4 strings.
- Field naming in JSON: `camelCase` on the wire (DTO layer), even though DB columns are `snake_case`.
- Idempotency: mutating endpoints that may be retried accept an `Idempotency-Key` header where relevant (webhooks, payments-like flows).

---

## 2. WebSocket (API Gateway WebSocket API)

- Routes: `$connect`, `$disconnect`, `$default`.
- Connection identity validated via JWT on `$connect`; reject unauthenticated connects.
- Connection state (connection id ↔ workspace user) persisted in RDS — Lambda is stateless.
- **Server→client event shape:**
  ```jsonc
  { "type": "FILING_STATUS_CHANGED", "payload": { ... }, "ts": "ISO-8601" }
  ```
- `type` is UPPER_SNAKE and stable. Used by frontend (TanStack Query) to invalidate cache.
- In-scope event types (Phase 1): live filing status updates, new client message received, document processing complete. Don't invent new event types without a doc update.
- Never broadcast across workspaces. Fan-out is scoped to the target workspace's connections.

---

## 3. Events (EventBridge / SQS)

- **EventBridge Scheduler** drives the filing calendar (input-collection triggers, reminder cadence). Schedules keyed off `FilingRecord.input_collection_date` / `effective_due_date`.
- **SQS** carries async jobs: document extraction trigger, outbound WhatsApp dispatch, LLM calls.
- **Internal event envelope:**
  ```jsonc
  {
    "eventType": "INPUT_COLLECTION_DUE",
    "workspaceId": "...",
    "filingRecordId": "...",
    "occurredAt": "ISO-8601",
    "version": 1,
  }
  ```
- Consumers are **idempotent** — dedupe on `(eventType, filingRecordId, period)`; redelivery must not double-send WhatsApp messages or re-create workflows.
- Every event carries `workspaceId`. Audit every consumed event to `AuditLog`.
- Reject/DLQ malformed events; never silently drop.

---

## 4. Webhooks (inbound, WhatsApp)

- Verify `X-Hub-Signature-256` against the secret in AWS Secrets Manager on **every** request.
- Reject events with a timestamp older than 5 minutes (replay protection).
- Respond 200 fast; do real work async via SQS. Webhook handler does validation + enqueue only.
