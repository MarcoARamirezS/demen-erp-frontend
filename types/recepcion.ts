export interface RecepcionItem {
  productId: string
  supplierProductId: string
  quantity: number
  cost: number
}

export interface Recepcion {
  id: string
  supplierId: string
  items: RecepcionItem[]
  notes?: string
  createdAt: any
}
