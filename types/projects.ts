export interface ProjectImage {
  publicId: string
  url: string
  secureUrl: string
  isMain: boolean
  uploadedAt: any
}

export type ProjectStatus =
  | 'AUTH_PENDING'
  | 'AUTHORIZED'
  | 'IN_EXECUTION'
  | 'COMPLETED'
  | 'NOT_ASSIGNED'
  | 'IN_QUOTATION'

export type ProjectSortBy = 'createdAt' | 'clientName' | 'projectNumber' | 'fecha'
export type ProjectSortDir = 'asc' | 'desc'

export interface ProjectRelatedRef {
  id: string
  name: string
}

export interface Project {
  id: string
  projectNumber: string

  clientId: string
  branchId: string

  plantaCliente?: string | null
  objetivoFuncionalCliente?: string | null
  realizaLevantamiento?: string | null
  personaAQuienVisita?: string | null

  fecha?: string | null
  visitDate?: any

  status: ProjectStatus
  statusHistory?: any[]

  isActive: boolean

  images?: ProjectImage[]

  client?: ProjectRelatedRef | null
  branch?: ProjectRelatedRef | null

  createdAt?: any
  updatedAt?: any
}

export interface CreateProjectDto {
  clientId: string
  branchId: string
  plantaCliente?: string | null
  objetivoFuncionalCliente?: string | null
  realizaLevantamiento?: string | null
  personaAQuienVisita?: string | null
  fecha?: string | null
}

export interface ProjectListFilters {
  status?: ProjectStatus
  clientId?: string
  search?: string
  sortBy?: ProjectSortBy
  sortDir?: ProjectSortDir
}
