import { defineStore } from 'pinia'
import type { Recepcion } from '~/types/recepcion'
import { useApi } from '~/composables/useApi'
import { useUi } from '~/composables/useUi'

export const useRecepcionesStore = defineStore('recepciones', {
  state: () => ({
    items: [] as Recepcion[],
    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true
      try {
        const { data } = await useApi().get('/recepciones')
        this.items = data
      } finally {
        this.loading = false
      }
    },

    async create(payload: Omit<Recepcion, 'id' | 'createdAt'>) {
      const ui = useUi()
      await useApi().post('/recepciones', payload)
      ui.showToast('Recepción registrada', 'success')
      await this.fetch()
    },
  },
})
