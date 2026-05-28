# AI Workflow — Frontend (React)

App-specific agentic rules. Extends `../../context/ai-workflow.md`. Read that first.

---

## Before writing any frontend code

1. **Identify the surface.** Which dashboard area (calendar, client mgmt, conversation monitor, takeover, doc viewer, team, approvals, analytics)? Confirm it's IN scope (Scope Lock §06).
2. **Check the data contract.** What does the API already return? Use the shared types. If the screen needs data the API doesn't expose → that's a backend task; log it to Backlog, don't fake it client-side.
3. **Check role visibility.** Which of `CA_OWNER / JUNIOR_CA / SUPPORT_STAFF` sees this? Gate accordingly (Actor Definition Doc).

## Building or styling a component

When the task involves a UI component (new or changed), follow this order — it prevents bespoke markup and token drift:

1. **Reuse first.** Is there already a component in `components/ui` (shadcn) or a feature component that fits? Extend it before creating anything.
2. **Need a primitive shadcn offers?** Add it via the CLI (`npx shadcn@latest add <component>`), don't hand-write it. It lands in `components/ui` as our source.
3. **Style via tokens + variants.** Theme through the design tokens (Tailwind utilities mapping to `design.md`); express visual variants with `cva`. Never fork a shadcn component or fix appearance with call-site `className` overrides.
4. **Compose with `cn()`.** No template-literal className strings.
5. **Check the per-component contract** in `ui_system.md` §8 (buttons, inputs, tables, status badge, calendar, WhatsApp preview, etc.) — app components are built _from_ primitives, not as custom styled markup.
6. **States are mandatory.** Loading / empty / error / stale-on-reconnect for any data-driven view (`ui_system.md` §9).
7. **Accessibility:** keep shadcn's a11y attributes intact; status never by color alone.

## Patterns to follow

- **Data fetching:** one TanStack Query hook per resource/query key. Co-locate query keys. Mutations invalidate the right keys. No fetching in `useEffect`.
- **UI/ephemeral state:** Zustand stores, scoped and small (sidebar, active workspace, modals). Never mirror server data into Zustand.
- **Real-time:** a single WS connection manager; on each typed WS event, invalidate the matching query key(s). Don't manually patch cache unless there's a measured reason.
- **Forms:** controlled inputs, validate against the same constraints the API enforces (mirror shared-type/enum values). Surface the API `error.code` meaningfully.
- **Loading/empty/error states are required** for every data-driven view — not optional polish.
- **Optimistic updates** only where the mutation is safe to roll back; otherwise show pending state.

## Out of bounds (don't build in Phase 1)

- Client web portal / any client-facing login UI.
- White-label/branding editor, billing dashboard, agent performance analytics, trend/cohort analytics — all OUT per Scope Lock. If asked, stop and flag.

## Testing focus

- Role-gating: a `SUPPORT_STAFF`/`JUNIOR_CA` view doesn't render owner-only controls.
- Query/mutation hooks: cache invalidation on success and on relevant WS events.
- Critical flows: filing approval queue actions, human takeover send path.

## When done

Report → `../../context/report/`. Deferrals → `../../context/Backlog.md`.
