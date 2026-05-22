import { useAuth } from '@clerk/nuxt/composables'

export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client) return

  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded.value) return

  if (!isSignedIn.value) {
    return navigateTo('/auth/login')
  }
})
