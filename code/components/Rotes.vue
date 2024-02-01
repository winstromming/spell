<template>
  <Card title="Rotes" :icon="true">
    <template #icon>
      <n-icon>
        <ClipboardOutline />
      </n-icon>
    </template>
    <template #header>
      <n-select filterable :value="value" placeholder="Choose spell to add" @update:value="choose" :options="options" />
    </template>
    <template #footer v-if="caster.rotes.length > 0">
      <n-space vertical>
        <Card v-for="item in caster.rotes" :key="item.name" :title="name(item)" collapsed
          :summary="`${item.arcana} ${dots(item.level)}`">
          <template #content>
            <n-space vertical>
              <n-text depth="3" italic>
                <n-ellipsis :line-clamp="2">
                  {{ description(item) }}
                </n-ellipsis>
              </n-text>
              <n-input v-model:value="item.effect" type="textarea" placeholder="Custom additional effect"
                :autosize="{ minRows: 1 }" size="small" />
              <n-select v-model:value="item.skill" placeholder="Choose rote skill to use" size="small"
                :options="item.skills.map((s) => ({ label: `${s} (+${skills[s]?.dots ?? 0})`, value: s }))"
                @update:value="chooseSkill(item.name, $event)">
              </n-select>
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
import type { Arcana, Source, Skill, Rote, Effect } from "../constants/types"

import { ClipboardOutline, Add, Remove, Trash, Build, Close, GitBranchOutline } from "@vicons/ionicons5"

import Card from "../components/Card.vue"
import { cloneDeep, merge } from "lodash";
import { useMessage } from "naive-ui";

const message = useMessage()

const dots = (num: number) => Array.from({ length: num }, () => "•").join("");

const value = ref(null)

const skills = computed(() => {
  return { ...caster.skills.physical, ...caster.skills.mental, ...caster.skills.social }
})

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
  caster.rotes = caster.rotes || []
  caster.rotes.push({
    name: option.name,
    arcana: option.primaryArcana.arcana,
    level: option.primaryArcana.level,
    skills: option.roteSkills,
    skill: undefined,
    effect: undefined,
  });
};

const chooseSkill = (spell: string, skill: Skill) => {
  let item = caster.rotes.find((s) => s.name === spell);
  if (item) item.skill = skill;
};

const remove = (name: string) => {
  let index = caster.rotes.findIndex((s) => s.name === name)
  if (index !== -1) caster.rotes.splice(index, 1)
};

const name = (option: Rote) => {
  return option.name
}

const description = (option: Rote) => {
  const normal = spells.find((s) => s.name === option.name)
  return normal?.description || ""
}

const load = (source: typeof caster.rotes[number]) => {
  const item = spells.find((s) => s.name === source.name)
  if (item) {
    const cloned = cloneDeep(item)
    if (source.effect) cloned.description += `\n${source.effect}`
    spell.reset()
    merge(spell, { ...cloned, isRote: true })
    message.success(`${source.name} was prepared`)
  } else {
    message.warning(`${source.name} not found in spell list`)
  }
}
</script>