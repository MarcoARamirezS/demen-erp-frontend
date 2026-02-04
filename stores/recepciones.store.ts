import { defineStore } from 'pinia'
import type { Recepcion } from '~/types/recepcion'

export const useRecepcionesStore = defineStore('recepciones', {
  state: () => ({
    items: [] as Recepcion[],
    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true
      try {
        const api = useApi
        const res = await api('/recepciones')
        this.items = res
      } finally {
        this.loading = false
      }
    },

    async create(payload: Omit<Recepcion, 'id' | 'createdAt'>) {
      const api = useApi
      await api('/recepciones', {
        method: 'POST',
        body: payload,
      })

      await this.fetch()
    },
  },
})
