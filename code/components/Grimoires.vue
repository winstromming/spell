<template>
  <Card title="Grimoires" :icon="true">
    <template #icon>
      <n-icon>
        <BookOutline />
      </n-icon>
    </template>
    <template #header>
      <n-select filterable :value="value" placeholder="Choose spell to add" @update:value="choose" :options="options" />
    </template>
    <template #footer v-if="caster.grimoires.length > 0">
      <n-space vertical>
        <Card v-for="item in caster.grimoires" :key="item.name" :title="item.name" collapsed
          :summary="`${item.arcana} ${dots(item.level)}`">
          <template #content>
            <n-space vertical>
              <n-text depth="3" italic>
                <n-ellipsis :line-clamp="2">
                  {{ getDescriptionForSpell(item.name) }}
                </n-ellipsis>
              </n-text>
            </n-space>
          </template>
          <template #footer>
            <n-space justify="space-between">
              <n-button quaternary title="Remove" type="error" @click="remove(item.name)">
                <template #icon>
                  <n-icon>
                    <Trash />
                  </n-icon>
                </template>
              </n-button>
              <n-button quaternary title="Prepare" type="success" @click="load(item)">
                <template #icon>
                  <n-icon>
                    <Build />
                  </n-icon>
                </template>
              </n-button>
            </n-space>
          </template>
        </Card>
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { caster, spell, type Spell } from "../store/store";
import { spells } from "../constants/spells"
import type { Arcana, Source } from "../constants/types"

import { BookOutline, Trash, Build } from "@vicons/ionicons5"

import Card from "../components/Card.vue"
import { cloneDeep, merge } from "lodash";
import { useMessage } from "naive-ui";

const message = useMessage()

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
  caster.grimoires = caster.grimoires || []
  caster.grimoires.push({
    name: option.name,
    arcana: option.primaryArcana.arcana,
    level: option.primaryArcana.level,
  });
};

const remove = (name: string) => {
  let index = caster.grimoires.findIndex((s) => s.name === name)
  if (index !== -1) caster.grimoires.splice(index, 1)
};

const getDescriptionForSpell = (name: string) => {
  const item = spells.find((s) => s.name === name)
  if (item) return item.description
  return ""
}

const load = (source: typeof caster.grimoires[number]) => {
  const item = spells.find((s) => s.name === source.name)
  if (item) {
    const cloned = cloneDeep(item)
    spell.reset()
    merge(spell, { ...cloned, isGrimoire: true })
    message.success(`${source.name} was prepared`)
  } else {
    message.warning(`${source.name} not found in spell list`)
  }
}
</script>