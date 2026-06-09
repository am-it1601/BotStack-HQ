# [Accounts] Third-Party Service Account Setup — secret population

**Date:** 2026-06-04
**Area:** infra
**Scope status:** in-scope — Sprint 0 account setup (ClickUp 86d34yd5v). Acceptance criterion "All API keys stored in AWS Secrets Manager — never in code".

## What was done

The CDK `BotStackHqBootstrapStack` already provisions the five `botstackhq/dev/*`
secret _containers_ with placeholder values. This task populated the real key
material (supplied out-of-band in a gitignored `key.yml`) into the deployed dev
secrets, without ever putting secrets in code.

- **`.gitignore`** — added `key.yml` / `keys.yml`. The file holds live API keys
  and was **not** previously ignored (leak risk). Now confirmed ignored.
- **`infrastructure/scripts/populate-secrets.cjs`** — new repeatable, secret-free
  Node CLI. Reads `key.yml` at run time, fetches each deployed secret, overlays
  only the fields it has real values for (dropping stale `note`/`random` keys),
  and `put-secret-value`s the merged JSON. Idempotent and non-destructive; never
  prints secret values; writes via a 0600 temp file + `file://` (value never on
  the process command line). Supports `--env`, `--profile`, `--region`,
  `--dry-run`.
- **`eslint.config.mjs`** — added a CommonJS-scripts override (`**/*.cjs`: node
  globals, `sourceType: commonjs`, `no-require-imports` off) so the ops script
  lints clean under the flat config.
- **Ran it for `dev`** (`--profile bruno-onb-dev`, `ap-south-1`). Populated:
  - `botstackhq/dev/openai/api-key` → real `apiKey`
  - `botstackhq/dev/anthropic/api-key` → real `apiKey`
  - `botstackhq/dev/authkit/credentials` → real `clientId` + `apiKey`
  - `botstackhq/dev/whatsapp/credentials` → real `accessToken` + `testNumber`
  - Verified each via `get-secret-value` (values masked in logs).

## Key decisions

- **Population is not in CDK.** Per the infra non-negotiable "no plaintext secrets
  in CDK or env", real values are pushed at run time from a gitignored file, not
  committed or templated into the stack. The script is the repeatable mechanism.
- **Merge, not overwrite.** The script overlays known fields and preserves the
  rest, so partial setups (WhatsApp Meta IDs, AuthKit webhook secret) keep their
  provisioned placeholders rather than being clobbered.
- **Used the `bruno-onb-dev` admin profile.** The `botstackhq-cdk-deployer` user
  deliberately has no `secretsmanager` permissions (it works through CDK CFN
  roles), so it cannot run `put-secret-value`. Logged a Backlog item to grant an
  ops role the needed permission.

## Deviations / conflicts

- None against locked docs. The WhatsApp/Meta subtask (86d34yd6c) is still open,
  so its secret is only partially populated — expected, not a deviation.

## Follow-ups (Backlog.md)

- Populate WhatsApp Meta fields once the Meta Developer app exists (86d34yd6c).
- Populate AuthKit `webhookSecret` (issued in WorkOS dashboard).
- Provision + populate **staging** secrets (only the dev bootstrap stack is deployed).
- Grant deployer/ops role `secretsmanager` Get/Put on `botstackhq/*`.

## Verification

- lint: pass (`eslint scripts/populate-secrets.cjs` → 0 problems)
- types: n/a (plain `.cjs` ops script, no TS build)
- tests: n/a (no unit tests for one-shot ops tooling)
- manual: dry-run reviewed, real run updated 4 secrets, `get-secret-value`
  confirmed real values present; `git check-ignore key.yml` confirms no secret
  is committable.

---

## UPDATE — 2026-06-04: workflow retired, secrets reset to placeholder

This `key.yml` + `populate-secrets.cjs` workflow has been **retired**. Going
forward, real key material is entered manually (AWS Console or
`aws secretsmanager put-secret-value`) directly into the CDK-provisioned
placeholder containers, when needed.

- Deleted `key.yml` (local only — was never git-tracked).
- Deleted `infrastructure/scripts/populate-secrets.cjs` and the empty `scripts/`
  folder; removed the `key.yml`/`keys.yml` block from `.gitignore`.
- Reset the four populated dev secrets back to placeholder values via
  `put-secret-value` (`openai/api-key`, `anthropic/api-key`,
  `authkit/credentials`, `whatsapp/credentials`). `database/credentials` was left
  as-is (only ever held a CDK-generated random password).

**Security note:** the keys populated by the original run are considered exposed
and must be **rotated/revoked at each provider** (OpenAI, Anthropic, Meta,
WorkOS). The placeholder reset does not undo exposure — Secrets Manager still
retains the prior version (`AWSPREVIOUS`) with the real values until rotated out.
