<template>
  <div class="dropdown">
    <label tabindex="0" class="btn">
      <Icon :name="icon" />
    </label>
    <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-danam">
      <slot />
    </ul>
  </div>
</template>

<script setup>
import Icon from "./Icon.vue"
defineProps({ icon: String })
</script>
