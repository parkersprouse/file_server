import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const exts = Object.freeze(['.cjs', '.js', '.mjs']);

/**
 * ------------------------------------------------------------------------------
 * NOTE:
 * Any plugins that were written using the old .eslintrc config format and have
 * not yet been updated to support the new flat config format need to be run
 * through ESLint's `FlatCompat` utility in order to be used:
 * https://eslint.org/docs/latest/use/configure/migration-guide#using-eslintrc-configs-in-flat-config
 * ------------------------------------------------------------------------------
 */
export default [
  /**
   * ------------------------------------------------------------------------------
   * ESLint tooling configuration:
   * https://eslint.org/docs/latest/use/configure/configuration-files-new
   */
  {
    ignores: ['node_modules/*', 'server/**/*.js'],
  },
  {
    files: exts.map((ext) => `**/*${ext}`),
    languageOptions: {
      globals: {
        console: 'readonly',
        // document: 'readonly',
        // window: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      'import/parsers': {
        espree: exts,
      },
      'import/resolver': {
        alias: {
          extensions: exts,
          map: [
            ['@', './'],
          ],
        },
        node: true,
      },
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * [Included] ESLint's official recommended configuration of rules:
   * https://eslint.org/docs/latest/use/configure/configuration-files-new#using-predefined-configurations
   */
  eslint.configs.recommended,

  /**
   * ------------------------------------------------------------------------------
   * [Extension] ESLint Stylistic's set of recommended rules:
   * https://eslint.style/guide/config-presets#static-configurations
   */
  stylistic.configs['recommended-flat'],

  /**
   * ------------------------------------------------------------------------------
   * [Extension] ESLint Import plugin for handling import/export errors
   * https://github.com/import-js/eslint-plugin-import
   */
  ...compat.extends('plugin:import/recommended'),

  /**
   * ------------------------------------------------------------------------------
   * [Extension] GitHub's official set of recommended and browser-specific rules:
   * https://github.com/github/eslint-plugin-github/tree/main#rules
   */
  ...compat.extends('plugin:github/recommended'),

  /**
   * ------------------------------------------------------------------------------
   * Base ESLint rule customization:
   * https://eslint.org/docs/latest/rules
   */
  {
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      camelcase: 'off',
      eqeqeq: ['error', 'always'],
      'filenames/match-regex': 'off',
      'grouped-accessor-pairs': ['error', 'getBeforeSet'],
      'no-alert': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-lonely-if': 'error',
      'no-loop-func': 'error',
      'no-nested-ternary': 'error',
      'no-param-reassign': [
        'error',
        {
          props: true,
        },
      ],
      'no-plusplus': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: 'props|^_',
        },
      ],
      'no-useless-computed-key': [
        'error',
        {
          enforceForClassMembers: true,
        },
      ],
      'no-var': 'error',
      'prefer-const': [
        'error',
        {
          destructuring: 'any',
        },
      ],
      'sort-imports': 'off',
      'sort-keys': [
        'warn',
        'asc',
        {
          allowLineSeparatedGroups: true,
          caseSensitive: true,
          minKeys: 2,
          natural: true,
        },
      ],
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * ESLint Stylistic rule customization:
   * https://eslint.style/rules
   */
  {
    rules: {
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
          imports: 'always-multiline',
          objects: 'always-multiline',
        },
      ],
      '@stylistic/comma-spacing': [
        'error',
        {
          after: true,
          before: false,
        },
      ],
      '@stylistic/comma-style': ['error', 'last'],
      '@stylistic/function-paren-newline': ['error', 'multiline'],
      '@stylistic/key-spacing': [
        'error',
        {
          afterColon: true,
          beforeColon: false,
          mode: 'strict',
        },
      ],
      '@stylistic/max-len': [
        'error',
        {
          code: 120,
          ignoreComments: true,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreUrls: true,
        },
      ],
      '@stylistic/no-multiple-empty-lines': [
        'error',
        {
          max: 2,
          maxBOF: 0,
          maxEOF: 1,
        },
      ],
      '@stylistic/no-tabs': 'error',
      '@stylistic/no-whitespace-before-property': 'error',
      '@stylistic/object-curly-newline': [
        'error',
        {
          consistent: true,
          multiline: true,
        },
      ],
      '@stylistic/object-curly-spacing': [
        'error',
        'always',
        {
          arraysInObjects: true,
          objectsInObjects: true,
        },
      ],
      '@stylistic/object-property-newline': [
        'error',
        {
          allowAllPropertiesOnSameLine: false,
        },
      ],
      '@stylistic/operator-linebreak': ['error', 'before'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
          avoidEscape: true,
        },
      ],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/semi-spacing': [
        'error',
        {
          after: true,
          before: false,
        },
      ],
      '@stylistic/semi-style': ['error', 'last'],
      '@stylistic/spaced-comment': [
        'error',
        'always',
        {
          block: {
            markers: ['/', '*', '--'],
          },
        },
      ],
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * ESLint Import rule customization:
   * https://github.com/import-js/eslint-plugin-import/tree/main#rules
   */
  {
    rules: {
      'import/first': 'error',
      'import/newline-after-import': ['error', {
        considerComments: true,
        count: 1,
      }],
      'import/no-unresolved': 'error',
      'import/order': ['error', {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
          orderImportKind: 'asc',
        },
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        pathGroups: [
          {
            group: 'builtin',
            pattern: '{@,.,..}/**/*.css',
            position: 'before',
          },
        ],
        warnOnUnassignedImports: true,
      }],
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * GitHub rule customization:
   * https://github.com/github/eslint-plugin-github/tree/main#rules
   */
  {
    rules: {
      'eslint-comments/no-use': 'off',
      'i18n-text/no-en': 'off',
      'import/extensions': ['error', 'ignorePackages'],
      'prettier/prettier': 'off',
    },
  },
];
