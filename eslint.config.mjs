// ESLint 9 flat config. The rules still live in .eslintrc.json and are loaded
// through FlatCompat, so lint behaviour is unchanged from the eslintrc setup.
// eslint-plugin-import, -react and -react-native do not support ESLint 10 yet.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

const legacy = JSON.parse(readFileSync(path.join(__dirname, '.eslintrc.json'), 'utf8'))
const { root: _root, ignorePatterns = [], ...rest } = legacy

export default [
  { ignores: ignorePatterns },
  ...compat.config(rest),
  {
    rules: {
      // unicorn 55's implementation calls a SourceCode API removed in ESLint 9;
      // newer unicorn releases are flat-config only and need ESLint 10 peers.
      'unicorn/expiring-todo-comments': 'off',
    },
  },
  {
    // Helper dan stub di file test sering memanggil hook di fungsi biasa dan
    // memakai default object; aturan ini tidak relevan untuk kode test.
    files: ['**/__tests__/**', 'src/test-utils/**'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unicorn/no-object-as-default-parameter': 'off',
      'unicorn/prefer-code-point': 'off',
      'unicorn/prefer-spread': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/prefer-logical-operator-over-ternary': 'off',
    },
  },
]
