<template>
  <UiDialog
    v-model="open"
    size="xl"
    :title="mode === 'create' ? 'Crear usuario' : 'Editar usuario'"
  >
    <form class="space-y-8" @submit.prevent="submit">
      <div class="flex items-start gap-4 rounded-lg bg-base-200/60 p-4">
        <div class="rounded-full bg-primary/10 p-3">
          <Icon name="user" />
        </div>
        <div>
          <h2 class="font-semibold text-lg">
            {{ mode === 'create' ? 'Nuevo usuario' : 'Editar usuario' }}
          </h2>
          <p class="text-sm text-base-content/60">Administración de accesos y roles del sistema</p>
        </div>
      </div>
      <section class="space-y-3">
        <h3 class="font-semibold flex items-center gap-2">
          <Icon name="user" size="sm" />
          Datos personales
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UiInput v-model="form.nombre" label="Nombre *" placeholder="Ej. Juan" />

          <UiInput v-model="form.apaterno" label="Apellido paterno *" placeholder="Ej. Pérez" />

          <UiInput v-model="form.amaterno" label="Apellido materno" placeholder="Ej. Gómez" />
        </div>
      </section>
      <section class="space-y-3">
        <h3 class="font-semibold flex items-center gap-2">
          <Icon name="home" size="sm" />
          Contacto y ubicación
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput v-model="form.telefono" label="Teléfono" placeholder="Ej. 477 123 4567" />

          <UiInput
            v-model="form.direccion"
            label="Dirección"
            placeholder="Calle, número, colonia"
          />

          <UiInput v-model="form.ciudad" label="Ciudad" placeholder="Ej. León" />

          <UiInput v-model="form.estado" label="Estado" placeholder="Ej. Guanajuato" />
        </div>
      </section>
      <section class="space-y-3">
        <h3 class="font-semibold flex items-center gap-2">
          <Icon name="lock" size="sm" />
          Acceso al sistema
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UiInput
            v-model="form.usuario"
            label="Usuario *"
            placeholder="Usuario para iniciar sesión"
          />

          <UiInput
            v-if="mode === 'create'"
            v-model="form.password"
            label="Contraseña *"
            type="password"
            placeholder="Mínimo 10 caracteres"
          />

          <UiToggle v-model="form.activo" label="Usuario activo" />
        </div>

        <p class="text-xs text-base-content/60">
          Si el usuario está inactivo, no podrá iniciar sesión en el sistema.
        </p>
      </section>
      <section class="space-y-3">
        <h3 class="font-semibold flex items-center gap-2">
          <Icon name="key" size="sm" />
          Roles asignados *
        </h3>

        <p class="text-xs text-base-content/60">
          Selecciona uno o más roles para definir los accesos del usuario.
        </p>

        <div class="flex flex-wrap gap-3">
          <UiCheckbox
            v-for="r in rolesStore.activeRoles"
            :key="r.id"
            v-model="form.roleIds"
            :value="r.id"
            :label="r.name"
          />
        </div>
      </section>
      <div class="flex justify-end gap-3 pt-6 border-t">
        <UiButton variant="ghost" type="button" @click="open = false"> Cancelar </UiButton>

        <UiButton variant="primary" type="submit">
          {{ mode === 'create' ? 'Guardar usuario' : 'Guardar cambios' }}
        </UiButton>
      </div>
    </form>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { User, CreateUserDto } from '~/types/user'
import { useUiStore } from '~/stores/ui.store'
import { useRolesStore } from '~/stores/roles.store'
import Icon from '~/components/ui/Icon.vue'

// IMPORTS EXPLÍCITOS (clave)
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiToggle from '~/components/ui/UiToggle.vue'
import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import UiButton from '~/components/ui/UiButton.vue'

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: User | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: Partial<CreateUserDto>): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const rolesStore = useRolesStore()

onMounted(() => {
  if (!rolesStore.items.length) {
    rolesStore.fetch()
  }
})

const form = ref<Partial<CreateUserDto>>({
  nombre: '',
  apaterno: '',
  amaterno: '',
  direccion: '',
  telefono: '',
  ciudad: '',
  estado: '',
  usuario: '',
  password: '',
  activo: true,
  roleIds: [],
})

watch(
  () => props.model,
  v => {
    if (props.mode === 'edit' && v) {
      form.value = { ...v, password: '' }
    } else {
      form.value = {
        nombre: '',
        apaterno: '',
        amaterno: '',
        direccion: '',
        telefono: '',
        ciudad: '',
        estado: '',
        usuario: '',
        password: '',
        activo: true,
        roleIds: [],
      }
    }
  },
  { immediate: true }
)

const submit = () => {
  const ui = useUiStore()

  if (!form.value.nombre || !form.value.apaterno || !form.value.usuario) {
    ui.showToast('warning', 'Completa los campos obligatorios')
    return
  }

  if (!form.value.roleIds?.length) {
    ui.showToast('warning', 'Selecciona al menos un rol')
    return
  }

  emit('submit', form.value)
}
</script>
