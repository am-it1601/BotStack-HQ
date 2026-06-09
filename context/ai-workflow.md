# AI Workflow — General Agentic Work Rules

**Scope:** Applies to every agent session across the entire `botstackhq` monorepo.
**Read this once at session start.** Sub-project rules in `apps/<app>/context/` override these where they conflict.

---

## 0. The Golden Rule

**The locked docs in `/docs` are the single source of truth.** Architecture, data model, scope, and flows are LOCKED. You do not build outside them. If a task requires deviating, you stop and flag it — you do not improvise.

Authority order (highest wins):

1. `docs/BotStackHQ_MVP_Scope_Lock.md` — what is even allowed to be built
2. `docs/BotStackHQ_ComplianceStack_Architecture_Decision_Document.md` — how it's built
3. `docs/BotStackHQ_Data_Model_Phase_1.md` — the schema
4. `docs/BotStackHQ_Actor_Definition_Document_ComplianceStack.md` — permissions
5. `docs/BotStackHQ_ComplianceStack_Agent_Flow_Specs.md` — conversation logic
6. `docs/BotStackHQ_Filing_Compliance_Reference.md` — filing rules
7. Sub-project `context/` files
8. This file

If two sources conflict, the higher one wins and you note the conflict in your report.

---

## 1. Context Loading Protocol (token discipline)

You do **not** read everything. Load only what the task touches. Determine the work area from the task, then load the matching context.

| Task area                       | Read these (in order)                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Backend / API / NestJS          | `apps/backend/Claude.md` → `apps/backend/context/ai_workflow.md` → `code_standards.md` → `api_rules.md`   |
| Frontend / dashboard UI         | `apps/frontend/Claude.md` → `apps/frontend/context/ai_workflow.md` → `code_standards.md` → `ui_system.md` |
| Document AI / Python            | `apps/document-ai/Claude.md` → `apps/document-ai/context/ai_workflow.md` → `code_standards.md`            |
| Infrastructure / CDK            | `infrastructure/Claude.md` → `infrastructure/context/ai_workflow.md` → `code_standards.md`                |
| Schema / data model change      | Always read `docs/BotStackHQ_Data_Model_Phase_1.md` first, then backend context                           |
| Cross-cutting (touches 2+ apps) | This file + each affected app's `Claude.md`                                                               |

**Rules:**

- A backend/API task does **not** load `ui_system.md`. A UI task does **not** load `api_rules.md`. Do not waste context on irrelevant layers.
- Read the sub-project `Claude.md` **before** its `context/` files — it tells you which context files actually apply.
- If you're unsure of the area, read this file's task table, decide, then load. Do not pre-load defensively.

---

## 2. Task Lifecycle

Every task follows this loop. ClickUp is the live progress tracker — steps 1 and 8 keep it in sync (full protocol in Section 7).

```
1. TICKET    → Identify the ClickUp task (Section 7). Move it to "In Progress".
2. CLASSIFY  → Which app/layer? Which docs/context apply? Is it in MVP scope?
3. LOAD      → Read only the relevant context (Section 1).
4. VERIFY    → Is this in-scope per MVP Scope Lock? If OUT/PARTIAL, STOP and flag.
5. PLAN      → State the approach in 2–4 lines before writing code.
6. Create a new branch for the ticket from latest develop(sync develop first from remote if behind)
7. BUILD     → Implement following the loaded standards.
8. SELF-CHECK→ Lint, types, tests pass. No scope creep. No new deps without flagging.
9. commit the changes.
10. CLOSE OUT → Write report md to context/report/ (Section 4),
               post summary comment to the ClickUp task, move it to "Review",
               log deferrals to context/Backlog.md (Section 5).
```

---

## 3. Hard Stops — When You Must Pause and Ask

Stop and surface the issue instead of proceeding when:

- The task requires a feature marked **OUT** or **PARTIAL** in the Scope Lock.
- The task requires a new DB table/field not defined in the Data Model.
- The task requires a new third-party dependency or AWS service not in the ADD.
- The task requires changing a LOCKED architectural decision.
- A permission/role behavior contradicts the Actor Definition Document.
- Tenant isolation (`workspace_id`) cannot be enforced as specified.

"It's only a small change" is not a reason to skip this. **No code is written for out-of-scope features regardless of how simple they seem.**

**On a Hard Stop, also update ClickUp:** move the task to **"Blocked"** and post a comment stating what triggered the stop, what's needed to unblock (e.g. doc update, Amit's sign-off), and the relevant Backlog item link. Do not move it to "Review". Then surface it to the human.

---

## 4. Implementation Report (mandatory, one per task)

After completing any task, write `context/report/YYYY-MM-DD_<short-slug>.md`:

```markdown
# <Task title>

**Date:** YYYY-MM-DD
**Area:** backend | frontend | document-ai | infra | cross-cutting
**Scope status:** in-scope (cite Scope Lock line if relevant)

## What was done

- Bullet summary of changes (files, modules, endpoints, components touched).

## Key decisions

- Any judgment calls and why.

## Deviations / conflicts

- Anything that diverged from a doc, or a doc conflict found. (None = say "None".)

## Follow-ups

- Anything pushed to Backlog.md (link the item).

## Verification

- lint: pass/fail | types: pass/fail | tests: pass/fail | manual checks done
```

Keep it tight — this is a changelog for the next agent, not an essay.

**Also post a summary comment to the ClickUp task** (Section 7) — a condensed version of this report (What was done / Deviations / Verification / report file path), so progress is visible to the human without opening the repo. The repo md is the full record; the ClickUp comment is the digest.

---

## 5. Backlog Discipline

`context/Backlog.md` is the single tracking file for deferred work. Whenever you:

- postpone something to stay in scope,
- spot tech debt or a TODO,
- defer an edge case,

…append an entry. **Never** silently drop work. Format defined in `Backlog.md`.

---

## 7. ClickUp — Progress Tracking Protocol

Project progress is tracked in **ClickUp**. Stories/tasks live in the ComplianceStack ClickUp Space. The agent keeps the relevant task's status and comments current so the board reflects reality without anyone chasing it.

> **Tooling:** Use the ClickUp connector/MCP tools available in the session (search task, get task, update status, add comment). Load them via tool search if not already active. If ClickUp tools are genuinely unavailable, do the work, write the repo report as normal, and note in the report that ClickUp couldn't be updated — never block coding on tracker access.

### 7.1 Identify the task (start of work)

- **If a task ID is given** in the prompt → fetch it, confirm the title matches the work, proceed.
- **If no ID is given** → search the Space by the task's title/keywords, pick the best match, and **confirm with the human before writing anything to it** ("Working against `<task name>` [ID] — correct?").
- **If no matching task exists** → proceed with the work (don't block), but flag it: tell the human no ClickUp task was found and recommend creating one (or create one if you have the means and the Space/list is clear). Note the missing-task situation in the report. Tracking should not be a hard gate on getting work done, but untracked work must never be silent.

Never write status/comments to a task you haven't confirmed is the right one.

### 7.2 On start

Once the task is confirmed, move its status to **"In Progress"**. (Match the Space's actual status name — don't invent statuses.)

- Work on individual Subtask if exits,
- Once subtask is done, make a commit, update the status of the subtask to "shipped"

### 7.3 On completion

After self-check passes and the repo report is written:

1. Post a **summary comment** to the task (the digest described in Section 4).
2. Move the task to **"Review"** (QA / human verification stage).

The agent **does not** move tasks to "Done" — a human verifies and closes. The agent's terminal state for a successful task is always "Review".

### 7.4 On a Hard Stop / blocker

If a Hard Stop (Section 3) or any blocker is hit mid-task:

- Move the task to **"Blocked"**.
- Comment: what triggered the block, what's required to unblock (doc update, sign-off, dependency), and the linked Backlog item if applicable.
- Do **not** move it to "Review". Surface it to the human.

### 7.5 Rules

- **Status names must match the Space's actual workflow.** If the real statuses differ from "In Progress / Review / Blocked", use the closest equivalent and don't create new ones without confirmation.
- **Comments are concise and factual** — digest, not essay. Link the repo report path so the full record is one hop away.
- **The repo `context/report/` md is the source of truth**; the ClickUp comment is the visible digest. They must not contradict each other.
- **One agent task = one ClickUp task.** Don't spread one piece of work across several tasks or batch several tasks under one update without saying so.

---

## 8. Universal Working Principles

- **Think like an owner.** Flag risk early, simplify, optimize for long-term leverage, not just task completion.
- **Pyramid communication.** When reporting to the human: conclusion first, then reasoning, then detail.
- **Proven patterns over cleverness.** This is a compliance product — predictability and auditability beat novelty.
- **Multi-tenancy is sacred.** `workspace_id` always comes from the JWT, never from request body or URL. This is non-negotiable everywhere.
- **Type safety end-to-end.** Shared types live in `packages/shared-types`. Backend and frontend consume them — do not redefine types locally that belong there.
- **Conventional Commits.** All commits follow the format in the root README. Non-conforming messages are rejected by the commit-msg hook.
- **No secrets in code.** Secrets come from AWS Secrets Manager / env. Never hardcode keys, tokens, or connection strings.
- **Don't reformat unrelated code.** Touch only what the task requires. Keep diffs reviewable.
- **Keep ClickUp honest.** The board reflects reality: In Progress when you start, Review when done, Blocked when stuck. Never leave a task you worked on in the wrong state.
