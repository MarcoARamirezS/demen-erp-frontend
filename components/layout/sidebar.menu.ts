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
  children: SidebarMenuItem[]
}

export type SidebarMenuItem = SidebarLink | SidebarGroup

/* =========================
   SIDEBAR MENU
========================= */
export const sidebarMenu: SidebarMenuItem[] = [
  {
    label: 'Inicio',
    icon: 'home',
    to: '/dashboard',
  },

  // =====================
  // CLIENTES
  // =====================
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

  // =====================
  // PROYECTOS
  // =====================
  {
    label: 'Proyectos',
    icon: 'shield',
    permission: 'projects:list',
    children: [
      {
        label: 'Listado',
        icon: 'clipboardList',
        to: '/projects',
        permission: 'projects:list',
      },
    ],
  },

  // =====================
  // INVENTARIO
  // =====================
  {
    label: 'Inventario',
    icon: 'home',
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
      {
        label: 'Inventario',
        icon: 'archive',
        to: '/inventory',
        permission: 'inventory:list',
      },
      {
        label: 'Recepciones',
        icon: 'download',
        to: '/recepciones',
        permission: 'recepciones:list',
      },
    ],
  },

  // =====================
  // CONFIGURACIÓN
  // =====================
  {
    label: 'Configuración',
    icon: 'cog',
    children: [
      {
        label: 'Catálogos',
        icon: 'collection',
        permission: 'product_families:list',
        children: [
          {
            label: 'Familias de productos',
            icon: 'layers',
            to: '/settings/catalogos/familias',
            permission: 'product_families:list',
          },
          {
            label: 'Categorías de productos',
            icon: 'tag',
            to: '/settings/catalogos/categorias',
            permission: 'product_categories:list',
          },
        ],
      },
    ],
  },

  // =====================
  // SEGURIDAD
  // =====================
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

  // =====================
  // AUDITORÍA
  // =====================
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
