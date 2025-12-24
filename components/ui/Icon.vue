<template>
  <svg
    v-if="icon"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    :class="sizeClass"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      :d="icon"
    />
  </svg>
</template>

<script setup>
const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: "md" },
})

const icons = {
  // Core (20+)
  check: "M5 13l4 4L19 7",
  close: "M6 18L18 6M6 6l12 12",
  error: "M12 8v4m0 4h.01",
  warning: "M12 9v2m0 4h.01",
  info: "M13 16h-1v-4h-1m1-4h.01",

  plus: "M12 4v16m8-8H4",
  minus: "M20 12H4",
  edit: "M11 4h2l7 7-2 2-7-7V4z",
  trash: "M6 7h12M9 7V5h6v2m-8 0l1 12h6l1-12",
  search: "M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16",

  user: "M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z M4 20a8 8 0 0 1 16 0",
  lock: "M12 17v-2m-4 2v-4a4 4 0 0 1 8 0v4",
  eye: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7",
  eyeOff: "M3 3l18 18",

  arrowRight: "M9 5l7 7-7 7",
  arrowLeft: "M15 19l-7-7 7-7",
  chevronDown: "M6 9l6 6 6-6",
  chevronUp: "M6 15l6-6 6 6",
}

const icon = computed(() => icons[props.name])

const sizeClass = computed(() => ({
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
}[props.size]))
</script>
