module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2023: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2023,
    sourceType: 'module'
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    'prettier',
    'vuetify'
  ],
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  rules: {
    quotes: ['error', 'single'],
    semi: 'off',
    'linebreak-style': ['error', 'windows'],
    'max-len': [
      'error',
      {
        code: 100,
        ignorePattern: '\\s*(class|d)=',
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true
      }
    ],
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-shadow': 'warn',
    'no-empty-function': 'warn',
    'require-await': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'warn',
    'vue/no-mutating-props': 'error',
    'vue/script-setup-uses-vars': 'error',
    'prettier/prettier': 'error'
  },
  reportUnusedDisableDirectives: true
}
