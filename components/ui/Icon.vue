<template>
  <svg
    v-if="icon"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    :class="sizeClass"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type IconSize = 'sm' | 'md' | 'lg'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'md' },
})

const icons: Record<string, string> = {
  // Core
  check: 'M5 13l4 4L19 7',
  close: 'M6 18L18 6M6 6l12 12',
  error: 'M12 8v4m0 4h.01',
  warning: 'M12 9v2m0 4h.01',
  info: 'M13 16h-1v-4h-1m1-4h.01',

  plus: 'M12 4v16m8-8H4',
  minus: 'M20 12H4',
  edit: 'M11 4h2l7 7-2 2-7-7V4z',
  trash: 'M6 7h12M9 7V5h6v2m-8 0l1 12h6l1-12',
  search: 'M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16',

  // Auth / Users
  user: 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z M4 20a8 8 0 0 1 16 0',
  users: 'M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87M16 3.13a4 4 0 1 1-2 7.75',

  // Security
  lock: 'M12 17v-2m-4 2v-4a4 4 0 0 1 8 0v4',
  lockClosed: 'M7 11V7a5 5 0 0 1 10 0v4m-9 0h8v10H8V11z',
  key: 'M21 2l-2 2m-2 2l-2 2m-2 2l-2 2M7 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z',

  shield: 'M12 2l7 4v6c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-4z',

  // Navigation
  home: 'M3 12l9-9 9 9v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V15h-2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  arrowRight: 'M9 5l7 7-7 7',
  arrowLeft: 'M15 19l-7-7 7-7',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',

  // Audit
  clipboard: 'M9 2h6v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2z',

  audit: 'M9 17v-2h6v2m-6-4V7h6v6',

  roles: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0',
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
