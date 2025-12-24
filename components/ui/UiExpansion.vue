<template>
  <div class="collapse collapse-arrow border">
    <input type="checkbox" />
    <div class="collapse-title font-medium">
      {{ title }}
    </div>
    <div class="collapse-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({ title: String })
</script>
