<template>
  <n-space :size="2" class="health">
    <n-tooltip trigger="hover" v-for="amount of caster.health.aggravated">
      <template #trigger>
        <n-icon :size="20" color="black" :component="SkullOutline" />
      </template>
      Aggravated
    </n-tooltip>
    <n-tooltip trigger="hover" v-for="amount of caster.health.lethal">
      <template #trigger>
        <n-icon :size="20" color="black" :component="WaterOutline" />
      </template>
      Lethal
    </n-tooltip>
    <n-tooltip trigger="hover" v-for="amount of caster.health.bashing">
      <template #trigger>
        <n-icon :size="20" color="black" :component="BandageOutline" />
      </template>
      Bashing
    </n-tooltip>
    <n-icon v-for="amount in remaining" :size="20" color="#eee" :component="Square" />
  </n-space>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { SkullOutline, BandageOutline, WaterOutline, Square } from "@vicons/ionicons5"
import { caster } from "../store/store";

const maximum = computed(() => {
  return caster.traits.Size.base + (caster.traits.Size.modifier ?? 0) + caster.attributes.physical.Stamina.dots
})

const remaining = computed(() => {
  return maximum.value - caster.health.bashing - caster.health.lethal - caster.health.aggravated
})

</script>

<style scoped>
.health .n-icon {
  padding: 3px;
  background: #eee;
  /* border: 1px solid black; */
  border-radius: 4px;
}
</style>