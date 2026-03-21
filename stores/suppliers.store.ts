import { defineStore } from 'pinia'
import type { Supplier } from '~/types/supplier'

type SuppliersListResponse = {
  items: Supplier[]
  nextCursor: string | null
}

function normalizeSearchText(value: string) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const useSuppliersStore = defineStore('suppliers', {
  state: () => ({
    items: [] as Supplier[],
    loading: false,
    cursor: null as string | null,
    hasMore: true,
    search: '',
    limit: 25,
  }),

  actions: {
    normalizeSearch(value: string) {
      return normalizeSearchText(value)
    },

    reset() {
      this.items = []
      this.loading = false
      this.cursor = null
      this.hasMore = true
      this.search = ''
    },

    setSearch(value: string) {
      const normalized = normalizeSearchText(value)

      this.search = normalized
      this.cursor = null
      this.hasMore = true
      this.items = []
    },

    async fetch() {
      if (this.loading) return
      if (!this.hasMore && this.cursor) return

      this.loading = true

      try {
        const response = await $fetch<SuppliersListResponse>('/api/suppliers', {
          query: {
            limit: this.limit,
            ...(this.cursor ? { cursor: this.cursor } : {}),
            ...(this.search ? { search: this.search } : {}),
          },
        })

        const incoming = Array.isArray(response?.items) ? response.items : []

        this.items = this.cursor ? [...this.items, ...incoming] : incoming
        this.cursor = response?.nextCursor ?? null
        this.hasMore = Boolean(response?.nextCursor)
      } finally {
        this.loading = false
      }
    },

    async create(payload: any) {
      const created = await $fetch<Supplier>('/api/suppliers', {
        method: 'POST',
        body: payload,
      })

      this.cursor = null
      this.hasMore = true
      await this.fetch()

      return created
    },

    async update(id: string, payload: any) {
      const updated = await $fetch<Supplier>(`/api/suppliers/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      this.cursor = null
      this.hasMore = true
      await this.fetch()

      return updated
    },

    async remove(id: string) {
      const out = await $fetch<{ ok: boolean }>(`/api/suppliers/${id}`, {
        method: 'DELETE',
      })

      this.items = this.items.filter(item => item.id !== id)

      return out
    },
  },
})
