import { merqoEslintPreset } from '@merqo/ui/eslint';
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';
import sonarjs from 'eslint-plugin-sonarjs';

const tsPlugin = typescript.find((c) => c.plugins?.['@typescript-eslint']).plugins[
  '@typescript-eslint'
];

const config = [
  ...coreWebVitals,
  ...typescript,
  sonarjs.configs.recommended,
  {
    rules: {
      // Honour the `_`-prefix convention for intentionally-unused args/vars.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Generated shadcn primitives — CLI-managed, not hand-authored to this rule.
    files: ['src/components/ui/**'],
    rules: {
      'sonarjs/prefer-read-only-props': 'off',
    },
  },
  ...merqoEslintPreset({ sonarjsPlugin: sonarjs.configs.recommended.plugins.sonarjs, tsPlugin }),
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      '.claude/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'supabase/**',
      '.worktrees/**',
    ],
  },
];

export default config;
