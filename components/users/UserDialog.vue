<template>
  <UiDialog v-model="open" size="xl" hide-header hide-close>
    <div
      class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl"
    >
      <!-- =====================================================
           HEADER
      ====================================================== -->
      <header
        class="sticky top-0 z-10 flex items-start gap-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <div class="rounded-full bg-primary/10 p-3 shrink-0">
          <Icon name="user" />
        </div>

        <div class="min-w-0 flex-1">
          <h2 class="font-semibold text-lg truncate text-primary">
            {{ mode === 'create' ? 'Nuevo usuario' : 'Editar usuario' }}
          </h2>
          <p class="text-xs opacity-60 truncate">Administración de accesos y roles</p>
        </div>

        <button class="btn btn-circle btn-sm btn-ghost" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- =====================================================
           CONTENT
      ====================================================== -->
      <section class="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <form class="space-y-8" @submit.prevent="submit">
          <!-- =========================
               DATOS PERSONALES
          ========================== -->
          <section class="space-y-4">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Datos personales
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UiInput v-model="form.nombre" label="Nombre *" />
              <UiInput v-model="form.apaterno" label="Apellido paterno *" />
              <UiInput v-model="form.amaterno" label="Apellido materno" />
            </div>
          </section>

          <!-- =========================
               CONTACTO
          ========================== -->
          <section class="space-y-4">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Contacto
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UiInput v-model="form.telefono" label="Teléfono" />
              <UiInput v-model="form.direccion" label="Dirección" />
              <UiInput v-model="form.ciudad" label="Ciudad" />
              <UiInput v-model="form.estado" label="Estado" />
            </div>
          </section>

          <!-- =========================
               ACCESO
          ========================== -->
          <section class="space-y-4">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Acceso
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <UiInput v-model="form.usuario" label="Usuario *" />

              <UiInput
                v-if="mode === 'create'"
                v-model="form.password"
                label="Contraseña *"
                type="password"
              />

              <UiToggle v-model="form.activo" label="Usuario activo" />
            </div>
          </section>

          <!-- =========================
               ROLES
          ========================== -->
          <section class="space-y-4">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Roles *
            </h3>

            <div
              class="flex flex-wrap gap-3 max-h-48 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-4"
            >
              <UiCheckbox
                v-for="r in rolesStore.activeRoles"
                :key="r.id"
                v-model="form.roleIds"
                :value="r.id"
                :label="r.name"
              />
            </div>
          </section>
        </form>
      </section>

      <!-- =====================================================
           FOOTER
      ====================================================== -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5"
      >
        <UiButton variant="ghost" type="button" class="w-full sm:w-auto" @click="open = false">
          Cancelar
        </UiButton>

        <UiButton variant="primary" class="w-full sm:w-auto" @click="submit"> Guardar </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRolesStore } from '~/stores/roles.store'
import { useUiStore } from '~/stores/ui.store'
import type { User, CreateUserDto } from '~/types/user'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiToggle from '~/components/ui/UiToggle.vue'
import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import UiButton from '~/components/ui/UiButton.vue'

const props = defineProps<{ modelValue: boolean; mode: 'create' | 'edit'; model?: User | null }>()
const emit = defineEmits(['update:modelValue', 'submit'])

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const rolesStore = useRolesStore()

onMounted(() => {
  if (!rolesStore.items.length) rolesStore.fetch()
})

const form = ref<Partial<CreateUserDto>>({
  nombre: '',
  apaterno: '',
  usuario: '',
  password: '',
  activo: true,
  roleIds: [],
})

watch(
  () => props.model,
  v => {
    form.value = v
      ? {
          nombre: v.nombre,
          apaterno: v.apaterno,
          amaterno: v.amaterno,
          direccion: v.direccion,
          telefono: v.telefono,
          ciudad: v.ciudad,
          estado: v.estado,
          usuario: v.usuario,
          activo: v.activo,
          roleIds: [...(v.roleIds ?? [])],
        }
      : {
          nombre: '',
          apaterno: '',
          usuario: '',
          password: '',
          activo: true,
          roleIds: [],
        }
  },
  { immediate: true }
)

const submit = () => {
  const ui = useUiStore()

  if (!form.value.nombre || !form.value.apaterno || !form.value.usuario) {
    ui.showToast('warning', 'Campos obligatorios')
    return
  }

  if (!form.value.roleIds?.length) {
    ui.showToast('warning', 'Selecciona al menos un rol')
    return
  }

  const payload = { ...form.value }

  if (!payload.password) {
    delete payload.password
  }

  emit('submit', payload)
}
</script>
