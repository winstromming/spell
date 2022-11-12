import { some, clone, range } from "lodash"
import { arcanaNames, baseCastingTimes, castingMethods, factors, gnosisManaLimits, durations, scales, practices, yantrasBaseData } from "./constants.js"

export const getRoteOrPraxis = (caster, spell) => {
  if (caster.rotes.findIndex((r) => r.name === spell.name) !== -1) return "rote"
  if (caster.praxes.findIndex((r) => r.name === spell.name) !== -1) return "praxis"
  return null
}

export const getYantras = (caster, spell) => {
  let expandedYantras = new Map()
  let isRote = getRoteOrPraxis(caster, spell) === "rote"
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
      // rote skill mudra: bonus = skill dots
      if (key === "a1" && isRote) {
        bonus = spell.roteSkill
      }
      // sympathetic yantras don't give a bonus to sympathetic or temporal spells
      if (["t4", "t5"].includes(key) && (spell.attainments.sympatheticRange || spell.attainments.temporalSympathy)) {
        bonus = 0
      }
      expandedYantra.yantraKey = Array.isArray(yantraBaseData.bonus) ? key + "_" + bonus : key // key is a reserved property in Vue so we use "yantraKey"
      expandedYantra.bonus = bonus
      expandedYantra.value = expandedYantra.yantraKey
      expandedYantra.label = `${yantraBaseData.name} (+${bonus} ${bonus === 1 ? "die" : "dice"})`
      expandedYantra.isDedicatedTool = false
      expandedYantras.set(expandedYantra.yantraKey, expandedYantra)
    })
  }

  return expandedYantras
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

export const getBaseCastingTime = (caster) => {
  for (let [key, value] of baseCastingTimes) {
    if (caster.gnosis >= key) {
      return value
    }
  }
  return null
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
  if (some(spell.yantras, ["isDedicatedTool", true])) pool -= 2
  pool -= paradox.manaSpent
  if (pool <= 0 && mustRoll) return "Chance"
  if (pool < 0) return 0
  return pool
}

export const getPotencySummary = (caster, spell) => {
  return spell.factors.potency.substr(1)
}

export const getDurationSummary = (caster, spell) => {
  return durations.get(spell.factors.duration).time
}

export const getCastingTimeSummary = (caster, spell) => {
  let time = getBaseCastingTime(caster)
  // standard
  if (spell.factors.castingTime[0] === "s") {
    let increment = time.increment * spell.factors.castingTime[1]
    let unit = time.unit + (increment !== 1 ? "s" : "")
    return increment + " " + unit
  }
  // advanced
  else {
    let turns = spell.yantras.length <= 1 ? 1 : spell.yantras.length
    if (some(spell.yantras, ["yantraKey", "a3"])) turns = turns == 1 ? 2 : turns
    return `${turns} turn${turns !== 1 ? "s" : ""}`
  }
}

export const getRangeSummary = (caster, spell) => {
  if (spell.factors.range === "s1") {
    return "Touch"
  } else if (spell.attainments.sympatheticRange || spell.attainments.temporalSympathy) {
    let range = []
    if (spell.attainments.sympatheticRange) {
      range.push("Sympathetic")
    }
    if (spell.attainments.temporalSympathy) {
      range.push("Temporal Sympathetic")
    }
    return range.join(" and ")
  } else {
    if (spell.factors.range === "a1") return "Sensory"
    if (spell.factors.range === "a2") return "Remote"
  }
}

export const getScaleSummary = (caster, spell) => {
  let scale = scales.get(spell.factors.scale)
  return scale ? `${scale.number} subjects or ${scale.area.toLowerCase()}` : ""
}

export const getYantrasSummary = (caster, spell) => {
  let yantrasNames = []
  let yantras = getYantras(caster, spell)
  for (let yantra of spell.yantras) {
    yantrasNames.push(yantras.get(yantra.yantraKey).name)
  }
  if (yantrasNames.length === 0) return "None"
  return yantrasNames.join(", ")
}

export const getDicePoolSummary = (caster, spell, conditions) => {
  let dice = getDicePool(caster, spell, conditions)
  if (dice < 1) {
    return "Chance"
  } else if (dice == 1) {
    return `${dice} die`
  } else {
    return `${dice} dice`
  }
}

export const getParadoxSummary = (caster, spell, conditions, paradox) => {
  let summary
  let dice = getParadoxDice(caster, spell, conditions, paradox)
  if (dice === "Chance") {
    summary = "Chance"
  } else if (dice === 1) {
    summary = dice + " die"
  } else {
    summary = dice + " dice"
  }
  if (paradox.sleepers > 0) {
    if (paradox.sleepers === 2) {
      summary += " (9-again)"
    } else if (paradox.sleepers === 3) {
      summary += " (8-again)"
    } else if (paradox.sleepers === 4) {
      summary += " (as rote)"
    }
  }
  return summary
}

export const getConditionsSummary = (conditions) => {
  let summary = []
  if (conditions.bonusDice > 0) summary.push(`+${conditions.bonusDice} dice`)
  if (conditions.activeSpells > 0) summary.push(`${conditions.activeSpells} active`)
  if (conditions.subjectWithstand > 0) summary.push(`${conditions.subjectWithstand} withstand`)
  if (summary.length === 0) return "None"
  return summary.join(", ")
}
