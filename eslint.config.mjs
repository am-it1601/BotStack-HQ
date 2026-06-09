// ESLint 9 flat config — single source of truth for all TypeScript linting
// across the monorepo. Python (apps/document-ai) is linted by ruff, not ESLint.
//
// Layers, in order:
//   1. Global ignores (build outputs, generated artefacts, Python sources)
//   2. ESLint recommended JS rules
//   3. typescript-eslint recommended rules — applied to all .ts/.tsx
//   4. Frontend overlay: React + React Hooks rules, browser globals
//   5. Node-context globals for backend / infra / shared-types
//   6. Prettier compat — MUST be last so it disables any formatting rules
//      that would otherwise fight Prettier.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // 1 — Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/cdk.out/**',
      '**/.turbo/**',
      '**/coverage/**',
      'apps/document-ai/Python/**',
      'apps/document-ai/**/*.py',
      'package-lock.json',
    ],
  },

  // 2 — ESLint recommended
  js.configs.recommended,

  // 3 — typescript-eslint recommended (non-type-checked, fast)
  ...tseslint.configs.recommended,

  // 4 — Frontend overlay (React + React Hooks)
  {
    files: ['apps/frontend/**/*.{ts,tsx,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // React 17+ automatic JSX runtime — no `import React` needed.
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-vars': 'error',
      // React Hooks safety.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // 5 — Node-context globals for non-frontend TS code
  {
    files: [
      'apps/backend/**/*.ts',
      'infrastructure/**/*.ts',
      'packages/shared-types/**/*.ts',
      '*.{js,mjs,cjs}',
    ],
    languageOptions: { globals: { ...globals.node } },
  },

  // 5b — CommonJS Node scripts (ops tooling). `require`/module.exports are the
  // point here, so disable the ESM-import rule for them.
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // 6 — Prettier compat (must be last)
  prettier,
);
