<template>
  <Card title="Merits" :summary="summary">
    <template #content>
      <n-grid y-gap="0" x-gap="24" cols="1 400:2">
        <n-gi v-for="merit in caster.merits">
          <Dots is-editable name="" :label="merit.label" @update-label="merit.label = $event" :dots="merit.dots"
            @update-dots="merit.dots = $event" placeholder="Merit"></Dots>
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
  let merits = 0;
  let amount = 0;
  for (const [name, merit] of Object.entries(caster.merits)) {
    if (merit.dots > 0) {
      merits++;
      amount += merit.dots;
    }
  }
  return `${merits} merits, ${amount} dots`;
})
</script>