<template>
  <div class="form-control w-full relative" ref="wrapper">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </label>

    <!-- Trigger -->
    <div
      class="select select-bordered w-full flex items-center justify-between cursor-pointer"
      :class="{ 'select-disabled opacity-60 pointer-events-none': disabled }"
      @click="toggle"
    >
      <div class="flex items-center gap-3 truncate">
        <img
          v-if="selectedOption?.image"
          :src="selectedOption.image"
          class="w-6 h-6 rounded object-cover"
        />

        <span v-if="selectedOption">
          {{ selectedOption.label }}
        </span>

        <span v-else class="text-base-content/50">
          {{ placeholder || 'Seleccionar' }}
        </span>
      </div>

      <span class="opacity-60">▾</span>
    </div>

    <!-- Dropdown -->
    <div
      v-if="open && !disabled"
      class="absolute z-50 mt-1 w-full bg-base-100 border border-base-300 rounded-box shadow-lg max-h-64 overflow-auto"
    >
      <div
        v-for="opt in safeOptions"
        :key="opt.value"
        class="px-3 py-2 hover:bg-base-200 cursor-pointer flex items-center gap-3"
        @click="select(opt)"
      >
        <img v-if="opt.image" :src="opt.image" class="w-6 h-6 rounded object-cover" />

        <span>{{ opt.label }}</span>

        <span v-if="modelValue === opt.value" class="ml-auto text-primary"> ✔ </span>
      </div>

      <div v-if="!safeOptions.length && emptyText" class="px-3 py-2 text-base-content/60">
        {{ emptyText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type Option = {
  label: string
  value: string | number
  image?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null
    label?: string
    disabled?: boolean
    placeholder?: string
    emptyText?: string
    options?: Option[]
  }>(),
  {
    modelValue: null,
    options: () => [], // 🔥 SSR SAFE
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number): void
}>()

const open = ref(false)
const wrapper = ref<HTMLElement | null>(null)

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

function select(opt: Option) {
  emit('update:modelValue', opt.value)
  open.value = false
}

/* =========================
   🔐 SSR SAFE COMPUTEDS
========================= */

const safeOptions = computed<Option[]>(() => (Array.isArray(props.options) ? props.options : []))

const selectedOption = computed<Option | undefined>(() =>
  safeOptions.value.find(o => o.value === props.modelValue)
)

/* =========================
   Click Outside (client only)
========================= */

function handleClickOutside(event: MouseEvent) {
  if (!wrapper.value) return
  if (!wrapper.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  if (process.client) {
    document.addEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
