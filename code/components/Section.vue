<template>
  <el-form size="large" label-position="top" class="form">
    <slot></slot>
  </el-form>
</template>

<script>
export default {
  props: ["name"],
  data() {
    return {
      open: true,
    }
  },
}
</script>

<style scoped>
/* .form {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
} */
</style>
