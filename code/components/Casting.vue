<template>
  <StickyHeader>
    <Actions />
  </StickyHeader>
  <n-space vertical style="padding: 24px;">
    <Spell />
    <Factors />
    <Yantras />
    <Paradox />
  </n-space>
</template>

<script setup lang="ts">
import Actions from "./Actions.vue"
import Spell from "./Spell.vue"
import Factors from "./Factors.vue"
import Yantras from "./Yantras.vue"
import Paradox from "./Paradox.vue"
import StickyHeader from "./StickyHeader.vue"
</script>