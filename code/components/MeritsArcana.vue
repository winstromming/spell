<template>
  <Card title="Merits, Arcana" :summary="summary">
    <template #content>
      <n-grid y-gap="12" x-gap="12" cols="1 400:2">
        <n-gi :span="1">
          <Dots v-for="merit in caster.merits" is-editable name="" :label="merit.label"
            @update-label="merit.label = $event" :dots="merit.dots" @update-dots="merit.dots = $event"></Dots>
        </n-gi>
        <n-gi :span="1">
          <Dots v-for="(arcana, name) in caster.arcana" :name="name" :dots="arcana.dots"
            @update-dots="arcana.dots = $event" :checked="arcana.ruling || caster.details.path?.arcana.includes(name)"
            :checked-disabled="caster.details.path?.arcana.includes(name)" @update-checked="arcana.ruling = $event">
          </Dots>
        </n-gi>
      </n-grid>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "../components/Card.vue";
import Dots from "../components/Dots.vue";
import { caster } from "../store/store";

const summary = computed(() => {
  let summary = [];
  for (const [name, arcana] of Object.entries(caster.arcana)) {
    if (arcana.dots > 0) {
      summary.push(`${name} ${arcana.dots}`);
    }
  }
  return summary.join(", ")
})
</script>