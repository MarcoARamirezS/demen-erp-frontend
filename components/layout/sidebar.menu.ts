export interface SidebarMenuItem {
  label: string
  icon: string
  to: string
  permission?: string
  children?: SidebarMenuItem[]
}

export const sidebarMenu: SidebarMenuItem[] = [
  {
    label: "Inicio",
    icon: "home",
    to: "/",
  },
  {
    label: "Usuarios",
    icon: "users",
    to: "/usuarios",
    permission: "users.read",
  },
  {
    label: "Roles y permisos",
    icon: "shield",
    to: "/roles",
    permission: "roles.read",
  },
]
