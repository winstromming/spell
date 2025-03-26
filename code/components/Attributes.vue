<template>
  <Card title="Attributes" :summary="summary">
    <template #content>
      <n-grid y-gap="12" x-gap="24" cols="1 600:3">
        <n-gi>
          <Dots v-for="(attribute, name) in caster.attributes.mental" :name="name" :dots="attribute.dots"
            @update-dots="attribute.dots = $event"></Dots>
        </n-gi>
        <n-gi>
          <Dots v-for="(attribute, name) in caster.attributes.physical" :name="name" :dots="attribute.dots"
            @update-dots="attribute.dots = $event"></Dots>
        </n-gi>
        <n-gi>
          <Dots v-for="(attribute, name) in caster.attributes.social" :name="name" :dots="attribute.dots"
            @update-dots="attribute.dots = $event"></Dots>
        </n-gi>
      </n-grid>
    </template>
    <template #footer>
      <n-grid y-gap="12" x-gap="12" cols="2 600:3">
        <n-gi>
          <n-input-number v-model:value="caster.traits.Size.modifier" :placeholder="caster.traits.Size.base.toString()"
            :show-button="false">
            <template #prefix>
              <n-text strong>Size</n-text>
            </template>
          </n-input-number>
        </n-gi>
        <n-gi>
          <n-input-number v-model:value="caster.traits.Speed.modifier" :placeholder="caster.traits.Speed.base.toString()"
            :show-button="false">
            <template #prefix>
              <n-text strong>Speed</n-text>
            </template>
          </n-input-number>
        </n-gi>
        <n-gi>
          <n-input-number v-model:value="caster.traits.Defense.modifier"
            :placeholder="caster.traits.Defense.base.toString()" :show-button="false">
            <template #prefix>
              <n-text strong>Defense</n-text>
            </template>
          </n-input-number>
        </n-gi>
        <n-gi>
          <n-input-number v-model:value="caster.traits.Gnosis" placeholder="0" min="0" max="10" :show-button="false">
            <template #prefix>
              <n-text strong>Gnosis </n-text>
            </template>
            <template #suffix>
              <n-text depth="3">0-10</n-text>
            </template>
          </n-input-number>
        </n-gi>
        <n-gi>
          <n-input-number v-model:value="caster.traits.Wisdom" placeholder="0" min="0" max="10" :show-button="false">
            <template #prefix>
              <n-text strong>Wisdom </n-text>
            </template>
            <template #suffix>
              <n-text depth="3">0-10</n-text>
            </template>
          </n-input-number>
        </n-gi>
        <n-gi>
          <n-input-number v-model:value="caster.traits.Initiative.modifier"
            :placeholder="caster.traits.Initiative.base.toString()" :show-button="false">
            <template #prefix>
              <n-text strong>Initiative</n-text>
            </template>
          </n-input-number>
        </n-gi>
      </n-grid>
    </template>
  </Card>
</template>

<script setup lang="ts">

import { caster } from "../store/store";
import Dots from "../components/Dots.vue";
import Card from "../components/Card.vue";
import { computed, watch } from "vue";


watch(caster, () => {
  caster.traits.Speed.base = caster.attributes.physical.Strength.dots + caster.attributes.physical.Dexterity.dots + caster.traits.Size.base;
});
watch(caster, () => {
  caster.traits.Speed.base = caster.attributes.physical.Strength.dots + caster.attributes.physical.Dexterity.dots + caster.traits.Size.base;
});
watch(caster, () => {
  caster.traits.Defense.base = Math.min(caster.attributes.physical.Dexterity.dots, caster.attributes.mental.Wits.dots) + caster.skills.physical.Athletics.dots
});
watch(caster, () => {
  caster.traits.Initiative.base = caster.attributes.physical.Dexterity.dots + caster.attributes.social.Composure.dots;
});

const summary = computed(() => {
  let mental = Object.values(caster.attributes.mental).reduce((acc, cur) => acc + cur.dots, 0);
  let physical = Object.values(caster.attributes.physical).reduce((acc, cur) => acc + cur.dots, 0);
  let social = Object.values(caster.attributes.social).reduce((acc, cur) => acc + cur.dots, 0);
  return `${mental} Mental, ${physical} Physical, ${social} Social`;
})
// const summary = computed(() => {
//   return `${caster.traits.Gnosis} Gnosis, ${caster.traits.Wisdom} Wisdom, ${caster.traits.Willpower} Willpower, ${caster.traits.Mana} Mana`;
// });

</script>

<style scoped></style>