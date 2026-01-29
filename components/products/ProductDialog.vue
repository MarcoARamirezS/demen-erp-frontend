<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiButton from '~/components/ui/UiButton.vue'
import Icon from '~/components/ui/Icon.vue'
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
  name: '',
  description: '',
  active: true,
})

watch(
  () => props.model,
  v => {
    if (!v) {
      form.value = { name: '', description: '', active: true }
      return
    }
    form.value = {
      name: v.name,
      description: v.description,
      active: v.active,
    }
  },
  { immediate: true }
)

function submit() {
  if (!form.value.name) {
    ui.showToast('warning', 'El nombre es obligatorio')
    return
  }
  emit('submit', form.value)
  open.value = false
}
</script>

<template>
  <UiDialog v-model="open" size="xl" :hide-close="true">
    <!-- HEADER -->
    <header
      class="sticky top-0 z-10 flex justify-between border-b border-base-300 bg-base-200 px-5 py-4"
    >
      <div class="flex items-center gap-4">
        <div class="rounded-full bg-primary/10 p-3">
          <Icon name="box" />
        </div>
        <div>
          <h2 class="font-semibold">
            {{ mode === 'create' ? 'Nuevo producto' : 'Editar producto' }}
          </h2>
          <p class="text-xs opacity-60">Información general</p>
        </div>
      </div>

      <button class="btn btn-sm btn-circle btn-ghost" @click="open = false">
        <Icon name="close" />
      </button>
    </header>

    <!-- CONTENT -->
    <section class="px-5 py-6 space-y-4 max-h-[calc(90vh-160px)] overflow-y-auto">
      <UiInput v-if="mode === 'edit'" :model-value="model?.sku" label="SKU" readonly />

      <UiInput v-model="form.name" label="Nombre *" />
      <UiInput v-model="form.description" label="Descripción" />
    </section>

    <!-- FOOTER -->
    <footer
      class="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-base-300 bg-base-200 px-5 py-4"
    >
      <UiButton variant="outline" @click="open = false">Cancelar</UiButton>
      <UiButton variant="primary" @click="submit">Guardar</UiButton>
    </footer>
  </UiDialog>
</template>
