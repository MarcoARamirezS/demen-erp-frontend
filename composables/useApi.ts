import { useUiStore } from '~/stores/ui.store'
import { useAuthStore } from '~/stores/auth.store'

export function useApi<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    body?: any
    query?: Record<string, any>
  } = {}
): Promise<T> {
  const { $api } = useNuxtApp()
  const ui = useUiStore()
  const auth = useAuthStore()

  // 🔒 Seguridad: solo API
  if (!url.startsWith('/')) {
    throw new Error('[useApi] URL inválida')
  }

  ui.showLoading()

  return $api<T>(url, {
    method: options.method ?? 'GET',
    body: options.body,
    query: options.query,
  })
    .catch((error: any) => {
      /**
       * $fetch error shape:
       * error.statusCode
       * error.data
       */
      const status = error?.statusCode
      const message = error?.data?.message || error?.message || 'Error inesperado del servidor'

      ui.showToast('error', message)

      // 🔐 401 → logout controlado
      if (status === 401 && process.client) {
        auth.logout()
        navigateTo('/login')
      }

      // ⚠️ IMPORTANTE:
      // relanzamos un error "plano"
      // para que Nuxt NO intente manejarlo como H3Error
      return Promise.reject({
        status,
        message,
      })
    })
    .finally(() => {
      ui.hideLoading()
    })
}
