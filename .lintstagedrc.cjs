/**
 * lint-staged configuration — runs lint/format only on files staged in the
 * current commit. Wired into .husky/pre-commit so unrelated files are never
 * touched during a commit. CI still runs `turbo run lint` over the whole repo.
 *
 * For each matched glob, lint-staged passes the staged file paths as args to
 * the command and auto-restages whatever the command modifies (--fix / --write).
 */
module.exports = {
  // TypeScript & JavaScript — lint via ESLint then format via Prettier.
  '*.{ts,tsx,js,jsx,cjs,mjs}': ['eslint --fix --max-warnings 0', 'prettier --write'],

  // Other formattable text — Prettier only.
  '*.{json,md,yml,yaml}': ['prettier --write'],

  // Python (Document AI service) — ruff lint with autofix.
  'apps/document-ai/**/*.py': ['python -m ruff check --fix'],
};
