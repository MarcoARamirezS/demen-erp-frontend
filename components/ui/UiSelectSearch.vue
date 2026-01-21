<template>
  <div ref="container" class="space-y-1">
    <label v-if="label" class="text-sm font-medium text-base-content">
      {{ label }}
    </label>

    <div class="relative">
      <!-- Input -->
      <input
        v-model="search"
        type="text"
        class="input input-bordered w-full pr-10"
        :placeholder="placeholder"
        @focus="open = true"
      />

      <!-- Dropdown -->
      <div
        v-if="open"
        class="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-base-300 bg-base-100 shadow-lg"
      >
        <div
          v-for="item in filteredItems"
          :key="item.value"
          class="cursor-pointer px-4 py-2 hover:bg-base-200"
          @click.stop="select(item)"
        >
          {{ item.label }}
        </div>

        <div v-if="!filteredItems.length" class="px-4 py-2 text-sm text-base-content/60">
          Sin resultados
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
  items: { value: string; label: string }[]
  label?: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const search = ref('')
const container = ref<HTMLElement | null>(null)

/* =========================
   FILTRADO
========================= */
const filteredItems = computed(() => {
  if (!search.value.trim()) {
    return props.items
  }

  return props.items.filter(i => i.label.toLowerCase().includes(search.value.toLowerCase()))
})

/* =========================
   SELECT
========================= */
function select(item: { value: string; label: string }) {
  emit('update:modelValue', item.value)
  search.value = item.label
  open.value = false
}

/* =========================
   SYNC SELECCIÓN
========================= */
watch(
  () => props.modelValue,
  v => {
    const found = props.items.find(i => i.value === v)
    if (found) search.value = found.label
  },
  { immediate: true }
)

/* =========================
   CLICK FUERA (CORRECTO)
========================= */
function onClickOutside(e: MouseEvent) {
  if (!container.value) return
  if (!container.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>
