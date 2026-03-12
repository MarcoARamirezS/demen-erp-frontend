import { useUiStore } from '~/stores/ui.store'
import { useAuthStore } from '~/stores/auth.store'

export function useApi<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    body?: any
    query?: Record<string, any>
    headers?: Record<string, string>
    silent?: boolean
  } = {}
): Promise<T> {
  const ui = useUiStore()
  const auth = useAuthStore()
  const config = useRuntimeConfig()

  if (!url.startsWith('/')) {
    throw new Error('[useApi] URL inválida')
  }

  const silent = options.silent === true

  if (!silent) {
    ui.showLoading()
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const baseUrl = config.public.apiBaseUrl
  let finalUrl = `${baseUrl}${url}`

  /* =========================
     🔥 BUILD QUERY STRING
  ========================= */
  if (options.query) {
    const params = new URLSearchParams()

    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const queryString = params.toString()
    if (queryString) {
      finalUrl += `?${queryString}`
    }
  }

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  }

  /* =========================
     🔥 IMPORTANTE
     JAMÁS setear Content-Type
     si es FormData
  ========================= */
  if (!isFormData && options.body) {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(finalUrl, {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  })
    .then(async res => {
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw {
          statusCode: res.status,
          data,
          url,
        }
      }

      return data
    })
    .catch((error: any) => {
      const status = error?.statusCode
      const message = error?.data?.message || error?.message || 'Error inesperado del servidor'

      /* =========================
         🔥 BOOTSTRAP SILENCIOSO
         Evita toast en /auth/me
      ========================= */
      const isSilent401Bootstrap = silent && status === 401 && url === '/auth/me'

      if (!isSilent401Bootstrap && !(status === 401 && auth.isLoggingOut)) {
        ui.showToast('error', message)
      }

      /* =========================
         🔥 MANEJO GLOBAL 401
      ========================= */
      if (status === 401 && process.client) {
        // Evitar limpiar estado durante logout
        if (!auth.isLoggingOut) {
          auth.user = null
          auth.permissions = []
        }
      }

      /* =========================
         🔥 NORMALIZAR ERROR
      ========================= */
      return Promise.reject({
        statusCode: status,
        message,
        url,
      })
    })
    .finally(() => {
      if (!silent) {
        ui.hideLoading()
      }
    })
}
