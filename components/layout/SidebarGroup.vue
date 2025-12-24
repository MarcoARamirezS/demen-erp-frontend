<template>
  <div>
    <!-- Group header -->
    <button
      class="w-full flex items-center justify-between px-4 py-2 rounded-lg text-xs font-semibold uppercase text-base-content/50 hover:bg-base-200 transition"
      @click="open = !open"
    >
      <span>{{ label }}</span>
      <Icon name="chevronDown" class="w-4 h-4 transition" :class="{ 'rotate-180': open }" />
    </button>

    <!-- Children -->
    <div v-show="open" class="mt-1 space-y-1 pl-2">
      <SidebarItem
        v-for="child in visibleChildren"
        :key="child.to"
        :icon="child.icon"
        :label="child.label"
        :to="child.to"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SidebarItem from './SidebarItem.vue'
import Icon from '~/components/ui/Icon.vue'
import { useAuthStore } from '~/stores/auth.store'

const props = defineProps<{
  label: string
  children: any[]
}>()

const auth = useAuthStore()
const open = ref(false)

const visibleChildren = computed(() =>
  props.children.filter(c => !c.permission || auth.permissions.includes(c.permission))
)
</script>
