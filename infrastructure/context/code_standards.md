# Code Standards — Infrastructure (AWS CDK / TypeScript)

Extends `../../context/code_standards.md`. Read that first. CDK-specific rules below.

---

## CDK structure

- TypeScript, strict mode. Same TS conventions as the rest of the monorepo.
- **Stacks** named by concern (`NetworkStack`, `DataStack`, `ApiStack`, `AsyncStack`, `FrontendHostingStack`, `ObservabilityStack`) — adjust to the repo's actual layout, but keep one cohesive concern per stack.
- **Constructs** (`*.construct.ts`) for reusable resource groupings. No copy-pasted resource definitions.
- File naming `kebab-case.ts`; classes `PascalCase`.

## Configuration

- Env-specific values (`development`/`staging`/`production`) come from CDK context or a typed config object keyed by environment — never hardcoded inline.
- Region fixed to `ap-south-1`. Account/env injected, not literal.
- Secrets referenced from Secrets Manager; never materialized into CDK source or env files.

## Security defaults (enforced in code)

- S3: `blockPublicAccess: BLOCK_ALL`, SSE enabled, access via CloudFront OAC only.
- RDS: encryption at rest (KMS), not publicly accessible, in private subnets.
- IAM: explicit, least-privilege policies. No `Effect: Allow` with `Resource: "*"` / `Action: "*"`.
- Lambda: scoped execution roles; env vars for non-secret config, Secrets Manager for secrets.
- API Gateway: usage plans / throttling configured for REST; JWT authorizer wired.

## Naming of resources

- Resource logical IDs and names include environment + a stable prefix (e.g. `botstackhq-<env>-<resource>`), so dev/staging/prod don't collide and are auditable.

## Reliability / ops

- Tag every resource with at least `project=botstackhq`, `env`, `managed-by=cdk`.
- Removal policies: `RETAIN` for stateful prod resources (RDS, S3 data buckets); safe defaults elsewhere.
- Log groups defined explicitly with retention set — no unbounded default retention.

## Quality bar

- `cdk synth` succeeds, `cdk diff` reviewed, lint/types pass before "done".
- Keep diffs minimal — infra changes are high blast-radius. One concern per change.
