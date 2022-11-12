import { some } from "lodash"
import { arcanaNames, baseCastingTimes, castingMethods, factors, gnosisManaLimits, durations, scales, practices, yantrasBaseData } from "./constants.js"

export const getRoteOrPraxis = (caster, spell) => {
  if (caster.rotes.findIndex((r) => r.name === spell.name) !== -1) return "rote"
  if (caster.praxes.findIndex((r) => r.name === spell.name) !== -1) return "praxis"
  return null
}

export const getFreeReach = (caster, spell) => {
  let arcana
  if (caster.rotes.find((r) => r.name === spell.name)) {
    arcana = 5
  } else {
    arcana = caster.arcana[spell.primaryArcana.arcana].level
  }
  return arcana - spell.primaryArcana.level + 1
}

export const getUsedReach = (caster, spell, conditions) => {
  let reach = 0
  if (conditions.activeSpells >= caster.gnosis) {
    reach += conditions.activeSpells - caster.gnosis + 1
  }
  // check factors (advanced factor keys begin with "a")
  for (let factor in spell.factors) {
    if (spell.factors[factor][0] === "a") reach++
  }
  // check effects
  for (let effect of spell.effects) {
    if (effect.cost) {
      for (let cost of effect.cost) {
        if (cost.type === "Reach") reach += cost.value
      }
    }
  }
  // check for common effects
  if (spell.commonEffects.changePrimaryFactor) reach += 1
  // remote viewing range costs 1 additional reach
  if (spell.factors.range === "a2") reach += 1
  // indefinite duration costs 1 additional reach
  if (spell.factors.duration === "a6") reach += 1
  // spell-specific extra reach
  reach += spell.extraReach
  // arcana attainments
  if (spell.attainments.permanence) reach--
  if (spell.attainments.timeInABottle) reach--
  if (spell.attainments.everywhere) reach--
  return reach
}

export const getTotalMana = (caster, spell, paradox) => {
  let mana = 0
  let type = getRoteOrPraxis(caster, spell)
  // check ruling, rote, praix
  if (!caster.arcana[spell.primaryArcana.arcana].ruling && type === null) mana++
  // check effects
  for (let effect of spell.effects) {
    if (effect.cost) {
      for (let cost of effect.cost) {
        if (cost.type === "Mana") mana += cost.value
      }
    }
  }
  if (spell.extraMana) mana += spell.extraMana
  if (spell.factors.duration === "a6") mana++
  if (spell.attainments.permanence) mana++
  if (spell.attainments.timeInABottle) mana++
  if (spell.attainments.sympatheticRange) mana++
  if (spell.attainments.temporalSympathy) mana++
  if (spell.attainments.everywhere) mana++
  mana += paradox.manaSpent
  return mana
}

export const getWithstand = (spell, conditions) => {
  let withstand = conditions.subjectWithstand
  if (spell.factors.potency === "a1") withstand -= 2
  return withstand
}

export const getPotencyPenalty = (caster, spell) => {
  let penalty = (spell.factors.potency.substr(1) - 1) * 2
  if (spell.primaryFactor === "Potency") {
    penalty -= (caster.arcana[spell.primaryArcana.arcana].level - 1) * 2
  }
  if (penalty <= 0) {
    penalty = 0
  }
  return penalty
}

export const getDurationPenalty = (caster, spell) => {
  let penalty = durations.get(spell.factors.duration).penalty
  if (spell.primaryFactor === "Duration") {
    penalty -= (caster.arcana[spell.primaryArcana.arcana].level - 1) * 2
  }
  if (penalty <= 0) {
    penalty = 0
  }
  return penalty
}

export const getDicePool = (caster, spell, conditions) => {
  // base pool
  let pool = caster.gnosis + caster.arcana[spell.primaryArcana.arcana].level
  pool += conditions.bonusDice
  if (spell.spendWillpower) pool += 3
  // casting time
  if (spell.factors["castingTime"][0] !== "a") {
    pool += spell.factors.castingTime[1] - 1
  }
  // withstand
  pool -= getWithstand(spell, conditions)
  // potency
  pool -= getPotencyPenalty(caster, spell)
  // duration
  pool -= getDurationPenalty(caster, spell)
  // scale
  pool -= scales.get(spell.factors.scale).penalty
  // yantras
  spell.yantras.forEach((yantra) => {
    pool += yantra.bonus
  })
  return pool
}

export const getParadoxDice = (caster, spell, conditions, paradox) => {
  let pool = 0,
    mustRoll = false
  const usedReach = getUsedReach(caster, spell, conditions)
  const freeReach = getFreeReach(caster, spell)
  // check reach
  if (usedReach > freeReach) {
    pool += (freeReach - usedReach) * -1
    mustRoll = true
  }
  // gnosis multiplies paradox from additional reach
  pool *= Math.ceil(caster.gnosis / 2)

  if (paradox.inured) {
    pool += 2
    mustRoll = true
  }

  if (paradox.previous > 0) {
    pool += paradox.previous
    mustRoll = true
  }

  if (paradox.sleepers > 0) {
    pool++
    mustRoll = true
  }

  if (some(spell.yantras, ["isDedicatedTool", true])) {
    pool -= 2
  }

  pool -= paradox.manaSpent

  if (pool <= 0 && mustRoll) {
    return "Chance"
  }
  if (pool < 0) return 0

  return pool
}
