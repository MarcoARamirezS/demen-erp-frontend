// server/middleware/ignore-nuxt-root.ts
export default defineEventHandler(event => {
  const url = event.node.req.url

  // Silenciar SOLO el request raíz /_nuxt/
  if (url === '/_nuxt/' || url === '/_nuxt') {
    event.node.res.statusCode = 204
    return ''
  }
})
