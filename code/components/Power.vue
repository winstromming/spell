<template>
  <Card title="Power" :icon="true" :summary="summary">
    <template #icon>
      <n-icon :component="BatteryCharging"></n-icon>
    </template>
    <template #footer>
      <n-grid x-gap="12" y-gap="12" :cols="2">
        <n-gi>
          <n-input-number v-model:value="caster.traits.Mana" :format="asMana" :parse="parse" size="small" min="0"
            :max="mana">
          </n-input-number>
        </n-gi>
        <n-gi>
          <n-input-number v-model:value="caster.traits.Willpower" size="small" min="0" :max="willpower"
            :format="asWillpower" :parse="parse">
          </n-input-number>
        </n-gi>
      </n-grid>
    </template>
  </Card>
</template>

<script setup lang="ts">

import Card from "../components/Card.vue";
import { caster, spell, scene } from "../store/store";
import { BatteryCharging } from "@vicons/ionicons5"
import Dots from "../components/Dots.vue";
import { computed, onMounted, watch } from "vue";

const asMana = (num: number | null) => {
  return `${num ?? 0}/${mana.value} Mana`
}
const asWillpower = (num: number | null) => {
  return `${num ?? 0}/${willpower.value} Willpower`
}
const parse = (input: string) => {
  const nums = input.split("/")[0].replace(/[^0-9]+/g, '').trim()
  return nums === '' ? null : Number(nums)
}

const willpower = computed(() => {
  return caster.attributes.mental.Resolve.dots + caster.attributes.social.Composure.dots;
});

const mana = computed(() => {
  switch (caster.traits.Gnosis) {
    case 0: return 0;
    case 1: return 10;
    case 2: return 11;
    case 3: return 12;
    case 4: return 13;
    case 5: return 15;
    case 6: return 20;
    case 7: return 25;
    case 8: return 30;
    case 9: return 50;
    case 10: return 75;
  }
})

const summary = computed(() => {
  return `${caster.traits.Mana} Mana, ${caster.traits.Willpower} Willpower`;
});

</script>