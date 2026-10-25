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
  {
    // The service client bypasses RLS: keep it in lib helpers and bearer-gated
    // route handlers. A Server Action that needs it states why on the import.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/**', 'src/app/api/**', '**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/supabase/server',
              importNames: ['createServiceClient'],
              message:
                'Service-role client bypasses RLS. Use it only in src/lib or src/app/api, or justify with an eslint-disable description.',
            },
          ],
        },
      ],
    },
  },
];

export default config;
