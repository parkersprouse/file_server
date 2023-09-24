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
    'lib/fa_kit/**/*.js',
    'node_modules/**/*.js',
    'server/**/*.js',
  ],
  prettier: false,
  semicolon: true,
  space: 2,
  rules: {
    'arrow-parens': ['error', 'always'],
    camelcase: 'off',
    curly: ['error', 'multi-line'],
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
  },
};

// {
//   "rules": {
//     "line-comment-position": "off",
//     "no-warning-comments": "off",
//     "sonarjs/cognitive-complexity": "off",
//   }
// }
