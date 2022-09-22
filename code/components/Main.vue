<template>
  <n-config-provider :theme-overrides="{ common: { fontWeightStrong: '600' } }">
    <n-layout
      static
      embedded
      content-style="padding: 30px; padding-bottom: 100px; max-width: 600px; margin: 0 auto"
    >
      <n-space vertical>
        <!-- Caster -->
        <Card title="Caster" :summary="casterSummary">
          <template #content>
            <n-space vertical>
              <n-table striped class="s-table">
                <thead>
                  <tr>
                    <th>Gnosis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <n-rate clearable :count="10" v-model:value="caster.gnosis">
                        <n-icon>
                          <EllipseOutline />
                        </n-icon>
                      </n-rate>
                    </td>
                  </tr>
                </tbody>
              </n-table>
              <n-table striped class="s-table">
                <thead>
                  <tr>
                    <th width="40">Arcana</th>
                    <th width="35"></th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, name) of caster.arcana" :key="name">
                    <td>
                      <n-text>{{ name }}</n-text>
                    </td>
                    <td>
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
            </n-space>
          </template>
        </Card>
        <!-- Warning if the caster has not been configured -->
        <n-alert type="info" v-if="hasConfiguredCaster === false">
          You must configure your caster (gnosis, arcana) before choosing a spell.
        </n-alert>
        <!-- Spell -->
        <Card title="Spell" :summary="spellSummary" v-if="hasConfiguredCaster">
          <template #content>
            <n-space vertical>
              <n-select
                filterable
                placeholder="What spell are you casting?"
                :value="spell.name"
                @update-value="chooseSpell"
                :options="chooseSpellOptions"
              />
            </n-space>
          </template>
          <template #footer v-if="spell.name">
            <n-space vertical>
              <n-text italic depth="2" v-html="spell.description" />
              <n-text italic depth="2" v-for="(item, index) of spell.reachEffects" :key="index">
                <b>+{{ item.reach }} Reach:</b> {{ item.effect }}
              </n-text>
              <n-text italic depth="2">
                <b style="text-transform: capitalize">{{ spell.primaryFactor }}</b> is the primary
                factor for this spell and is boosted up to the caster's {{ spell.arcana }} rating
                without incurring a penalty.
              </n-text>
            </n-space>
          </template>
        </Card>
        <!-- Method -->
        <Card title="Method" :summary="methodSummary" v-if="canCastSpell">
          <template #content>
            <n-space vertical>
              <n-space>
                <n-switch size="small" v-model:value="spell.isPraxis" @change="setRote(false)" />
                <n-text strong style="vertical-align: middle; line-height: 14px">Praxis</n-text>
              </n-space>
              <n-space>
                <n-switch size="small" v-model:value="spell.isRote" @change="setPraxis(false)" />
                <n-text strong style="vertical-align: middle; line-height: 14px"> Rote </n-text>
                <n-rate v-if="spell.isRote" clearable :count="10" v-model:value="spell.roteSkill">
                  <n-icon>
                    <EllipseOutline />
                  </n-icon>
                </n-rate>
              </n-space>
              <n-space>
                <n-switch size="small" v-model:value="spell.spendWillpower" />
                <n-text strong>Spend willpower (+3 dice)</n-text>
              </n-space>
            </n-space>
          </template>
          <template #footer>
            Bonus spellcasting dice widget goes here<br />
            Number of active other spells widget goes here
          </template>
        </Card>
        <!-- Warning if this spell cannot be cast -->
        <n-alert type="warning" v-if="spell.name && isSpellArcanaTooHigh">
          You need {{ spell.arcana }} {{ dots(spell.level) }} to cast this spell
        </n-alert>
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
          <template #footer v-if="spell.factors.duration === 'a6'">
            Indefinite duration requires +1 Reach and +1 Mana
          </template>
        </Card>
        <!-- Casting Time -->
        <Card title="Casting Time" collapsed :summary="castingTimeSummary" v-if="canCastSpell">
          <template #content>
            <n-select v-model:value="spell.factors.castingTime" :options="castingTimeOptions" />
          </template>
          <template #footer v-if="isAdvanced('castingTime')">
            Using more than one Yantra (or High Speech) will increase this time.
          </template>
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
          <template #footer>
            Advanced Scale doubles the number of subjects and adds 5 size per additional -2 dice
            penalty.
          </template>
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
                      <n-button
                        block
                        secondary
                        type="error"
                        @click="deleteYantra(yantra.yantraKey)"
                      >
                        Remove
                      </n-button>
                    </td>
                    <td v-if="hasYantra(yantra.yantraKey) === false">
                      <n-tooltip
                        :trigger="
                          !!yantra.disabledWarning || numYantras === maxYantras ? 'hover' : 'manual'
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
                                ? addYantraFromModal(yantra.yantraKey)
                                : undefined
                            "
                          >
                            Add
                          </n-button>
                        </template>
                        <span v-if="numYantras === maxYantras">
                          You cannot have more than {{ maxYantras }} yantras
                        </span>
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
          <template #footer>
            Gnosis {{ caster.gnosis }} allows the use of {{ maxYantras }} yantras.
          </template>
        </Card>
      </n-space>
    </n-layout>
    <n-card class="bottom">
      <n-space horizontal size="small" v-if="canCastSpell">
        <n-tag :bordered="false" round strong :type="usedReach > freeReach ? 'warning' : 'success'">
          Reach {{ usedReach }}/{{ freeReach }}
        </n-tag>
        <n-tag :bordered="false" round strong :type="isDicePoolTooLow ? 'warning' : 'success'"
          >Dice Pool {{ dicePool }}</n-tag
        >
        <n-tag :bordered="false" round strong type="success">Mana {{ totalMana }}</n-tag>
        <n-tag v-if="hasParadox" :bordered="false" round strong type="error">
          Paradox {{ paradoxDice }}
        </n-tag>
      </n-space>
    </n-card>
  </n-config-provider>
</template>

<script>
import { clone, max, some, capitalize, findIndex, range } from "lodash"
import { useMessage } from "naive-ui"
import { darkTheme } from "naive-ui"

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

export default {
  components: { Card, Close, ChevronDown, ChevronUp, Ellipse, EllipseOutline },
  setup() {
    return {
      darkTheme,
      theme: darkTheme,
    }
  },
  data() {
    return {
      caster: {
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
        activeSpells: 0,
      },
      spell: {
        name: undefined,
        arcana: undefined,
        level: undefined,
        isRote: false,
        isPraxis: false,
        practice: undefined,
        primaryFactor: undefined,
        primaryArcana: undefined,
        secondaryArcana: undefined,
        suggestedRoteSkills: undefined,
        description: undefined,
        reachEffects: [],
        source: undefined,
        factors: {
          castingTime: "s1",
          potency: "s1",
          range: "s1",
          duration: "s1",
          scale: "s1",
        },
        roteSkill: 0,
        bonusDice: 0,
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
      },
      subject: {
        isResisted: false,
        withstand: 1,
        numWithstands: 1,
      },
      paradox: {
        inured: false,
        previousRolls: 0,
        sleepers: false,
        sleeperGroupSize: "on",
        manaSpent: 0,
      },
      showCasterModal: false,
      showMethodModal: false,
      showPotencyModal: false,
      showDurationModal: false,
      showCastingTimeModal: false,
      showRangeModal: false,
      showScaleModal: false,
      showYantrasModal: false,
      theme: darkTheme.darkTheme,
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
    chooseSpellValue() {
      const spell = this.spell
      if (spell.name && spell.arcana && spell.level) {
        return spell.name
        // return `${spell.name} (${spell.arcana} ${dots(spell.level)})`
      }
      return undefined
    },
    chooseSpellOptions() {
      let options = []

      for (let arcanaName of arcanaNames) {
        options.push({
          type: "group",
          label: arcanaName,
          key: arcanaName,
          children: spells
            .filter((s) => s.arcana === arcanaName)
            .sort((a, b) => a.level < b.level)
            .map((s) => {
              return {
                label: `${dots(s.level)} ${s.name}`,
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

      if (this.highestCasterArcana.includes(this.spell.arcana)) {
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
      return this.caster.arcana[this.spell.arcana].level > this.maxCasterArcana
    },
    isSpellArcanaTooHigh() {
      return this.caster.arcana[this.spell.arcana].level < this.spell.level
    },
    freeReach() {
      let arcana

      if (this.spell.isRote) {
        arcana = 5
      } else {
        arcana = this.caster.arcana[this.spell.arcana].level
      }

      return arcana - this.spell.level + 1
    },
    usedReach() {
      let reach = 0

      if (this.caster.activeSpells >= this.caster.gnosis) {
        reach += this.caster.activeSpells - this.caster.gnosis + 1
      }

      // check factors (advanced factor keys begin with "a")
      for (let factor of factors) {
        if (this.spell.factors[factor][0] === "a") {
          reach++
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
        penalty -= (this.caster.arcana[this.spell.arcana].level - 1) * 2
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
        penalty -= (this.caster.arcana[this.spell.arcana].level - 1) * 2
      }

      if (penalty <= 0) {
        penalty = 0
      }

      return penalty
    },
    dicePool() {
      // base pool
      let pool = this.caster.gnosis + this.caster.arcana[this.spell.arcana].level

      pool += this.spell.bonusDice

      if (this.spell.spendWillpower) {
        pool += 3
      }

      // casting time
      if (!this.isAdvanced("castingTime")) {
        pool += this.spell.factors.castingTime[1] - 1
      }

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
      if (!this.subject.isResisted) {
        return 0
      }

      let withstand = this.subject.withstand + this.subject.numWithstands - 1

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
        !this.caster.isRulingArcana &&
        this.spell.method !== "Rote" &&
        this.spell.method !== "Praxis"
      ) {
        mana++
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
          penalty -= (this.caster.arcana[this.spell.arcana].level - 1) * 2
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
          penalty -= (this.caster.arcana[this.spell.arcana].level - 1) * 2
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
            penalty -= (this.caster.arcana[this.spell.arcana].level - 1) * 2
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
            penalty -= (this.caster.arcana[this.spell.arcana].level - 1) * 2
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
    casterSummary() {
      let summary = []
      if (this.caster.gnosis > 0) summary.push(`Gnosis ${this.caster.gnosis}`)
      for (let arcana in this.caster.arcana) {
        let level = this.caster.arcana[arcana].level
        if (level > 0) summary.push(`(${arcana} ${dots(level)})`)
      }
      return summary.join(" ")
    },
    spellSummary() {
      let summary = ""
      if (this.spell.name) summary += `${this.spell.name}`
      if (this.spell.arcana) summary += ` (${this.spell.arcana} ${dots(this.spell.level)})`
      return summary
    },
    methodSummary() {
      let summary = ""
      if (this.spell.isPraxis) summary += `Praxis`
      if (this.spell.isRote) summary += `Rote (+${this.spell.roteSkill})`
      if (this.spell.spendWillpower) {
        if (this.spell.isPraxis || this.spell.isRote) summary += " with Willpower"
        else summary += "Willpower"
      }
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
  methods: {
    chooseSpell(spell) {
      this.spell.name = spell.name
      this.spell.arcana = spell.arcana
      this.spell.level = spell.level
      this.spell.practice = spell.practice
      this.spell.primaryFactor = spell.primaryFactor
      this.spell.primaryArcana = spell.primaryArcana
      this.spell.secondaryArcana = spell.secondaryArcana
      this.spell.suggestedRoteSkills = spell.suggestedRoteSkills
      this.spell.description = spell.description
      this.spell.reachEffects = spell.reachEffects
      this.spell.source = spell.source
    },
    choosePotency(potency) {
      this.showPotencyModal = false
      this.spell.factors.potency = potency
    },
    chooseDuration(duration) {
      this.showDurationModal = false
      this.spell.factors.duration = duration
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
    /**
     * Called when Caster's Arcana, Potency, Primary Factor or Withstand changed
     */
    checkPotencyAgainstWithstand() {
      let extraPotency = this.spell.factors.potency[1] - 1,
        prefix = this.spell.factors.potency[0], // 's' or 'a'
        minPotency = this.subject.isResisted ? this.totalWithstand + 1 : 0,
        isStandard = prefix !== "a"

      // Advanced Potency reduces Withstand by 2
      if (!isStandard) {
        minPotency -= 2
      }

      // is Potency too low?
      if (extraPotency < minPotency) {
        // debounce(() => {
        //   this.spell.factors.potency = prefix + minPotency
        //   Toast.create(
        //     `Potency spell factor (${
        //       prefix === "s" ? "Standard" : "Advanced"
        //     }) automatically increased to ${minPotency}`
        //   )
        // })()
      }
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
        (this.spell.arcana !== "Matter" || !this.isAdvanced("duration"))
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

          if (key === "a1" && this.spell.method !== "Rote") {
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

      // check uniques
      if (this.isUniqueYantraUsed(key)) {
        // debounce(() => {
        //   Toast.create(`The ${yantra.name} Yantra can only be selected once`)
        // })()
        return
      }

      this.spell.yantras.push(yantra)
    },
    deleteYantra(key) {
      let index = findIndex(this.spell.yantras, (yantra) => yantra.yantraKey === key)
      this.spell.yantras.splice(index, 1)
    },
    addYantraFromModal(key) {
      this.addYantra(key)

      this.showYantrasModal = false
    },
    updateYantraIsDedicatedTool(key, newValue) {
      let index = findIndex(this.spell.yantras, (yantra) => yantra.yantraKey === key)
      this.spell.yantras[index].isDedicatedTool = newValue
    },
    log(text) {
      console.log(text)
    },
  },
  mounted() {
    useMessage().success("Ready to use!")
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
  stroke: black;
}
.n-rate__item--active svg circle {
  fill: black;
  stroke: black;
}
.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 70px;
}
</style>
