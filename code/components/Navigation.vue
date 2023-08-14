<template>
  <n-space align="center" justify="space-between" class="navigation">
    <Config />
    <Actions />
  </n-space>
</template>

<script setup lang="ts">
import Config from "./Config.vue";
import Actions from "./Actions.vue";
</script>

<style>
.navigation {
  background: var(--n-color);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.25);
  padding: 0 24px;
  height: 50px;
}
</style>