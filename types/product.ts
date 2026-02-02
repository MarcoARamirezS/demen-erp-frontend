export interface Product {
  id: string

  sku: string
  internalCode?: string

  name: string
  description?: string

  brand?: string
  unit: 'm' | 'pz' | 'kg' | 'lt'

  category?: string

  active: boolean

  createdAt?: any
  updatedAt?: any
}

export interface CreateProductDto extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {}
