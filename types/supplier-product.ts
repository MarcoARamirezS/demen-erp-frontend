// 📁 ~/types/supplier-product.ts

import type { FireTimestamp } from '~/types/fire'
import type { Product } from './product'
import type { Supplier } from './supplier'

/**
 * Relación Proveedor - Producto
 * ✅ Incluye precio vigente (read-only)
 * ❌ No inventario
 * ❌ No stock
 */
export interface SupplierProduct {
  id: string

  supplierId: string
  productId: string

  supplierSku?: string

  /** 🔥 PRECIO VIGENTE (materializado desde backend) */
  currentPrice?: {
    cost: number
    currency: 'MXN' | 'USD'
  }

  active: boolean

  /** Poblado (solo lectura) */
  supplier?: Pick<Supplier, 'id' | 'razonSocial'>
  product?: Pick<Product, 'id' | 'sku' | 'nombre'>

  createdAt: FireTimestamp
  updatedAt: FireTimestamp
}

/**
 * DTO creación relación
 * (NO incluye precio)
 */
export interface CreateSupplierProductDto {
  supplierId: string
  productId: string
  supplierSku?: string
  active?: boolean
}
