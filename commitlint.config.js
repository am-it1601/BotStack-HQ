/**
 * commitlint configuration — enforces Conventional Commits.
 *
 * Allowed types (from @commitlint/config-conventional):
 *   build · chore · ci · docs · feat · fix · perf · refactor · revert · style · test
 *
 * Format:
 *   <type>(<optional-scope>): <subject>
 *
 *   <body>
 *
 *   <footer>
 *
 * Examples:
 *   feat(backend): add filing calendar engine
 *   fix(frontend): correct status badge color for overdue filings
 *   chore: bump turbo to 2.9.16
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Soft-cap the header at 100 chars (default is 72) — gives room for short scopes.
    'header-max-length': [2, 'always', 100],
    // Allow longer body lines for paragraphs.
    'body-max-line-length': [1, 'always', 200],
  },
};
