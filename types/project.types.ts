/* =========================
   PROJECTS
========================= */
export interface Project {
  id: string
  clientId: string
  clientAddressId: string // 👈 NUEVO
  fechaLevantamiento: string
  descripcion: string
  versionActual: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

/* =========================
   PROJECT VERSIONS
========================= */
export interface ProjectVersion {
  id: string
  projectId: string
  version: string
  descripcion: string
  esActual: boolean
  createdAt: string
}

/* =========================
   PROJECT PHOTOS
========================= */
export interface ProjectPhoto {
  id: string
  projectId: string
  versionId: string
  url: string
  secureUrl: string
  originalName: string
  uploadedBy: string
  source: 'web' | 'mobile'
  activo: boolean
  createdAt: string
}
