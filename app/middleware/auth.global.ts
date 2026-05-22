import { useAuth } from '@clerk/nuxt/composables'

export default defineNuxtRouteMiddleware(to => {
  if (!import.meta.client) return

  const { isSignedIn, isLoaded } = useAuth()

  const isAuthRoute =
    to.path.startsWith('/auth/login') ||
    to.path.startsWith('/auth/register') ||
    to.path === '/auth/sync' ||
    to.path === '/auth/complete-profile'

  if (isAuthRoute) return

  if (!isLoaded.value) return

  if (!isSignedIn.value) {
    return navigateTo('/auth/login')
  }
})
