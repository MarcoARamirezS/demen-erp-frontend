import { defineStore } from 'pinia'
import type { Client, CreateClientDto } from '~/types/client'

export const useClientsStore = defineStore('clients', {
  state: () => ({
    items: [] as Client[],
    selected: null as Client | null,
    loading: false,
    cursor: null as string | null,
    lastLimit: 10,
    lastSearch: '',
  }),

  actions: {
    /**
     * Carga inicial y paginación
     */
    async fetch(limit = 10, search = '') {
      this.loading = true

      try {
        this.lastLimit = limit
        this.lastSearch = search

        const query: Record<string, any> = { limit }

        if (this.cursor) query.cursor = this.cursor
        if (search) query.search = search

        const res = await useApi<{ items: Client[]; nextCursor?: string | null }>('/clients', {
          query,
        })

        this.items = res.items ?? []
        this.cursor = res.nextCursor ?? null
      } finally {
        this.loading = false
      }
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
      this.selected = await useApi<Client>(`/clients/${id}`)
      return this.selected
    },

    async create(payload: CreateClientDto) {
      this.loading = true

      try {
        const created = await useApi<Client>('/clients', {
          method: 'POST',
          body: payload,
        })

        this.selected = created
        this.cursor = null
        await this.fetch(this.lastLimit, this.lastSearch)

        return created
      } finally {
        this.loading = false
      }
    },

    async update(id: string, payload: Partial<CreateClientDto>) {
      this.loading = true

      try {
        const updated = await useApi<Client>(`/clients/${id}`, {
          method: 'PATCH',
          body: payload,
        })

        const idx = this.items.findIndex(c => c.id === id)
        if (idx !== -1) {
          this.items[idx] = updated
        }

        if (this.selected?.id === id) {
          this.selected = updated
        }

        this.cursor = null
        await this.fetch(this.lastLimit, this.lastSearch)

        return updated
      } finally {
        this.loading = false
      }
    },

    async toggleActive(id: string, activo: boolean) {
      const updated = await useApi<Client>(`/clients/${id}`, {
        method: 'PATCH',
        body: { activo },
      })

      const idx = this.items.findIndex(c => c.id === id)
      if (idx !== -1) {
        this.items[idx] = updated
      }

      if (this.selected?.id === id) {
        this.selected = updated
      }

      return updated
    },
  },
})
