import type { PrismaWorkspaceRole } from '@botstackhq/shared-types';
import { TeamManagement } from './components';

interface AppProps {
  /**
   * Current user's workspace role — would come from AuthKit JWT in production.
   * TODO: Replace with actual JWT claims once AuthKit backend integration is complete.
   */
  currentUserRole?: PrismaWorkspaceRole;
}

/**
 * Main app component for CA dashboard.
 *
 * Wrapped with QueryClientProvider in main.tsx (TanStack Query configuration).
 *
 * TODO: Authentication Integration
 * - Wire in AuthKit token injection in API hooks
 * - Extract user role from JWT claims
 * - Redirect unauthenticated users to login
 *
 * Surfaces included:
 * - Team Management (invite, edit, remove team members)
 * - TODO: Filing calendar dashboard
 * - TODO: Client management
 * - TODO: Conversation monitor
 * - TODO: Human takeover (live chat)
 * - TODO: Document viewer
 * - TODO: Filing approval queue
 * - TODO: Basic analytics
 */
export function App({ currentUserRole = 'JUNIOR_CA' }: AppProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <header
        style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}
      >
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.875rem', fontWeight: 'bold' }}>
          BotStackHQ — ComplianceStack Dashboard
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
          {/* TODO: Show workspace name and current user email once AuthKit is integrated */}
          CA dashboard with team management
        </p>
      </header>

      <main>
        {/* Team Management Surface */}
        <section>
          <TeamManagement currentUserRole={currentUserRole} />
        </section>

        {/* TODO: Other dashboard surfaces go here */}
      </main>
    </div>
  );
}
