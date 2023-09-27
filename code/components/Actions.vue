<template>
  <n-space :size="10">
    <n-space :size="2" v-if="canCastSpell">
      <n-tag size="small" :bordered="false" round strong :type="usedReach > freeReach ? 'warning' : 'success'"> {{
        usedReach }}/{{ freeReach }} Reach</n-tag>
      <n-tag size="small" :bordered="false" round strong :type="isDicePoolTooLow ? 'warning' : 'success'">
        {{ dicePool }} Dice</n-tag>
      <n-tag size="small" :bordered="false" round strong type="success">{{ totalMana }} Mana</n-tag>
      <n-tag v-if="hasParadox" size="small" :bordered="false" round strong type="error">{{ paradoxDice }}
        Paradox</n-tag>
    </n-space>
    <n-space :size="2" v-if="canCastSpell === false">
      <n-tag size="small" disabled :bordered="false" round strong>0/0 Reach</n-tag>
      <n-tag size="small" disabled :bordered="false" round strong>0 Dice</n-tag>
      <n-tag size="small" disabled :bordered="false" round strong>0 Mana</n-tag>
    </n-space>
    <n-space :size="2">
      <n-button size="tiny" title="Reset" :disabled="canCastSpell === false" type="error" @click="resetSpell">
        <template #icon>
          <n-icon>
            <Trash />
          </n-icon>
        </template>
      </n-button>
      <n-button size="tiny" title="Cast" :disabled="canCastSpell === false" type="warning" @click="castSpell(spell)">
        <template #icon>
          <n-icon>
            <Flash />
          </n-icon>
        </template>
      </n-button>
      <n-button size="tiny" title="Copy for Roll20" :disabled="canCastSpell === false" type="info"
        @click="copySpell(spell)">
        <template #icon>
          <n-icon>
            <DocumentText />
          </n-icon>
        </template>
      </n-button>
      <n-button size="tiny" title="Save" :disabled="canCastSpell === false" type="success" @click="saveSpell(spell)">
        <template #icon>
          <n-icon>
            <Bookmark />
          </n-icon>
        </template>
      </n-button>
    </n-space>
  </n-space>
</template>

<script setup lang="ts">

import { computed } from "vue";
import Card from "../components/Card.vue"
import { spell, caster, scene } from "../store/store"
import type { Caster, Spell } from "../store/store"
import { Trash, Bookmark, DocumentText, Flash } from '@vicons/ionicons5'
import { getCastingEffectsSummary, getCastingFactorsSummary, getCastingTimeSummary, getDicePool, getDicePoolSummary, getFactorSummary, getFreeReach, getParadoxDice, getTotalMana, getUsedReach, getYantrasSummary } from "../constants/methods";
import { cloneDeep, max } from "lodash";
import { useMessage } from "naive-ui";
const message = useMessage()

const isCasterConfigured = computed(() => caster.traits.Gnosis > 0 && Object.values(caster.arcana).filter((a) => a.dots > 0).length > 0)

const isSpellArcanaTooHigh = computed(() => {
  if (spell.primaryArcana.arcana && spell.primaryArcana.level) {
    if (caster.arcana[spell.primaryArcana.arcana]) {
      if (caster.arcana[spell.primaryArcana.arcana].dots < spell.primaryArcana.level) return true
    }
  }
  // if (spell.secondaryArcana && spell.secondaryArcana.arcana && spell.secondaryArcana.level && caster.arcana[spell.secondaryArcana.arcana].dots < spell.secondaryArcana.level) return true
  return false
})

const canCastSpell = computed(() => {
  if (spell.name === undefined) return false
  if (isSpellArcanaTooHigh.value) return false
  if (isCasterConfigured.value === false) return false
  return true
})

const usedReach = computed(() => {
  return getUsedReach(caster, spell)
})

const freeReach = computed(() => {
  return getFreeReach(caster, spell)
})

const dicePool = computed(() => {
  return getDicePool(caster, spell, scene)
})

const isDicePoolTooLow = computed(() => {
  return dicePool.value < 1
})

const hasParadox = computed(() => {
  return (
    usedReach.value > freeReach.value ||
    caster.paradox > 0 ||
    scene.witnesses > 0
  )
})

const totalMana = computed(() => {
  return getTotalMana(caster, spell)
})

const paradoxDice = computed(() => {
  return getParadoxDice(caster, spell, scene)
})
const resetSpell = () => {
  spell.reset();
}

const copySpell = (choice: Spell) => {
  const out = [];
  out.push("&{template:default}");
  out.push(`{{name=**${choice.name}** (${choice.primaryArcana.arcana} ${Array.from({ length: choice.primaryArcana.level }, v => "&bull;").join("")})}}`)
  out.push(`{{summary=${choice.description}\n(${choice.page})}}`)
  out.push(`{{casting=${getCastingTimeSummary(caster, choice)}}}`)
  out.push(`{{factors=${getCastingFactorsSummary(caster, choice)}}}`)
  out.push(`{{extras=${getCastingEffectsSummary(caster, choice) || "None"}}}`)
  out.push(`{{yantras=${getYantrasSummary(caster, choice) || "None"}}}`)
  out.push(`{{=[Roll ${getDicePoolSummary(caster, choice, scene)} to cast](!&#13;&#91;[&#63;{Number of dice|${getDicePool(caster, choice, scene)}}d10>8!>&#63;{Explodes on|10}]&#93; Successes)}}`);
  const text = out.join(" ");
  navigator.clipboard.writeText(text).then(() => {
    message.info(`${choice.name} was copied`)
  });
}
const loadSpell = (choice: Spell) => {
  // const cloned = cloneDeep(spell)
  // this.spell = { ...cloned }
  // this.spell.primaryArcana.arcana = spell.primaryArcana.arcana;
  // this.spell.primaryArcana.level = spell.primaryArcana.level;
  // this.spell.secondaryArcana.arcana = spell.secondaryArcana.arcana;
  // this.spell.secondaryArcana.level = spell.secondaryArcana.level;
  message.success(`${choice.name} was loaded`)
}
const castSpell = (choice: Spell) => {
  const cloned = cloneDeep(spell)
  cloned.id = new Date().getTime()
  caster.active.push(cloned)
  message.warning(`${cloned.name} was cast`)
}
const saveSpell = (choice: Spell) => {
  const cloned = cloneDeep(spell)
  cloned.id = cloned.id || new Date().getTime()
  caster.saved.push(cloned)
  message.success(`${cloned.name} was saved`)
}

</script>

<style></style>