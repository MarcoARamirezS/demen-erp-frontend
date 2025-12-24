<template>
  <div class="card bg-base-100 shadow-md border border-base-300 w-full">
    <div class="card-body gap-6">
      <!-- Logo -->
      <div class="flex justify-center">
        <img
          src="/logo-danam-transparent.svg"
          alt="DANAM"
          class="h-20"
        />
      </div>

      <!-- Title -->
      <div class="text-center">
        <h2 class="text-xl font-semibold text-base-content">
          Acceso al sistema
        </h2>
        <p class="text-sm text-base-content/60 mt-1">
          Ingresa tus credenciales
        </p>
      </div>

      <!-- Form -->
      <div class="space-y-4 mt-2">
        <UiInput
          v-model="form.username"
          placeholder="Usuario"
          icon="user"
          autocomplete="username"
        />

        <UiInput
          v-model="form.password"
          type="password"
          placeholder="Contraseña"
          icon="lock"
          autocomplete="current-password"
        />
      </div>

      <!-- Action -->
      <UiButton
        class="w-full mt-4"
        :loading="auth.loading"
        icon="arrowRight"
        @click="submit"
      >
        Ingresar
      </UiButton>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "~/stores/auth.store"

definePageMeta({ layout: "auth" })

const auth = useAuthStore()

const form = reactive({
  username: "",
  password: "",
})

const submit = async () => {
  await auth.login(form)
}
</script>
