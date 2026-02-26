<template>
  <svg
    v-if="icon"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    :class="sizeClass"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type IconSize = 'sm' | 'md' | 'lg'

const props = defineProps<{
  name: string
  size?: IconSize
}>()

/**
 * Icon paths (Heroicons outline style)
 */
const icons: Record<string, string> = {
  // Core
  check: 'M5 13l4 4L19 7',
  close: 'M6 18L18 6M6 6l12 12',
  error: 'M12 8v4m0 4h.01',
  warning: 'M12 9v2m0 4h.01',
  info: 'M13 16h-1v-4h-1m1-4h.01',

  // Actions
  plus: 'M12 4v16m8-8H4',
  minus: 'M20 12H4',
  edit: 'M11 4h2l7 7-2 2-7-7V4z',
  trash: 'M6 7h12M9 7V5h6v2m-8 0l1 12h6l1-12',
  search: 'M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16',

  // 👇👇👇 FIX CLAVE
  menu: 'M4 6h16M4 12h16M4 18h16',

  // Users / Auth
  user: 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z M4 20a8 8 0 0 1 16 0',
  users: 'M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87M16 3.13a4 4 0 1 1-2 7.75',

  // Security
  lock: 'M12 17v-2m-4 2v-4a4 4 0 0 1 8 0v4',
  key: 'M21 2l-2 2m-2 2l-2 2m-2 2l-2 2M7 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z',
  shield: 'M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z',

  // Navigation
  home: 'M3 12l9-9 9 9v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V15h-2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',

  // Audit
  clipboard: 'M9 2h6v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2z',

  // Settings / UI
  settings:
    'M10.325 4.317a1 1 0 0 1 .95-.69h1.45a1 1 0 0 1 .95.69l.36 1.08a1 1 0 0 0 .95.69h1.18a1 1 0 0 1 .71 1.71l-.84.84a1 1 0 0 0 0 1.41l.84.84a1 1 0 0 1-.71 1.71h-1.18a1 1 0 0 0-.95.69l-.36 1.08a1 1 0 0 1-.95.69h-1.45a1 1 0 0 1-.95-.69l-.36-1.08a1 1 0 0 0-.95-.69H8.84a1 1 0 0 1-.71-1.71l.84-.84a1 1 0 0 0 0-1.41l-.84-.84a1 1 0 0 1 .71-1.71h1.18a1 1 0 0 0 .95-.69l.36-1.08z',
  cog: 'M11.983 13.7a1.717 1.717 0 1 0 0-3.434 1.717 1.717 0 0 0 0 3.434z',

  bell: 'M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17a2 2 0 0 1-.6 1.43L4 17h5m6 0a3 3 0 0 1-6 0',

  calendar:
    'M8 7V3m8 4V3m-9 8h10m-13 8h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z',
  clock: 'M12 6v6l4 2',

  document: 'M7 2h8l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z',
  documentText: 'M9 12h6m-6 4h6m-6-8h6',

  chartBar: 'M5 12h3v7H5v-7zm5-4h3v11h-3V8zm5-4h3v15h-3V4',
  chartPie: 'M11 3.055A9 9 0 1 0 20.945 13H11V3.055z',

  database:
    'M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3-3.582-3-8-3-8 1.343-8 3zm0 6c0 1.657 3.582 3 8 3s8-1.343 8-3m-16 6c0 1.657 3.582 3 8 3s8-1.343 8-3',

  filter: 'M3 4h18l-7 8v6l-4 2v-8L3 4z',

  download: 'M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 4v10m0 0l-4-4m4 4l4-4',
  upload: 'M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 20V10m0 0l-4 4m4-4l4 4',

  refresh: 'M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0 0 14-7M19 5a9 9 0 0 0-14 7',

  eye: 'M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M3 3l18 18',

  lockOpen: 'M5 11h14v10H5V11zm3-4a4 4 0 0 1 8 0',

  clipboardCheck:
    'M9 2h6v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2zm2 12l2 2 4-4',

  exclamation: 'M12 8v4m0 4h.01',
  dotsVertical: 'M12 5h.01M12 12h.01M12 19h.01',
  // Clients
  usersGroup:
    'M7 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M14 21v-1a6 6 0 0 1 8 0v1',
  location:
    'M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
  // Inventory / Catalogs
  cube: 'M20 7l-8-4-8 4v10l8 4 8-4V7z M12 3v18 M4 7l8 4 8-4',

  truck:
    'M9 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M1 5h11v10h-1a3 3 0 0 0-6 0H3a2 2 0 0 1-2-2V5zm12 2h5l3 3v5h-1a3 3 0 0 0-6 0h-1V7z',

  link: 'M10 14a5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 7l-1 1 M14 10a5 5 0 0 1 0 7l-2 2a5 5 0 0 1-7-7l1-1',

  archive:
    'M4 3h16a2 2 0 0 1 2 2v2H2V5a2 2 0 0 1 2-2zm-2 6h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9zm6 3h8',
  /* =========================
     CLIENT STATUS / ACTIONS
  ========================== */
  power: 'M12 3v9m6.36-6.36a9 9 0 1 1-12.72 0',
  checkCircle:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm-1-5l-4-4 1.5-1.5L11 14l5.5-5.5L18 10l-7 7z',
  xCircle: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm-3-7l6-6m0 6l-6-6',
  ban: 'M18 6L6 18M6 6l12 12',
  toggleOn: 'M4 12a8 8 0 0 1 16 0 8 8 0 0 1-16 0zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  toggleOff: 'M4 12a8 8 0 0 0 16 0 8 8 0 0 0-16 0zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',

  /* =========================
     ERP / BUSINESS
  ========================== */
  cash: 'M3 10h18M3 14h18M5 6h14v12H5V6z',
  creditCard: 'M3 6h18v12H3V6zm0 4h18',
  building: 'M3 21h18M9 21V9h6v12M5 9h14',
  factory: 'M3 21h18M3 10l6-4v4l6-4v14H3V10z',
  briefcase: 'M3 7h18v13H3V7zm6-4h6v4H9V3z',

  /* =========================
     NAVIGATION EXTRA
  ========================== */
  arrowRight: 'M5 12h14m-6-6l6 6-6 6',
  arrowLeft: 'M19 12H5m6-6l-6 6 6 6',
  arrowUp: 'M12 19V5m-6 6l6-6 6 6',
  arrowDown: 'M12 5v14m6-6l-6 6-6-6',

  /* =========================
     UI / COMMON EXTRA
  ========================== */
  logout: 'M16 17l5-5-5-5M21 12H9m4 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8',
  login: 'M8 7l-5 5 5 5M3 12h12m-4-9h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  heart: 'M12 21s-6-4.35-9-8.5C-1 6 4 2 8 6c2-4 9-4 11 2-3 4.15-9 8.5-9 8.5z',
  bookmark: 'M6 2h12v20l-6-4-6 4V2z',
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5h20v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z',
  folder: 'M3 7h5l2 2h11v11H3V7z',
  folderOpen: 'M3 7h5l2 2h11l-2 9H5L3 7z',
  clipboardList: 'M9 2h6v2h3v18H6V4h3V2zm0 6h6m-6 4h6m-6 4h6',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 0v20m-8-10h16',
}

const icon = computed(() => icons[props.name])

const sizeClass = computed(() => {
  const sizes: Record<IconSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }
  const size: IconSize = props.size ?? 'md'
  return sizes[size]
})
</script>
