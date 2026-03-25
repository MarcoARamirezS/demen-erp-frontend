<template>
  <div class="form-control relative w-full" ref="wrapper">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </label>

    <!-- Trigger -->
    <div
      class="select select-bordered flex w-full cursor-pointer items-center justify-between"
      :class="[
        {
          'select-disabled pointer-events-none opacity-60': disabled,
          '!border-error !ring-1 !ring-error/20': !!error,
        },
      ]"
      @click="toggle"
    >
      <div class="flex min-w-0 items-center gap-3 truncate">
        <img
          v-if="selectedOption?.image"
          :src="selectedOption.image"
          class="h-6 w-6 rounded object-cover"
          alt="option"
        />

        <span v-if="selectedOption" class="truncate">
          {{ selectedOption.label }}
        </span>

        <span v-else class="truncate text-base-content/50">
          {{ placeholder || 'Seleccionar' }}
        </span>
      </div>

      <div class="ml-3 flex items-center gap-2">
        <span v-if="loading" class="loading loading-spinner loading-xs"></span>
        <span class="opacity-60">▾</span>
      </div>
    </div>

    <!-- Error -->
    <p v-if="error" class="mt-1 text-xs text-error">
      {{ error }}
    </p>

    <!-- Dropdown -->
    <div
      v-if="open && !disabled"
      class="absolute z-50 mt-1 w-full overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-lg"
    >
      <!-- Search -->
      <div v-if="searchable" class="border-b border-base-300 bg-base-100 p-2">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          class="input input-sm input-bordered w-full uppercase"
          :placeholder="searchPlaceholder || 'Buscar...'"
          @input="handleSearchInput"
          @click.stop
          @keydown.stop
        />
      </div>

      <!-- Options -->
      <div class="max-h-64 overflow-auto">
        <div
          v-for="opt in filteredOptions"
          :key="opt.value"
          class="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-base-200"
          @click.stop="select(opt)"
        >
          <img
            v-if="opt.image"
            :src="opt.image"
            class="h-6 w-6 rounded object-cover"
            alt="option"
          />

          <span class="truncate">{{ opt.label }}</span>

          <span v-if="modelValue === opt.value" class="ml-auto text-primary">✔</span>
        </div>

        <div v-if="!filteredOptions.length && !loading" class="px-3 py-2 text-base-content/60">
          {{ emptyText || 'Sin opciones disponibles' }}
        </div>

        <div
          v-if="loading && !filteredOptions.length"
          class="flex items-center gap-2 px-3 py-3 text-base-content/60"
        >
          <span class="loading loading-spinner loading-xs"></span>
          Buscando...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

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
    error?: string
    searchable?: boolean
    searchPlaceholder?: string
    loading?: boolean
  }>(),
  {
    modelValue: null,
    options: () => [],
    searchable: false,
    loading: false,
    error: '',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number): void
  (e: 'search', value: string): void
}>()

const open = ref(false)
const wrapper = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')

const safeOptions = computed<Option[]>(() => (Array.isArray(props.options) ? props.options : []))

const selectedOption = computed<Option | undefined>(() =>
  safeOptions.value.find(o => o.value === props.modelValue)
)

const normalizedSearch = computed(() => searchQuery.value.trim().toUpperCase())

const filteredOptions = computed<Option[]>(() => {
  if (!props.searchable || !normalizedSearch.value) {
    return safeOptions.value
  }

  return safeOptions.value.filter(opt =>
    `${opt.label} ${String(opt.value)}`.toUpperCase().includes(normalizedSearch.value)
  )
})

async function focusSearchInput() {
  if (!props.searchable) return
  await nextTick()
  searchInput.value?.focus()
}

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

function select(opt: Option) {
  emit('update:modelValue', opt.value)
  open.value = false
}

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  const upper = String(target.value || '').toUpperCase()
  searchQuery.value = upper
}

function resetSearch() {
  if (!searchQuery.value) {
    emit('search', '')
    return
  }

  searchQuery.value = ''
  emit('search', '')
}

function handleClickOutside(event: MouseEvent) {
  if (!wrapper.value) return
  if (!wrapper.value.contains(event.target as Node)) {
    open.value = false
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
  }
}

watch(open, async value => {
  if (value) {
    await focusSearchInput()
    return
  }

  if (props.searchable) {
    resetSearch()
  }
})

watch(
  () => searchQuery.value,
  value => {
    if (!props.searchable) return
    emit(
      'search',
      String(value || '')
        .trim()
        .toUpperCase()
    )
  }
)

onMounted(() => {
  if (process.client) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
  }
})

onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscape)
  }
})
</script>
