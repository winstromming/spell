<template>
  <n-config-provider :theme="darkTheme">
    <n-layout embedded content-style="padding: 30px; padding-bottom: 80px">
      <n-space vertical size="large">
        <n-card title="Caster" size="medium" segmented> </n-card>
        <n-card title="Spell" size="medium" segmented>
          <n-form
            label-placement="left"
            require-mark-placement="right-hanging"
            size="large"
            label-width="auto"
          >
            <n-form-item label="Name">
              <n-select
                filterable
                placeholder="Choose spell you are casting"
                :value="chooseSpellValue"
                @update-value="chooseSpell"
                :options="chooseSpellOptions"
              />
            </n-form-item>
            <n-form-item label="Method">
              <n-radio-group v-model:value="spell.method" name="spell.method">
                <n-radio
                  v-for="method of methodOptions"
                  :key="method.label"
                  :value="method.value"
                  :label="method.label"
                />
              </n-radio-group>
            </n-form-item>
            <n-form-item label="Options">
              <n-checkbox v-model:checked="spell.spendWillpower">
                Spend Willpower (+3 dice)
              </n-checkbox>
            </n-form-item>
            <n-form-item
              label="Potency"
              :validation-status="isAdvanced('potency') ? 'warning' : ''"
            >
              <n-select
                v-model:value="spell.factors.potency"
                :options="potencyOptions"
              />
            </n-form-item>
            <n-form-item
              label="Duration"
              :validation-status="isAdvanced('duration') ? 'warning' : ''"
            >
              <n-select
                v-model:value="spell.factors.duration"
                :options="durationOptions"
              />
            </n-form-item>
            <n-form-item
              label="Casting"
              :validation-status="isAdvanced('castingTime') ? 'warning' : ''"
            >
              <n-select
                v-model:value="spell.factors.castingTime"
                :options="castingTimeOptions"
              />
            </n-form-item>
            <n-form-item
              label="Range"
              :validation-status="isAdvanced('range') ? 'warning' : ''"
            >
              <n-select
                v-model:value="spell.factors.range"
                :options="rangeOptions"
              />
            </n-form-item>
            <n-form-item
              label="Scale"
              :validation-status="isAdvanced('scale') ? 'warning' : ''"
            >
              <n-select
                v-model:value="spell.factors.scale"
                :options="scaleOptions"
              />
            </n-form-item>
            <n-form-item label="Yantras">
              <n-space>
                <n-button
                  tertiary
                  v-for="yantra in spell.yantras"
                  :key="yantra.yantraKey"
                  @click="deleteYantra(yantra.yantraKey)"
                >
                  {{ yantra.name }} (+{{ yantra.bonus }})
                </n-button>
                <n-button
                  primary
                  :disabled="numYantras === maxYantras"
                  @click="showYantrasModal = true"
                >
                  Add
                </n-button>
              </n-space>
              <n-modal v-model:show="showYantrasModal">
                <n-card
                  size="medium"
                  embedded
                  :bordered="false"
                  style="max-width: 500px; margin: 0 auto"
                >
                  <n-scrollbar style="max-height: 500px">
                    <n-space vertical size="large">
                      <n-list
                        hoverable
                        clickable
                        bordered
                        v-for="(group, name) of {
                          Locations: locationYantraOptions,
                          Actions: actionYantraOptions,
                          Tools: toolYantraOptions,
                        }"
                        :key="name"
                      >
                        <template #header>
                          <n-text strong type="success"> {{ name }}</n-text>
                        </template>
                        <n-list-item
                          v-for="yantra in group"
                          :key="yantra.yantraKey"
                          :style="{
                            opacity: !!yantra.disabledWarning ? 0.5 : 1,
                          }"
                          @click="
                            !yantra.disabledWarning
                              ? addYantraFromModal(yantra.yantraKey)
                              : null
                          "
                        >
                          <n-thing
                            :title="`${yantra.name} (+${yantra.bonus})`"
                            :description="yantra.desc"
                          />
                        </n-list-item>
                      </n-list>
                    </n-space>
                  </n-scrollbar>
                </n-card>
              </n-modal>
            </n-form-item>
          </n-form>
        </n-card>
      </n-space>
    </n-layout>
    <n-back-top
      :bottom="20"
      :left="30"
      :visibility-height="0"
      :style="{
        transition: 'all .3s cubic-bezier(.4, 0, .2, 1)',
        padding: '0 10px',
      }"
    >
      <n-space horizontal size="small">
        <n-tag
          :bordered="false"
          round
          strong
          :type="usedReach > freeReach ? 'warning' : 'success'"
        >
          Reach {{ usedReach }}/{{ freeReach }}
        </n-tag>
        <n-tag
          :bordered="false"
          round
          strong
          :type="isDicePoolTooLow ? 'warning' : 'success'"
          >Dice Pool {{ dicePool }}</n-tag
        >
        <n-tag :bordered="false" round strong type="success"
          >Mana {{ totalMana }}</n-tag
        >
        <n-tag v-if="hasParadox" :bordered="false" round strong type="error">
          Paradox {{ paradoxDice }}
        </n-tag>
      </n-space>
    </n-back-top>
  </n-config-provider>
</template>

<script>
import _ from "lodash"
import "vfonts/Lato.css"
import { useMessage } from "naive-ui"
import { darkTheme } from "naive-ui"
// import type { GlobalTheme } from "naive-ui"

import {
  arcanaNames,
  baseCastingTimes,
  castingMethods,
  factors,
  gnosisManaLimits,
  durations,
  scales,
  spells,
  yantrasBaseData,
} from "../constants/constants.js"

function dots(num) {
  return Array.from({ length: num }, () => "•").join("")
}

export default {
  components: {},
  setup() {
    return {
      darkTheme,
      theme: darkTheme,
    }
  },
  data() {
    return {
      caster: {
        gnosis: 1,
        arcana: {
          Death: { level: 0, isRulingArcana: false, isHighestArcana: false },
          Fate: { level: 0, isRulingArcana: false, isHighestArcana: false },
          Forces: { level: 0, isRulingArcana: false, isHighestArcana: false },
          Life: { level: 0, isRulingArcana: false, isHighestArcana: false },
          Matter: { level: 0, isRulingArcana: false, isHighestArcana: false },
          Mind: { level: 0, isRulingArcana: false, isHighestArcana: false },
          Prime: { level: 0, isRulingArcana: false, isHighestArcana: false },
          Spirit: { level: 0, isRulingArcana: false, isHighestArcana: false },
          Space: { level: 0, isRulingArcana: false, isHighestArcana: false },
          Time: { level: 0, isRulingArcana: false, isHighestArcana: false },
        },
        activeSpells: 0,
      },
      spell: {
        name: undefined,
        arcana: "Prime",
        level: 1,
        method: "Normal",
        primaryFactor: undefined,
        factors: {
          castingTime: "s1",
          potency: "s1",
          range: "s1",
          duration: "s1",
          scale: "s1",
        },
        roteSkill: 1,
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
      showYantrasModal: false,
      theme: darkTheme.darkTheme,
    }
  },
  computed: {
    chooseSpellValue() {
      const spell = this.spell
      if (spell.name && spell.arcana && spell.level) {
        return `${spell.name} (${spell.arcana} ${dots(spell.level)})`
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
    maxCasterArcana() {
      let arcana

      if (this.caster.isHighestArcana) {
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

      if (this.spell.method === "Rote") {
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
      if (
        !this.isPrimaryFactor("duration") &&
        this.spell.factors.duration === "a6"
      ) {
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
      if (this.spell.method === "Rote") {
        return "rote"
      } else if (this.spell.method === "Praxis") {
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
      let pool =
        this.caster.gnosis + this.caster.arcana[this.spell.arcana].level

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
      return _.capitalize(this.spell.primaryFactor)
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
          bonuses = _.range(
            yantraBaseData.bonus[0],
            yantraBaseData.bonus[1] + 1
          )
        } else {
          bonuses = [yantraBaseData.bonus]
        }

        bonuses.forEach((bonus) => {
          let expandedYantra = _.clone(yantraBaseData)

          /*
           * Bonus
           */

          // rote skill mudra: bonus = skill dots
          if (key === "a1" && this.spell.method === "Rote") {
            bonus = this.spell.roteSkill
          }

          // sympathetic yantras don't give a bonus to sympathetic or temporal spells
          if (
            ["t4", "t5"].includes(key) &&
            (this.spell.attainments.sympatheticRange ||
              this.spell.attainments.temporalSympathy)
          ) {
            bonus = 0
          }

          expandedYantra.yantraKey = Array.isArray(yantraBaseData.bonus)
            ? key + "_" + bonus
            : key // key is a reserved property in Vue so we use "yantraKey"
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
      return (
        this.isPrimaryFactor("duration") || this.spell.factors.duration !== "s1"
      )
    },
    isDedicatedToolYantraUsed: {
      cache: false,
      // getter
      get() {
        if (this.hasYantra("t1")) {
          return true
        }

        return _.some(this.spell.yantras, ["isDedicatedTool", true])
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

      _.each(this.spell.attainments, (value, key) => {
        if (value) {
          attainments.push(key)
        }
      })

      return attainments
    },
    isSympatheticYantraMissing() {
      return (
        (this.spell.attainments.sympatheticRange ||
          this.spell.attainments.temporalSympathy) &&
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
          let s = _.clone(scale)
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
          let s = _.clone(scale)
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
        children: this.standardScaleOptions.map(
          ({ value, number, size, area, penalty }) => {
            return {
              value: value,
              label: `${number} subjects, max size ${size}, in ${area.toLowerCase()} (${penalty} dice)`,
            }
          }
        ),
      })
      options.push({
        type: "group",
        label: "Advanced",
        key: "advanced",
        children: this.advancedScaleOptions.map(
          ({ value, number, size, area, penalty }) => {
            return {
              value: value,
              label: `${number} subjects, max size ${size}, in ${area.toLowerCase()} (${penalty} dice)`,
            }
          }
        ),
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
        let increment =
            this.baseCastingTime.increment * this.spell.factors.castingTime[1],
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
    scaleSummary(scale) {
      scale = scale ?? scales.get(this.spell.factors.scale)

      return `${scale.number} subjects of up to size ${
        scale.size
      } or subjects ${scale.area.toLowerCase()}`
    },
    yantrasSummary() {
      let yantrasNames = []

      for (let yantra of this.spell.yantras) {
        yantrasNames.push(this.yantras.get(yantra.yantraKey))
      }

      return yantrasNames
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
      console.log("chooseSpell", spell)
      this.$data.spell.name = spell.name
      this.$data.spell.arcana = spell.arcana
      this.$data.spell.level = spell.level
      this.$data.spell.primaryFactor = spell.primaryFactor
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
      if (
        this.spell.attainments.timeInABottle &&
        !this.isAdvanced("castingTime")
      ) {
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
      if (
        this.spell.attainments.sympatheticRange &&
        !this.isAdvanced("range")
      ) {
        // debounce(() => {
        //   this.spell.attainments.sympatheticRange = false
        //   Toast.create(
        //     "Sympathetic Range attainment requires advanced Range. Deselecting attainment."
        //   )
        // })()
      }

      // temporal sympathy requires advanced
      if (
        this.spell.attainments.temporalSympathy &&
        !this.isAdvanced("range")
      ) {
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
        if (
          this.spell.yantras.some(
            (yantra) => yantra.yantraKey.indexOf(baseKey) === 0
          )
        ) {
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
            disabledWarning =
              "Duration must be more than 1 turn to use concentration."
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
      return _.some(this.spell.yantras, ["yantraKey", key]) // `_.matchesProperty` iteratee shorthand.
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
      let index = _.findIndex(
        this.spell.yantras,
        (yantra) => yantra.yantraKey === key
      )
      this.spell.yantras.splice(index, 1)
    },
    addYantraFromModal(key) {
      this.addYantra(key)

      this.showYantrasModal = false
    },
    updateYantraIsDedicatedTool(key, newValue) {
      let index = _.findIndex(
        this.spell.yantras,
        (yantra) => yantra.yantraKey === key
      )
      this.spell.yantras[index].isDedicatedTool = newValue
    },
  },
  mounted() {
    useMessage().success("Ready to use!")
  },
}
</script>

<style scoped></style>
