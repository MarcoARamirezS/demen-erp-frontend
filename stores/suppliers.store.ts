import { defineStore } from 'pinia'
import type { Supplier, CreateSupplierDto } from '~/types/supplier'

export const useSuppliersStore = defineStore('suppliers', {
  state: () => ({
    items: [] as Supplier[],
    selected: null as Supplier | null,
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
      const res = await useApi<any>('/suppliers', {
        query: { limit, cursor: this.cursor },
      })

      this.items.push(...res.items)
      this.cursor = res.nextCursor
      this.hasMore = !!res.nextCursor
      this.loading = false
    },

    async create(payload: CreateSupplierDto) {
      const supplier = await useApi<Supplier>('/suppliers', {
        method: 'POST',
        body: payload,
      })
      this.items.unshift(supplier)
    },

    async update(id: string, payload: Partial<CreateSupplierDto>) {
      const updated = await useApi<Supplier>(`/suppliers/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      const idx = this.items.findIndex(i => i.id === id)
      if (idx !== -1) this.items[idx] = updated
    },

    async remove(id: string) {
      await useApi(`/suppliers/${id}`, { method: 'DELETE' })
      this.items = this.items.filter(i => i.id !== id)
    },

    async get(id: string) {
      this.selected = await useApi<Supplier>(`/suppliers/${id}`)
    },

    clearSelected() {
      this.selected = null
    },
  },
})
