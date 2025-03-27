// eslint.config.js

import { FlatCompat } from '@eslint/eslintrc'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import securityPlugin from 'eslint-plugin-security'

// FlatCompatを使って従来の設定からの移行を容易にします
const compat = new FlatCompat()

export default [
  {
    files: ['*.ts', '*.tsx'], // TypeScriptファイルに適用
    languageOptions: {
      parser: tsParser, // TypeScript用のパーサ
      parserOptions: {
        project: './tsconfig.json' // tsconfig.json を参照
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin, // TypeScriptのルールを使用
      security: securityPlugin // セキュリティに関するルールを使用
    },
    rules: {
      // TypeScript用のルール設定
      ...tsPlugin.configs.recommended.rules,
      // セキュリティルール
      'security/detect-object-injection': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      // その他のルール
      'no-console': 'warn',
      'no-unused-vars': 'warn'
    }
  },
  {
    files: ['*.js', '*.jsx'], // JavaScriptファイルに適用
    languageOptions: {
      ecmaVersion: 'latest', // ECMAScriptのバージョン
      sourceType: 'module' // モジュールを使用
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn'
    }
  },
  ...compat.extends('prettier')
]
