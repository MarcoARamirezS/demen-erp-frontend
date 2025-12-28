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

export const sidebarMenu: SidebarMenuItem[] = [
  {
    label: 'Inicio',
    icon: 'home',
    to: '/',
  },
  {
    label: 'Seguridad',
    icon: 'shield',
    children: [
      {
        label: 'Usuarios',
        icon: 'user',
        to: '/usuarios',
        permission: 'users:read',
      },
      {
        label: 'Roles',
        icon: 'key',
        to: '/roles',
        permission: 'roles:read',
      },
    ],
  },
  {
    label: 'Auditoría',
    icon: 'clipboard',
    children: [
      {
        label: 'Bitácora',
        icon: 'search',
        to: '/audit',
        permission: 'audit:read',
      },
    ],
  },
]
