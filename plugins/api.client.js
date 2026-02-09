export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',

    onResponseError({ response }) {
      // Evita que errores 404/401 rompan el dev server
      return Promise.reject({
        statusCode: response.status,
        data: response._data,
      })
    },
  })

  return {
    provide: { api },
  }
})
