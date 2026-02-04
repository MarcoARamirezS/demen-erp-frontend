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
     CLIENTES (DOMINIO)
  ========================= */
  {
    label: 'Clientes',
    icon: 'users', // entidad de negocio (NO usersGroup)
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
   INVENTARIO
========================= */
  {
    label: 'Inventario',
    icon: 'settings',
    permission: 'products:list',
    children: [
      {
        label: 'Productos',
        icon: 'cube',
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
        label: 'Proveedor · Producto',
        icon: 'link',
        to: '/supplier-products',
        permission: 'supplier_products:list',
      },
    ],
  },

  /* =========================
     SEGURIDAD (ADMIN)
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
