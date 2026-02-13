import { useUiStore } from '~/stores/ui.store'
import { useAuthStore } from '~/stores/auth.store'

export function useApi<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    body?: any
    query?: Record<string, any>
    headers?: Record<string, string>
  } = {}
): Promise<T> {
  const ui = useUiStore()
  const auth = useAuthStore()

  if (!url.startsWith('/')) {
    throw new Error('[useApi] URL inválida')
  }

  ui.showLoading()

  /* =========================
     🔥 FIX DEFINITIVO FORMDATA
  ========================= */
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  /* =========================
     🔥 BUILD QUERY STRING
  ========================= */
  let finalUrl = `http://localhost:4000/api${url}`

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
     si es FormData (browser agrega boundary)
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
        }
      }

      return data
    })
    .catch((error: any) => {
      const status = error?.statusCode
      const message = error?.data?.message || error?.message || 'Error inesperado del servidor'

      ui.showToast('error', message)

      if (status === 401 && process.client) {
        auth.logout()
        navigateTo('/')
      }

      return Promise.reject({
        status,
        message,
      })
    })
    .finally(() => {
      ui.hideLoading()
    })
}
