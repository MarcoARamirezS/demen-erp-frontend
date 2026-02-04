export interface SupplierProductPrice {
  id: string
  supplierProductId: string

  price: number
  currency: 'MXN' | 'USD'

  validFrom: string
  createdAt?: any
}
