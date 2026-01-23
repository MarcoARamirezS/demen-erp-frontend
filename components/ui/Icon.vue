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
  documentText: 'M9 12h6m-6 4h6m-6-8h6',
  briefcase:
    'M10 4h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2zm4 4V6h-4v2h4zm-9 4v2h14v-2H5z',
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
