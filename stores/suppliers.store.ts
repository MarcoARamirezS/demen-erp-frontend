// 📁 ~/stores/suppliers.store.ts
import { defineStore } from 'pinia'
import type { Supplier, CreateSupplierDto } from '~/types/supplier'

export const useSuppliersStore = defineStore('suppliers', {
  state: () => ({
    items: [] as Supplier[],
    selected: null as Supplier | null,
    loading: false,
    cursor: null as string | null,
  }),

  actions: {
    async fetch(limit = 10) {
      this.loading = true
      const api = useApi

      const params: Record<string, any> = { limit }
      if (this.cursor) params.cursor = this.cursor

      const res = await api('/suppliers', { params })

      this.items = res.items
      this.cursor = res.nextCursor ?? null
      this.loading = false
    },

    reset() {
      this.items = []
      this.cursor = null
      this.selected = null
    },

    async getById(id: string) {
      const api = useApi
      this.selected = await api(`/suppliers/${id}`)
    },

    async create(payload: CreateSupplierDto) {
      this.loading = true
      try {
        await useApi('/suppliers', {
          method: 'POST',
          body: payload,
        })
        this.reset()
        await this.fetch()
      } finally {
        this.loading = false
      }
    },

    async update(id: string, payload: Partial<CreateSupplierDto>) {
      await useApi(`/suppliers/${id}`, {
        method: 'PATCH',
        body: payload,
      })
    },
  },
})
