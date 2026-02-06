<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'
import SidebarItem from './SidebarItem.vue'

defineEmits(['navigate'])

const props = defineProps<{
  item: any
  hasPermission: (perm?: string) => boolean
}>()

const isOpen = ref(false)
const toggle = () => (isOpen.value = !isOpen.value)

const visibleChildren = computed(() =>
  (props.item.children ?? []).filter((c: any) => props.hasPermission(c.permission))
)
</script>

<template>
  <!-- LINK -->
  <SidebarItem
    v-if="'to' in item && hasPermission(item.permission)"
    :label="item.label"
    :icon="item.icon"
    :to="item.to"
    @navigate="$emit('navigate')"
  />

  <!-- GROUP -->
  <div v-else-if="visibleChildren.length">
    <button
      type="button"
      @click="toggle"
      class="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-base-content/70 hover:bg-base-300"
    >
      <Icon v-if="item.icon" :name="item.icon" />
      <span class="flex-1 text-left">{{ item.label }}</span>
      <Icon :name="isOpen ? 'chevronUp' : 'chevronDown'" size="sm" />
    </button>

    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isOpen" class="ml-4 mt-1 space-y-1">
        <SidebarGroup
          v-for="child in visibleChildren"
          :key="child.label"
          :item="child"
          :has-permission="hasPermission"
          @navigate="$emit('navigate')"
        />
      </div>
    </transition>
  </div>
</template>
