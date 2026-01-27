// 📁 ~/types/product.ts

import type { FireTimestamp } from '~/types/fire'

/**
 * Producto (catálogo)
 * ❌ No inventario
 * ❌ No stock
 */
export interface Product {
  id: string

  sku: string
  name: string
  description?: string

  active: boolean

  createdAt: FireTimestamp
  updatedAt: FireTimestamp
}

/**
 * DTO creación
 */
export interface CreateProductDto {
  sku: string
  name: string
  description?: string
  active?: boolean
}
