// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
    rules: {
      // Membolehkan '=' di akhir atau awal baris (bebas)
     '@stylistic/operator-linebreak': 'off',
      // Mematikan komplain soal spasi/indentasi yang sering berantem sama Prettier
      '@stylistic/indent': 'off',
      '@stylistic/member-delimiter-style': 'off'
    }
)
