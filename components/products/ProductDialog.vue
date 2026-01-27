<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import { useUiStore } from '~/stores/ui.store'
import type { Product, CreateProductDto } from '~/types/product'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: Product | null
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const ui = useUiStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const form = ref<CreateProductDto>({
  sku: '',
  name: '',
  description: '',
  active: true,
})

watch(
  () => props.model,
  v => {
    form.value = v
      ? {
          sku: v.sku,
          name: v.name,
          description: v.description,
          active: v.active,
        }
      : { sku: '', name: '', description: '', active: true }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.sku || !form.value.name) {
    ui.showToast('warning', 'SKU y nombre son obligatorios')
    return
  }

  emit('submit', form.value)
  open.value = false
}
</script>

<template>
  <UiDialog
    v-model="open"
    size="lg"
    :title="mode === 'create' ? 'Nuevo producto' : 'Editar producto'"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <UiInput v-model="form.sku" label="SKU *" />
      <UiInput v-model="form.name" label="Nombre *" />
      <UiInput v-model="form.description" label="Descripción" />

      <div class="flex justify-end gap-3 border-t pt-4">
        <UiButton variant="ghost" type="button" @click="open = false">Cancelar</UiButton>
        <UiButton variant="primary" type="submit">Guardar</UiButton>
      </div>
    </form>
  </UiDialog>
</template>
