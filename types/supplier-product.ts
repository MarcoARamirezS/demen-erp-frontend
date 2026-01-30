// 📁 ~/types/supplier-product.ts

import type { FireTimestamp } from '~/types/fire'
import type { Product } from './product'
import type { Supplier } from './supplier'

/**
 * Relación Proveedor - Producto
 * ✅ Aquí vive el precio de compra
 * ❌ No inventario
 * ❌ No existencias
 */
export interface SupplierProduct {
  id: string

  productId: string
  supplierId: string

  supplierSku?: string // SKU del proveedor
  purchasePrice: number // Precio de compra
  currency: 'MXN' | 'USD'

  active: boolean

  /** Datos poblados (read-only desde backend) */
  supplier?: Pick<Supplier, 'id' | 'razonSocial'>
  product?: Pick<Product, 'id' | 'sku' | 'nombre'>

  createdAt: FireTimestamp
  updatedAt: FireTimestamp
}

/**
 * DTO creación
 */
export interface CreateSupplierProductDto {
  productId: string
  supplierId: string
  supplierSku?: string
  purchasePrice: number
  currency: 'MXN' | 'USD'
  active?: boolean
}
