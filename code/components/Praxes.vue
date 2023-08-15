<template>
  <Card title="Praxes" :icon="true">
    <template #icon>
      <n-icon>
        <SparklesOutline />
      </n-icon>
    </template>
    <template #header>
      <n-select filterable :value="value" placeholder="Choose spell to add" @update:value="choose" :options="options" />
    </template>
    <template #footer v-if="caster.praxes.length > 0">
      <n-space vertical>
        <Card :title="item.name" :summary="`${item.arcana} ${dots(item.level)}`" v-for="item in caster.praxes"
          :key="item.name" :collapsed="true">
          <template #footer>
            <n-button quaternary title="Remove" size="small" type="error" @click="remove(item.name)">
              <template #icon>
                <n-icon>
                  <Trash />
                </n-icon>
              </template>
            </n-button>
          </template>
        </Card>
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { caster } from "../store/store";
import { spells } from "../constants/spells"
import type { Arcana, Source } from "../constants/types"

import { SparklesOutline, Trash } from "@vicons/ionicons5"

import Card from "../components/Card.vue"

const dots = (num: number) => Array.from({ length: num }, () => "•").join("");

const value = ref(null);

const options = computed(() => {
  let options = []
  for (let arcana in caster.arcana) {
    const name = arcana as Arcana;
    if (caster.arcana[name].dots > 0) {
      options.push({
        type: "group",
        label: name,
        key: name,
        children: spells
          .filter((s) => s.primaryArcana.arcana === name && s.primaryArcana.level <= caster.arcana[name].dots)
          .sort((a, b) => a.primaryArcana.level - b.primaryArcana.level)
          .map((s) => {
            return {
              label: `${dots(s.primaryArcana.level)} ${s.name}`,
              value: s,
            }
          }),
      })
    }
  }
  return options
});

const choose = (option: Source) => {
  caster.praxes = caster.praxes || []
  caster.praxes.push({
    name: option.name,
    arcana: option.primaryArcana.arcana,
    level: option.primaryArcana.level,
  });
};

const remove = (name: string) => {
  let index = caster.praxes.findIndex((s) => s.name === name)
  if (index !== -1) caster.praxes.splice(index, 1)
};
</script>