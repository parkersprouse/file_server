/* eslint-disable import/no-commonjs */

module.exports = {
  extends: [
    'plugin:github/recommended',
    'plugin:sonarjs/recommended',
  ],
  plugins: [
    'github',
    'sonarjs',
  ],
  ignores: [
    'node_modules/**/*.js',
    'server/**/*.js',
  ],
  prettier: false,
  semicolon: true,
  space: 2,
  rules: {
    'arrow-parens': ['error', 'always'],
    camelcase: 'off',
    'capitalized-comments': 'off',
    curly: ['error', 'multi-line'],
    'filenames/match-regex': 'off',
    'i18n-text/no-en': 'off',
    'import/no-named-as-default-member': 'off',
    'no-await-in-loop': 'off',
    'no-console': 'off',
    'no-unused-vars': ['error', { 'varsIgnorePattern': '^_.*' }],
    'object-curly-spacing': ['error', 'always', {
      arraysInObjects: false,
    }],
    'prettier/prettier': 'off',
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      asyncArrow: 'always',
      named: 'never',
    }],
    'unicorn/filename-case': ['error', {
      case: 'snakeCase',
    }],
    'unicorn/no-array-reduce': 'off',
  },
};

// {
//   "rules": {
//     "line-comment-position": "off",
//     "no-warning-comments": "off",
//     "sonarjs/cognitive-complexity": "off",
//   }
// }
