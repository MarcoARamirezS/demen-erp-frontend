// sidebar.menu.ts
export interface SidebarMenuItem {
  label: string
  icon?: string
  to?: string
  permission?: string
  children?: SidebarMenuItem[]
}

export const sidebarMenu: SidebarMenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'home',
    to: '/',
  },
  {
    label: 'Seguridad',
    children: [
      {
        label: 'Usuarios',
        icon: 'users',
        to: '/usuarios',
        permission: 'users:read',
      },
      {
        label: 'Roles',
        icon: 'shield',
        to: '/roles',
        permission: 'roles:read',
      },
      {
        label: 'Permisos',
        icon: 'key',
        to: '/permisos',
        permission: 'permissions:read',
      },
    ],
  },
  {
    label: 'Auditoría',
    children: [
      {
        label: 'Bitácora',
        icon: 'history',
        to: '/audit',
        permission: 'audit:list',
      },
    ],
  },
]
