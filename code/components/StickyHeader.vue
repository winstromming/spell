<template>
  <div class="sticky-header">
    <slot name="default"></slot>
  </div>
</template>

<style>
.sticky-header {
  background: var(--n-color);
  padding: 24px;
  position: sticky;
  top: 0;
  z-index: 5;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2)
}
</style>