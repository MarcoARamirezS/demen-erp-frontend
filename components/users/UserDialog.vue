<template>
  <UiDialog v-model="open" size="xl" hide-close>
    <!-- =========================
         HEADER (STICKY)
    ========================== -->
    <div
      class="sticky top-0 z-10 flex items-start gap-4 border-b border-base-300 bg-base-200 px-6 py-4"
    >
      <div class="rounded-full bg-primary/10 p-3 shrink-0">
        <Icon name="user" />
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="font-semibold text-lg truncate">
          {{ mode === 'create' ? 'Nuevo usuario' : 'Editar usuario' }}
        </h2>
        <p class="text-xs opacity-60 truncate">Administración de accesos y roles</p>
      </div>

      <button type="button" class="btn btn-circle btn-sm btn-ghost" @click="open = false">
        <Icon name="x" />
      </button>
    </div>

    <!-- =========================
         CONTENT (SCROLL)
    ========================== -->
    <div class="px-6 py-5 overflow-auto" style="max-height: calc(90vh - 160px)">
      <form class="space-y-8" @submit.prevent="submit">
        <!-- =========================
             DATOS PERSONALES
        ========================== -->
        <section class="space-y-3">
          <h3 class="font-semibold flex items-center gap-2">
            <Icon name="user" size="sm" />
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
        <section class="space-y-3">
          <h3 class="font-semibold flex items-center gap-2">
            <Icon name="home" size="sm" />
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
        <section class="space-y-3">
          <h3 class="font-semibold flex items-center gap-2">
            <Icon name="lock" size="sm" />
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
        <section class="space-y-3">
          <h3 class="font-semibold flex items-center gap-2">
            <Icon name="key" size="sm" />
            Roles *
          </h3>

          <div
            class="flex flex-wrap gap-3 max-h-48 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-3"
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
    </div>

    <!-- =========================
         FOOTER (STICKY)
    ========================== -->
    <div
      class="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-base-300 bg-base-200 px-6 py-4"
    >
      <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

      <UiButton variant="primary" type="submit" @click="submit"> Guardar </UiButton>
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
onMounted(() => !rolesStore.items.length && rolesStore.fetch())

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

  // 🔥 CLAVE: si password está vacío, NO se envía
  if (!payload.password) {
    delete payload.password
  }

  emit('submit', payload)
}
</script>
