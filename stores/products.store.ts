import { defineStore } from 'pinia'
import type { Product, CreateProductDto } from '~/types/product'

export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [] as Product[],
    selected: null as Product | null,
    loading: false,
    cursor: null as string | null,
    hasMore: true,
  }),

  actions: {
    reset() {
      this.items = []
      this.cursor = null
      this.hasMore = true
    },

    async fetch(limit = 10) {
      if (!this.hasMore || this.loading) return

      this.loading = true

      const res = await useApi<any>('/products', {
        query: { limit, cursor: this.cursor },
      })

      this.items.push(...res.items)
      this.cursor = res.nextCursor
      this.hasMore = !!res.nextCursor
      this.loading = false
    },

    /* =========================
       CREATE
    ========================= */
    async create(payload: CreateProductDto) {
      const product = await useApi<Product>('/products', {
        method: 'POST',
        body: payload,
      })

      this.items.unshift(product)
      return product // 🔥 IMPORTANTE
    },

    /* =========================
       UPDATE
    ========================= */
    async update(id: string, payload: Partial<CreateProductDto>) {
      const updated = await useApi<Product>(`/products/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      const idx = this.items.findIndex(i => i.id === id)
      if (idx !== -1) this.items[idx] = updated

      return updated // 🔥 IMPORTANTE
    },

    /* =========================
       UPLOAD IMAGES
    ========================= */
    async uploadImages(id: string, files: File[]) {
      const fd = new FormData()
      files.forEach(f => fd.append('images', f))

      const updated = await useApi<Product>(`/products/${id}/images`, {
        method: 'POST',
        body: fd,
      })

      // 🔥 actualizar local state
      const idx = this.items.findIndex(i => i.id === id)
      if (idx !== -1) this.items[idx] = updated

      if (this.selected?.id === id) {
        this.selected = updated
      }

      return updated
    },

    async remove(id: string) {
      await useApi(`/products/${id}`, { method: 'DELETE' })
      this.items = this.items.filter(i => i.id !== id)
    },

    async get(id: string) {
      this.selected = await useApi<Product>(`/products/${id}`)
      return this.selected
    },

    clearSelected() {
      this.selected = null
    },
  },
})
