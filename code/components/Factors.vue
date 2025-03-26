<template>
  <Card title="Factors" collapsed :summary="factorSummary">
    <template #footer>
      <n-space vertical :size="15">
        <!-- Potency -->
        <n-space vertical>
          <n-space justify="space-between" size="small">
            <n-text strong>Potency:</n-text>
            <n-text depth="3">{{ potencySummary }}</n-text>
          </n-space>
          <n-select v-model:value="spell.factors.potency" :options="potencyOptions" />
        </n-space>
        <!-- Duration -->
        <n-space vertical>
          <n-space justify="space-between" size="small">
            <n-text strong>Duration:</n-text>
            <n-text depth="3">{{ durationSummary }}</n-text>
          </n-space>
          <n-select v-model:value="spell.factors.duration" :options="durationOptions" />
          <Card v-if="caster.arcana.Matter.dots < 2 === false">
            <template #content>
              <n-space :wrap="false">
                <n-switch v-model:value="spell.attainments.permanence" size="small"
                  :disabled="caster.arcana.Matter.dots < 2" />
                <n-space vertical size="small">
                  <n-text strong :depth="caster.arcana.Matter.dots < 2 ? '3' : '1'">Attainment: Permanence
                    (Matter {{ dots(2) }})</n-text>
                  <n-text :depth="caster.arcana.Matter.dots < 2 ? '3' : '1'">Advanced Scale costs 1 Mana
                    instead of 1 Reach.</n-text>
                </n-space>
              </n-space>
            </template>
          </Card>
          <Card v-if="caster.arcana.Fate.dots < 2 === false">
            <template #content>
              <n-space :wrap="false">
                <n-switch v-model:value="spell.attainments.conditionalDuration" size="small"
                  :disabled="caster.arcana.Fate.dots < 2" />
                <n-space vertical size="small">
                  <n-text strong :depth="caster.arcana.Fate.dots < 2 ? '3' : '1'">Attainment: Conditional
                    Duration (Fate {{ dots(2) }})</n-text>
                  <n-text :depth="caster.arcana.Fate.dots < 2 ? '3' : '1'">Spend 1 Mana to end the spell when a
                    condition is met, adding 1-3 levels of Duration based on the nature of the
                    condition.</n-text>
                </n-space>
              </n-space>
            </template>
          </Card>
        </n-space>
        <!-- Casting -->
        <n-space vertical>
          <n-space justify="space-between" size="small">
            <n-text strong>Casting time:</n-text>
            <n-text depth="3">{{ castingTimeSummary }}</n-text>
          </n-space>
          <n-select v-model:value="spell.factors.castingTime" :options="castingTimeOptions" />
          <Card v-if="caster.arcana.Time.dots < 4 === false">
            <template #content>
              <n-space :wrap="false">
                <n-switch v-model:value="spell.attainments.timeInABottle" size="small"
                  :disabled="caster.arcana.Time.dots < 4" />
                <n-space vertical size="small">
                  <n-text strong :depth="caster.arcana.Time.dots < 4 ? '3' : '1'">Attainment: Time in a Bottle
                    (Time {{ dots(4) }})</n-text>
                  <n-text :depth="caster.arcana.Time.dots < 4 ? '3' : '1'">Advanced Casting Time costs 1 Mana
                    instead of 1 Reach.</n-text>
                </n-space>
              </n-space>
            </template>
          </Card>
        </n-space>
        <!-- Range -->
        <n-space vertical>
          <n-space justify="space-between" size="small">
            <n-text strong>Range:</n-text>
            <n-text depth="3">{{ rangeSummary }}</n-text>
          </n-space>
          <n-select v-model:value="spell.factors.range" :options="rangeOptions" />
          <Card v-if="caster.arcana.Space.dots < 2 === false">
            <template #content>
              <n-space :wrap="false">
                <n-switch v-model:value="spell.attainments.sympatheticRange" size="small"
                  :disabled="caster.arcana.Space.dots < 2" />
                <n-space vertical size="small">
                  <n-text strong :depth="caster.arcana.Space.dots < 2 ? '3' : '1'">Attainment: Sympathetic
                    Range (Space {{ dots(2) }})</n-text>
                  <n-text :depth="caster.arcana.Space.dots < 2 ? '3' : '1'">Subject can be beyond sensory
                    range. Requires Advanced Range, a sympathy Yantra and costs 1 Mana.</n-text>
                </n-space>
              </n-space>
            </template>
          </Card>
          <Card v-if="caster.arcana.Time.dots < 2 === false">
            <template #content>
              <n-space :wrap="false">
                <n-switch v-model:value="spell.attainments.temporalSympathy" size="small"
                  :disabled="caster.arcana.Time.dots < 2" />
                <n-space vertical size="small">
                  <n-text strong :depth="caster.arcana.Time.dots < 2 ? '3' : '1'">Attainment: Temporal Sympathy
                    (Time {{ dots(2) }})</n-text>
                  <n-text :depth="caster.arcana.Time.dots < 2 ? '3' : '1'">Cast a spell at subject's past self.
                    Requires Advanced Range, a sympathy Yantra and costs +1 Mana. Can only be used with Time
                    spells that allow it or spells combined with them.</n-text>
                </n-space>
              </n-space>
            </template>
          </Card>
        </n-space>
        <!-- Scale -->
        <n-space vertical>
          <n-space justify="space-between" size="small">
            <n-text strong>Scale:</n-text>
            <n-text depth="3">{{ scaleSummary }}</n-text>
          </n-space>
          <n-select v-model:value="spell.factors.scale" :options="scaleOptions" />
          <Card v-if="caster.arcana.Space.dots < 4 === false">
            <template #content>
              <n-space :wrap="false">
                <n-switch v-model:value="spell.attainments.everywhere" size="small"
                  :disabled="caster.arcana.Space.dots < 4" />
                <n-space vertical size="small">
                  <n-text strong :depth="caster.arcana.Space.dots < 4 ? '3' : '1'">Attainment: Everywhere
                    (Space {{ dots(4) }})</n-text>
                  <n-text :depth="caster.arcana.Space.dots < 4 ? '3' : '1'">Advanced Scale costs 1 Mana instead
                    of 1 Reach.</n-text>
                </n-space>
              </n-space>
            </template>
          </Card>
        </n-space>
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">

import { computed } from "vue";
import Card from "../components/Card.vue";
import { dots } from "../constants/functions";
import { caster, spell } from "../store/store";
import type { Caster, Spell } from "../store/store";
import { spells } from "../constants/spells";
import { clone, cloneDeep } from "lodash";
import type { Effect, Practice, Factor } from "../constants/types";

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
import { getBaseCastingTime, getCastingTimeSummary, getDurationSummary, getFactorSummary, getPotencySummary, getRangeSummary, getScaleSummary } from "../constants/methods";

const factorSummary = computed(() => getFactorSummary(caster, spell))
const potencySummary = computed(() => getPotencySummary(caster, spell))
const durationSummary = computed(() => getDurationSummary(caster, spell))
const castingTimeSummary = computed(() => getCastingTimeSummary(caster, spell))
const rangeSummary = computed(() => getRangeSummary(caster, spell))
const scaleSummary = computed(() => getScaleSummary(caster, spell))

const baseCastingTime = computed(() => getBaseCastingTime(caster))

const isAdvanced = (factor: Factor) => spell.factors[factor][0] === "a"
const isPrimaryFactor = (factor: "Duration" | "Potency") => spell.primaryFactor === factor


const hasGrimoire = (name?: string) => {
  if (!name || !caster.grimoires) return undefined;
  return caster.grimoires.find((s) => s.name === name)
}

const standardCastingTimeOptions = computed(() => {
  let options = [],
    i = 0

  while (i++ <= 5) {
    let increment = baseCastingTime.value.increment * i,
      unit = baseCastingTime.value.unit + (increment !== 1 ? "s" : ""),
      bonus = i - 1

    options.push({
      value: "s" + i,
      label: `${increment} ${unit} (+${bonus} dice)`,
    })
  }

  return options
})
const castingTimeOptions = computed(() => {
  let options = []
  options.push({
    type: "group",
    label: "Standard (Ritual Casting)",
    key: "standard",
    children: standardCastingTimeOptions.value,
  })
  options.push({
    type: "group",
    label: "Advanced (Quick Casting)",
    key: "advanced",
    children: [{ value: "a1", label: "Instant" }],
  })
  return options
})
const standardPotencyOptions = computed(() => {
  let options = [],
    i = 0

  while (i++ < 11) {
    let penalty = (i - 1) * 2

    if (isPrimaryFactor("Potency") && spell.primaryArcana.arcana) {
      penalty -= (caster.arcana[spell.primaryArcana.arcana].dots - 1) * 2
    }

    if (penalty < 0) {
      penalty = 0
    }

    options.push({
      value: "s" + i,
      label: `${i} (-${penalty} dice)`,
    })
  }

  return options
})
const advancedPotencyOptions = computed(() => {
  let options = []
  let i = 0
  while (i++ < 12) {
    let penalty = (i - 1) * 2

    if (isPrimaryFactor("Potency") && spell.primaryArcana.arcana) {
      penalty -= (caster.arcana[spell.primaryArcana.arcana].dots - 1) * 2
    }

    if (penalty < 0) {
      penalty = 0
    }

    options.push({
      value: "a" + i,
      label: `${i} (-${penalty} dice and -2 Withstand)`,
    })
  }

  return options
})
const potencyOptions = computed(() => {
  let options = []
  options.push({
    type: "group",
    label: "Standard",
    key: "standard",
    children: standardPotencyOptions.value,
  })
  options.push({
    type: "group",
    label: "Advanced",
    key: "advanced",
    children: advancedPotencyOptions.value,
  })
  return options
})
const rangeOptions = computed(() => {
  let options = []
  options.push({
    type: "group",
    label: "Standard",
    key: "standard",
    children: [{ value: "s1", label: "Touch" }],
  })
  options.push({
    type: "group",
    label: "Advanced",
    key: "advanced",
    children: [
      { value: "a1", label: "Sensory" },
      { value: "a2", label: "Remote (+1 Reach)" },
    ],
  })
  return options
})
const standardDurationOptions = computed(() => {
  let options = []

  for (let [key, duration] of durations) {
    if (key[0] === "s") {
      let penalty = duration.penalty

      if (isPrimaryFactor("Duration") && spell.primaryArcana.arcana) {
        penalty -= (caster.arcana[spell.primaryArcana.arcana].dots - 1) * 2
      }

      if (penalty < 0) {
        penalty = 0
      }

      options.push({
        value: key,
        successes: key[1],
        time: duration.time,
        label: `${duration.time} (-${penalty} dice)`,
      })
    }
  }

  return options
})
const advancedDurationOptions = computed(() => {
  let options = []

  for (let [key, duration] of durations) {
    if (key[0] === "a") {
      let penalty = duration.penalty

      if (isPrimaryFactor("Duration") && spell.primaryArcana.arcana) {
        penalty -= (caster.arcana[spell.primaryArcana.arcana].dots - 1) * 2
      }

      if (penalty < 0) {
        penalty = 0
      }

      options.push({
        value: key,
        successes: key[1],
        time: duration.time,
        label: `${duration.time} (-${penalty} dice)`,
      })
    }
  }

  return options
})
const durationOptions = computed(() => {
  let options = []
  options.push({
    type: "group",
    label: "Standard",
    key: "standard",
    children: standardDurationOptions.value,
  })
  options.push({
    type: "group",
    label: "Advanced",
    key: "advanced",
    children: advancedDurationOptions.value,
  })
  return options
})
const standardScaleOptions = computed(() => {
  let options = []

  for (let [key, scale] of scales) {
    if (key[0] === "s") {
      let s = clone(scale)
      options.push({ ...s, penalty: -scale.penalty, value: key })
    }
  }

  return options
})
const advancedScaleOptions = computed(() => {
  let options = []

  for (let [key, scale] of scales) {
    if (key[0] === "a") {
      let s = clone(scale)
      options.push({ ...s, penalty: -scale.penalty, value: key })
    }
  }

  return options
})
const scaleOptions = computed(() => {
  let options = []
  options.push({
    type: "group",
    label: "Standard",
    key: "standard",
    children: standardScaleOptions.value.map(({ value, number, size, area, penalty }) => {
      return {
        value: value,
        label: `${number} subjects or ${area.toLowerCase()} (${penalty} dice)`,
      }
    }),
  })
  options.push({
    type: "group",
    label: "Advanced",
    key: "advanced",
    children: advancedScaleOptions.value.map(({ value, number, size, area, penalty }) => {
      return {
        value: value,
        label: `${number} subjects or ${area.toLowerCase()} (${penalty} dice)`,
      }
    }),
  })
  return options
})


</script>