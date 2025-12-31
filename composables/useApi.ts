export const useApi = async <T = any>(url: string, options: any = {}): Promise<T> => {
  const auth = useAuthStore()
  const config = useRuntimeConfig()

  const finalUrl = `${config.public.apiBaseUrl}${url}`

  try {
    return await $fetch<T>(finalUrl, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
      },
      credentials: 'include',
    })
  } catch (e: any) {
    if (e?.status === 401 && auth.refreshToken) {
      await auth.refresh()

      return await $fetch<T>(finalUrl, {
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
        },
        credentials: 'include',
      })
    }

    throw e
  }
}
