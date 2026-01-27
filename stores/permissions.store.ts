import { defineStore } from 'pinia'
import type { Permission } from '~/types/permission'
import { useApi } from '~/composables/useApi'

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    items: [] as Permission[],
    loading: false,
  }),

  getters: {
    activePermissions: state => state.items.filter(p => p.active),
  },

  actions: {
    async fetch() {
      this.loading = true
      try {
        const res = await useApi<{ items: Permission[] }>('/permissions?limit=300')
        this.items = res.items
      } finally {
        this.loading = false
      }
    },
  },
})
