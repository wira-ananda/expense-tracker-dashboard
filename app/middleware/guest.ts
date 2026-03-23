export default defineNuxtRouteMiddleware(() => {
  const token = useCookie<string | null>('auth_token')

  if (token.value) {
    return navigateTo('/')
  }
})
