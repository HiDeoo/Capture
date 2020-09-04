module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  extends: [
    'react-app',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/sort': 'warn',
    'no-shadow': 'error',
    'no-debugger': 'off',
    'jsx-a11y/accessible-emoji': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
  },
}
