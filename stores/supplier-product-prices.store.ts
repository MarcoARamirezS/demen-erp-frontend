export const useSupplierProductPricesStore = defineStore('supplierProductPrices', {
  state: () => ({
    items: [],
    loading: false,
  }),

  actions: {
    async fetch(supplierProductId: string) {
      this.loading = true
      const res = await useApi('/supplier-product-prices', {
        query: { supplierProductId },
      })
      this.items = res.items
      this.loading = false
    },
  },
})
