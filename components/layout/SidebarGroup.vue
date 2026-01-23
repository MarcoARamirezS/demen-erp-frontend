<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '~/components/ui/Icon.vue'
import SidebarItem from './SidebarItem.vue'

const props = defineProps<{
  label: string
  icon?: string
  items: {
    label: string
    to: string
    icon?: string
  }[]
}>()

const route = useRoute()
const open = ref(false)

/* =========================
   ACTIVE STATE
========================= */
const isActive = computed(() => props.items.some(i => route.path.startsWith(i.to)))
</script>

<template>
  <div class="space-y-1">
    <!-- GROUP HEADER -->
    <button
      type="button"
      class="group flex w-full items-center justify-between gap-3 px-4 py-2 rounded-lg text-sm transition-all"
      :class="
        isActive
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-base-content/70 hover:bg-base-300 hover:text-base-content'
      "
      @click="open = !open"
    >
      <div class="flex items-center gap-3">
        <!-- 🔥 ICONO DEL GRUPO (FIX CLAVE) -->
        <Icon
          v-if="icon"
          :name="icon"
          size="md"
          class="shrink-0 text-current opacity-80 group-hover:opacity-100"
        />

        <span>{{ label }}</span>
      </div>

      <Icon
        name="chevronDown"
        size="sm"
        class="transition-transform"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <!-- CHILDREN -->
    <div v-show="open" class="ml-6 mt-1 space-y-1">
      <SidebarItem
        v-for="item in items"
        :key="item.to"
        :label="item.label"
        :to="item.to"
        :icon="item.icon"
      />
    </div>
  </div>
</template>
