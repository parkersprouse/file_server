import eslint from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import stylistic from '@stylistic/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import n from 'eslint-plugin-n';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

const exts = ['.cjs', '.js', '.mjs'];

/**
 * ------------------------------------------------------------------------------
 * [NOTE]
 * Any plugins that were written using the old .eslintrc config format and have
 *   not yet been updated to support the new flat config format need to be run
 *   through ESLint's `FlatCompat` utility in order to be used:
 * https://eslint.org/docs/latest/use/configure/migration-guide#using-eslintrc-configs-in-flat-config
 * ------------------------------------------------------------------------------
 */
export default [
  /**
   * ==============================================================================
   * [SECTION] Global configuration
   * ==============================================================================
   */

  /**
   * ------------------------------------------------------------------------------
   * ESLint tooling configuration
   * https://eslint.org/docs/latest/use/configure/configuration-files-new
   */
  {
    ignores: [
      'node_modules/**/*',
      'server/**/*.js',
    ],
  },
  {
    files: exts.map((ext) => `**/*${ext}`),
  },
  {
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        parser: {
          js: 'espree',
        },
        sourceType: 'module',
      },
    },
    plugins: {
      unicorn,
    },
    settings: {
      'import-x/parsers': {
        espree: exts,
      },
      'import-x/resolver': {
        'eslint-import-resolver-custom-alias': {
          alias: {
            '@': './',
          },
        },
        node: true,
      },
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * [Official] ESLint's official set of rules (recommended config)
   * https://eslint.org/docs/latest/use/configure/configuration-files-new#using-predefined-configurations
   */
  eslint.configs.recommended,

  /**
   * ------------------------------------------------------------------------------
   * [Extension] ESLint Stylistic's set of rules (recommended config)
   * https://eslint.style/guide/config-presets#static-configurations
   */
  stylistic.configs.recommended,

  /**
   * ------------------------------------------------------------------------------
   * [Extension] For linting ESLint's directive comments (recommended config)
   * https://eslint-community.github.io/eslint-plugin-eslint-comments/
   */
  comments.recommended,

  /**
   * ------------------------------------------------------------------------------
   * [Extension] For linting import/export syntax (recommended config)
   * https://github.com/un-ts/eslint-plugin-import-x
   */
  importX.flatConfigs.recommended,

  /**
   * ------------------------------------------------------------------------------
   * [Extension] For linting Node.js environments (recommended config for ESM projects)
   * https://github.com/eslint-community/eslint-plugin-n
   */
  n.configs['flat/recommended'],

  /**
   * ------------------------------------------------------------------------------
   * Base ESLint rule customization
   * https://eslint.org/docs/latest/rules
   */
  {
    rules: {
      'arrow-body-style': [
        'error',
        'as-needed',
      ],
      'constructor-super': 'error',
      'default-case': 'error',
      'default-case-last': 'error',
      'dot-notation': [
        'error',
        { allowKeywords: true },
      ],
      eqeqeq: [
        'error',
        'always',
      ],
      'func-style': [
        'error',
        'declaration',
        {
          allowArrowFunctions: true,
        },
      ],
      'grouped-accessor-pairs': [
        'error',
        'getBeforeSet',
      ],
      'new-cap': 'off',
      'no-alert': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-const-assign': 'error',
      'no-constant-condition': 'error',
      'no-control-regex': 'error',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-delete-var': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-else-return': 'error',
      'no-empty': 'error',
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-eval': 'error',
      'no-ex-assign': 'error',
      'no-extra-boolean-cast': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-global-assign': 'error',
      'no-implicit-coercion': 'error',
      'no-implicit-globals': 'error',
      'no-implied-eval': 'error',
      'no-inner-declarations': 'error',
      'no-invalid-regexp': 'error',
      'no-invalid-this': 'error',
      'no-irregular-whitespace': 'error',
      'no-lonely-if': 'error',
      'no-loop-func': 'error',
      'no-multi-assign': 'error',
      'no-nested-ternary': 'error',
      'no-new-symbol': 'error',
      'no-obj-calls': 'error',
      'no-octal': 'error',
      'no-param-reassign': [
        'error',
        {
          props: false,
        },
      ],
      'no-plusplus': 'error',
      'no-process-exit': 'off',
      'no-regex-spaces': 'error',
      'no-return-assign': 'error',
      'no-self-assign': 'error',
      'no-sequences': 'error',
      'no-sparse-arrays': 'error',
      'no-this-before-super': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unused-labels': 'error',
      'no-useless-computed-key': [
        'error',
        {
          enforceForClassMembers: true,
        },
      ],
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'object-shorthand': [
        'error',
        'always',
        {
          avoidQuotes: true,
        },
      ],
      'one-var': ['error', 'never'],
      'prefer-const': [
        'error',
        {
          destructuring: 'any',
        },
      ],
      'prefer-object-spread': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      'require-yield': 'error',
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
      'use-isnan': 'error',
      'valid-typeof': 'error',
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * ESLint Stylistic rule customization
   * https://eslint.style/rules
   */
  {
    rules: {
      '@stylistic/array-bracket-spacing': [
        'error',
        'never',
      ],
      '@stylistic/arrow-parens': [
        'error',
        'always',
      ],
      '@stylistic/brace-style': [
        'error',
        '1tbs',
        {
          allowSingleLine: true,
        },
      ],
      '@stylistic/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          enums: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
          generics: 'never',
          imports: 'always-multiline',
          objects: 'always-multiline',
          tuples: 'always-multiline',
        },
      ],
      '@stylistic/comma-spacing': [
        'error',
        {
          after: true,
          before: false,
        },
      ],
      '@stylistic/comma-style': [
        'error',
        'last',
      ],
      '@stylistic/eol-last': [
        'error',
        'always',
      ],
      '@stylistic/function-paren-newline': [
        'error',
        'multiline',
      ],
      '@stylistic/indent': [
        'error',
        2,
      ],
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
          ignoreComments: false,
          ignorePattern: '<path|d=', // ignore SVG data
          ignoreRegExpLiterals: true,
          ignoreStrings: false,
          ignoreTemplateLiterals: false,
          ignoreUrls: true,
        },
      ],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          multilineDetection: 'brackets',
          singleline: {
            delimiter: 'semi',
            requireLast: true,
          },
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
      '@stylistic/no-trailing-spaces': 'error',
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
          allowAllPropertiesOnSameLine: true,
        },
      ],
      '@stylistic/operator-linebreak': [
        'error',
        'before',
      ],
      '@stylistic/quote-props': [
        'error',
        'as-needed',
      ],
      '@stylistic/quotes': [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
          avoidEscape: true,
        },
      ],
      '@stylistic/semi': [
        'error',
        'always',
      ],
      '@stylistic/semi-spacing': [
        'error',
        {
          after: true,
          before: false,
        },
      ],
      '@stylistic/semi-style': [
        'error',
        'last',
      ],
      '@stylistic/space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          asyncArrow: 'always',
          named: 'never',
        },
      ],
      '@stylistic/spaced-comment': [
        'error',
        'always',
        {
          block: {
            markers: [
              '/',
              '*',
              '--',
            ],
          },
        },
      ],
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * Directive comments rule customization
   * https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/
   */
  {
    rules: {
      '@eslint-community/eslint-comments/no-aggregating-enable': 'error',
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
      '@eslint-community/eslint-comments/require-description': [
        'error',
        {
          ignore: ['eslint-enable'],
        },
      ],
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * ESLint Import rule customization
   * https://github.com/import-js/eslint-plugin-import-x/tree/main#rules
   */
  {
    rules: {
      'import-x/default': 'error',
      'import-x/export': 'error',
      'import-x/extensions': [
        'error',
        'ignorePackages',
      ],
      'import-x/first': 'error',
      'import-x/named': 'error',
      'import-x/namespace': 'error',
      'import-x/newline-after-import': [
        'error',
        {
          considerComments: true,
          count: 1,
        },
      ],
      'import-x/no-absolute-path': 'error',
      'import-x/no-amd': 'error',
      'import-x/no-anonymous-default-export': [
        'error',
        {
          allowAnonymousClass: false,
          allowAnonymousFunction: false,
          allowArray: true,
          allowArrowFunction: false,
          allowLiteral: true,
          allowObject: true,
        },
      ],
      'import-x/no-commonjs': 'error',
      'import-x/no-deprecated': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-dynamic-require': 'error',
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-named-as-default': 'error',
      'import-x/no-named-as-default-member': 'error',
      'import-x/no-namespace': 'error',
      'import-x/no-unresolved': 'error',
      'import-x/no-webpack-loader-syntax': 'error',
      'import-x/order': [
        'error',
        {
          alphabetize: {
            caseInsensitive: true,
            order: 'asc',
            orderImportKind: 'asc',
          },
          distinctGroup: true,
          groups: [
            // Do not change this order!
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'unknown',
            'index',
            'object',
          ],
          'newlines-between': 'always',
          warnOnUnassignedImports: true,
        },
      ],
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * Unicorn rule customization
   * https://github.com/sindresorhus/eslint-plugin-unicorn#rules
   */
  {
    rules: {
      'unicorn/custom-error-definition': 'error',
      'unicorn/empty-brace-spaces': 'error',
      'unicorn/error-message': 'error',
      'unicorn/explicit-length-check': [
        'error',
        {
          'non-zero': 'greater-than',
        },
      ],
      'unicorn/no-array-callback-reference': 'error',
      'unicorn/no-array-for-each': 'error',
      'unicorn/no-array-push-push': 'error',
      'unicorn/no-await-in-promise-methods': 'error',
      'unicorn/no-empty-file': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-hex-escape': 'error',
      'unicorn/no-instanceof-array': 'error',
      // 'unicorn/no-length-as-slice-end': 'error', // Not released yet
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-negation-in-equality-check': 'error',
      'unicorn/no-new-array': 'error',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-unnecessary-await': 'error',
      'unicorn/no-unreadable-array-destructuring': 'error',
      'unicorn/no-unreadable-iife': 'error',
      'unicorn/no-useless-length-check': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-useless-switch-case': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/number-literal-case': 'error',
      'unicorn/numeric-separators-style': [
        'warn',
        {
          binary: {
            groupLength: 4,
            minimumDigits: 0,
          },
          hexadecimal: {
            groupLength: 2,
            minimumDigits: 0,
          },
          number: {
            groupLength: 3,
            minimumDigits: 6,
          },
          octal: {
            groupLength: 4,
            minimumDigits: 0,
          },
          onlyIfContainsSeparator: false,
        },
      ],
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-array-flat': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-array-index-of': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-at': 'error',
      'unicorn/prefer-blob-reading-methods': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-logical-operator-over-ternary': 'error',
      'unicorn/prefer-math-trunc': 'error',
      'unicorn/prefer-modern-math-apis': 'error',
      'unicorn/prefer-module': 'error',
      'unicorn/prefer-native-coercion-functions': 'error',
      'unicorn/prefer-negative-index': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-number-properties': [
        'error',
        {
          checkInfinity: true,
          checkNaN: true,
        },
      ],
      'unicorn/prefer-object-from-entries': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/prefer-set-size': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/prefer-string-raw': 'error',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-trim-start-end': 'error',
      'unicorn/prefer-structured-clone': 'error',
      'unicorn/prefer-switch': [
        'error',
        {
          emptyDefaultCase: 'do-nothing-comment',
          minimumCases: 3,
        },
      ],
      'unicorn/prefer-type-error': 'error',
      'unicorn/relative-url-style': [
        'error',
        'always', // always require the `./` prefix for explicitness
      ],
      'unicorn/require-array-join-separator': 'error',
      'unicorn/require-number-to-fixed-digits-argument': 'error',
      'unicorn/template-indent': 'error',
      'unicorn/text-encoding-identifier-case': 'error',
      'unicorn/throw-new-error': 'error',
    },
  },

  /**
   * ------------------------------------------------------------------------------
   * Node.js standards rule customization
   * https://github.com/eslint-community/eslint-plugin-n#-rules
   */
  {
    rules: {
      'n/callback-return': ['error', ['callback', 'cb']],
      'n/handle-callback-err': ['error', '^.*(e|E)rr'],
      'n/no-callback-literal': 'error',
      'n/no-extraneous-import': 'off',
      'n/no-missing-import': 'off',
      'n/no-path-concat': 'error',
      'n/no-process-exit': 'off',
      'n/prefer-global/console': ['error', 'always'],
      'n/prefer-global/process': ['error', 'always'],
      'n/prefer-node-protocol': 'error',
    },
  },
];
