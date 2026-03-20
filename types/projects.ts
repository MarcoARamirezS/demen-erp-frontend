export type FireTimestamp =
  | Date
  | string
  | number
  | {
      _seconds?: number
      _nanoseconds?: number
      seconds?: number
      nanoseconds?: number
    }
  | null

export interface ProductImageRef {
  url?: string
  secureUrl?: string
  thumbnailUrl?: string
  publicId?: string
  alt?: string
}

export interface Product {
  id: string
  name: string
  sku: string
  unit: string

  brand?: string
  description?: string

  familyId?: string
  categoryId?: string

  activo?: boolean

  imageUrl?: string
  image?: string
  photoUrl?: string
  thumbnailUrl?: string
  thumbnail?: string
  previewUrl?: string
  images?: Array<string | ProductImageRef>

  createdAt?: FireTimestamp
  updatedAt?: FireTimestamp
}

export interface CreateProductDto {
  name: string
  sku: string
  unit: string

  brand?: string
  description?: string

  familyId?: string
  categoryId?: string

  activo?: boolean

  imageUrl?: string
  image?: string
  photoUrl?: string
  thumbnailUrl?: string
  thumbnail?: string
  previewUrl?: string
  images?: Array<string | ProductImageRef>
}

export type UpdateProductDto = Partial<CreateProductDto>
