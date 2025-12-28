<script setup lang="ts">
import Icon from '~/components/ui/Icon.vue'

const props = defineProps<{
  label: string
  icon?: string
  items: {
    label: string
    to: string
    icon?: string
  }[]
}>()

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div>
    <!-- Header -->
    <button
      type="button"
      @click="toggle"
      class="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-base-content/70 hover:bg-base-300 transition"
    >
      <Icon v-if="icon" :name="icon" />
      <span class="flex-1 text-left">{{ label }}</span>
      <Icon :name="isOpen ? 'chevronUp' : 'chevronDown'" size="sm" />
    </button>

    <!-- Children -->
    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isOpen" class="ml-6 mt-1 space-y-1 overflow-hidden">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-2 rounded-md text-sm text-base-content/60 hover:bg-base-300 hover:text-base-content transition"
          active-class="bg-primary/10 text-primary font-medium"
        >
          <Icon v-if="item.icon" :name="item.icon" size="sm" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </div>
    </transition>
  </div>
</template>
