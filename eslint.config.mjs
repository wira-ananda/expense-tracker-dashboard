// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt().append({
  rules: {
    '@stylistic/operator-linebreak': 'off',
    '@stylistic/indent': 'off',
    '@stylistic/member-delimiter-style': 'off',
    '@stylistic/arrow-parens': 'off',
    '@stylistic/indent-binary-ops': 'off',

    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',

    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-self-closing': 'off'
  }
})
