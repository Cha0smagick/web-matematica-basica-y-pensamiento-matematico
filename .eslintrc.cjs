module.exports = {
  env: {
    browser: true,
    es2022: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-alert': 'warn',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all']
  },
  ignorePatterns: ['dist/', 'public/', 'node_modules/']
};