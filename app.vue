<template>
  <Head>
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;400;700&display=swap"
      rel="stylesheet"
    />
  </Head>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { usePermissionsStore } from '~/stores/permissions.store'
import { useRolesStore } from '~/stores/roles.store'

const auth = useAuthStore()
const permissions = usePermissionsStore()
const roles = useRolesStore()

watch(
  () => auth.isAuthenticated,
  async isAuth => {
    if (!isAuth) return

    // 🧠 BOOTSTRAP ÚNICO
    await Promise.all([permissions.fetch(), roles.fetch()])
  },
  { immediate: true }
)
</script>
