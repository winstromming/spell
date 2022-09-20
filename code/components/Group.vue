<template>
  <el-card>
    <div class="header">
      <b>{{ name }}</b>
      <el-button
        @click="open = !open"
        round
        text
        bg
        :icon="open ? 'arrowUpBold' : 'arrowDownBold'"
      />
    </div>
    <el-divider v-if="open"></el-divider>
    <div class="content" v-if="open">
      <el-space direction="vertical" size="large" fill style="width: 100%">
        <el-form size="large" label-position="top" class="form">
          <slot></slot>
        </el-form>
      </el-space>
    </div>
  </el-card>
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
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
