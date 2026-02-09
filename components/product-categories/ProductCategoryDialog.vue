<template>
  <UiDialog v-model="open" size="sm" hide-header hide-close>
    <!-- =========================
         HEADER (STICKY)
    ========================== -->
    <div
      class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <h2 class="text-lg font-semibold">
        {{ mode === 'create' ? 'Nueva categoría' : 'Editar categoría' }}
      </h2>

      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
        <Icon name="x" />
      </button>
    </div>

    <!-- =========================
         CONTENT (SCROLL)
    ========================== -->
    <div class="px-6 py-5 space-y-4 overflow-auto" style="max-height: calc(90vh - 160px)">
      <UiSelect v-model="form.familyId" label="Familia">
        <UiOption v-for="f in families" :key="f.id" :value="f.id">
          {{ f.name }}
        </UiOption>
      </UiSelect>

      <UiInput v-model="form.name" label="Nombre de la categoría" />
    </div>

    <!-- =========================
         FOOTER (STICKY)
    ========================== -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

      <UiButton variant="primary" @click="submit"> Guardar </UiButton>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, onMounted } from 'vue'
import { useProductFamiliesStore } from '~/stores/productFamilies.store'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: any
  familyId?: string
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const familiesStore = useProductFamiliesStore()
const families = computed(() => familiesStore.items)

const form = reactive({
  name: '',
  familyId: '',
})

onMounted(async () => {
  if (!familiesStore.items.length) {
    await familiesStore.fetch()
  }

  if (props.familyId) {
    form.familyId = props.familyId
  }
})

watch(
  () => props.model,
  v => {
    if (v) Object.assign(form, v)
    else {
      form.name = ''
      form.familyId = props.familyId || ''
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.name.trim() || !form.familyId) return
  emit('submit', { ...form })
  open.value = false
}
</script>
