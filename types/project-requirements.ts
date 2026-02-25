export type RequirementStatus = 'DRAFT' | 'SUBMITTED'

export interface RequirementImage {
  publicId: string
  url?: string
  secureUrl?: string
  bytes?: number
  format?: string
  width?: number
  height?: number
  uploadedAt?: any
  uploadedBy?: string
}

export interface ProjectRequirement {
  id: string
  projectId: string
  version: number
  status: RequirementStatus

  tableroTipo?: string | null
  tableroOtros?: string | null

  ubicacion?: string[]
  tipoTablero?: string[]

  dimensiones?: string | null
  voltaje?: string | null
  sistemaAutomatizar?: string[]

  controlador?: string | null
  comunicacion?: string | null
  señales?: string | null
  sensoresActuadores?: string | null
  anotacionesTablero?: string | null

  tipoTubo?: string[]
  medidaTubo?: string[]
  cantidadTubos?: number | null
  conduits?: {
    LR?: number | null
    LL?: number | null
    LB?: number | null
    T?: number | null
  } | null
  accesorios?: string | null
  abrazaderas?: {
    una?: number | null
    omega?: number | null
    clip?: number | null
    unicanal?: number | null
  } | null

  cable?: { calibre?: string[]; metros?: number | null; color?: string[] } | null

  plataforma?: string | null
  descripcionFuncional?: string | null

  images?: RequirementImage[]

  submittedAt?: any
  submittedBy?: string
  submitComment?: string | null

  createdAt?: any
  updatedAt?: any
}

export type CreateRequirementDto = Omit<ProjectRequirement, 'id' | 'version' | 'status'>
