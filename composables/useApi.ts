// composables/useApi.ts
export function useApi<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    body?: any
    query?: Record<string, any>
  } = {}
): Promise<T> {
  const { $api } = useNuxtApp()

  return $api<T>(url, {
    method: options.method ?? 'GET',
    body: options.body,
    query: options.query,
  })
}
