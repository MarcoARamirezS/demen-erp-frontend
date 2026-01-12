import { defineStore } from 'pinia'
import type { Client, CreateClientDto } from '~/types/client'

export const useClientsStore = defineStore('clients', {
  state: () => ({
    items: [] as Client[],
    selected: null as Client | null,
    loading: false,
    cursor: null as string | null,
  }),

  actions: {
    async fetch(limit = 10) {
      this.loading = true
      const api = useApi

      const res = await api('/clients', {
        params: {
          limit,
          cursor: this.cursor,
        },
      })

      this.items = res.items
      this.cursor = res.nextCursor ?? null
      this.loading = false
    },

    async getById(id: string) {
      const api = useApi
      this.selected = await api(`/clients/${id}`)
    },

    async create(payload: CreateClientDto) {
      this.loading = true
      try {
        await useApi('/clients', {
          method: 'POST',
          body: payload,
        })
        await this.fetch()
      } finally {
        this.loading = false
      }
    },

    async update(id: string, payload: Partial<CreateClientDto>) {
      const api = useApi
      await api(`/clients/${id}`, {
        method: 'PATCH',
        body: payload,
      })
    },
  },
})
