export default defineNuxtRouteMiddleware(to => {
  const auth = useAuthStore()

  // Rutas públicas
  if (to.path === '/login') return

  // No autenticado
  if (!auth.accessToken) {
    return navigateTo('/login')
  }

  // Permiso requerido por página
  const requiredPermission = to.meta.permission as string | undefined
  if (!requiredPermission) return

  const normalized = requiredPermission.replace('.', ':')

  if (!auth.permissions.includes(normalized)) {
    return navigateTo('/') // o página 403
  }
})
