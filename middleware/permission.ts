export default defineNuxtRouteMiddleware(to => {
  // ⛔ Solo cliente
  if (process.server) return

  const auth = useAuthStore()

  // ⏳ Esperar a que auth esté listo
  if (!auth.initialized) return

  // 🔒 Si no está autenticado, auth middleware decide
  if (!auth.isAuthenticated) return

  // 📌 Leer permisos desde meta
  const required = to.meta.permission as string | string[] | undefined

  console.log('[permission] required =>', required)
  console.log('[permission] user perms =>', auth.permissions)

  if (!required) return

  const allowed = Array.isArray(required)
    ? required.some(p => auth.hasPermission(p))
    : auth.hasPermission(required)

  if (!allowed) {
    console.warn('[permission] access denied:', required)
    return navigateTo('/')
  }
})
