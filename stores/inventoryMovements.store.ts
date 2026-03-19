import { defineStore } from 'pinia'
import type { InventoryMovement, InventoryMovementType } from '~/types/inventory'

type MovementsFetchParams = {
  limit?: number
  cursor?: string
}

type MovementsResponse = {
  ok: boolean
  items: InventoryMovement[]
  nextCursor: string | null
}

type CreateMovementPayload = {
  productId: string
  type: InventoryMovementType
  quantity: number
  reason: string
  referenceType?: 'purchase' | 'sale' | 'manual'
  referenceId?: string
}

export const useInventoryMovementsStore = defineStore('inventoryMovements', {
  state: () => ({
    items: [] as InventoryMovement[],
    loading: false,
    cursor: null as string | null,

    search: '',
    type: '' as InventoryMovementType | '',
  }),

  actions: {
    setFilters(payload: { search?: string; type?: InventoryMovementType | '' }) {
      this.search = payload.search ?? ''
      this.type = payload.type ?? ''
      this.cursor = null
      this.items = []
    },

    reset() {
      this.items = []
      this.cursor = null
      this.loading = false
    },

    clearAll() {
      this.items = []
      this.cursor = null
      this.loading = false
      this.search = ''
      this.type = ''
    },

    async fetch(params: MovementsFetchParams = {}) {
      if (this.loading) return

      this.loading = true

      try {
        const res = await useApi<MovementsResponse>('/inventory/movements', {
          query: {
            limit: params.limit ?? 20,
            cursor: params.cursor ?? this.cursor ?? undefined,
            search: this.search || undefined,
            type: this.type || undefined,
          },
        })

        const incomingItems = Array.isArray(res?.items) ? res.items : []

        if (params.cursor) {
          this.items.push(...incomingItems)
        } else {
          this.items = incomingItems
        }

        this.cursor = res?.nextCursor ?? null
      } finally {
        this.loading = false
      }
    },

    async create(payload: CreateMovementPayload) {
      return await useApi('/inventory/movements', {
        method: 'POST',
        body: payload,
      })
    },
  },
})
