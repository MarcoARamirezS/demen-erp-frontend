import { useUiStore } from '~/stores/ui.store'
import { useAuthStore } from '~/stores/auth.store'

let isRefreshing = false
let refreshPromise: Promise<any> | null = null

export async function useApi<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    body?: any
    query?: Record<string, any>
    headers?: Record<string, string>
    silent?: boolean
    _retry?: boolean // 🔥 interno
  } = {}
): Promise<T> {
  const ui = useUiStore()
  const auth = useAuthStore()
  const config = useRuntimeConfig()

  if (!url.startsWith('/')) {
    throw new Error('[useApi] URL inválida')
  }

  const silent = options.silent === true

  if (!silent) ui.showLoading()

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  let finalUrl = `${config.public.apiBaseUrl}${url}`

  if (options.query) {
    const params = new URLSearchParams()
    Object.entries(options.query).forEach(([k, v]) => {
      if (v != null) params.append(k, String(v))
    })
    const qs = params.toString()
    if (qs) finalUrl += `?${qs}`
  }

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  }

  if (!isFormData && options.body) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const res = await fetch(finalUrl, {
      method: options.method ?? 'GET',
      headers,
      credentials: 'include',
      body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw { statusCode: res.status, data }
    }

    return data
  } catch (error: any) {
    const status = error?.statusCode

    /* =========================
       🔥 REFRESH AUTOMÁTICO
    ========================= */
    if (status === 401 && !options._retry && !auth.isLoggingOut) {
      try {
        if (!isRefreshing) {
          isRefreshing = true
          refreshPromise = fetch(`${config.public.apiBaseUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          }).finally(() => {
            isRefreshing = false
          })
        }

        await refreshPromise

        return useApi(url, { ...options, _retry: true })
      } catch {
        auth.user = null
        auth.permissions = []
        if (process.client) navigateTo('/')
      }
    }

    const message = error?.data?.message || error?.message || 'Error inesperado del servidor'

    if (!(status === 401 && options.silent)) {
      ui.showToast('error', message)
    }

    return Promise.reject({
      statusCode: status,
      message,
      url,
    })
  } finally {
    if (!silent) ui.hideLoading()
  }
}
