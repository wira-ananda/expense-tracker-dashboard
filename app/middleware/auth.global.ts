export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('auth_token')

  const isAuthPage = to.path.startsWith('/auth')

  if (!token.value && !isAuthPage) {
    return navigateTo('/auth/login')
  }

  if (token.value && isAuthPage) {
    return navigateTo('/')
  }
})
