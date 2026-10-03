import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/**', '.expo/**'] },
  {
    files: ['**/*.cjs'],
    extends: [js.configs.recommended],
    languageOptions: { globals: { require: 'readonly', module: 'readonly', __dirname: 'readonly' } },
  },
  {
    files: ['**/*.{ts,tsx,mjs}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
);
