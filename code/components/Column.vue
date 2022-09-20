<template>
  <div
    :class="{
      scol: true,
      stop: aligns === 'left',
      sbottom: aligns === 'right',
      smiddle: aligns === undefined,
    }"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ["aligns"],
}
</script>

<style>
.scol {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.srow.smiddle > * {
  flex: 1;
}
.sleft {
  justify-content: flex-start;
}
.sright {
  justify-content: flex-end;
}
.seven {
  justify-content: space-between;
}
</style>
