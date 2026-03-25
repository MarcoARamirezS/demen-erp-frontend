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

export interface ProjectImage {
  publicId?: string
  url?: string
  secureUrl?: string
  isMain?: boolean
  uploadedAt?: FireTimestamp
}

export interface ProjectClientLogo {
  publicId?: string
  url?: string
  secureUrl?: string
  originalName?: string
  uploadedAt?: FireTimestamp
}

export interface ProjectClientRef {
  id: string
  name: string
  logo?: ProjectClientLogo | null
}

export interface ProjectBranchRef {
  id: string
  name: string
}

export interface ProjectStatusHistoryItem {
  status: string
  at?: FireTimestamp
  by?: string
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

export type ProjectListFilters = {
  status?: string
  clientId?: string
  search?: string
  sortBy?: 'createdAt' | 'clientName' | 'projectNumber' | 'fecha'
  sortDir?: 'asc' | 'desc'
}

export interface Project extends CreateProjectDto {
  id: string
  projectNumber?: string
  status?: string
  isActive?: boolean
  images?: ProjectImage[]
  visitDate?: FireTimestamp
  statusHistory?: ProjectStatusHistoryItem[]
  createdAt?: FireTimestamp
  updatedAt?: FireTimestamp
  client?: ProjectClientRef | null
  branch?: ProjectBranchRef | null
}
