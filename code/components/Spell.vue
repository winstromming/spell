<template>
  <Card title="Spell" :summary="spellSummary">
    <template #content>
      <n-space vertical size="large">
        <n-select filterable placeholder="What spell are you casting?" :value="chooseSpellLabel"
          @update:value="chooseSpell" :options="chooseSpellOptions" />
        <n-alert type="warning" v-if="(spell.name || spell.custom) && isSpellArcanaTooHigh">
          <n-text>You don't have the arcana required for this spell</n-text>
        </n-alert>
        <n-alert type="info" v-if="hasPraxis(spell.name)">
          <n-text>{{ spell.name }} is one of your Praxes.</n-text>
        </n-alert>
        <n-alert type="info" v-if="hasRote(spell.name)">
          <n-text>{{ spell.name }} is one of your Rotes (+{{ hasRoteSkill(spell.name) }} bonus from {{
            hasRote(spell.name)?.skill }}).</n-text>
        </n-alert>
      </n-space>
    </template>
    <template #footer v-if="spell.name || spell.custom">
      <n-space vertical size="large" v-if="spell.name && !spell.custom">
        <n-text depth="3" v-if="spell.description">
          {{ spell.description }} <span v-if="spell.page"><br />({{ spell.page }})</span>
        </n-text>
        <n-grid :cols="4">
          <n-grid-item>
            <n-text> <b>Practice</b><br />{{ spell.practice }} </n-text>
          </n-grid-item>
          <n-grid-item>
            <n-text> <b>Factor</b><br />{{ spell.primaryFactor }} </n-text>
          </n-grid-item>
          <n-grid-item :span="2" v-if="spell.roteSkills.length > 0">
            <n-text> <b>Rote Skills</b><br />{{ spell.roteSkills.join(", ") }}</n-text>
          </n-grid-item>
        </n-grid>
      </n-space>
      <n-space vertical size="large" v-if="spell.custom">
        <n-grid :cols="2" :x-gap="10" :y-gap="10">
          <n-grid-item>
            <n-space vertical size="small">
              <b>Name</b>
              <n-input v-model:value="spell.name" type="text" placeholder="What is the spell named?" />
            </n-space>
          </n-grid-item>
          <n-grid-item>
            <n-space vertical size="small">
              <b>Arcana</b>
              <n-select placeholder="Choose an arcanum" filterable v-model:value="spell.primaryArcana.arcana"
                :options="arcanaOptions" />
            </n-space>
          </n-grid-item>
          <n-grid-item>
            <n-space vertical size="small">
              <b>Practice</b>
              <n-select placeholder="Choose a practice" filterable :value="choosePracticeValue"
                :options="choosePracticeOptions" @update:value="choosePractice" />
            </n-space>
          </n-grid-item>
          <n-grid-item>
            <n-space vertical size="small">
              <b>Factor</b>
              <n-select placeholder="Choose a primary factor" filterable v-model:value="spell.primaryFactor"
                :options="choosePrimaryFactorOptions" />
            </n-space>
          </n-grid-item>
        </n-grid>
        <n-input v-model:value="spell.description" type="textarea" :autosize="{ minRows: 2 }"
          placeholder="What does this spell do? Describe the effects and conditions that would apply." />
      </n-space>
      <br v-if="canCastSpell" />
      <n-space vertical size="small" v-if="canCastSpell">
        <Card>
          <template #content>
            <n-space :wrap="false">
              <n-switch size="small" v-model:value="spell.spendWillpower" />
              <n-space vertical :size="2">
                <n-text strong>Spend 1 Willpower:</n-text>
                <n-text>Gain +3 spellcasting dice.</n-text>
              </n-space>
            </n-space>
          </template>
        </Card>
        <Card>
          <template #content>
            <n-space :wrap="false">
              <n-switch size="small" v-model:value="spell.commonEffects.changePrimaryFactor" />
              <n-space vertical :size="2">
                <n-text strong>+1 Reach:</n-text>
                <n-text>Change the primary factor.</n-text>
              </n-space>
            </n-space>
          </template>
        </Card>
        <!-- -->
        <Card v-if="spell.custom === true">
          <template #content>
            <n-space :wrap="false">
              <n-switch size="small" :disabled="true" :value="spell.extraMana > 0" />
              <n-space vertical :size="2">
                <n-text strong>Spend {{ spell.extraMana }} Mana for spell effects</n-text>
                <n-slider :tooltip="false" v-model:value="spell.extraMana" :min="0" :max="10" />
              </n-space>
            </n-space>
          </template>
        </Card>
        <Card v-if="spell.custom === true">
          <template #content>
            <n-space :wrap="false">
              <n-switch size="small" :disabled="true" :value="spell.extraReach > 0" />
              <n-space vertical :size="2">
                <n-text strong>+{{ spell.extraReach }} Reach for spell effects</n-text>
                <n-slider :tooltip="false" v-model:value="spell.extraReach" :min="0" :max="10" />
              </n-space>
            </n-space>
          </template>
        </Card>
        <Card v-if="spell.custom !== true" v-for="(item, index) of spell.additionalEffects" :key="index">
          <template #content>
            <n-space :wrap="false">
              <n-switch size="small" :disabled="item.requirement ? true : isEffectRestricted(item)"
                :value="item.requirement ? !isEffectRestricted(item) : isEffectAdded(item)"
                @update:value="toggleEffect(item)" />
              <n-space vertical :size="2">
                <n-text strong>
                  <span v-if="item.cost">{{ item.cost.map(c => `+${c.value} ${c.type}`).join(", ") }}:</span>
                  <span v-if="item.requirement">{{
                    item.requirement.map(v => ` ${v.arcana}
                                      ${dots(v.value)}`).join(" and ")
                  }}</span>
                </n-text>
                <n-text>{{ item.effect }}</n-text>
              </n-space>
            </n-space>
          </template>
        </Card>
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">

import { computed } from "vue";
import Card from "../components/Card.vue";
import { dots } from "../constants/functions";
import { caster, spell, scene } from "../store/store";
import type { Caster, Spell } from "../store/store";
import { spells } from "../constants/spells";
import { cloneDeep } from "lodash";
import type { Effect, Practice } from "../constants/types";

import {
  arcanaNames,
  baseCastingTimes,
  castingMethods,
  factors,
  gnosisManaLimits,
  durations,
  scales,
  practices,
  yantrasBaseData,
} from "../constants/constants"
import type { Level } from "../constants/types";
import type { Skill } from "../constants/types";

const spellSummary = computed(() => {
  let summary = ""
  if (spell.name) summary += `${spell.name} (`
  if (spell.primaryArcana?.arcana && spell.primaryArcana?.level) summary += `${spell.primaryArcana.arcana} ${dots(spell.primaryArcana.level)}`
  if (spell.secondaryArcana?.arcana && spell.secondaryArcana?.level) summary += `, ${spell.secondaryArcana.arcana} ${dots(spell.secondaryArcana.level)}`
  if (spell.name) summary += ")"
  if (summary.length === 0) return "None"
  return summary
})

const chooseSpellLabel = computed(() => {
  if (spell.name === undefined && spell.custom) return "Creative Thaumaturgy"
  if (spell.name !== undefined && spell.custom) return `${spell.name} (Custom)`
  return spell.name
})


const isSpellArcanaTooHigh = computed(() => {
  if (spell.primaryArcana && spell.primaryArcana.arcana && spell.primaryArcana.level && caster.arcana[spell.primaryArcana.arcana].dots < spell.primaryArcana.level) return true
  if (spell.secondaryArcana && spell.secondaryArcana.arcana && spell.secondaryArcana.level && caster.arcana[spell.secondaryArcana.arcana].dots < spell.secondaryArcana.level) return true
  return false
})

const canCastSpell = computed(() => {
  if (spell.name === undefined) return false
  if (spell.primaryArcana.arcana === undefined) return false
  if (spell.primaryArcana.level === undefined) return false
  if (spell.primaryFactor === undefined) return false
  if (spell.practice === undefined) return false
  if (isSpellArcanaTooHigh.value) return false
  return true
})

const chooseSpellOptions = computed(() => {

  let options: any[] = []

  options.push({
    type: "group",
    label: "Custom",
    key: "custom",
    children: [{
      label: "Creative Thaumaturgy",
      value: {
        name: "Creative Thaumaturgy",
      }
    }]
  })

  for (let [name, arcana] of Object.entries(caster.arcana)) {
    if (arcana.dots > 0) {
      options.push({
        type: "group",
        label: name,
        key: name,
        children: spells
          .filter((s) => s.primaryArcana.arcana === name && s.primaryArcana.level <= arcana.dots)
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


const isEffectRestricted = (item: Effect) => {
  let answer = false
  if (item.requirement) {
    item.requirement.forEach(i => {
      if (i.arcana) {
        if (caster.arcana[i.arcana].dots < i.value) answer = true
      }
      // if (i.practice) {
      //   if (spell.practice !== i.practice) answer = true
      // }
    })
  }
  return answer
}

const isEffectAdded = (item: Effect) => {
  const existing = spell.effects.findIndex(added => added.effect === item.effect);
  return existing !== -1
}

const toggleEffect = (item: Effect) => {
  if (isEffectAdded(item)) {
    spell.effects.splice(spell.effects.findIndex(added => added.effect === item.effect), 1)
  } else {
    spell.effects.push(item)
  }
}

const hasPraxis = (name?: string) => {
  if (!name || !caster.praxes) return undefined;
  return caster.praxes.find((s) => s.name === name)
}
const hasRote = (name?: string) => {
  if (!name || !caster.rotes) return undefined;
  return caster.rotes.find((s) => s.name === name)
}
const hasRoteSkill = (name?: string) => {
  return hasRote(name) ? spell.roteSkill : undefined
}

const skills = computed(() => {
  return { ...caster.skills.physical, ...caster.skills.mental, ...caster.skills.social }
})

const arcanaOptions = computed(() => {
  let options = arcanaNames.map((arcana) => {
    return {
      label: arcana,
      value: arcana,
    }
  });
  return options
})
const choosePracticeValue = computed(() => {
  return spell.practice
})
const choosePracticeOptions = computed(() => {
  let options: any[] = []
  for (let practice of practices) {
    options.push({
      label: `${dots(practice.level)} ${practice.name}`,
      value: practice,
    })
  }
  return options
})
const choosePrimaryFactorOptions = computed(() => {
  let options = ["Duration", "Potency"].map((factor) => {
    return {
      label: factor,
      value: factor,
    }
  });
  return options
})

const applyCustomSpell = (choice: Spell) => {
  spell.name = choice.customName
}

const choosePractice = (practice: { name: Practice; level: Level; desc: string }) => {
  spell.practice = practice.name
  spell.primaryArcana.level = practice.level
}

const chooseSpell = (choice: Spell) => {
  spell.name = choice.name
  spell.practice = choice.practice
  spell.primaryArcana.arcana = choice.primaryArcana?.arcana
  spell.primaryArcana.level = choice.primaryArcana?.level
  spell.secondaryArcana.arcana = choice.secondaryArcana?.arcana
  spell.secondaryArcana.level = choice.secondaryArcana?.level
  spell.primaryFactor = choice.primaryFactor
  spell.roteSkill = choice.roteSkill
  spell.roteSkills = choice.roteSkills ?? []
  spell.description = choice.description
  spell.additionalEffects = choice.additionalEffects ?? []
  spell.effects = []
  spell.yantras = []
  spell.factors = {
    castingTime: "s1",
    potency: "s1",
    range: "s1",
    duration: "s1",
    scale: "s1",
  }
  spell.isPraxis = false
  spell.isRote = false
  spell.page = choice.page
  if (spell.name === "Creative Thaumaturgy") {
    spell.custom = true
    spell.customName = undefined
  } else {
    spell.custom = false
    spell.customName = undefined
  }

  const casterHasPraxis = hasPraxis(choice.name)
  if (casterHasPraxis) {
    spell.isPraxis = true
  }

  const casterHasRote = hasRote(choice.name)
  if (casterHasRote && casterHasRote.skill) {
    spell.isRote = true
    spell.roteSkill = skills.value[casterHasRote.skill].dots
  }
  scene.reset()
}

</script>