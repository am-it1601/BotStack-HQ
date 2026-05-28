# UI System — CA Dashboard

Design rules and reference for the frontend. Load only for visual/layout/component work.

**Design system: "Precision Minimalist" — LOCKED.** Full token source of truth is `design.md` (frontmatter = the machine-readable tokens; prose = the intent). This file is the _application_ guide: how to apply those tokens in the dashboard. Where they overlap, `design.md` wins on values, this file wins on usage patterns.

**Component library: shadcn/ui.** Build on shadcn primitives, themed with the Precision Minimalist tokens. Do not hand-roll components that shadcn already provides.

---

## 0. The two rules that prevent drift

1. **Never hardcode a value that exists as a token.** Colors, spacing, radius, type — all come from the theme (wired from `design.md`). A raw hex, px, or rem literal in a component is a defect.
2. **Never fork a shadcn component to restyle it.** Theme via CSS variables / Tailwind config. If a variant is genuinely missing, extend through shadcn's variant pattern (e.g. `cva`), don't copy-paste-and-edit.

---

## 1. Design principles (from design.md)

- **Architectural rigor.** Strict grid, "locked" enterprise stability. This is a high-performance tool for serious compliance work, not a consumer app.
- **Cognitive clarity.** Generous whitespace, clear data hierarchy — complex multi-stage workflows (filing lifecycle) must stay digestible.
- **Technological edge, used sparingly.** Electric cyan (tertiary) is the "AI layer" accent — reserved for AI-driven actions and high-energy triggers, never decoration.
- **Calm by default, loud only for risk.** Strong color signals risk/alert states; everything else is neutral navy/slate/white.

---

## 2. Color — semantic roles (tokens locked in design.md)

Use token roles, never literals. The palette is anchored in **Deep Navy** (primary / typography / structure) and **Cobalt** (secondary / primary actions), with **Electric Cyan** (tertiary) reserved for the AI layer.

| Role                     | Token                                                | Use                                                                                      |
| ------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Primary (Deep Navy)      | `primary` / `on-primary`                             | Typography, nav, structural foundations, primary buttons                                 |
| Secondary (Cobalt)       | `secondary` / `on-secondary`                         | Active states, secondary emphasis, focus rings                                           |
| Tertiary (Electric Cyan) | `tertiary`                                           | **AI layer only** — AI-suggestion icons, AI action triggers, progress/energy touchpoints |
| Neutral (Slate)          | `on-surface-variant`, `outline`, `outline-variant`   | Secondary text, borders, scaffolding                                                     |
| Surfaces                 | `surface*`, `surface-container*`                     | Tonal layering (see §6)                                                                  |
| Background               | `surface-background` (`oklch(0.9842 0.0034 247.86)`) | App background behind cards                                                              |
| Border                   | `surface-border` (`oklch(0.9288 0.0126 255.51)`)     | The standard 1px element border                                                          |

### Semantic status palette (compliance reporting)

Dedicated status tokens — use these, not the brand palette, for filing/document states:

| Token            | Color                         | Meaning                                   |
| ---------------- | ----------------------------- | ----------------------------------------- |
| `status-success` | `oklch(0.6959 0.1491 162.48)` | Closed / Verified / done                  |
| `status-warning` | `oklch(0.7686 0.1647 70.08)`  | Pending / Partial / overdue-warning       |
| `status-error`   | `oklch(0.6368 0.2078 25.33)`  | Out of scope / deadline breached / failed |
| `status-info`    | `oklch(0.6231 0.188 259.81)`  | Informational / in-progress               |

**Cyan is not a status color.** Don't use the AI accent to signal filing status — keep the two systems separate so "AI did something" never reads as "filing state changed."

---

## 3. Status color system (critical — filing is the hero)

Filing status drives the product. Render it from **one** source-of-truth map `FilingStatus → { statusToken, label, icon }`, consumed by every pill, calendar cell, and table row. Never inline a status color in a component.

Mapping `FilingStatus` enum → status token:

| FilingStatus                                        | Token            | Band            |
| --------------------------------------------------- | ---------------- | --------------- |
| `UPCOMING`, `INPUT_TRIGGERED`, `INPUT_ACKNOWLEDGED` | `status-info`    | informational   |
| `INPUTS_RECEIVED`, `PENDING_APPROVAL`               | `status-info`    | in-progress     |
| `INPUTS_COMPLETE`, `FILED`, `CONFIRMED`             | `status-success` | positive / done |
| `INPUTS_OVERDUE`                                    | `status-warning` | warning         |
| `AT_RISK`                                           | `status-error`   | risk / alert    |

Color is **never the only signal** — always pair with the text label (JetBrains Mono) and, where useful, an icon. Required for accessibility and color-blind safety.

---

## 4. Typography (tokens locked in design.md)

Two families, by intent:

- **Inter** — all human-readable content. Headings, body, table cell content. Neutral, legible, systematic.
- **JetBrains Mono** — system/technical data and labels: status tags, field labels, metadata, ARN references, counts. This visual split (mono = machine-generated, sans = human) is intentional — preserve it.

| Token                                    | Use                                                  |
| ---------------------------------------- | ---------------------------------------------------- |
| `headline-lg` / `-md` / `-sm`            | Page titles, section heads, card titles              |
| `body-lg` / `body-md`                    | Body copy; `body-md` is default table cell content   |
| `label-md` / `label-sm` (JetBrains Mono) | Table headers, field labels, status badges, metadata |
| `headline-lg-mobile`                     | Mobile heading scale (see breakpoints)               |

Rules: bold weights for headings (clear vertical rhythm); `label-md` for table headers + `body-md` for cells; tabular figures for numeric columns (deadlines, counts) so tables align; italics reserved for metadata/disclaimers/legal parentheticals.

---

## 5. Layout & spacing (tokens locked in design.md)

Spacing scale on a **4px base**. Use scale tokens — `gutter-sm` (16px) and `gutter-md` (24px) are the default component paddings. Page margin `margin-page` (48px desktop). Content max-width `max-width-content` (1280px).

- **Desktop dashboard = fixed 12-column grid** — "locked", predictable. Fixed centered content, 48px margins at >=1280px.
- **Tablet (768-1279px):** fluid 24px margins, 8-column.
- **Mobile (<=767px):** single column, 16px margins, type scales to `-mobile` variants. (No mobile _app_ in Phase 1, but the dashboard must not break at these widths.)
- **Tabular bias:** when horizontal space is tight, lists become structured tables — manage density, don't wrap into mush.

---

## 6. Elevation & depth (flat, tonal — not shadow-heavy)

Depth via **low-contrast outlines + tonal surface layers**, not heavy shadows — keeps the UI flat and data-focused.

- **Surface tiers:** separate via background-tone shifts (white card on `surface-background` gray), using the `surface-container*` ladder.
- **Crisp borders:** 1px solid `surface-border` (`oklch(0.9288 0.0126 255.51)`) defines elements.
- **Ambient shadows only for floating UI** (dropdowns, modals, popovers): extra-diffused, Deep Navy (`primary`) at ~5% opacity.
- **Interaction depth:** on hover, increase border contrast or shift background tone — **don't lift via shadow.**

---

## 7. Shape (soft, 0.25rem)

- **Containers / inputs / buttons:** `rounded.DEFAULT` (4px / 0.25rem) — the standard.
- **Status pills/badges:** `rounded.xl` (12px) to read as badges, distinct from functional blocks.
- Stay consistent — don't scatter radii. The `rounded` scale in design.md is the only allowed set.

---

## 8. Components (shadcn-based)

Build on shadcn/ui primitives, themed with the tokens above. App-specific rules:

### Buttons (shadcn `Button`)

- **Primary:** Deep Navy (`primary`) bg, white text, 4px radius. **AI-trigger actions** use Electric Cyan (`tertiary`).
- **Secondary:** transparent bg, 1px Cobalt (`secondary`) border.
- **Tertiary/Ghost:** no border, slate text — low-priority actions in tables.

### Inputs (shadcn `Input`, `Label`, `Form`)

- 1px `surface-border`, Inter `body-md`. Active: 1px Cobalt border + 2px soft blue focus ring.
- **Labels always `label-md` (JetBrains Mono) above the field.**
- Validate against the same constraints the API enforces; surface `error.code` meaningfully (use shadcn `Form` error slots).

### Tables (shadcn `Table`) — the core surface

- Zebra striping (very light gray) for high-density compliance views.
- Sticky header, cursor-paginated, sortable where the API supports it.
- `label-md` headers, `body-md` cells, tabular figures for numeric columns.
- Mandatory loading (skeleton, not just spinner) / empty (with next-step hint) / error states.

### Status badge (shadcn `Badge`, themed)

- The canonical status renderer (Section 3): JetBrains Mono text, `rounded-xl`, background from the semantic status token. Used in tables, calendar, detail panes — one component, everywhere.

### Compliance-specific

- **Filing calendar / timeline:** vertical lines with circular status nodes, nodes colored by the Section 3 status map.
- **WhatsApp preview card:** specialized component mimicking the WhatsApp chat UI to preview agent interactions before they go live (inbound/outbound distinction, agent vs human indicator).
- **Conversation monitor / takeover:** chat transcript, clear inbound/outbound + agent/human indicators, prominent role-gated takeover control.
- **Document viewer:** preview alongside extraction results; show `INCOMPLETE`/`UNREADABLE`/confidence states clearly.
- **Approval queue:** clear approve/reject affordances, reason capture on reject (shadcn `Dialog` + `Textarea`).

Use shadcn `Dialog`/`Sheet`/`DropdownMenu`/`Toast`/`Tabs`/`Skeleton` for their respective patterns — themed, not restyled by forking.

---

## 9. States, interaction, accessibility

- Every data view ships **loading / empty / error / stale-on-reconnect** states.
- Optimistic UI only where safe to roll back; otherwise pending state. Toasts for transient confirmations; inline errors for field issues. Destructive actions confirm + state consequences (shadcn `AlertDialog`).
- Semantic HTML, labeled inputs, visible focus states (the Cobalt focus ring), full keyboard nav. shadcn gives accessible primitives — don't strip their a11y attributes.
- Status never by color alone (Section 3). Maintain contrast on all text/status tokens.

---

## 10. Don't

- No colors / spacing / radii / type outside the design.md tokens.
- No forking shadcn components to restyle — theme via tokens/variants.
- Electric Cyan is the AI accent only — never a status, never decoration.
- No client-facing UI (WhatsApp-only clients in Phase 1).
- No white-label/branding theming UI, no billing dashboard, no out-of-scope analytics charts (all OUT per Scope Lock) — stop and flag if asked.
