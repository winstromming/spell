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
      <Card v-for="item in caster.rotes" :key="item.name" :title="item.name" collapsed
        :summary="`(${item.skill}) ${item.arcana} ${dots(item.level)}`">
        <template #content>
          <n-select v-model:value="item.skill" placeholder="Choose Rote Skill" size="small"
            :options="item.skills.map((s) => ({ label: `${s} (+${skills[s]?.dots})`, value: s }))"
            @update:value="chooseSkill(item.name, $event)">
          </n-select>
        </template>
        <template #footer>
          <n-button quaternary type="error" @click="remove(item.name)">
            <template #icon>
              <n-icon>
                <Trash />
              </n-icon>
            </template>
          </n-button>
        </template>
      </Card>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { caster } from "../store/store";
import { spells } from "../constants/spells"
import type { Arcana, Source, Skill } from "../constants/types"

import { ClipboardOutline, Trash } from "@vicons/ionicons5"

import Card from "../components/Card.vue"

const dots = (num: number) => Array.from({ length: num }, () => "•").join("");

const value = ref(null);

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
  });
};

const chooseSkill = (spell: string, skill: Skill) => {
  console.log(spell, skill)
  let item = caster.rotes.find((s) => s.name === spell);
  if (item) item.skill = skill;
};

const remove = (name: string) => {
  let index = caster.rotes.findIndex((s) => s.name === name)
  if (index !== -1) caster.rotes.splice(index, 1)
};
</script>