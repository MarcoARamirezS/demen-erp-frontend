/* =========================
   TYPES
========================= */
export interface SidebarBase {
  label: string
  icon?: string
  permission?: string
}

export interface SidebarLink extends SidebarBase {
  to: string
}

export interface SidebarGroup extends SidebarBase {
  children: SidebarLink[]
}

export type SidebarMenuItem = SidebarLink | SidebarGroup

/* =========================
   SIDEBAR MENU
========================= */
export const sidebarMenu: SidebarMenuItem[] = [
  /* =========================
     DASHBOARD
  ========================= */
  {
    label: 'Inicio',
    icon: 'home',
    to: '/',
  },

  /* =========================
     CLIENTES
  ========================= */
  {
    label: 'Clientes',
    icon: 'users',
    permission: 'clients:list',
    children: [
      {
        label: 'Listado',
        icon: 'documentText',
        to: '/clients',
        permission: 'clients:list',
      },
    ],
  },

  /* =========================
     PROYECTOS
  ========================= */
  {
    label: 'Proyectos',
    icon: 'briefcase',
    permission: 'projects:list',
    children: [
      {
        label: 'Listado',
        icon: 'documentText',
        to: '/projects',
        permission: 'projects:list',
      },
    ],
  },

  /* =========================
   CATÁLOGOS
========================= */
  {
    label: 'Catálogos',
    icon: 'database',
    permission: 'products:list',
    children: [
      {
        label: 'Productos',
        icon: 'box',
        to: '/products',
        permission: 'products:list',
      },
      {
        label: 'Proveedores',
        icon: 'truck',
        to: '/suppliers',
        permission: 'suppliers:list',
      },
      {
        label: 'Productos por proveedor',
        icon: 'link',
        to: '/supplier-products',
        permission: 'supplier_products:list',
      },
    ],
  },

  /* =========================
     SEGURIDAD
  ========================= */
  {
    label: 'Seguridad',
    icon: 'shield',
    children: [
      {
        label: 'Usuarios',
        icon: 'user',
        to: '/usuarios',
        permission: 'users:list',
      },
      {
        label: 'Roles',
        icon: 'key',
        to: '/roles',
        permission: 'roles:list',
      },
    ],
  },

  /* =========================
     AUDITORÍA
  ========================= */
  {
    label: 'Auditoría',
    icon: 'clipboard',
    children: [
      {
        label: 'Bitácora',
        icon: 'search',
        to: '/audit',
        permission: 'audit:list',
      },
    ],
  },
]
