<script setup lang="ts">
import { useRoute } from 'vue-router'
import Icon from '~/components/ui/Icon.vue'

defineEmits(['navigate'])

const props = defineProps<{
  label: string
  icon?: string
  to: string
}>()

const route = useRoute()
const isActive = computed(() => route.path === props.to)
</script>

<template>
  <NuxtLink
    :to="to"
    @click="$emit('navigate')"
    class="group flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all"
    :class="
      isActive
        ? 'bg-primary/15 text-primary font-semibold'
        : 'text-base-content/70 hover:bg-base-300 hover:text-base-content'
    "
  >
    <Icon v-if="icon" :name="icon" size="md" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>
