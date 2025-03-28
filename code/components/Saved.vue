<template>
  <Card :icon="true" title="Saved" :summary="`(${caster.saved.length})`">
    <template #icon>
      <n-icon>
        <BookmarkOutline />
      </n-icon>
    </template>
    <template #footer v-if="caster.saved.length > 0">
      <n-space vertical>
        <Card :title="item.name" collapsed :summary="getCastingSummaryFor(item)" v-for="(item) in caster.saved"
          :key="item.id">
          <template #tags>
            <n-space :size="5">
              <n-tag v-if="getCastingType(caster, item)" size="small" :bordered="false" round strong
                style="text-transform: capitalize"> {{ getCastingType(caster, item) }} </n-tag>
              <n-tag size="small" :bordered="false" round strong
                :type="getUsedReach(caster, item) > getFreeReach(caster, item) ? 'warning' : 'success'">
                {{ getUsedReach(caster, item) }}/{{ getFreeReach(caster, item) }} Reach </n-tag>
              <n-tag size="small" :bordered="false" round strong type="success"> {{ getDicePool(caster, item, scene) }}
                Dice
              </n-tag>
              <n-tag size="small" :bordered="false" round strong type="success"> {{ getTotalMana(caster, item, scene) }}
                Mana
              </n-tag>
              <n-tag size="small" :bordered="false" round strong type="error"> {{ getParadoxDice(caster, item, scene) }}
                Paradox </n-tag>
            </n-space>
          </template>
          <template #content>
            <n-space vertical size="large">
              <n-text v-if="getCastingSummaryFor(item)"><b>Casting:</b> {{
    getCastingSummaryFor(item)
  }}.</n-text>
              <n-text v-if="getFactorsSummaryFor(item)"><b>Factors:</b> {{
    getFactorsSummaryFor(item)
  }}.</n-text>
              <n-text v-if="getEffectsSummaryFor(item)"><b>Extra:</b> {{ getEffectsSummaryFor(item) }}</n-text>
              <n-text v-if="getYantrasSummary(caster, item)"><b>Yantras:</b> {{
    getYantrasSummary(caster, item)
  }}.</n-text>
            </n-space>
          </template>
          <template #footer>
            <n-space justify="space-between">
              <n-button class="btn-only-icon-when-small" title="Remove" size="tiny" type="error"
                @click="unsaveSpell(item)">
                <template #icon>
                  <n-icon>
                    <Trash />
                  </n-icon>
                </template>
                Remove
              </n-button>
              <n-space>
                <n-button class="btn-only-icon-when-small" title="Prepare" size="tiny" type="warning"
                  @click="castSpell(item)">
                  <template #icon>
                    <n-icon>
                      <Flash />
                    </n-icon>
                  </template>
                  Cast
                </n-button>
                <n-button class="btn-only-icon-when-small" title="Copy for Roll20" size="tiny" type="info"
                  @click="copySpell(item)">
                  <template #icon>
                    <n-icon>
                      <DocumentText />
                    </n-icon>
                  </template>
                  Copy
                </n-button>
                <n-button class="btn-only-icon-when-small" title="Edit" size="tiny" type="success"
                  @click="loadSpell(item)">
                  <template #icon>
                    <n-icon>
                      <Build />
                    </n-icon>
                  </template>
                  Edit
                </n-button>
              </n-space>
            </n-space>
          </template>
        </Card>
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">

import { cloneDeep, findIndex, merge } from "lodash";
import Card from "../components/Card.vue"
import { getCastingNameSummary, getRote, getCastingEffectsSummary, getCastingDescriptionSummary, getYantrasSummary, getCastingTimeSummary, getFactorSummary, getDicePoolSummary, getDicePool, getTotalMana, getParadoxDice, getUsedReach, getFreeReach, getPotencySummary, getDurationSummary, getRangeSummary, getScaleSummary, getParadoxSummary, getCastingType } from "../constants/methods";

import { BookmarkOutline, Build, DocumentText, Flash, Trash } from "@vicons/ionicons5";
import { caster, spell, scene } from "../store/store";
import type { Spell } from "../store/store";
import { useMessage } from "naive-ui";

const message = useMessage()

const unsaveSpell = (choice: Spell) => {
  let index = findIndex(caster.saved, (spell) => spell.id === choice.id)
  caster.saved.splice(index, 1)
};

const copySpell = (choice: Spell) => {
  const out = [];
  out.push("&{template:default}");
  out.push(`{{name=${getCastingNameSummary(caster, choice)}}}`)
  out.push(`{{summary=${getCastingDescriptionSummary(caster, choice)}}}`)
  out.push(`{{casting=${getCastingTimeSummary(caster, choice)}}}`)
  out.push(`{{factors=${getFactorSummary(caster, choice)}}}`)
  out.push(`{{extras=${getCastingEffectsSummary(caster, choice) || "None"}}}`)
  out.push(`{{yantras=${getYantrasSummary(caster, choice) || "None"}}}`)
  out.push(`{{paradox=${getParadoxSummary(caster, choice, scene) || "None"}}}`)
  out.push(`{{=[Roll ${getDicePoolSummary(caster, choice, scene)} to cast](!&#13;&#91;[&#63;{Number of dice|${getDicePool(caster, choice, scene)}}d10>8!>&#63;{Explodes on|10}]&#93; Successes)}}`);
  const text = out.join(" ");
  navigator.clipboard.writeText(text).then(() => {
    message.info(`${choice.name} was copied`)
  });
}
const loadSpell = (choice: Spell) => {
  const cloned = cloneDeep(choice)
  spell.reset()
  merge(spell, cloned)
  message.success(`${choice.name} was prepared`)
}
const castSpell = (choice: Spell) => {
  const cloned = cloneDeep(choice)
  cloned.id = new Date().getTime()
  caster.active.push(cloned)
  message.warning(`${cloned.name} was cast`)
}

const getCastingSummaryFor = (choice: Spell) => {
  let summary = []
  let method = getCastingType(caster, choice)
  if (method) summary.push(method)
  summary.push(`${getUsedReach(caster, choice)}/${getFreeReach(caster, choice)} Reach`)
  summary.push(`${getDicePool(caster, choice, scene)} Dice`)
  summary.push(`${getTotalMana(caster, choice, scene)} Mana`)
  summary.push(`${getParadoxDice(caster, choice, scene)} Paradox`)
  return summary.join(", ")
}
const getFactorsSummaryFor = (choice: Spell) => {
  let summary = []
  summary.push(`${getPotencySummary(caster, choice).toLowerCase()}`)
  summary.push(`${getDurationSummary(caster, choice).toLowerCase()}`)
  summary.push(`${getCastingTimeSummary(caster, choice).toLowerCase()}`)
  summary.push(`${getRangeSummary(caster, choice).toLowerCase()}`)
  summary.push(`${getScaleSummary(caster, choice).toLowerCase()}`)
  return summary.join(", ")
}
const getEffectsSummaryFor = (choice: Spell) => {
  let summary = choice.effects.map(effect => effect.effect)
  if (choice.spendWillpower) summary.unshift("Willpower spent.")
  if (choice.commonEffects.changePrimaryFactor) summary.push("Changed primary factor.")
  if (caster.active.length >= caster.traits.Gnosis) summary.push("Casting spells above active limit.")
  if (choice.custom) choice.page = "Creative, " + choice.practice
  return summary.join(" ")
}


</script>