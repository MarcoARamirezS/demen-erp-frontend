export interface SupplierContact {
  name: string
  role?: string
  email?: string
  phone?: string
  notes?: string
}

export interface SupplierBankAccount {
  bankName: string
  accountHolder: string
  accountNumber?: string
  clabe?: string
  swift?: string
  iban?: string
  currency: 'MXN' | 'USD'
  notes?: string
}

export interface Supplier {
  id: string
  code: string
  name: string
  legalName?: string
  rfc?: string

  email?: string
  phone?: string
  website?: string

  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }

  contacts: SupplierContact[]
  bankAccounts: SupplierBankAccount[]

  paymentTermsDays: number
  defaultCurrency: 'MXN' | 'USD'

  notes?: string
  active: boolean

  createdAt?: any
  updatedAt?: any
}

export interface CreateSupplierDto extends Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'> {}
