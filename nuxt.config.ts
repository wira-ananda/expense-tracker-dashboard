// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/icon'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Keys di dalam sini bersifat PRIVATE (hanya server-side)
    apiSecret: '', // Akan diisi oleh NUXT_API_SECRET di .env

    // Keys di dalam 'public' bersifat PUBLIC (bisa diakses di browser)
    public: {
      apiBase: 'http://localhost:2000/' // Akan diisi oleh NUXT_PUBLIC_API_BASE di .env
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
