# [Domain] Domain Registration & DNS Setup

**Date:** 2026-06-04
**Area:** infra
**Scope status:** in-scope — ADD §02 (architecture), §10 (`dashboard.botstackhq.com` frontend host), §06/§16 (API GW), §18 (region/residency). ClickUp `86d34yd9d` (subtasks `86d34yd9p`, `86d34ydaa`, `86d34ydb4`).

## What was done

Provisioned Route 53 DNS + ACM certificates as CDK (the apex domain is already registered on AWS, so no registration step in IaC — registration is not a CloudFormation resource anyway).

- **`infrastructure/lib/botstackhq-dns-stack.ts`** (new, `ap-south-1`):
  - `PublicHostedZone` for the apex domain (NS + SOA records auto-created by Route 53 — subtask `86d34ydaa`).
  - One regional ACM `Certificate` covering `api.<domain>` (primary) + `wh.<domain>` (SAN) for the REST API and WhatsApp webhook API Gateway custom domains. DNS-validated in-zone via native `DomainValidationOptions.HostedZoneId` — ACM auto-writes the validation CNAMEs and CloudFormation blocks until `ISSUED`.
  - Exports `SUBDOMAINS` constants (`dashboard`/`api`/`wh`) reused by the edge stack.
  - Outputs: hosted zone ID, authoritative nameservers, regional cert ARN.
- **`infrastructure/lib/botstackhq-edge-cert-stack.ts`** (new, `us-east-1`):
  - ACM `Certificate` for `dashboard.<domain>` for the CloudFront distribution (CloudFront only accepts `us-east-1` certs). DNS-validated against the same hosted zone via `crossRegionReferences`.
  - Output: dashboard cert ARN.
- **`infrastructure/bin/botstackhq.ts`**: wired both stacks; `domainName` read from CDK context (default `botstackhq.com`, override `-c domainName=...`); `crossRegionReferences: true` on both so the `us-east-1` cert can validate against the `ap-south-1` zone.

## Key decisions

- **Single apex hosted zone, not env-multiplied.** A registered domain maps to exactly one public hosted zone (one set of authoritative NS records); deploying a `botstackhq.com` zone per env would create competing zones. The zone is shared infra; env differentiation for endpoints is deferred (see Follow-ups). `domainName` is still parameterized via context, so a non-prod zone (e.g. `dev.botstackhq.com`) can be deployed with an override.
- **`api` + `wh` share one regional cert** (SAN) — one ACM cert can back multiple API Gateway custom domains; cheaper and simpler than two certs.
- **Native DNS validation over the deprecated `DnsValidatedCertificate`** — `Certificate` + `CertificateValidation.fromDns(zone)` emits `DomainValidationOptions.HostedZoneId`, so ACM/CloudFormation handle record creation and the `ISSUED` wait with no custom-resource Lambda.
- **No alias (A/AAAA) records yet.** They point at CloudFront and API Gateway custom domains that don't exist until their own tasks; creating aliases now would fail with no target. Records will be added by the CloudFront/API GW stacks (Follow-ups).

## Deviations / conflicts

None. All resources trace to the ADD; region stays `ap-south-1` except the CloudFront cert, which AWS mandates be in `us-east-1`.

## Follow-ups

Logged to Backlog: (1) operator must point the registered domain's nameservers at the deployed zone's NS (one-time, `HostedZoneNameServers` output); (2) subdomain alias records wired in the CloudFront and API GW custom-domain tasks; (3) multi-env subdomain/zone strategy (delegated sub-zones vs. env-prefixed records under the apex).

## Verification

- lint: **pass** (`eslint . --max-warnings 0`)
- types: **pass** (`tsc`)
- tests: n/a (no CDK assertion suite in repo yet)
- manual: `cdk synth` clean for all 4 stacks; confirmed DNS stack emits `Route53::HostedZone` + `CertificateManager::Certificate` with `DomainValidationOptions.HostedZoneId`, edge stack emits the `us-east-1` cert wired via cross-region SSM. **Not deployed** — deploy + nameserver pointing is the operator step (needs account credentials; cert `ISSUED` state is reached during `cdk deploy`).
