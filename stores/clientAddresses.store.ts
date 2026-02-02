import { defineStore } from 'pinia'
import type { ClientAddress, CreateClientAddressDto } from '~/types/client-address'

export const useClientAddressesStore = defineStore('clientAddresses', {
  state: () => ({
    items: [] as ClientAddress[],
    loading: false,
  }),

  actions: {
    async fetchByClient(clienteId: string) {
      this.loading = true
      try {
        this.items = await useApi('/clients/addresses', {
          query: { clienteId }, // 🔥 CAMBIO CLAVE
        })
      } finally {
        this.loading = false
      }
    },

    async create(payload: CreateClientAddressDto) {
      await useApi('/clients/addresses', {
        method: 'POST',
        body: {
          ...payload,
          esPrincipal: payload.esFiscal, // 🔁 mapeo backend
        },
      })
    },

    async update(id: string, payload: Partial<CreateClientAddressDto>) {
      await useApi(`/clients/addresses/${id}`, {
        method: 'PATCH',
        body: {
          ...payload,
          esPrincipal: payload.esFiscal,
        },
      })
    },

    async remove(id: string) {
      await useApi(`/clients/addresses/${id}`, {
        method: 'DELETE',
      })
    },
  },
})
