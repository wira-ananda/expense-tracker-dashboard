import { useAuth } from '@clerk/nuxt/composables'

export default defineNuxtRouteMiddleware(() => {
  // Cek auth manual lama
  const token = useCookie<string | null>('auth_token')

  if (token.value) {
    return navigateTo('/')
  }

  // Cek Clerk auth
  const { isSignedIn, isLoaded } = useAuth()

  if (isLoaded.value && isSignedIn.value) {
    return navigateTo('/transactions')
  }
})
