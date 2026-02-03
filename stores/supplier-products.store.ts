import { defineStore } from 'pinia'
import type { SupplierProduct, CreateSupplierProductDto } from '~/types/supplier-product'

type ListQuery = {
  limit?: number
  cursor?: string | null
  supplierId?: string
  productId?: string
  active?: boolean
}

export const useSupplierProductsStore = defineStore('supplierProducts', {
  state: () => ({
    items: [] as SupplierProduct[],
    loading: false,
    cursor: null as string | null,
    hasMore: true,

    // 🔁 Para reusar en details y después de create/update
    lastQuery: {} as ListQuery,
  }),

  actions: {
    reset() {
      this.items = []
      this.cursor = null
      this.hasMore = true
      this.lastQuery = {}
    },

    async fetch(params: ListQuery = {}, limit = 25) {
      this.loading = true
      try {
        const query: ListQuery = { ...params, limit, cursor: undefined }
        this.lastQuery = { ...params } // guardar filtro (sin cursor)

        const res = await useApi<any>('/supplier-products', {
          query,
        })

        this.items = res.items ?? []
        this.cursor = res.nextCursor ?? null
        this.hasMore = !!res.nextCursor
      } finally {
        this.loading = false
      }
    },

    async fetchMore(params: ListQuery = {}, limit = 25) {
      if (!this.cursor || this.loading) return

      this.loading = true
      try {
        const query: ListQuery = { ...params, limit, cursor: this.cursor }
        const res = await useApi<any>('/supplier-products', { query })

        const next = res.items ?? []
        this.items.push(...next)

        this.cursor = res.nextCursor ?? null
        this.hasMore = !!res.nextCursor
      } finally {
        this.loading = false
      }
    },

    async refreshLastQuery(limit = 25) {
      await this.fetch(this.lastQuery, limit)
    },

    async create(payload: CreateSupplierProductDto) {
      const created = await useApi<SupplierProduct>('/supplier-products', {
        method: 'POST',
        body: payload,
      })

      // ✅ Si el create coincide con el filtro actual, lo insertamos
      const matchesSupplier =
        !this.lastQuery.supplierId || this.lastQuery.supplierId === created.supplierId
      const matchesProduct =
        !this.lastQuery.productId || this.lastQuery.productId === created.productId

      if (matchesSupplier && matchesProduct) {
        this.items.unshift(created)
      } else {
        // si estás filtrando otra cosa, refresca
        await this.refreshLastQuery()
      }
    },

    async update(id: string, payload: Partial<CreateSupplierProductDto>) {
      const updated = await useApi<SupplierProduct>(`/supplier-products/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      const idx = this.items.findIndex(i => i.id === id)
      if (idx !== -1) this.items[idx] = updated
      else await this.refreshLastQuery()
    },

    async remove(id: string) {
      await useApi(`/supplier-products/${id}`, { method: 'DELETE' })
      this.items = this.items.filter(i => i.id !== id)
    },
  },
})
