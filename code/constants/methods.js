import { some, clone, range, filter } from "lodash"
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
      if (["y1", "y2", "y3"].includes(key) && (spell.attainments.sympatheticRange || spell.attainments.temporalSympathy)) {
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

export const getUsedReach = (caster, spell) => {
  let reach = 0
  if (caster.active.length >= caster.gnosis) {
    reach += caster.active.length - caster.gnosis + 1
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

export const getTotalMana = (caster, spell) => {
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

export const getWithstand = (spell, scene) => {
  let withstand = scene.withstand
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

export const getDicePool = (caster, spell, scene) => {
  // base pool
  let pool = caster.gnosis + caster.arcana[spell.primaryArcana.arcana].level
  if (spell.spendWillpower) pool += 3
  // casting time
  if (spell.factors["castingTime"][0] !== "a") {
    pool += spell.factors.castingTime[1] - 1
  }
  let penalties = 0
  let bonus = 0
  // withstand
  penalties += getWithstand(spell, scene)
  // potency
  penalties += getPotencyPenalty(caster, spell)
  // duration
  penalties += getDurationPenalty(caster, spell)
  // scale
  penalties += scales.get(spell.factors.scale).penalty
  // yantras
  spell.yantras.forEach((yantra) => {
    bonus += yantra.bonus
  })
  // maximum yantra bonus after penalties is 5
  bonus = bonus - penalties
  if (bonus > 5) bonus = 5
  pool += bonus
  return pool
}

export const getParadoxDice = (caster, spell, scene) => {
  let pool = 0,
    mustRoll = false,
    usedReach = 0,
    freeReach = 0
  if (spell.name || spell.custom) {
    usedReach = getUsedReach(caster, spell, scene)
    freeReach = getFreeReach(caster, spell)
  }
  // check reach
  if (usedReach > freeReach) {
    pool += (freeReach - usedReach) * -1
    mustRoll = true
  }
  // gnosis multiplies paradox from additional reach
  pool *= Math.ceil(caster.gnosis / 2)
  // if (paradox.inured) {
  //   pool += 2
  //   mustRoll = true
  // }
  if (caster.paradox > 0) {
    pool += caster.paradox
    mustRoll = true
  }
  if (scene.witnesses > 0) {
    pool++
    mustRoll = true
  }
  let dedicated = filter(spell.yantras, ["isDedicatedTool", true])
  if (dedicated.length === 1) {
    if (dedicated[0].yantraKey[0] === "s") pool -= 3
    if (dedicated[0].yantraKey[0] !== "s") pool -= 2
  }
  if (dedicated.length > 1) {
    pool -= 3
    mustRoll = false
  }
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
    let name = yantras.get(yantra.yantraKey).name
    if (yantra.isDedicatedTool) name = "Dedicated " + name
    yantrasNames.push(name)
  }
  if (yantrasNames.length === 0) return "None"
  return yantrasNames.join(", ")
}

export const getDicePoolSummary = (caster, spell, scene) => {
  let dice = getDicePool(caster, spell, scene)
  if (dice < 1) {
    return "Chance"
  } else if (dice == 1) {
    return `${dice} die`
  } else {
    return `${dice} dice`
  }
}

export const getParadoxSummary = (caster, spell, scene) => {
  let summary
  let dice = getParadoxDice(caster, spell, scene)
  if (dice === "Chance") {
    summary = "Chance"
  } else if (dice === 1) {
    summary = dice + " die"
  } else {
    summary = dice + " dice"
  }
  if (scene.witnesses > 0) {
    if (scene.witnesses === 2) {
      summary += " (9-again)"
    } else if (scene.witnesses === 3) {
      summary += " (8-again)"
    } else if (scene.witnesses === 4) {
      summary += " (as rote)"
    }
  }
  return summary
}
