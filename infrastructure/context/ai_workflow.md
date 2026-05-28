# AI Workflow — Infrastructure (AWS CDK)

App-specific agentic rules. Extends `../../context/ai-workflow.md`. Read that first.

---

## Before provisioning anything

1. **Find the ADD decision.** Every resource must trace to a decision in the Architecture Decision Document. If there's no decision for it → **Hard Stop**, flag, Backlog as `[SCOPE-CHANGE]`.
2. **Confirm region.** `ap-south-1`. Always.
3. **Confirm environment parameterization.** dev/staging/prod must all be expressible — no single-env hardcoding.

## Patterns to follow

- **One stack per concern** (network, data, compute/api, async, frontend-hosting, observability) or per the repo's existing CDK layout — keep stacks cohesive and independently deployable.
- **Construct reuse** for repeated patterns (Lambda function + log group + IAM role). Don't copy-paste resource blocks.
- **Config via context/SSM/Secrets Manager**, never inline literals for env-specific values.
- **IAM least-privilege**, authored alongside the resource it grants access to.
- **Infra changes are reviewed via diff** — `cdk diff` is the source of truth for what changes. Keep changes small and legible.

## Hard stops specific to infra

- Adding an AWS service not in the ADD (e.g. Redis/ElastiCache, a second region, a different DB).
- Any public S3 bucket or public resource exposure.
- Any wildcard IAM grant.
- Any plaintext secret.

## Testing / validation

- `cdk synth` clean and `cdk diff` reviewed before "done".
- Where the repo has CDK assertions/snapshot tests, update them; add tests for new security-relevant config (encryption, public-access-block, IAM scope).

## When done

Report → `../../context/report/` (include the relevant `cdk diff` summary). Deferrals → `../../context/Backlog.md`.
