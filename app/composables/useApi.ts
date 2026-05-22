import { useAuth } from '@clerk/nuxt/composables'
import { unref } from 'vue'

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
  query?: Record<string, unknown>
}

export function useApi() {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  async function apiFetch<T>(url: string, options: ApiOptions = {}) {
    const getTokenFn = unref(getToken)

    if (typeof getTokenFn !== 'function') {
      throw new Error('Method getToken Clerk tidak tersedia')
    }

    const token = await getTokenFn()

    if (!token) {
      throw new Error('Token Clerk tidak ditemukan')
    }

    return $fetch<T>(url, {
      baseURL: config.public.apiBase,
      method: options.method || 'GET',
      body: options.body,
      query: options.query,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  return {
    apiFetch
  }
}
