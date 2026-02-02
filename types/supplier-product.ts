export interface SupplierProduct {
  id: string

  supplierId: string
  productId: string

  supplierSku?: string

  currentPrice: number
  currency: 'MXN' | 'USD'

  leadTimeDays: number
  moq: number
  packSize: number

  preferred: boolean
  notes?: string

  active: boolean

  createdAt: any
  updatedAt: any
}

export interface CreateSupplierProductDto {
  supplierId: string
  productId: string
  supplierSku?: string

  currentPrice: number
  currency: 'MXN' | 'USD'

  leadTimeDays?: number
  moq?: number
  packSize?: number

  preferred?: boolean
  notes?: string
}
