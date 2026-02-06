// ~/stores/roles.store.ts
import { defineStore } from 'pinia'
import type { Role, CreateRoleDto, UpdateRoleDto } from '~/types/role'
import { useApi } from '~/composables/useApi'

export const useRolesStore = defineStore('roles', {
  state: () => ({
    items: [] as Role[],
    loading: false,
    loaded: false, // ⬅️ CLAVE
    nextCursor: null as string | null,
  }),

  getters: {
    activeRoles: state => state.items.filter(r => r.active),
    byId: state => (id: string) => state.items.find(r => r.id === id),
  },

  actions: {
    async fetch(limit = 50, force = false) {
      // ⛔ GUARDIAS CRÍTICAS
      if (this.loading) return
      if (this.loaded && !force) return

      this.loading = true

      try {
        const res = await useApi<{ items: Role[]; nextCursor: string | null }>(
          `/roles?limit=${limit}`
        )

        this.items = res.items
        this.nextCursor = res.nextCursor
        this.loaded = true // ⬅️ MARCAR CARGADO
      } finally {
        this.loading = false
      }
    },

    async create(payload: CreateRoleDto) {
      await useApi<Role>('/roles', {
        method: 'POST',
        body: payload,
      })

      await this.fetch(50, true) // ⬅️ force reload
    },

    async update(id: string, payload: UpdateRoleDto) {
      const updated = await useApi<Role>(`/roles/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      const idx = this.items.findIndex(r => r.id === id)
      if (idx !== -1) this.items[idx] = updated
    },

    async remove(id: string) {
      await useApi(`/roles/${id}`, { method: 'DELETE' })
      this.items = this.items.filter(r => r.id !== id)
    },

    reset() {
      this.items = []
      this.loaded = false
      this.loading = false
      this.nextCursor = null
    },
  },
})
