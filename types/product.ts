// 📁 ~/types/product.ts
import type { FireTimestamp } from '~/types/fire'

/**
 * Producto (catálogo)
 * ❌ No inventario
 * ❌ No stock
 */
export interface Product {
  id: string

  /** SKU interno generado por sistema */
  sku: string

  name: string
  description?: string

  active: boolean

  createdAt: FireTimestamp
  updatedAt: FireTimestamp
}

/**
 * DTO creación
 * 🔥 SKU NO viene del frontend
 */
export interface CreateProductDto {
  name: string
  description?: string
  active?: boolean
}

/**
 * DTO actualización
 * (SKU no editable)
 */
export interface UpdateProductDto {
  name?: string
  description?: string
  active?: boolean
}
