# Claude.md — Infrastructure (AWS CDK)

**You are working in infrastructure-as-code.** Router for this workspace — read first.

---

## What this is

AWS CDK (TypeScript) defining all AWS resources for ComplianceStack. Region **`ap-south-1` (Mumbai)** — data residency for the Indian CA market is a hard requirement. Versioned alongside app code. **No manual AWS console configuration** — if it's not in CDK, it doesn't exist.

Resources in scope (per ADD): Lambda (NestJS backend, containerized Document AI), API Gateway (REST + WebSocket), EventBridge Scheduler, SQS, RDS PostgreSQL 16 + pgvector, S3, CloudFront (+ OAC), Secrets Manager, KMS, IAM.

---

## Context loading — read in this order

1. **Always:** `../../context/ai-workflow.md` + `../../context/code_standards.md`
2. **Always for this app:** `context/ai_workflow.md` + `context/code_standards.md`
3. **Authoritative source for what to provision:** `/docs/BotStackHQ_ComplianceStack_Architecture_Decision_Document.md` (§03 architecture, §06 DB, §07 scheduling, §14 storage, §15 CI/CD, §16–18 monitoring/security/residency)

**Do NOT load:** frontend/backend app context, `ui_system.md`, `api_rules.md`. You provision the platform; you don't write its business logic.

---

## Non-negotiables for this app

- **Region `ap-south-1` only.** No resource provisioned outside it. Data residency is a compliance requirement, not a preference.
- **The ADD is the resource list.** Don't add services not in it (e.g. ElastiCache is explicitly deferred; no BullMQ/Redis). New service → Hard Stop + flag.
- **Least privilege IAM.** No wildcard `*` resource/action grants. Scope every policy.
- **Encryption on by default** — RDS at-rest (KMS), S3 SSE, secrets in Secrets Manager. No plaintext secrets in CDK or env.
- **S3 is private** — CloudFront OAC only, no public buckets, no public S3 URLs.
- **Three environments** (`development`/`staging`/`production`) parameterized — no env-specific hardcoding.

## Report + Backlog

Report → `../../context/report/`. Deferrals → `../../context/Backlog.md`.
