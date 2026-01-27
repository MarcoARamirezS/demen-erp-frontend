import { defineStore } from 'pinia'
import type { Role, CreateRoleDto, UpdateRoleDto } from '~/types/role'

export const useRolesStore = defineStore('roles', {
  state: () => ({
    items: [] as Role[],
    loading: false,
    nextCursor: null as string | null,
  }),

  getters: {
    activeRoles: state => state.items.filter(r => r.active),
    byId: state => (id: string) => state.items.find(r => r.id === id),
  },

  actions: {
    /* =========================
       FETCH
    ========================= */
    async fetch(limit = 25) {
      this.loading = true
      try {
        const res = await useApi<{ items: Role[]; nextCursor: string | null }>(
          `/roles?limit=${limit}`
        )

        this.items = res.items ?? []
        this.nextCursor = res.nextCursor ?? null
      } finally {
        this.loading = false
      }
    },

    /* =========================
       CREATE
       ✅ NO asumir retorno
    ========================= */
    async create(payload: CreateRoleDto) {
      await useApi('/roles', {
        method: 'POST',
        body: payload,
      })

      // 🔄 Estado consistente
      await this.fetch()
    },

    /* =========================
       UPDATE
       ✅ NO pisar con undefined
    ========================= */
    async update(id: string, payload: UpdateRoleDto) {
      await useApi(`/roles/${id}`, {
        method: 'PATCH',
        body: payload,
      })

      // 🔄 Estado consistente
      await this.fetch()
    },

    /* =========================
       DELETE (soft / hard)
    ========================= */
    async remove(id: string) {
      await useApi(`/roles/${id}`, { method: 'DELETE' })

      // Limpieza local segura
      this.items = this.items.filter(r => r.id !== id)
    },
  },
})
