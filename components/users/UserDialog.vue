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
        <div class="shrink-0 rounded-full bg-primary/10 p-3">
          <Icon name="user" />
        </div>

        <div class="min-w-0 flex-1">
          <h2 class="truncate text-lg font-semibold text-primary">
            {{ mode === 'create' ? 'Nuevo usuario' : 'Editar usuario' }}
          </h2>
          <p class="truncate text-xs opacity-60">Administración de accesos y roles</p>
        </div>

        <button class="btn btn-circle btn-sm btn-ghost" @click="open = false">
          <Icon name="x" />
        </button>
      </header>

      <!-- =====================================================
           CONTENT
      ====================================================== -->
      <section class="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <!-- ALERTA DE VALIDACIÓN -->
        <div
          v-if="errorSummary.length"
          class="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm"
        >
          <div class="flex items-start gap-3">
            <Icon name="alert-triangle" class="mt-0.5 h-5 w-5 text-error" />

            <div class="flex-1">
              <p class="font-semibold text-error">Revisa los siguientes campos:</p>

              <ul class="mt-2 list-disc space-y-1 pl-5 text-base-content/80">
                <li v-for="item in errorSummary" :key="item.key">
                  <span class="font-medium">{{ item.label }}:</span>
                  {{ item.message }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <form class="space-y-8" @submit.prevent="submit">
          <!-- =========================
               DATOS PERSONALES
          ========================== -->
          <section class="space-y-4">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Datos personales
            </h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div data-error-field="nombre">
                <UiInput
                  v-model="form.nombre"
                  label="Nombre *"
                  placeholder="Ej: Marco"
                  :error="errors.nombre"
                />
              </div>

              <div data-error-field="apaterno">
                <UiInput
                  v-model="form.apaterno"
                  label="Apellido paterno *"
                  placeholder="Ej: Ramírez"
                  :error="errors.apaterno"
                />
              </div>

              <div data-error-field="amaterno">
                <UiInput
                  v-model="form.amaterno"
                  label="Apellido materno"
                  placeholder="Ej: López"
                  :error="errors.amaterno"
                />
              </div>
            </div>
          </section>

          <!-- =========================
               CONTACTO
          ========================== -->
          <section class="space-y-4">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Contacto
            </h3>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div data-error-field="telefono">
                <UiInput
                  v-model="form.telefono"
                  label="Teléfono"
                  placeholder="Ej: 4641234567"
                  :error="errors.telefono"
                />
              </div>

              <div data-error-field="direccion">
                <UiInput
                  v-model="form.direccion"
                  label="Dirección"
                  placeholder="Ej: Av. Universidad 123"
                  :error="errors.direccion"
                />
              </div>

              <div data-error-field="ciudad">
                <UiInput
                  v-model="form.ciudad"
                  label="Ciudad"
                  placeholder="Ej: Salamanca"
                  :error="errors.ciudad"
                />
              </div>

              <div data-error-field="estado">
                <UiInput
                  v-model="form.estado"
                  label="Estado"
                  placeholder="Ej: Guanajuato"
                  :error="errors.estado"
                />
              </div>
            </div>
          </section>

          <!-- =========================
               ACCESO
          ========================== -->
          <section class="space-y-4">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Acceso
            </h3>

            <div class="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
              <div data-error-field="usuario">
                <UiInput
                  v-model="form.usuario"
                  label="Usuario *"
                  placeholder="Ej: marcoramirez"
                  :error="errors.usuario"
                />
                <p class="mt-1 text-xs opacity-60">
                  Usa un nombre de usuario fácil de identificar y sin espacios.
                </p>
              </div>

              <div v-if="mode === 'create'" data-error-field="password">
                <UiInput
                  v-model="form.password"
                  label="Contraseña *"
                  type="password"
                  placeholder="Mínimo 10 caracteres"
                  :error="errors.password"
                />
                <p class="mt-1 text-xs opacity-60">Debe tener entre 10 y 200 caracteres.</p>
              </div>

              <UiToggle v-model="form.activo" label="Usuario activo" />
            </div>
          </section>

          <!-- =========================
               ROLES
          ========================== -->
          <section class="space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                Roles *
              </h3>

              <div class="text-xs opacity-60">{{ form.roleIds.length }} seleccionado(s)</div>
            </div>

            <div
              data-error-field="roleIds"
              class="max-h-48 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-4"
              :class="errors.roleIds ? 'border-error/40 bg-error/5' : ''"
            >
              <div v-if="rolesStore.activeRoles?.length" class="flex flex-wrap gap-3">
                <UiCheckbox
                  v-for="r in rolesStore.activeRoles"
                  :key="r.id"
                  v-model="form.roleIds"
                  :value="r.id"
                  :label="r.name"
                />
              </div>

              <div v-else class="text-sm opacity-60">No hay roles disponibles.</div>
            </div>

            <p class="text-xs opacity-60">
              Selecciona al menos un rol para definir qué podrá hacer este usuario en el sistema.
            </p>

            <p v-if="errors.roleIds" class="text-xs text-error">
              {{ errors.roleIds }}
            </p>
          </section>
        </form>
      </section>

      <!-- =====================================================
           FOOTER
      ====================================================== -->
      <footer
        class="sticky bottom-0 z-10 flex flex-col-reverse justify-end gap-3 border-t border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-5 sm:flex-row"
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
import { reactive, watch, computed, onMounted, nextTick } from 'vue'
import { useRolesStore } from '~/stores/roles.store'
import { useUiStore } from '~/stores/ui.store'
import type { User, CreateUserDto } from '~/types/user'
import Icon from '~/components/ui/Icon.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import UiInput from '~/components/ui/UiInput.vue'
import UiToggle from '~/components/ui/UiToggle.vue'
import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import UiButton from '~/components/ui/UiButton.vue'

type UserDialogForm = {
  nombre: string
  apaterno: string
  amaterno: string
  direccion: string
  telefono: string
  ciudad: string
  estado: string
  usuario: string
  password: string
  activo: boolean
  roleIds: string[]
  permissionCodes: string[]
}

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  model?: User | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submit', payload: Partial<CreateUserDto>): void
}>()

const ui = useUiStore()
const rolesStore = useRolesStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

function getDefaultForm(): UserDialogForm {
  return {
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
    permissionCodes: [],
  }
}

const form = reactive<UserDialogForm>(getDefaultForm())
const errors = reactive<Record<string, string>>({})

const fieldLabels: Record<string, string> = {
  nombre: 'Nombre',
  apaterno: 'Apellido paterno',
  amaterno: 'Apellido materno',
  direccion: 'Dirección',
  telefono: 'Teléfono',
  ciudad: 'Ciudad',
  estado: 'Estado',
  usuario: 'Usuario',
  password: 'Contraseña',
  roleIds: 'Roles',
}

const errorSummary = computed(() =>
  Object.entries(errors)
    .filter(([, message]) => !!message)
    .map(([key, message]) => ({
      key,
      label: fieldLabels[key] || key,
      message,
    }))
)

onMounted(() => {
  if (!rolesStore.items.length) {
    rolesStore.fetch()
  }
})

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function optionalString(value?: string | null) {
  return String(value ?? '').trim()
}

function hydrateForm(user?: User | null) {
  clearErrors()

  if (!user) {
    Object.assign(form, getDefaultForm())
    return
  }

  Object.assign(form, {
    ...getDefaultForm(),
    nombre: user.nombre ?? '',
    apaterno: user.apaterno ?? '',
    amaterno: user.amaterno ?? '',
    direccion: user.direccion ?? '',
    telefono: user.telefono ?? '',
    ciudad: user.ciudad ?? '',
    estado: user.estado ?? '',
    usuario: user.usuario ?? '',
    activo: user.activo ?? true,
    roleIds: [...(user.roleIds ?? [])],
    permissionCodes: [...(user.permissionCodes ?? [])],
    password: '',
  })
}

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen) {
      hydrateForm(props.model)
    } else {
      clearErrors()
    }
  },
  { immediate: true }
)

watch(
  () => props.model,
  value => {
    if (!props.modelValue) return
    hydrateForm(value)
  },
  { immediate: false }
)

async function focusFirstErrorField() {
  const firstKey = Object.keys(errors).find(key => errors[key])
  if (!firstKey) return

  await nextTick()

  const wrapper = document.querySelector(`[data-error-field="${firstKey}"]`)
  const target = wrapper?.querySelector('input, textarea, select, button') as HTMLElement | null

  if (wrapper) {
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (target?.focus) {
    target.focus()
  }
}

async function submit() {
  clearErrors()

  const nombre = optionalString(form.nombre)
  const apaterno = optionalString(form.apaterno)
  const amaterno = optionalString(form.amaterno)
  const direccion = optionalString(form.direccion)
  const telefono = optionalString(form.telefono)
  const ciudad = optionalString(form.ciudad)
  const estado = optionalString(form.estado)
  const usuario = optionalString(form.usuario)
  const password = String(form.password ?? '')
  const roleIds = [...new Set(form.roleIds)].filter(Boolean)
  const permissionCodes = [...new Set(form.permissionCodes)].filter(Boolean)

  if (!nombre) {
    errors.nombre = 'El nombre es obligatorio'
  }

  if (!apaterno) {
    errors.apaterno = 'El apellido paterno es obligatorio'
  }

  if (usuario.length < 3) {
    errors.usuario = 'Debe tener al menos 3 caracteres'
  } else if (usuario.length > 60) {
    errors.usuario = 'No puede exceder 60 caracteres'
  }

  if (props.mode === 'create') {
    if (!password) {
      errors.password = 'La contraseña es obligatoria'
    } else if (password.length < 10) {
      errors.password = 'Debe tener al menos 10 caracteres'
    } else if (password.length > 200) {
      errors.password = 'No puede exceder 200 caracteres'
    }
  } else if (password && (password.length < 10 || password.length > 200)) {
    errors.password = 'Si capturas una contraseña, debe tener entre 10 y 200 caracteres'
  }

  if (!roleIds.length) {
    errors.roleIds = 'Debes seleccionar al menos un rol'
  } else if (roleIds.some(id => id.length < 10)) {
    errors.roleIds = 'Uno o más roles no son válidos'
  }

  const firstError = Object.entries(errors).find(([, value]) => !!value)

  if (firstError) {
    const [key, message] = firstError
    ui.showToast('warning', `${fieldLabels[key] || key}: ${message}`)
    await focusFirstErrorField()
    return
  }

  const payload: Partial<CreateUserDto> = {
    nombre,
    apaterno,
    amaterno,
    direccion,
    telefono,
    ciudad,
    estado,
    usuario,
    activo: !!form.activo,
    roleIds,
    permissionCodes,
  }

  if (password) {
    payload.password = password
  }

  emit('submit', payload)
  open.value = false
}
</script>
