module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'import/extensions': ['error', {
      json: 'always',
    }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-restricted-syntax': 'warn',
    'no-prototype-builtins': 'warn',
    'prefer-destructuring': 'warn',
    'max-len': 'off',
    'import/no-cycle': 'off',
    'no-param-reassign': 'off',
    'no-await-in-loop': 'off',
    'no-bitwise': ['error', { 'allow': ['^'] }],
    'linebreak-style': 'off',
  },
};