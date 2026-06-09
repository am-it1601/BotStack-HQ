# 8. NestJS App Scaffold + Lambda Adapter + Module Structure

**Date:** 2026-06-09
**Area:** cross-cutting (backend + infra)
**ClickUp:** 86d34ytmy (Sprint 1 — Foundation)
**Scope status:** in-scope (ADD §04 Backend module structure, §05 API Layer)

## What was done

- **Backend domain modules** — created the 11 domain modules under `apps/backend/src/`, each a minimal `@Module({})` scaffold with a doc comment naming its ADD §04 responsibility: `auth`, `workspace`, `client`, `filing`, `workflow`, `document`, `notification`, `llm`, `agent`, `audit`, `common`.
- **AppModule wiring** — imported all 11 modules into `app.module.ts` alongside the existing global `PrismaModule`. Startup log confirms every module's dependencies initialize.
- **CDK API tier** — added `infrastructure/lib/botstackhq-api-stack.ts` (`BotStackHqApiStack`) and registered it in `bin/botstackhq.ts` as `BotStackHqApi-${envShort}`. It defines:
  - the NestJS backend Lambda (`lambda.handler`, NODEJS_20_X, ARM64, serverless-express);
  - a REST API (`LambdaRestApi`, proxy) forwarding all `/v1/*` traffic to the Lambda;
  - a WebSocket API with the three platform routes `$connect`/`$disconnect`/`$default` mapped to the Lambda + a stage.
- Lambda adapter (`lambda.ts`), `PrismaModule` (@Global), and `GET /v1/health` already existed from the prior scaffold task — verified, not rebuilt.

## Key decisions

- **Empty module scaffolds** (no controllers/services yet) — the task is "module structure"; per-domain endpoints land in their dedicated tasks (e.g. dependent 86d34ytng). Keeps the diff to the domain-boundary wiring only.
- **REST as a single Lambda-proxy** — NestJS owns the `/v1` prefix and routing, so the gateway needs no per-route config; adding endpoints needs no CDK change.
- **API stack left decoupled from VPC/Data stack** — avoids cross-stack deploy-order coupling while the data tier is undeployed (per Sprint 0 deploy state). VPC attachment deferred to Backlog.
- **Lambda code asset points at `apps/backend/dist`** — enough to synthesise and map routes; real bundling (node_modules + Prisma engine) is a packaging task, deferred to Backlog. No API deploy was performed (Sprint 0 state: only Bootstrap-dev is live).

## Deviations / conflicts

- The ClickUp task lists an **`agent`** module that ADD §04's module list omits. Scaffolded `AgentModule` per the task (agent orchestration has its own Flow Specs doc); logged a Backlog item to fold `agent` into ADD §04 on its next revision. All other modules match ADD §04 exactly.

## Follow-ups

Logged to `context/Backlog.md` (all raised by `nestjs-scaffold`):

- [infra] Production bundling for the backend Lambda (node_modules + Prisma engine for linux-arm64).
- [infra] Attach the Lambda to the VPC + `dbClientSecurityGroup` for RDS access.
- [infra] AuthKit JWT Lambda authorizer + usage-plan rate limiting on the REST API / `$connect`.
- [backend] WebSocket event handling in the Lambda (serverless-express is HTTP-only) + RDS connection-state.
- [data-model] Fold the `agent` module into ADD §04.

## Verification

- backend lint: **pass** (`eslint --max-warnings 0`) | types/build: **pass** (`nest build`)
- infra lint: **pass** | build: **pass** (`tsc`) | `cdk synth BotStackHqApi-dev`: **pass** (RestApi + 2 methods, WebSocket Api + 3 routes/integrations, 1 Lambda)
- manual: ran `node dist/main.js`, all 11 modules + AppModule initialized, `GET /v1/health` → **HTTP 200** `{"status":"ok","service":"backend",...}`
