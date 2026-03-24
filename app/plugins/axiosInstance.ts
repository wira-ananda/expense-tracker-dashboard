import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authToken = useCookie<string | null>('auth_token')

  const axiosInstance = axios.create({
    baseURL: config.public.apiBase as string
  })

  axiosInstance.interceptors.request.use((request) => {
    if (authToken.value) {
      request.headers.set('Authorization', `Bearer ${authToken.value}`)
    }

    return request
  })

  axiosInstance.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
  )

  return {
    provide: {
      axiosInstance
    }
  }
})
