<template>
  <n-config-provider :theme="theme" :theme-overrides="{ common: { fontWeightStrong: '600' } }">
    <n-layout static embedded content-style="padding: 30px; padding-bottom: 100px; max-width: 600px; margin: 0 auto">
      <n-tabs default-value="spell" size="large" animated>
        <template #suffix>
          <n-switch v-model:value="dark" @update:value="setDark">
            <template #checked>Dark</template>
            <template #unchecked>Dark</template>
          </n-switch>
        </template>
        <n-tab-pane name="caster" tab="Caster">
          <n-space vertical>
            <!-- Gnosis -->
            <Card title="Gnosis" :summary="gnosisSummary">
              <template #content>
                <n-rate clearable :count="10" v-model:value="caster.gnosis">
                  <n-icon>
                    <EllipseOutline />
                  </n-icon>
                </n-rate>
              </template>
            </Card>
            <!-- Arcana -->
            <Card title="Arcana" :summary="arcanaSummary">
              <template #content>
                <n-table striped :bordered="false" class="s-table" style="margin-left: -8px; width: calc(100% + 16px)">
                  <tbody>
                    <tr v-for="(item, name) of caster.arcana" :key="name">
                      <td width="50">
                        <n-text>{{ name }}</n-text>
                      </td>
                      <td width="20">
                        <n-switch size="small" v-model:value="item.ruling" />
                      </td>
                      <td>
                        <n-rate clearable :count="5" v-model:value="item.level">
                          <n-icon>
                            <EllipseOutline />
                          </n-icon>
                        </n-rate>
                      </td>
                    </tr>
                  </tbody>
                </n-table>
              </template>
            </Card>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="spell" tab="Spell">
          <n-space vertical>
            <!-- Info -->
            <n-alert type="info" v-if="hasConfiguredCaster === false">
              <n-text>You need to configure your Gnosis and Arcana in the <b>Caster</b> tab first.</n-text>
            </n-alert>
            <!-- Spell -->
            <Card title="Spell" :summary="spellSummary" v-if="hasConfiguredCaster">
              <template #content>
                <n-space vertical size="large">
                  <n-select filterable placeholder="What spell are you casting?" v-model:value="spell.name" @update:value="chooseSpell" :options="chooseSpellOptions" />
                  <n-text v-if="spell.name" italic depth="2">({{ spell.page }}) {{ spell.description }}</n-text>
                  <n-alert type="warning" v-if="spell.name && isSpellArcanaTooHigh">
                    <n-text>You don't have the arcana required for this spell</n-text>
                  </n-alert>
                </n-space>
              </template>
              <template #footer>
                <n-grid v-if="spell.name" :cols="4">
                  <n-grid-item>
                    <n-text> <b>Practice</b><br />{{ spell.practice }} </n-text>
                  </n-grid-item>
                  <n-grid-item>
                    <n-text> <b>Factor</b><br />{{ spell.primaryFactor }} </n-text>
                  </n-grid-item>
                  <n-grid-item :span="2">
                    <n-text> <b>Rote Skills</b><br />{{  spell.roteSkills.join(", ") }}</n-text>
                  </n-grid-item>
                </n-grid>
              </template>
            </Card>
            <!-- Effects -->
            <Card title="Effects" :summary="effectsSummary" v-if="canCastSpell">
              <template #content>
                <n-space vertical>
                  <n-table bordered striped class="e-table" style="margin-left: -5px; width: calc(100% + 10px)">
                    <tbody>
                      <tr>
                        <td width="20">
                          <n-switch size="small" v-model:value="spell.isPraxis" @update:value="setRote(false)" />
                        </td>
                        <td width="140">
                          <b>Cast as Praxis</b>
                        </td>
                        <td colspan="2"></td>
                      </tr>
                      <tr>
                        <td width="20">
                          <n-switch size="small" v-model:value="spell.isRote" @update:value="setPraxis(false)" />
                        </td>
                        <td width="140">
                          <b>Cast as Rote</b>
                          <b v-if="spell.isRote"> (+{{ spell.roteSkill }})</b>
                        </td>
                        <td>
                          <n-slider v-if="spell.isRote" :tooltip="false" :min="0" :max="10" v-model:value="spell.roteSkill" />
                        </td>
                      </tr>
                      <tr>
                        <td width="20">
                          <n-switch size="small" v-model:value="spell.spendWillpower" />
                        </td>
                        <td width="140">
                          <b>Spend Willpower</b>
                        </td>
                        <td colspan="2">Gain +3 dice</td>
                      </tr>
                    </tbody>
                  </n-table>
                  <n-table v-if="spell.additionalEffects" bordered striped class="e-table" style="margin-left: -5px; width: calc(100% + 10px)">
                    <tbody>
                      <tr v-for="(item, index) of spell.additionalEffects" :key="index">
                        <td v-if="item.cost" width="20">
                          <n-switch size="small" :disabled="isEffectRestricted(item)" :value="isEffectAdded(item)" @update:value="toggleEffect(item)" />
                        </td>
                        <td v-if="item.cost" width="140">
                          <b>{{ item.cost.map(c => `+${c.value} ${c.type}`).join(", ")}}</b>
                        </td>
                        <td :colspan="item.cost ? 1 : 3">
                          <b v-if="item.requirement">({{ item.requirement.map(v => `${v.arcana} ${v.value}`).join(", ") }}):</b>
                          {{ item.effect }}
                        </td>
                      </tr>
                    </tbody>
                  </n-table>
                </n-space>
              </template>
            </Card>
            <!-- Method -->
            <Card title="Conditions" collapsed :summary="conditionsSummary" v-if="canCastSpell">
              <template #content>
                <n-space vertical size="large">
                  <n-space vertical size="large">
                    <n-text strong>Bonus spellcasting dice</n-text>
                    <n-slider placement="right" :min="0" :max="10" v-model:value="conditions.bonusDice" />
                  </n-space>
                  <n-space vertical size="large">
                    <n-text strong>Spells currently active</n-text>
                    <n-slider placement="right" :min="0" :max="10" v-model:value="conditions.activeSpells" />
                  </n-space>
                  <n-space vertical size="large">
                    <n-text strong>Withstand rating of subject</n-text>
                    <n-slider placement="right" :min="0" :max="10" v-model:value="conditions.subjectWithstand" />
                  </n-space>
                </n-space>
              </template>
              <template #footer v-if="conditionsSummary !== 'None'">
                <n-space vertical>
                  <n-text v-if="conditions.bonusDice > 0"><b>Bonus:</b> Can come from Fate magic, Merits, Artefacts, or the Storyteller.</n-text>
                  <n-text v-if="conditions.activeSpells > 0"><b>Spells:</b> Maintaining more spells than the caster's Gnosis adds Reach.</n-text>
                  <n-text v-if="conditions.subjectWithstand > 0"><b>Withstand:</b> Potency must exceed this rating for the spell to take effect.</n-text>
                </n-space>
              </template>
            </Card>
            <!-- Potency -->
            <Card title="Potency" collapsed :summary="potencySummary" v-if="canCastSpell">
              <template #content>
                <n-select v-model:value="spell.factors.potency" :options="potencyOptions" />
              </template>
              <template #footer> Advanced Potency grants an additional -2 to Withstand. </template>
            </Card>
            <!-- Duration -->
            <Card title="Duration" collapsed :summary="durationSummary" v-if="canCastSpell">
              <template #content>
                <n-select v-model:value="spell.factors.duration" :options="durationOptions" />
              </template>
              <template #footer v-if="spell.factors.duration === 'a6'"> Indefinite duration requires +1 Reach and +1 Mana </template>
            </Card>
            <!-- Casting Time -->
            <Card title="Casting Time" collapsed :summary="castingTimeSummary" v-if="canCastSpell">
              <template #content>
                <n-select v-model:value="spell.factors.castingTime" :options="castingTimeOptions" />
              </template>
              <template #footer v-if="isAdvanced('castingTime')"> Using more than one Yantra (or High Speech) will increase this time. </template>
            </Card>
            <!-- Range -->
            <Card title="Range" collapsed :summary="rangeSummary" v-if="canCastSpell">
              <template #content>
                <n-select v-model:value="spell.factors.range" :options="rangeOptions" />
              </template>
            </Card>
            <!-- Scale -->
            <Card title="Scale" collapsed :summary="scaleSummary" v-if="canCastSpell">
              <template #content>
                <n-select v-model:value="spell.factors.scale" :options="scaleOptions" />
              </template>
              <template #footer> Advanced Scale doubles the number of subjects and adds 5 size per additional -2 dice penalty. </template>
            </Card>
            <!-- Yantras -->
            <Card title="Yantras" collapsed :summary="yantrasSummary" v-if="canCastSpell">
              <template #content>
                <n-space vertical>
                  <n-table
                    v-for="(group, name) of {
                      Locations: locationYantraOptions,
                      Actions: actionYantraOptions,
                      Tools: toolYantraOptions,
                    }"
                    :key="name"
                    striped
                  >
                    <thead>
                      <tr>
                        <th>{{ name }}</th>
                        <th width="80"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="yantra in group" :key="yantra.yantraKey">
                        <td>
                          <n-text strong>{{ yantra.name }} (+{{ yantra.bonus }})</n-text><br />
                          <n-text v-html="yantra.desc" />
                        </td>
                        <td v-if="hasYantra(yantra.yantraKey) === true">
                          <n-button block secondary type="error" @click="deleteYantra(yantra.yantraKey)"> Remove </n-button>
                        </td>
                        <td v-if="hasYantra(yantra.yantraKey) === false">
                          <n-tooltip
                            :trigger="
                              !!yantra.disabledWarning || numYantras === maxYantras
                                ? 'hover'
                                : 'manual'
                            "
                          >
                            <template #trigger>
                              <n-button
                                block
                                secondary
                                :type="
                                  !!yantra.disabledWarning || numYantras === maxYantras
                                    ? 'tertiary'
                                    : 'success'
                                "
                                @click="
                                  !yantra.disabledWarning && numYantras < maxYantras
                                    ? addYantra(yantra.yantraKey)
                                    : undefined
                                "
                              >
                                Add
                              </n-button>
                            </template>
                            <span v-if="numYantras === maxYantras"> You cannot have more than {{ maxYantras }} yantras </span>
                            <span v-if="numYantras !== maxYantras">
                              {{ yantra.disabledWarning }}
                            </span>
                          </n-tooltip>
                        </td>
                      </tr>
                    </tbody>
                  </n-table>
                </n-space>
              </template>
              <template #footer> Gnosis {{ caster.gnosis }} allows the use of {{ maxYantras }} yantras. </template>
            </Card>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="saved" :tab="`Saved (${saved.length})`">
          <n-space vertical>
            <n-card embedded v-if="saved.length === 0">
              <n-text italic depth="3">You haven't saved any spells!</n-text>
            </n-card>
            <!-- Saved -->
            <Card :title="item.name" collapsed :summary="item.castingSummary" v-for="(item, index) in saved" :key="index">
              <template #content>
                <n-space vertical>
                  <n-text><b>Factors:</b> {{ item.factorSummary }}.</n-text>
                  <n-text v-if="item.effectSummary"><b>Effects:</b> {{ item.effectSummary }}</n-text>
                  <n-text v-if="item.yantraSummary"><b>Yantras:</b> {{ item.yantraSummary }}.</n-text>
                </n-space>
              </template>
              <template #footer>
                <n-space justify="space-between">
                  <n-button strong type="info" @click="formatSpell(item)">Roll20</n-button>
                  <n-space>
                    <n-button strong type="error" @click="removeSpell(item)">Remove</n-button>
                    <n-button strong type="success" @click="loadSpell(item)">Load</n-button>
                  </n-space>
                </n-space>
              </template>
            </Card>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-layout>
    <n-card class="bottom" v-if="canCastSpell">
      <n-space horizontal size="small" justify="space-between">
        <n-space size="small">
          <n-tag :bordered="false" round strong :type="usedReach > freeReach ? 'warning' : 'success'"> Reach {{ usedReach }}/{{ freeReach }} </n-tag>
          <n-tag :bordered="false" round strong :type="isDicePoolTooLow ? 'warning' : 'success'"> Dice Pool {{ dicePool }} </n-tag>
          <n-tag :bordered="false" round strong type="success">Mana {{ totalMana }}</n-tag>
          <n-tag v-if="hasParadox" :bordered="false" round strong type="error"> Paradox {{ paradoxDice }} </n-tag>
        </n-space>
        <n-space size="small">
          <n-button type="warning" strong @click="reset">Reset</n-button>
          <n-button type="info" strong @click="formatSpell(spell)">Roll20</n-button>
          <n-button type="success" strong @click="saveSpell(spell)">Save</n-button>
        </n-space>
      </n-space>
    </n-card>
  </n-config-provider>
</template>

<script>
import { clone, max, some, capitalize, findIndex, range } from "lodash"
import { useMessage } from "naive-ui"
import { darkTheme, lightTheme } from "naive-ui"

import { Close, ChevronDown, ChevronUp, Ellipse, EllipseOutline } from "@vicons/ionicons5"

import Card from "./Card.vue"

import {
  arcanaNames,
  baseCastingTimes,
  castingMethods,
  factors,
  gnosisManaLimits,
  durations,
  scales,
  yantrasBaseData,
} from "../constants/constants.js"
import { spells } from "../constants/spells.js"

function dots(num) {
  return Array.from({ length: num }, () => "•").join("")
}

const defaultCaster = {
  gnosis: 0,
  arcana: {
    Death: { level: 0, ruling: false },
    Fate: { level: 0, ruling: false },
    Forces: { level: 0, ruling: false },
    Life: { level: 0, ruling: false },
    Matter: { level: 0, ruling: false },
    Mind: { level: 0, ruling: false },
    Prime: { level: 0, ruling: false },
    Spirit: { level: 0, ruling: false },
    Space: { level: 0, ruling: false },
    Time: { level: 0, ruling: false },
  },
}
const defaultSpell = {
  name: undefined,
  isRote: false,
  isPraxis: false,
  practice: undefined,
  primaryFactor: undefined,
  primaryArcana: undefined,
  secondaryArcana: undefined,
  description: undefined,
  effects: [],
  additionalEffects: [],
  description: undefined,
  page: undefined,
  factors: {
    castingTime: "s1",
    potency: "s1",
    range: "s1",
    duration: "s1",
    scale: "s1",
  },
  roteSkills: [],
  roteSkill: 0,
  spendWillpower: false,
  extraReach: 0,
  yantras: [],
  yantraAlsoDedicatedTool: null,
  attainments: {
    conditionalDuration: false,
    everywhere: false,
    permanence: false,
    sympatheticRange: false,
    temporalSympathy: false,
    timeInABottle: false,
  },
}
const defaultConditions = {
  subjectWithstand: 0,
  activeSpells: 0,
  bonusDice: 0,
}
const defaultParadox = {
  inured: false,
  previousRolls: 0,
  sleepers: false,
  sleeperGroupSize: "on",
  manaSpent: 0,
}

export default {
  components: { Card, Close, ChevronDown, ChevronUp, Ellipse, EllipseOutline },
  setup() {
    const message = useMessage()
    return {
      darkTheme,
      lightTheme,
      message: message,
      // theme: lightTheme,
    }
  },
  data() {
    return {
      caster: clone(defaultCaster),
      spell: clone(defaultSpell),
      conditions: clone(defaultConditions),
      paradox: clone(defaultParadox),
      saved: [],
      theme: lightTheme,
      dark: false,
    }
  },
  computed: {
    hasConfiguredCaster() {
      return this.caster.gnosis > 0 && this.highestCasterArcana.length > 0
    },
    canCastSpell() {
      if (this.spell.name === undefined) return false
      if (this.isSpellArcanaTooHigh === true) return false
      return true
    },
    chooseSpellLabel() {
      return this.spell.name
    },
    chooseSpellOptions() {
      let options = []

      for (let arcanaName of arcanaNames) {
        options.push({
          type: "group",
          label: arcanaName,
          key: arcanaName,
          children: spells
            .filter((s) => s.primaryArcana.arcana === arcanaName)
            .sort((a, b) => a.primaryArcana.level - b.primaryArcana.level)
            .map((s) => {
              return {
                label: `${dots(s.primaryArcana.level)} ${s.name}`,
                value: s,
              }
            }),
        })
      }

      return options
    },
    methodOptions() {
      let options = []

      for (let method of castingMethods) {
        options.push({
          label: method,
          value: method,
        })
      }

      return options
    },
    arcanaNameOptions() {
      let options = []

      for (let arcanaName of arcanaNames) {
        options.push({
          label: arcanaName,
          value: arcanaName,
        })
      }

      return options
    },
    highestCasterArcana() {
      let highest = max(Object.values(this.caster.arcana).map((a) => a.level))
      let arcanas = []
      if (highest === 0) return arcanas
      for (let arcana in this.caster.arcana) {
        if (this.caster.arcana[arcana].level === highest) arcanas.push(arcana)
      }
      return arcanas
    },
    maxCasterArcana() {
      let arcana

      if (this.highestCasterArcana.includes(this.spell.primaryArcana.arcana)) {
        if (this.caster.gnosis >= 5) {
          arcana = 5
        } else if (this.caster.gnosis >= 3) {
          arcana = 4
        } else {
          arcana = 3
        }
      } else {
        if (this.caster.gnosis >= 6) {
          arcana = 5
        } else if (this.caster.gnosis >= 4) {
          arcana = 4
        } else {
          arcana = 3
        }
      }

      return arcana
    },
    isCasterArcanaTooHigh() {
      return this.caster.arcana[this.spell.primaryArcana.arcana].level > this.maxCasterArcana
    },
    isSpellArcanaTooHigh() {
      if (this.spell.primaryArcana && this.caster.arcana[this.spell.primaryArcana.arcana].level < this.spell.primaryArcana.level) return true
      if (this.spell.secondaryArcana && this.caster.arcana[this.spell.secondaryArcana.arcana].level < this.spell.secondaryArcana.level) return true
      return false
    },
    freeReach() {
      let arcana

      if (this.spell.isRote) {
        arcana = 5
      } else {
        arcana = this.caster.arcana[this.spell.primaryArcana.arcana].level
      }

      return arcana - this.spell.primaryArcana.level + 1
    },
    usedReach() {
      let reach = 0

      if (this.conditions.activeSpells >= this.caster.gnosis) {
        reach += this.conditions.activeSpells - this.caster.gnosis + 1
      }

      // check factors (advanced factor keys begin with "a")
      for (let factor of factors) {
        if (this.spell.factors[factor][0] === "a") {
          reach++
        }
      }

      // check effects
      for (let effect of this.spell.effects) {
        if (effect.cost) {
          for (let cost of effect.cost) {
            if (cost.type === "Reach") reach += cost.value
          }
        }
      }

      // indefinite duration costs 1 reach
      if (!this.isPrimaryFactor("duration") && this.spell.factors.duration === "a6") {
        reach++
      }

      // spell-specific extra reach
      reach += this.spell.extraReach

      if (this.spell.attainments.permanence) {
        reach--
      }

      if (this.spell.attainments.timeInABottle) {
        reach--
      }

      if (this.spell.attainments.everywhere) {
        reach--
      }

      return reach
    },
    roteOrPraxis() {
      if (this.spell.isRote) {
        return "rote"
      } else if (this.spell.isPraxis) {
        return "praxis"
      } else {
        return null
      }
    },
    baseParadoxDice() {
      return Math.ceil(this.caster.gnosis / 2)
    },
    paradoxDice() {
      let pool, mustRoll

      pool = 0
      mustRoll = false

      if (this.usedReach > this.freeReach) {
        pool += (this.freeReach - this.usedReach) * -1
        mustRoll = true
      }

      // gnosis multiplies paradox from additional reach
      pool *= this.baseParadoxDice

      if (this.paradox.inured) {
        pool += 2
        mustRoll = true
      }

      if (this.paradox.previousRolls > 0) {
        pool += this.paradox.previousRolls
        mustRoll = true
      }

      if (this.paradox.sleepers) {
        pool++
        mustRoll = true
      }

      if (this.isDedicatedToolYantraUsed) {
        pool -= 2
      }

      pool -= this.paradox.manaSpent

      if (pool <= 0 && mustRoll) {
        return "[chance die]"
      }

      return pool
    },
    hasParadox() {
      return (
        this.usedReach > this.freeReach ||
        this.paradox.inured ||
        this.paradox.previousRolls > 0 ||
        this.paradox.sleepers
      )
    },
    durationPenalty() {
      let penalty = durations.get(this.spell.factors.duration).penalty

      if (this.isPrimaryFactor("duration")) {
        penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
      }

      if (penalty <= 0) {
        penalty = 0
      }

      return penalty
    },
    potencyValue() {
      return this.spell.factors.potency.substr(1)
    },
    potencyPenalty() {
      let penalty = (this.potencyValue - 1) * 2

      if (this.isPrimaryFactor("potency")) {
        penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
      }

      if (penalty <= 0) {
        penalty = 0
      }

      return penalty
    },
    dicePool() {
      // base pool
      let pool = this.caster.gnosis + this.caster.arcana[this.spell.primaryArcana.arcana].level

      pool += this.conditions.bonusDice

      if (this.spell.spendWillpower) {
        pool += 3
      }

      // casting time
      if (!this.isAdvanced("castingTime")) {
        pool += this.spell.factors.castingTime[1] - 1
      }

      // withstand
      pool -= this.totalWithstand

      // potency
      pool -= this.potencyPenalty

      // duration
      pool -= this.durationPenalty

      // scale
      pool -= scales.get(this.spell.factors.scale).penalty

      // yantras
      this.spell.yantras.forEach((yantra) => {
        pool += yantra.bonus
      })

      return pool
    },
    isDicePoolTooLow() {
      return this.dicePool < 1
    },
    spellFactorOptions() {
      return [
        {
          label: "Duration",
          value: "duration",
        },
        {
          label: "Potency",
          value: "potency",
        },
      ]
    },
    primaryFactor() {
      return this.spell.primaryFactor
    },
    primaryFactorLabel() {
      return capitalize(this.spell.primaryFactor)
    },
    totalWithstand() {

      let withstand = this.conditions.subjectWithstand

      if (this.spell.factors.potency === "a1") {
        withstand -= 2
      }

      return withstand
    },
    yantras() {
      let expandedYantras = new Map()

      for (let [key, yantraBaseData] of yantrasBaseData) {
        // bonus can contain a single number or a range. Arrayify.
        let bonuses
        if (Array.isArray(yantraBaseData.bonus)) {
          bonuses = range(yantraBaseData.bonus[0], yantraBaseData.bonus[1] + 1)
        } else {
          bonuses = [yantraBaseData.bonus]
        }

        bonuses.forEach((bonus) => {
          let expandedYantra = clone(yantraBaseData)

          /*
           * Bonus
           */

          // rote skill mudra: bonus = skill dots
          if (key === "a1" && this.spell.isRote) {
            bonus = this.spell.roteSkill
          }

          // sympathetic yantras don't give a bonus to sympathetic or temporal spells
          if (
            ["t4", "t5"].includes(key) &&
            (this.spell.attainments.sympatheticRange || this.spell.attainments.temporalSympathy)
          ) {
            bonus = 0
          }

          expandedYantra.yantraKey = Array.isArray(yantraBaseData.bonus) ? key + "_" + bonus : key // key is a reserved property in Vue so we use "yantraKey"
          expandedYantra.bonus = bonus
          expandedYantra.label = `${yantraBaseData.name} (+${bonus} ${
            bonus === 1 ? "die" : "dice"
          })`
          expandedYantra.isDedicatedTool = false
          expandedYantras.set(expandedYantra.yantraKey, expandedYantra)
        })
      }

      return expandedYantras
    },
    maxYantras() {
      return Math.ceil(this.caster.gnosis / 2) + 1
    },
    numYantras() {
      return this.spell.yantras.length
    },
    isConcentrationMantraAllowed() {
      return this.isPrimaryFactor("duration") || this.spell.factors.duration !== "s1"
    },
    isDedicatedToolYantraUsed: {
      cache: false,
      // getter
      get() {
        if (this.hasYantra("t1")) {
          return true
        }

        return some(this.spell.yantras, ["isDedicatedTool", true])
      },
      // setter (bool)
      set(isUsed) {
        if (isUsed) {
          if (this.isDedicatedToolYantraUsed) {
            // debounce(() => {
            //   Toast.create("A Dedicated Tool is already selected")
            // })()
          }

          this.spell.yantras.push(this.yantras.get("t1"))
        } else {
          this.deleteYantra("t1")

          for (let key of this.spell.yantras) {
            this.spell.yantras[key].isDedicatedTool = false
          }

          this.$forceUpdate() // cache: false and this.$forceUpdate() means the getter shows updated value
        }
      },
    },
    totalMana() {
      let mana = 0

      if (
        !this.caster.arcana[this.spell.primaryArcana.arcana].ruling &&
        !this.spell.isRote &&
        !this.spell.isPraxis
      ) {
        mana++
      }

      // check effects
      for (let effect of this.spell.effects) {
        if (effect.cost) {
          for (let cost of effect.cost) {
            if (cost.type === "Mana") mana += cost.value
          }
        }
      }

      if (this.spell.factors.duration === "a6") {
        mana++
      }

      if (this.spell.attainments.permanence) {
        mana++
      }

      if (this.spell.attainments.timeInABottle) {
        mana++
      }

      if (this.spell.attainments.sympatheticRange) {
        mana++
      }

      if (this.spell.attainments.temporalSympathy) {
        mana++
      }

      if (this.spell.attainments.everywhere) {
        mana++
      }

      mana += this.paradox.manaSpent

      return mana
    },
    maxMana() {
      return gnosisManaLimits[this.caster.gnosis]
    },
    // use this to watch attainments changing
    attainmentsByName() {
      let attainments = []

      each(this.spell.attainments, (value, key) => {
        if (value) {
          attainments.push(key)
        }
      })

      return attainments
    },
    isSympatheticYantraMissing() {
      return (
        (this.spell.attainments.sympatheticRange || this.spell.attainments.temporalSympathy) &&
        !this.hasYantra("t3") &&
        !this.hasYantra("t4") &&
        !this.hasYantra("t5")
      )
    },
    isCastable() {
      return !this.isDicePoolTooLow && !this.isSympatheticYantraMissing
    },
    baseCastingTime() {
      for (let [key, value] of baseCastingTimes) {
        if (this.caster.gnosis >= key) {
          return value
        }
      }
      return null
    },
    standardCastingTimeOptions() {
      let options = [],
        i = 0

      while (i++ <= 5) {
        let increment = this.baseCastingTime.increment * i,
          unit = this.baseCastingTime.unit + (increment !== 1 ? "s" : ""),
          bonus = i - 1

        options.push({
          value: "s" + i,
          label: `${increment} ${unit} (+${bonus} dice)`,
        })
      }

      return options
    },
    castingTimeOptions() {
      let options = []
      options.push({
        type: "group",
        label: "Standard (Ritual Casting)",
        key: "standard",
        children: this.standardCastingTimeOptions,
      })
      options.push({
        type: "group",
        label: "Advanced (Quick Casting)",
        key: "advanced",
        children: [{ value: "a1", label: "1 Turn" }],
      })
      return options
    },
    standardPotencyOptions() {
      let options = [],
        i = 0

      while (i++ < 11) {
        let penalty = (i - 1) * 2

        if (this.isPrimaryFactor("potency")) {
          penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
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
    },
    advancedPotencyOptions() {
      let options = []
      let i = 0
      while (i++ < 11) {
        let penalty = (i - 1) * 2

        if (this.isPrimaryFactor("potency")) {
          penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
        }

        if (penalty < 0) {
          penalty = 0
        }

        options.push({
          value: "a" + i,
          label: `${i} (-${penalty} dice)`,
        })
      }

      return options
    },
    potencyOptions() {
      let options = []
      options.push({
        type: "group",
        label: "Standard",
        key: "standard",
        children: this.standardPotencyOptions,
      })
      options.push({
        type: "group",
        label: "Advanced",
        key: "advanced",
        children: this.advancedPotencyOptions,
      })
      return options
    },
    rangeOptions() {
      let options = []
      options.push({
        type: "group",
        label: "Standard",
        key: "standard",
        children: [{ value: "s1", label: "Touch/Aimed" }],
      })
      options.push({
        type: "group",
        label: "Advanced",
        key: "advanced",
        children: [{ value: "a1", label: "Sensory" }],
      })
      return options
    },
    standardDurationOptions() {
      let options = []

      for (let [key, duration] of durations) {
        if (key[0] === "s") {
          let penalty = duration.penalty

          if (this.isPrimaryFactor("duration")) {
            penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
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
    },
    advancedDurationOptions() {
      let options = []

      for (let [key, duration] of durations) {
        if (key[0] === "a") {
          let penalty = duration.penalty

          if (this.isPrimaryFactor("duration")) {
            penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
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
    },
    durationOptions() {
      let options = []
      options.push({
        type: "group",
        label: "Standard",
        key: "standard",
        children: this.standardDurationOptions,
      })
      options.push({
        type: "group",
        label: "Advanced",
        key: "advanced",
        children: this.advancedDurationOptions,
      })
      return options
    },
    standardScaleOptions() {
      let options = []

      for (let [key, scale] of scales) {
        if (key[0] === "s") {
          let s = clone(scale)
          s.value = key
          s.penalty = `-${scale.penalty}`
          options.push(s)
        }
      }

      return options
    },
    advancedScaleOptions() {
      let options = []

      for (let [key, scale] of scales) {
        if (key[0] === "a") {
          let s = clone(scale)
          s.value = key
          s.penalty = `-${scale.penalty}`
          options.push(s)
        }
      }

      return options
    },
    scaleOptions() {
      let options = []
      options.push({
        type: "group",
        label: "Standard",
        key: "standard",
        children: this.standardScaleOptions.map(({ value, number, size, area, penalty }) => {
          return {
            value: value,
            label: `${number} subjects, ${area.toLowerCase()} (${penalty} dice)`,
          }
        }),
      })
      options.push({
        type: "group",
        label: "Advanced",
        key: "advanced",
        children: this.advancedScaleOptions.map(({ value, number, size, area, penalty }) => {
          return {
            value: value,
            label: `${number} subjects, ${area.toLowerCase()} (${penalty} dice)`,
          }
        }),
      })
      return options
    },
    locationYantraOptions() {
      return this.getYantraOptions("l")
    },
    actionYantraOptions() {
      return this.getYantraOptions("a")
    },
    toolYantraOptions() {
      return this.getYantraOptions("t")
    },
    gnosisSummary() {
      let summary = ""
      if (this.caster.gnosis > 0) summary += `Gnosis ${this.caster.gnosis}`
      if (summary.length === 0) return "None"
      return summary
    },
    arcanaSummary() {
      let summary = []
      for (let arcana in this.caster.arcana) {
        let level = this.caster.arcana[arcana].level
        if (level > 0) summary.push(`${arcana} ${level}`)
      }
      if (summary.length === 0) return "None"
      return summary.join(", ")
    },
    effectsSummary() {
      let summary = []
      if (this.spell.isPraxis) summary.push(`Praxis`)
      if (this.spell.isRote) summary.push(`Rote (+${this.spell.roteSkill})`)
      if (this.spell.spendWillpower) summary.push("Willpower")
      if (this.spell.effects.length) summary.push(`Effects (${this.spell.effects.length})`)
      if (summary.length === 0) return "None"
      return summary.join(", ")
    },
    conditionsSummary() {
      let summary = []
      if (this.conditions.bonusDice > 0) summary.push(`+${this.conditions.bonusDice} dice`)
      if (this.conditions.activeSpells > 0) summary.push(`${this.conditions.activeSpells} active`)
      if (this.conditions.subjectWithstand > 0) summary.push(`${this.conditions.subjectWithstand} withstand`)
      if (summary.length === 0) return "None"
      return summary.join(", ")
    },
    spellSummary() {
      let summary = ""
      if (this.spell.name) summary += `${this.spell.name} (`
      if (this.spell.primaryArcana?.arcana) summary += `${this.spell.primaryArcana.arcana} ${this.spell.primaryArcana.level}`
      if (this.spell.secondaryArcana?.arcana) summary += `, ${this.spell.secondaryArcana.arcana} ${this.spell.secondaryArcana.level}`
      if (this.spell.name) summary += ")"
      if (summary.length === 0) return "None"
      return summary
    },
    paradoxDiceSummary() {
      let summary

      if (this.paradoxDice === "[chance die]") {
        summary = "A chance die"
      } else if (this.paradoxDice === 1) {
        summary = this.paradoxDice + " die"
      } else {
        summary = this.paradoxDice + " dice"
      }

      if (this.paradox.sleepers) {
        if (this.paradox.sleeperGroupSize === "sm") {
          summary += " (with the 9-again quality)"
        } else if (this.paradox.sleeperGroupSize === "md") {
          summary += " (with the 8-again quality)"
        } else if (this.paradox.sleeperGroupSize === "lg") {
          summary += " (with the rote quality)"
        }
      }

      return summary
    },
    dicePoolSummary() {
      if (this.dicePool < 1) {
        return "A chance die"
      } else if (this.dicePool == 1) {
        return `${this.dicePool} die`
      } else {
        return `${this.dicePool} dice`
      }
    },
    castingTimeSummary() {
      // standard
      if (this.spell.factors.castingTime[0] === "s") {
        let increment = this.baseCastingTime.increment * this.spell.factors.castingTime[1],
          unit = this.baseCastingTime.unit + (increment !== 1 ? "s" : "")

        return increment + " " + unit
      }
      // advanced
      else {
        let turns = this.numYantras <= 1 ? 1 : this.numYantras

        if (this.hasYantra("a3")) {
          turns = turns == 1 ? 2 : turns
        }

        return `${turns} turn${turns !== 1 ? "s" : ""}`
      }
    },
    durationSummary() {
      return durations.get(this.spell.factors.duration).time
    },
    potencySummary() {
      return this.potencyValue
    },
    rangeSummary() {
      if (this.spell.factors.range === "s1") {
        return "Touch/aimed"
      } else if (
        this.spell.attainments.sympatheticRange ||
        this.spell.attainments.temporalSympathy
      ) {
        let range = []

        if (this.spell.attainments.sympatheticRange) {
          range.push("Sympathetic")
        }

        if (this.spell.attainments.temporalSympathy) {
          range.push("Temporal Sympathetic")
        }

        return range.join(" and ")
      } else {
        return "Sensory"
      }
    },
    scaleSummary() {
      let scale = scales.get(this.spell.factors.scale)
      return scale ? `${scale.number} subjects or ${scale.area.toLowerCase()}` : ""
    },
    scalePenalty() {
      let scale = scales.get(this.spell.factors.scale)
      return scale ? scale.penalty : ""
    },
    yantrasSummary() {
      let yantrasNames = []

      for (let yantra of this.spell.yantras) {
        yantrasNames.push(this.yantras.get(yantra.yantraKey).name)
      }
      if (yantrasNames.length === 0) return "None"

      return yantrasNames.join(", ")
    },
    factorCastingTime() {
      return this.spell.factors.castingTime
    },
    factorDuration() {
      return this.spell.factors.duration
    },
    factorRange() {
      return this.spell.factors.range
    },
    factorScale() {
      return this.spell.factors.scale
    },
  },
  watch: {
    caster: {
      handler(value) {
        localStorage.setItem("caster", JSON.stringify(value))
      },
      deep: true,
    },
    saved: {
      handler(value) {
        localStorage.setItem("saved", JSON.stringify(value))
      },
      deep: true,
    },
    "spell.isRote": function (newer, older) {
      if (older === true && newer === false && this.hasYantra("a1")) {
        this.deleteYantra("a1")
        this.message.warning("Rote Skill Mudra removed from yantras")
      }
        // if (this.hasYantra("a1") && spell.isRote === true) {
        //   setTimeout(() => {
        //     let yantra = spell.yantras.findIndex((y) => y.yantraKey === "a1")
        //     if (yantra.bonus !== spell.roteSkill) {
        //       this.message.info("Rote Skill Mudra updated to +" + spell.roteSkill)
        //       spell.yantras[yantra].bonus = spell.roteSkill
        //     }
        //   }, 250)
        // }
    },
    "conditions.subjectWithstand": function (newer, older) {
      let extraPotency = this.spell.factors.potency[1] - 1
      let prefix = this.spell.factors.potency[0]
      let minPotency = this.totalWithstand
      let isStandard = prefix !== "a"

      // Advanced Potency reduces Withstand by 2
      if (!isStandard) minPotency -= 2

      // Potency too low?
      if (extraPotency < minPotency) {
        this.spell.factors.potency = prefix + minPotency
        this.message.info(`Potency (${prefix === "s" ? "Standard" : "Advanced"}) increased to ${minPotency}`)
      }
    },
  },
  methods: {
    setDark(value) {
      if (value === true) this.theme = darkTheme
      if (value === false) this.theme = lightTheme
    },
    chooseSpell(spell) {
      this.spell.name = spell.name
      this.spell.practice = spell.practice
      this.spell.primaryArcana = spell.primaryArcana
      this.spell.secondaryArcana = spell.secondaryArcana
      this.spell.primaryFactor = spell.primaryFactor
      this.spell.roteSkills = spell.roteSkills
      this.spell.description = spell.description
      this.spell.additionalEffects = spell.additionalEffects
      this.spell.page = spell.page
    },
    dots(num) {
      return Array.from({ length: num }, () => "•").join("")
    },
    isAdvanced(factorName) {
      return this.spell.factors[factorName][0] === "a"
    },
    isPrimaryFactor(factorName) {
      return this.spell.primaryFactor === factorName
    },
    setRote(value) {
      this.spell.isRote = value
    },
    setPraxis(value) {
      this.spell.isPraxis = value
    },
    checkAttainments() {
      // time in a bottle requires advanced
      if (this.spell.attainments.timeInABottle && !this.isAdvanced("castingTime")) {
        // debounce(() => {
        //   this.spell.attainments.timeInABottle = false
        //   Toast.create(
        //     "Time in a Bottle attainment requires advanced Casting Time. Deselecting attainment."
        //   )
        // })()
      }

      // permanence requires advanced
      if (
        this.spell.attainments.permanence &&
        (this.spell.primaryArcana.arcana !== "Matter" || !this.isAdvanced("duration"))
      ) {
        // debounce(() => {
        //   this.spell.attainments.permanence = false
        //   Toast.create(
        //     "Permanence attainment requires advanced Duration. Deselecting attainment."
        //   )
        // })()
      }

      // everywhere requires advanced
      if (this.spell.attainments.everywhere && !this.isAdvanced("scale")) {
        // debounce(() => {
        //   this.spell.attainments.everywhere = false
        //   Toast.create(
        //     "Everywhere attainment requires advanced Scale. Deselecting attainment."
        //   )
        // })()
      }

      // sympathy requires advanced
      if (this.spell.attainments.sympatheticRange && !this.isAdvanced("range")) {
        // debounce(() => {
        //   this.spell.attainments.sympatheticRange = false
        //   Toast.create(
        //     "Sympathetic Range attainment requires advanced Range. Deselecting attainment."
        //   )
        // })()
      }

      // temporal sympathy requires advanced
      if (this.spell.attainments.temporalSympathy && !this.isAdvanced("range")) {
        // debounce(() => {
        //   this.spell.attainments.temporalSympathy = false
        //   Toast.create(
        //     "Temporal Sympathy attainment requires advanced Range. Deselecting attainment."
        //   )
        // })()
      }
    },
    isUniqueYantraUsed(key) {
      let yantra = this.yantras.get(key)

      // ignore non-uniques
      if (!yantra.unique) {
        return false
      }

      // this version is used?
      if (this.hasYantra(key)) {
        return true
      }

      // there are multiple version of this yantra - check for others
      if (key.indexOf("_") !== -1) {
        let baseKey = key.split("_")[0]
        if (this.spell.yantras.some((yantra) => yantra.yantraKey.indexOf(baseKey) === 0)) {
          return true
        }
      }

      return false
    },
    getYantraOptions(prefix) {
      let options = []

      for (let [key, yantra] of this.yantras) {
        if (key[0] === prefix) {
          // 'l', 'a', or 't'
          // disabled?
          let disabledWarning

          if (key === "a1" && this.spell.isRote === false) {
            disabledWarning = "Only available when casting Rotes."
          }

          if (key === "a2" && !this.isConcentrationMantraAllowed) {
            disabledWarning = "Duration must be more than 1 turn to use concentration."
          }

          if (this.isUniqueYantraUsed(key)) {
            disabledWarning = "Only one of this Yantra may be used."
          }

          if (key === "t1" && this.isDedicatedToolYantraUsed) {
            disabledWarning = "A Dedicated Tool is already being used."
          }

          yantra.disabledWarning = disabledWarning

          // add to options
          options.push(yantra)
        }
      }

      return options
    },
    hasYantra(key) {
      return some(this.spell.yantras, ["yantraKey", key]) // `_.matchesProperty` iteratee shorthand.
    },
    addYantra(key) {
      let yantra = this.yantras.get(key)

      this.spell.yantras.push(yantra)
    },
    deleteYantra(key) {
      let index = findIndex(this.spell.yantras, (yantra) => yantra.yantraKey === key)
      this.spell.yantras.splice(index, 1)
    },
    updateYantraIsDedicatedTool(key, newValue) {
      let index = findIndex(this.spell.yantras, (yantra) => yantra.yantraKey === key)
      this.spell.yantras[index].isDedicatedTool = newValue
    },
    isEffectRestricted(item) {
      let answer = false
      if (item.requirement) {
        item.requirement.forEach(i => {
          if (this.caster.arcana[i.arcana].level < i.value) answer = true
        })
      }
      return answer
    },
    isEffectAdded(item) {
      const existing = this.spell.effects.findIndex(added => added.effect === item.effect);
      return existing !== -1
    },
    // Effects
    toggleEffect(item) {
      if (this.isEffectAdded(item)) {
        this.spell.effects.splice(this.spell.effects.findIndex(added => added.effect === item.effect), 1)
      } else {
        this.spell.effects.push(item)
      }
    },
    // Spell Stuff
    formatSpell(spell) {
      this.message.info(`${spell.name} was copied as Roll20 Macro to clipboard`)
      this.message.warning("But I haven't finished this function yet :)")
    },
    removeSpell(spell) {
      let index = findIndex(this.saved, (item) => item.id === spell.id)
      this.saved.splice(index, 1)
      this.message.error(`${spell.name} was removed from saved spells`)
    },
    loadSpell(spell) {
      this.spell = spell
      this.message.success(`${spell.name} configuration was loaded`)
    },
    saveSpell(spell) {
      const item = clone(spell)
      const itemCastingSummary = []
      if (item.isRote) itemCastingSummary.push("Rote")
      if (item.isPraxis) itemCastingSummary.push("Praxis")
      itemCastingSummary.push(`Reach ${this.usedReach}/${this.freeReach}`)
      itemCastingSummary.push(`Dice Pool ${this.dicePool}`)
      itemCastingSummary.push(`Mana ${this.totalMana}`)
      itemCastingSummary.push(`Paradox ${this.paradoxDice}`)
      const itemFactorSummary = [];
      itemFactorSummary.push(`${this.potencySummary} potency`)
      itemFactorSummary.push(`${this.durationSummary} duration`)
      itemFactorSummary.push(`${this.castingTimeSummary} casting time`)
      itemFactorSummary.push(`${this.rangeSummary} range`)
      itemFactorSummary.push(`${this.scaleSummary}`)
      const itemEffectSummary = item.effects.map(effect => effect.effect);
      if (item.spendWillpower) itemEffectSummary.unshift("Willpower spent.")
      const itemYantraSummary = item.yantras.map(yantra => yantra.name);
      item.id = new Date().getTime()
      item.castingSummary = itemCastingSummary.join(", ")
      item.factorSummary = itemFactorSummary.join(", ")
      item.effectSummary = itemEffectSummary.join(" ")
      item.yantraSummary = itemYantraSummary.join(", ")
      this.saved.push(item)
      this.message.success(`${spell.name} was added to saved spells`)
    },
    reset() {
      this.spell = clone(defaultSpell)
      this.paradox = clone(defaultParadox)
      this.conditions = clone(defaultConditions)
      this.message.warning("Spell configuration was reset")
    },
    log(text) {
      console.log(text)
    },
  },
  mounted() {
    this.message.success("Ready to use!")
    if (localStorage.getItem("caster")) {
      try {
        this.caster = JSON.parse(localStorage.getItem("caster"))
      } catch (err) {
        console.error(err)
        localStorage.removeItem("caster")
      }
    }
    if (localStorage.getItem("saved")) {
      try {
        this.saved = JSON.parse(localStorage.getItem("saved"))
      } catch (err) {
        console.error(err)
        localStorage.removeItem("saved")
      }
    }
  },
}
</script>

<style>
html {
  height: 100%;
}
body {
  min-height: 100%;
}
.n-tabs .n-tabs-pane-wrapper {
  overflow: visible;
}
.n-layout {
  min-height: 100vh;
}
.s-modal {
  min-width: 400px;
  max-width: 400px;
  margin: 30px auto;
}
.s-table td {
  vertical-align: middle;
  line-height: 20px;
}
.e-table td {
  vertical-align: top;
  line-height: 18px;
}
.n-card {
  box-shadow: var(--n-box-shadow);
}
.n-card-header__extra {
  flex: 1;
  justify-content: flex-end;
}
.n-rate {
  vertical-align: middle;
}
.n-rate__item svg circle {
  stroke: var(--n-text-color);
}
.n-rate__item--active svg circle {
  fill: var(--n-text-color);
  stroke: var(--n-text-color);
}
.n-tabs-nav__suffix .n-switch.n-switch--active .n-switch__rail {
    /* background-color: #f2c97d; */
}
.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 70px;
}
</style>
