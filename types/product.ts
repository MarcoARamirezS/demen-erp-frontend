export interface Product {
  id: string

  sku: string
  internalCode?: string

  name: string
  description?: string

  brand?: string
  unit: 'm' | 'pz' | 'kg' | 'lt'

  // 🔹 EXISTENTE (lo dejamos para compatibilidad visual)
  category?: string

  // 🔹 NUEVO (relación real con backend)
  familyId?: string
  categoryId?: string

  active: boolean
  avgCost?: number
  lastCost?: number

  createdAt?: any
  updatedAt?: any
}

export interface CreateProductDto extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {}
