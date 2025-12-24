import { useAuthStore } from "@/stores/auth.store"

export const useApi = async <T = any>(
  url: string,
  options: any = {}
): Promise<T> => {
  const auth = useAuthStore()
  const config = useRuntimeConfig()

  const finalUrl = `${config.public.apiBaseUrl}${url}`

  // 🔍 DEBUG (opcional)
  console.log("[API]", finalUrl)

  return await $fetch<T>(finalUrl, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(auth.accessToken
        ? { Authorization: `Bearer ${auth.accessToken}` }
        : {}),
    },
  })
}
