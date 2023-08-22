<template>
  <Card title="Yantras" collapsed :summary="yantrasSummary">
    <template #content>
      <n-space vertical>
        <n-table striped bordered v-if="spell.yantras.length > 0">
          <tbody>
            <tr v-for="yantra, index in spell.yantras" :key="index">
              <td>
                <n-space justify="space-between">
                  <n-space align="center">
                    <n-button quaternary size="tiny" type="error" @click="deleteYantra(yantra.yantraKey, yantra.id)">
                      <template #icon>
                        <n-icon>
                          <Trash />
                        </n-icon>
                      </template>
                    </n-button>
                    <n-text>
                      <n-text strong>{{
                        yantra.id ? `${yantra.name !== '' ? yantra.name + ', ' : ''}${yantra.label.split("(+")[0]}` :
                        yantra.label.split("(+")[0]
                      }}</n-text>
                      <n-text depth="3">&nbsp;(+{{ yantra.label.split("(+")[1] }}</n-text>
                    </n-text>
                  </n-space>
                  <n-switch :disabled="!!yantra.id" size="small" v-model:value="yantra.isDedicatedTool" />
                </n-space>
              </td>
            </tr>
          </tbody>
        </n-table>
        <n-select ref="chooseYantraDropdown" :options="yantraOptions" :value="chooseYantraValue"
          :render-label="renderYantraLabel" filterable @update:value="chooseYantraFromDropdown" />
      </n-space>
    </template>
    <template #footer>
      <n-space vertical>
        <n-text>Gnosis {{ caster.traits.Gnosis }} allows the use of {{ maxYantras }} yantras.</n-text>
        <n-text italic v-if="hasDedicatedSoulStone">Using a Dedicated Soul Stone provide -3 Paradox, but you
          cannot contain Paradox.</n-text>
        <n-text italic v-if="hasDedicatedOneTool">Using a Dedicated Tool provides -2 Paradox.</n-text>
        <n-text italic v-if="hasDedicatedBothTools">Using two Dedicated Tools provides -3 Paradox and Chance
          cancellation.</n-text>
        <n-text italic v-if="hasBroadDedication">Broad Dedication (merit) is required to dedicate yantras which
          aren't magical tools.</n-text>
        <n-text italic v-if="hasProfligateDedication">Profligate Dedication (merit) is required to dedicate more
          than two magical tools, but you won't get a benefit for using more than two simultaneously.</n-text>
      </n-space>
    </template>
  </Card>
</template>
<script setup lang="ts">

import { computed, h, ref } from "vue";
import Card from "../components/Card.vue";
import { dots } from "../constants/functions";
import { caster, spell } from "../store/store";
import type { Caster, Spell } from "../store/store";
import { spells } from "../constants/spells";
import { clone, cloneDeep, findIndex, some } from "lodash";
import type { Effect, Practice, Factor, Yantra, Tool } from "../constants/types";
import { Trash, Bookmark, DocumentText, Flash } from '@vicons/ionicons5'

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
import { getBaseCastingTime, getCastingTimeSummary, getDurationSummary, getFactorSummary, getPotencySummary, getRangeSummary, getScaleSummary, getYantras, getYantrasSummary } from "../constants/methods";
import { type SelectGroupOption, type SelectInst } from "naive-ui";

const yantrasSummary = computed(() => getYantrasSummary(caster, spell))

const yantras = computed(() => getYantras(caster, spell))

const maxYantras = computed(() => Math.ceil(caster.traits.Gnosis / 2) + 1)

const hasYantra = (key: string) => some(spell.yantras, ["yantraKey", key])
const isAdvanced = (factor: Factor) => spell.factors[factor][0] === "a"
const isPrimaryFactor = (factor: "Duration" | "Potency") => spell.primaryFactor === factor

const isConcentrationMantraAllowed = () => isPrimaryFactor("Duration") || spell.factors.duration !== "s1"

const isDedicatedToolYantraUsed = computed(() => {
  if (hasYantra("t1")) return true
  return some(spell.yantras, ["isDedicatedTool", true])
  // setter (bool)
  // set(isUsed) {
  //   if (isUsed) {
  //     if (this.isDedicatedToolYantraUsed) {
  //       this.message.warning("Dedicated Tool already used")
  //     }
  //     this.spell.yantras.push(this.yantras.get("t1"))
  //   } else {
  //     this.deleteYantra("t1")

  //     for (let key of this.spell.yantras) {
  //       this.spell.yantras[key].isDedicatedTool = false
  //     }

  //     this.$forceUpdate() // cache: false and this.$forceUpdate() means the getter shows updated value
  //   }
  // },
})
const hasDedicatedSoulStone = computed(() => {
  return some(spell.yantras, (y) => y.isDedicatedTool && y.yantraKey[0] === "s");
})
const hasDedicatedOneTool = computed(() => {
  return spell.yantras.filter(y => y.isDedicatedTool).length === 1;
})
const hasDedicatedBothTools = computed(() => {
  return spell.yantras.filter(y => y.isDedicatedTool).length > 1;
})
const hasBroadDedication = computed(() => {
  return some(spell.yantras, (y) => y.isDedicatedTool && y.yantraKey[0] !== "s" && y.yantraKey[0] !== "t");
})
const hasProfligateDedication = computed(() => {
  return spell.yantras.filter(y => y.isDedicatedTool).length > 2;
})


const isUniqueYantraUsed = (key: string) => {
  let yantra = yantras.value.get(key)

  // ignore non-uniques
  if (!yantra.unique) {
    return false
  }

  // this version is used?
  if (hasYantra(key)) {
    return true
  }

  // there are multiple version of this yantra - check for others
  if (key.indexOf("_") !== -1) {
    let baseKey = key.split("_")[0]
    if (spell.yantras.some((yantra) => yantra.yantraKey.indexOf(baseKey) === 0)) {
      return true
    }
  }

  return false
}

const getYantraOptions = (prefix: string) => {
  let options = []

  for (let [key, yantra] of yantras.value) {
    if (key[0] === prefix) {
      // disabled?
      let disabledWarning

      if (key === "a1" && spell.isRote === false) {
        disabledWarning = "Only available when casting Rotes."
      }

      if (key === "a2" && !isConcentrationMantraAllowed) {
        disabledWarning = "Duration must be more than 1 turn to use concentration."
      }

      if (isUniqueYantraUsed(key)) {
        disabledWarning = "Only one of this Yantra may be used."
      }

      // if (key === "t1" && this.isDedicatedToolYantraUsed) {
      //   disabledWarning = "Dedicated Tool is already being used."
      // }

      yantra.disabledWarning = disabledWarning
      yantra.disabled = !!disabledWarning

      // add to options
      options.push(yantra)
    }
  }

  return options
}

const savedYantraOptions = computed(() => {
  const options = []
  for (let tool of caster.tools) {
    const source: Yantra = yantras.value.get(tool.key)
    const cloned: Yantra = clone(source)
    cloned.isDedicatedTool = tool.dedicated
    cloned.name = tool.name
    cloned.desc = tool.description
    cloned.id = tool.id
    if (some(spell.yantras, ["key", cloned.id])) {
      options.push({ ...cloned, key: cloned.id, value: cloned.id, disabled: true });
    } else {
      options.push({ ...cloned, key: cloned.id, value: cloned.id });
    }
  }
  return options
})
const locationYantraOptions = computed(() => {
  return getYantraOptions("l")
})
const actionYantraOptions = computed(() => {
  return getYantraOptions("a")
})
const toolYantraOptions = computed(() => {
  return getYantraOptions("t")
})
const soulstoneYantraOptions = computed(() => {
  return getYantraOptions("s")
})
const sympathyYantraOptions = computed(() => {
  return getYantraOptions("y")
})
const sacramentYantraOptions = computed(() => {
  return getYantraOptions("c")
})
const personaYantraOptions = computed(() => {
  return getYantraOptions("p")
})
const yantraOptions = computed(() => {
  return [
    { type: "group", label: "Saved", key: "saved", children: savedYantraOptions.value },
    { type: "group", label: "Locations", key: "locations", children: locationYantraOptions.value },
    { type: "group", label: "Actions", key: "actions", children: actionYantraOptions.value },
    { type: "group", label: "Tools", key: "tools", children: toolYantraOptions.value },
    { type: "group", label: "Soul Stones", key: "soulstones", children: soulstoneYantraOptions.value },
    { type: "group", label: "Sympathy", key: "sympathy", children: sympathyYantraOptions.value },
    { type: "group", label: "Sacrament", key: "sacrament", children: sacramentYantraOptions.value },
    { type: "group", label: "Persona", key: "persona", children: personaYantraOptions.value },
  ]
})

const chooseYantraValue = ref(null)
const chooseYantraDropdown = ref<SelectInst | null>(null)

const chooseYantraFromDropdown = (option: string, object: Yantra) => {
  if (chooseYantraDropdown.value) {
    chooseYantraDropdown.value.blur()
    chooseYantraValue.value = null
  }
  if (object) spell.yantras.push(clone(object))
  else addYantra(option)
}
const addYantra = (key: string) => {
  let yantra = yantras.value.get(key)

  spell.yantras.push(clone(yantra))
}

const deleteYantra = (key: string, id?: number) => {
  if (id) {
    let index = findIndex(spell.yantras, (yantra) => yantra.id === id)
    spell.yantras.splice(index, 1)
  } else {
    let index = findIndex(spell.yantras, (yantra) => yantra.yantraKey === key && yantra.id === undefined)
    spell.yantras.splice(index, 1)
  }
}

const renderYantraLabel = (option: SelectGroupOption) => {
  if (option.type === "group") return option.label

  return h(
    'div',
    {
      style: { padding: '4px 0' },
    },
    [
      h('b', String(option.id ? `${option.name ? option.name + ', ' : ''}${option.label}` : option.label)),
      h('br'),
      String(option.disabledWarning || option.desc),
    ]
  )
}

</script>