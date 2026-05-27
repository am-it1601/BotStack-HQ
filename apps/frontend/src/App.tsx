import type { HealthStatus } from '@botstackhq/shared-types';

export function App() {
  const health: HealthStatus = {
    status: 'ok',
    service: 'frontend',
    timestamp: new Date().toISOString(),
  };

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>BotStackHQ — ComplianceStack Dashboard</h1>
      <p>CA dashboard scaffold is running.</p>
      <p>
        Service status: <strong>{health.status}</strong>
      </p>
    </main>
  );
}
