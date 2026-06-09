# RDS PostgreSQL 16 + pgvector — CDK provisioning (ClickUp 86d34yr3z)

**Date:** 2026-06-08
**Area:** infra
**Scope status:** in-scope — ADD §06 (RDS PostgreSQL 16, db.t4g.medium, KMS, gp3/backups, Single-AZ MVP) + §17 (private subnets, not publicly accessible). No service outside the ADD.
**ClickUp:** 86d34yr3z — the CDK half. The in-database DDL half (11 schemas, pgvector, RLS) was delivered earlier as a Prisma migration (report `2026-06-08_local-prisma-setup.md`) and is applied to RDS post-deploy.

## What was done

- **`infrastructure/lib/botstackhq-network-stack.ts`** (`BotStackHqNetworkStack`) — platform VPC: 2 AZs (RDS subnet-group minimum), `natGateways: 0`, PRIVATE_ISOLATED subnets only (no IGW/NAT). RDS needs no egress; avoids ~$32/mo/NAT against the $200 account budget.
- **`infrastructure/lib/botstackhq-data-stack.ts`** (`BotStackHqDataStack`) — the data tier:
  - Customer-managed **KMS key** (rotation on; RETAIN prod / DESTROY else) for storage-at-rest.
  - **Two security groups**: `dbSecurityGroup` (no inline ingress) and `dbClientSecurityGroup` (the seam compute attaches to); single 5432/tcp ingress from client → DB.
  - **`rds.DatabaseInstance`**: postgres 16.4, db.t4g.medium, private-isolated subnets, `publiclyAccessible: false`, `multiAz: false`, gp3 100→500 GB autoscaling, `storageEncrypted` with the CMK, 7-day backups, db `botstackhq`, port 5432, deletion protection + RETAIN in prod.
  - **Credentials reuse** the Bootstrap stack's `botstackhq/<env>/database/credentials` secret via `Credentials.fromSecret(fromSecretNameV2(...))`; CDK adds a `SecretTargetAttachment` that backfills host/port/dbInstanceIdentifier — keeps the canonical secret name the backend uses.
  - Outputs: endpoint, port, secret name, client SG id, KMS key arn.
- **`infrastructure/bin/botstackhq.ts`** — wires `BotStackHqNetwork-${envShort}` then `BotStackHqData-${envShort}` (env-suffixed like Bootstrap), passing the VPC.

## Key decisions

- **Reuse bootstrap secret, not a new one** — matches that secret's own doc comment ("RDS rotation overrides host/port/password"). Synth confirmed the attachment + `MasterUsername` dynamic-reference resolve against the imported secret; no fallback needed.
- **`natGateways: 0` / isolated subnets** — cheapest correct topology for a private DB.
- **CMK over AWS-managed key** — own the rotation; small fixed cost.
- **Monitoring omitted** (RDS CPU alarm → existing `alertsTopic`, Performance Insights) — ADD §16, not in this ticket's ACs; optional follow-up.

## Deviations / conflicts

- None. Region ap-south-1, encryption on, least-privilege SG, env-parameterized — all per the infra non-negotiables.

## Follow-ups (Backlog, 2026-06-08)

- `[infra]` **Run the Prisma migration against RDS** — RDS is private (no public access, no NAT), so `prisma migrate deploy` must run from inside the VPC (SSM bastion / CodeBuild-in-VPC / one-off migration Lambda). This is what lands the 11 schemas + pgvector + RLS on RDS.
- `[infra]` Non-superuser app DB role (already logged) — required for RLS to bind the app connection; create it as part of the migration-runner / app wiring.
- `[infra]` Optional: RDS CPU alarm → `alertsTopic` + Performance Insights (ADD §16).

## Verification

- **build:** pass (`tsc`). **lint:** pass (`eslint . --max-warnings 0`).
- **synth:** `cdk synth BotStackHqNetwork-dev BotStackHqData-dev` succeeded. Template asserts confirmed: `AWS::RDS::DBInstance` Engine postgres 16.4, DBInstanceClass db.t4g.medium, StorageType gp3, AllocatedStorage 100 / MaxAllocatedStorage 500, StorageEncrypted true + KmsKeyId, MultiAZ false, PubliclyAccessible false, BackupRetentionPeriod 7, Port 5432, DBName botstackhq; 1 `SecretTargetAttachment`; 1 KMS key; 2 SGs with a single 5432/tcp ingress; 1 DBSubnetGroup.
- **Not deployed** — `cdk deploy` needs AWS creds and incurs cost/prod impact (same handling as the Bootstrap/DNS stacks). Operator steps: deploy order **Bootstrap → Network → Data**, then run `prisma migrate deploy` from inside the VPC.
