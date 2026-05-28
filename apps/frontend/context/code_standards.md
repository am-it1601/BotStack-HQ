# Code Standards — Frontend (React / TypeScript)

Extends `../../context/code_standards.md`. Read that first. Frontend-specific rules below.

---

## Structure

- **Feature-based folders**, not type-based: `features/filing-calendar/{components,hooks,api,types}`. Shared primitives in `components/ui`.
- One component per file. `PascalCase.tsx` for components, `use-x.ts` (`useX`) for hooks, `kebab-case.ts` for utilities.
- Keep components small and presentational where possible; push data + logic into hooks.

## State

- **Server state → TanStack Query only.** Query keys are typed and centralized per feature (`filingKeys.list(filters)`).
- **UI state → Zustand**, one focused store per concern. No global mega-store. No Redux.
- **Derived state is computed, not stored.** Don't duplicate server data into local state.

## Types

- Strict TypeScript, no `any`. API types imported from `packages/shared-types` — never redefined.
- Props typed via explicit `interface`. No implicit `any` props.

## API layer

- All network calls go through a typed client wrapper that understands the `{ data, meta, error }` envelope and cursor pagination. Components/hooks never call `fetch` directly.
- Handle `error.code` explicitly for known business errors; generic fallback for the rest.
- use Tanstack Query kit for API calls.

## Data display

- Timestamps from the API are UTC — format to the workspace/user locale at render time; never assume the API sends local time.
- Filing statuses render from the `FilingStatus` enum with a single source-of-truth status→color/label map (matches the calendar's color-coding requirement).

## Styling / UI

- **Component library: shadcn/ui.** Build on shadcn primitives. Do not hand-roll what shadcn provides, and never fork a shadcn component to restyle it — theme via CSS variables / Tailwind config, extend via the variant pattern (`cva`).
- **Design system is locked: "Precision Minimalist."** Token source of truth is `context/design.md`; application rules are in `context/ui_system.md`.
- **Tokens only — no literals.** Every color, spacing, radius, and type value comes from the theme (wired from `design.md`). A raw hex / px / rem in a component is a defect.
- **Two type families by intent:** Inter for human-readable content, JetBrains Mono for system/technical data and labels. Preserve the split.
- **Electric Cyan (`tertiary`) is the AI-layer accent only** — never a filing status, never decoration. Filing status uses the semantic status tokens via the single `FilingStatus` map (see ui_system §3).
- No inline magic style values that bypass tokens. No one-off colors/spacing/radii.

## Tailwind (v4 — CSS-first)

This project uses **Tailwind CSS v4**. Config is CSS-first (`@theme` / `@theme inline` in the global stylesheet), not a `tailwind.config.js` JS theme. The design tokens are oklch (matching `design.md`) — that's deliberate, don't "simplify" them back to hex.

- **Tokens are exposed as Tailwind theme variables.** `design.md` tokens are wired into `@theme` as CSS custom properties, then consumed as utility classes (`bg-primary`, `text-on-surface`, `border-surface-border`, `rounded`, `p-gutter-sm`). Use the utility that maps to a token — never an arbitrary value.
- **No arbitrary values for anything tokenized.** `bg-[#3755c3]`, `p-[18px]`, `rounded-[10px]` are defects — there's a token for it. Arbitrary values are acceptable _only_ for genuinely one-off, non-design-system layout math (e.g. a computed `grid-template`), and even then prefer a CSS var.
- **Compose classes with `cn()`** (the `clsx` + `tailwind-merge` helper shadcn ships in `lib/utils`). Never build className strings with template literals or string concatenation — `cn()` handles conditional + conflicting-class resolution.
- **Variants via `cva`**, not conditional className soup. Component visual variants (size, intent, state) are declared in a `cva` config and selected by prop. This is also how you extend a shadcn component without forking it.
- **Class ordering** is enforced by the Prettier Tailwind plugin — don't hand-order, let the formatter sort.
- **Responsive** uses the breakpoints from `design.md` (mobile ≤767, tablet 768–1279, desktop ≥1280). Mobile-first: unprefixed = base, layer up with `md:` / `lg:`. Don't invent breakpoints.
- **Dark mode is out of scope for Phase 1** — don't add `dark:` variants speculatively.

## shadcn/ui (workflow)

shadcn is **not an npm dependency** — components are generated into the repo (typically `components/ui/`) via the CLI and become _our_ source code, themed by _our_ tokens.

- **Add components via the CLI** (`npx shadcn@latest add <component>`) rather than copy-pasting from the docs or writing from scratch. Pull a primitive in once; reuse it everywhere.
- **The generated component IS the styling layer.** To restyle, edit the generated source / its `cva` variants and point them at our tokens — do **not** wrap a shadcn component in another component purely to override its look.
- **Themed, not overridden inline.** A shadcn `Button` should already render correct via tokens; if you find yourself passing a long `className` to fix its appearance at the call site, the variant config is wrong — fix it there.
- **Composition over prop-explosion.** Prefer shadcn's compound/`asChild` patterns (e.g. `<Button asChild><Link/></Button>`) over adding boolean props for every case.
- App-specific components (filing calendar, WhatsApp preview, conversation monitor) are built _from_ shadcn primitives + tokens, not as bespoke styled markup. See `ui_system.md` §8 for the per-component contract.

## React (component conventions)

- **Function components only**, typed props via explicit `interface`. No `React.FC` (it muddies generics/children typing) — type props directly.
- **Presentational vs container split:** components render; hooks own data + logic (TanStack/Zustand). A component that both fetches and renders heavy logic should be split.
- **Composition over configuration.** Small composable pieces beat one component with 15 boolean props.
- **Keys are stable IDs**, never array index, for any list backed by server data.
- **No business/compliance logic in components.** Filing rules, status transitions, dependency logic live behind the API and in typed helpers — the component just renders the result.
- **Effects are a last resort.** No data fetching in `useEffect` (that's TanStack). Reserve effects for genuine external-system sync (e.g. the WS subscription manager).

## Quality

- Every data view handles loading / empty / error.
- No `console.log` left in committed code (lint should catch it).
- Accessibility: semantic elements, labels on inputs, keyboard-navigable interactive elements.
- **No browser storage for app state** in a way that breaks SSR/refetch assumptions; rely on TanStack cache + AuthKit session.
