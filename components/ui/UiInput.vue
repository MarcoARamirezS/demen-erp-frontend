<template>
  <label class="form-control w-full">
    <div
      class="relative"
      :class="{ 'opacity-50': disabled }"
    >
      <span
        v-if="icon"
        class="absolute inset-y-0 left-0 flex items-center pl-4 text-base-content/50"
      >
        <Icon :name="icon" size="sm" />
      </span>

      <input
        class="input input-bordered w-full"
        :class="{
          'pl-10': icon,
        }"
        v-bind="$attrs"
        :disabled="disabled"
      />
    </div>
  </label>
</template>

<script setup>
import Icon from "./Icon.vue"

defineProps({
  icon: String,
  disabled: Boolean,
})
</script>
