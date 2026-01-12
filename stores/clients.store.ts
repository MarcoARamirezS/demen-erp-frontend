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
    /**
     * Carga inicial y paginación
     */
    async fetch(limit = 10) {
      this.loading = true
      const api = useApi

      const params: Record<string, any> = { limit }
      if (this.cursor) {
        params.cursor = this.cursor
      }

      const res = await api('/clients', { params })

      this.items = res.items
      this.cursor = res.nextCursor ?? null
      this.loading = false
    },

    /**
     * Limpia estado al salir/entrar a la vista
     */
    reset() {
      this.items = []
      this.cursor = null
      this.selected = null
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
        this.reset()
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
