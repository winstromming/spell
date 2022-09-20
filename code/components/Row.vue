<template>
  <div
    :class="{
      srow: true,
      sleft: aligns === 'left',
      sright: aligns === 'right',
      seven: aligns === undefined,
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
.srow {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  gap: 20px;
}
.srow + .srow {
  margin-top: 15px;
}
.srow.seven > * {
  flex: 1;
  width: 100%;
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
