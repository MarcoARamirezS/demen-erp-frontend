import { useAuthStore } from '@/stores/auth.store'

export const useApi = <T = any>(url: string, options: any = {}): Promise<T> => {
  const auth = useAuthStore()
  const config = useRuntimeConfig()

  // Asegúrate que config.public.apiBaseUrl sea: http://localhost:3000/api
  const finalUrl = `${config.public.apiBaseUrl}${url}`

  return $fetch<T>(finalUrl, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
    },
  })
}
