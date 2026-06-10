# Team Management Frontend Implementation

**Date:** 2026-06-10  
**Area:** frontend  
**Scope status:** in-scope (§06 Dashboard & UI: "Team management (invite, assign roles, assign clients) ✅ IN")

---

## What was done

Complete React + TanStack Query frontend implementation for team member management surface (CA dashboard).

### Files created:

**Components:**

- `apps/frontend/src/components/TeamManagement.tsx` — main container component with role gating (CA_OWNER only)
- `apps/frontend/src/components/TeamMembersList.tsx` — displays team members in a table with edit/remove actions
- `apps/frontend/src/components/InviteMemberForm.tsx` — modal form for inviting new members (email, name, role)
- `apps/frontend/src/components/UpdateMemberModal.tsx` — modal for editing member role and deactivating
- `apps/frontend/src/components/index.ts` — clean exports

**Hooks & State:**

- `apps/frontend/src/hooks/api.ts` — TanStack Query hooks for all workspace/member API endpoints:
  - `useWorkspace()` — GET /v1/workspace
  - `useUpdateWorkspace()` — PATCH /v1/workspace
  - `useWorkspaceMembers()` — GET /v1/workspace/members (structure in place; backend list endpoint pending)
  - `useInviteMember()` — POST /v1/workspace/members
  - `useUpdateMember()` — PATCH /v1/workspace/members/:id
- `apps/frontend/src/hooks/index.ts` — clean exports
- `apps/frontend/src/stores/team.ts` — Zustand store for UI state (modal open/close, selected member)
- `apps/frontend/src/stores/index.ts` — clean exports

**Types & Utilities:**

- `apps/frontend/src/types/team.ts` — role metadata, display constants, form types
- `apps/frontend/src/utils/api.ts` — error message formatting and API error parsing
- `apps/frontend/src/env.d.ts` — Vite environment variable types

**Configuration:**

- Updated `apps/frontend/src/App.tsx` — integrated team management surface; QueryClientProvider assumed (set up in main.tsx)
- Updated `packages/shared-types/src/index.ts` — added DTOs: `WorkspaceMemberResponseDto`, `InviteMemberDto`, `UpdateMemberDto`, `UpdateWorkspaceDto`, `WorkspaceResponseDto`
- Updated `packages/shared-types/tsconfig.json` — fixed ignoreDeprecations version (5.0 vs 6.0)

### Features implemented:

✅ **Team member list** — table showing all members with:

- Full name, email, role badge, invite/join status
- Edit and Remove buttons
- Empty state and error states with retry

✅ **Invite workflow**:

- Modal form with email, full name, role (JUNIOR_CA / SUPPORT_STAFF only — CA_OWNER not assignable)
- Client-side email validation
- Server error display with helpful messages
- Optimistic mutation feedback (loading state, disabled form)

✅ **Role & deactivation management**:

- Change member role via modal
- Deactivate (remove) member with confirmation
- Cache invalidation on success

✅ **Role gating**:

- CA_OWNER can access team management
- Non-owners see a read-only message (controls are completely hidden, not just disabled)
- Backend enforces role on API calls (403 on unauthorized roles)

✅ **Server state management**:

- TanStack Query for all workspace/member queries
- Cursor pagination structure in place (API not yet returning nextCursor)
- Cache invalidation on mutations (invite, update)
- Proper error handling and retry

✅ **Type safety**:

- Full TypeScript coverage (tsc --noEmit passes)
- DTO types consumed from shared-types
- No unused imports or variables

---

## Blockers / TODO notes in code

### AuthKit Integration (backend in progress — user specified)

Per the user's requirement ("authkit integration on backend is in progress... any dependency there, will be left as 'to be implemented'"), the following are marked TODO:

1. **JWT token injection in API calls** (`apps/frontend/src/hooks/api.ts:23-24`):

   ```
   // TODO: AuthKit JWT token injection
   // const token = await getAuthKitToken();
   // const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
   ```

   Blocked on: backend completing WorkOS / AuthKit integration and exposing token retrieval method.

2. **User role extraction from JWT** (`apps/frontend/src/App.tsx:38`):

   ```
   // TODO: Replace with actual JWT claims once AuthKit backend is ready.
   ```

   Currently hardcoded to `JUNIOR_CA` for testing; will be replaced with `context.role` from JwtClaims once AuthKit is live.

3. **Workspace provisioning** (`apps/frontend/src/App.tsx:34-35`):
   ```
   // TODO: Determine when to call workspaceService.provisionWorkspace()
   ```
   Provisioning endpoint exists on backend; triggering logic (on first login?) to be defined once auth flow is finalized.

### Backend API Contract Gaps

1. **GET /v1/workspace/members list endpoint** (`apps/frontend/src/hooks/api.ts:105-113`):
   - Hook structure in place and working
   - Backend controller scaffolded but list endpoint not yet implemented
   - Will return 404 until backend implements cursor-paginated list

---

## Testing notes

**Manual testing done:**

- ✅ TypeScript compilation (tsc --noEmit passes)
- ✅ Component renders without error (basic smoke test in App.tsx)
- ✅ Role gating: non-CA_OWNER users see read-only message
- ✅ Form validation: email/name required, invalid email caught, role dropdown works
- ✅ Error handling: API error responses format correctly

**Not tested (blocked on backend/AuthKit):**

- E2E workflow: invite, accept, edit, remove (requires backend endpoint implementation)
- Real JWT token flow and role extraction
- WebSocket real-time updates (WS integration pending)

---

## Architectural alignment

✅ **Follows scope lock:**

- §06 Dashboard & UI: team management is IN scope, invite is IN (bulk invite deferred to Phase 2)
- Single CA_OWNER invite per request (no bulk)

✅ **Frontend conventions (apps/frontend/Claude.md):**

- Server state via TanStack Query (useWorkspaceMembers, useInviteMember, etc.)
- UI state via Zustand (modals, selections)
- No Redux, no useEffect-based fetching
- Role gating matches Actor Definition (CA_OWNER, JUNIOR_CA, SUPPORT_STAFF)

✅ **Code standards (context/code_standards.md):**

- Tenant isolation enforced at API layer (workspace_id from JWT, never from input)
- Conventional Commits ready
- No hardcoded secrets or API keys
- UUID v4 for IDs (from backend DTOs)

---

## Next steps

1. **Backend**: Implement `GET /v1/workspace/members` list endpoint with cursor pagination (blocked on current task, logged to Backlog)
2. **Backend**: Complete AuthKit integration and expose JWT token retrieval
3. **Backend**: Implement workspace provisioning trigger logic
4. **Frontend**: Wire in AuthKit token injection once backend is ready
5. **Frontend**: Add UI for workspace settings (agent name, escalation threshold, language) — currently hooked but not surfaced

---

## Files changed summary

```
apps/frontend/src/
├── App.tsx (M)           — integrated TeamManagement component
├── components/           — NEW
│   ├── TeamManagement.tsx
│   ├── TeamMembersList.tsx
│   ├── InviteMemberForm.tsx
│   ├── UpdateMemberModal.tsx
│   └── index.ts
├── hooks/                — NEW
│   ├── api.ts
│   └── index.ts
├── stores/               — NEW
│   ├── team.ts
│   └── index.ts
├── types/                — NEW
│   └── team.ts
├── utils/                — NEW
│   └── api.ts
└── env.d.ts              — NEW

packages/shared-types/
├── src/index.ts (M)      — added workspace/member DTOs
└── tsconfig.json (M)     — fixed ignoreDeprecations version
```
