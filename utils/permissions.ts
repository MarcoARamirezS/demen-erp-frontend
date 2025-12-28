// ~/utils/permissions.ts
import { useAuthStore } from '~/stores/auth.store'

/**
 * Verifica si el usuario tiene un permiso específico
 * Ej: 'users:create', 'users:update'
 */
export function hasPermission(permission?: string): boolean {
  if (!permission) return true

  const auth = useAuthStore()

  if (!auth.permissions || !Array.isArray(auth.permissions)) {
    return false
  }

  return auth.permissions.includes(permission)
}

/**
 * Verifica si tiene TODOS los permisos
 */
export function hasAllPermissions(perms: string[]): boolean {
  const auth = useAuthStore()
  if (!auth.permissions) return false
  return perms.every(p => auth.permissions.includes(p))
}

/**
 * Verifica si tiene AL MENOS UNO
 */
export function hasAnyPermission(perms: string[]): boolean {
  const auth = useAuthStore()
  if (!auth.permissions) return false
  return perms.some(p => auth.permissions.includes(p))
}
