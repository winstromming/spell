import { some, clone, range, filter } from "lodash"
import { baseCastingTimes, durations, scales, yantrasBaseData } from "./constants"
import type { Caster, Spell, Scene } from "../store/store.js"
import type { Yantra } from "./types.js"

export const getCastingType = (caster: Caster, spell: Spell) => {
  // if (caster.rotes.findIndex((r) => r.name === spell.name) !== -1) return "Rote"
  // if (caster.praxes.findIndex((r) => r.name === spell.name) !== -1) return "Praxis"
  // if (caster.grimoires.findIndex((r) => r.name === spell.name) !== -1) return "Grimoire"
  // return null
  if (spell.isRote) return "Rote"
  if (spell.isPraxis) return "Praxis"
  if (spell.isGrimoire) return "Grimoire"
  return null
}

export const getRote = (caster: Caster, spell: Spell) => {
  return caster.rotes.find((r) => r.name === spell.name)
}

export const getYantras = (caster: Caster, spell: Spell) => {
  let expandedYantras = new Map()
  let isRote = getCastingType(caster, spell) === "Rote"
  for (let [key, yantraBaseData] of yantrasBaseData) {
    // bonus can contain a single number or a range. Arrayify.
    let bonuses
    if (Array.isArray(yantraBaseData.bonus)) {
      bonuses = range(yantraBaseData.bonus[0], yantraBaseData.bonus[1] + 1)
    } else {
      bonuses = [yantraBaseData.bonus]
    }
    bonuses.forEach((bonus) => {
      let expandedYantra: any = clone(yantraBaseData)
      // rote skill mudra: bonus = skill dots
      if (key === "a1" && isRote && spell.roteSkill) {
        let skill = caster.skills.mental[spell.roteSkill] ?? caster.skills.physical[spell.roteSkill] ?? caster.skills.social[spell.roteSkill]
        bonus = skill.dots
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
      let yantra: Yantra = expandedYantra
      expandedYantras.set(yantra.yantraKey, yantra)
    })
  }

  return expandedYantras
}

export const getFreeReach = (caster: Caster, spell: Spell) => {
  if (spell === undefined || !spell.primaryArcana.arcana || !spell.primaryArcana.level) return 0
  let arcana
  let type = getCastingType(caster, spell)
  if (type === "Rote" || type === "Grimoire") {
    arcana = 5
  } else {
    arcana = caster.arcana[spell.primaryArcana.arcana].dots
  }
  return arcana - spell.primaryArcana.level + 1
}

export const getUsedReach = (caster: Caster, spell: Spell) => {
  let reach = 0
  if (spell === undefined || !spell.primaryArcana.arcana || !spell.primaryArcana.level) return 0
  if (caster.active.length >= caster.traits.Gnosis) {
    reach += caster.active.length - caster.traits.Gnosis + 1
  }
  // check factors (advanced factor keys begin with "a")
  for (let factor in spell.factors) {
    if (spell.factors[factor as keyof Spell["factors"]][0] === "a") reach++
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
  if (spell.commonEffects && spell.commonEffects.changePrimaryFactor) reach += 1
  // remote viewing range costs 1 additional reach
  if (spell.factors.range === "a2") reach += 1
  // indefinite duration costs 1 additional reach
  if (spell.factors.duration === "a6") reach += 1
  // spell-specific extra reach
  reach += spell.extraReach
  // arcana attainments
  if (spell.attainments && spell.attainments.permanence) reach--
  if (spell.attainments && spell.attainments.timeInABottle) reach--
  if (spell.attainments && spell.attainments.everywhere) reach--
  if (reach < 0) reach = 0
  return reach
}

export const getTotalMana = (caster: Caster, spell: Spell, scene: Scene) => {
  if (spell === undefined || !spell.primaryArcana.arcana || !spell.primaryArcana.level) return 0
  let mana = 0
  let type = getCastingType(caster, spell)
  // check ruling, rote, grimoire, praxis
  if (!caster.arcana[spell.primaryArcana.arcana].ruling && type === null) mana++
  // check effects
  for (let effect of spell.effects) {
    if (effect.cost) {
      for (let cost of effect.cost) {
        if (cost.type === "Mana") mana += cost.value
      }
    }
  }
  if (scene.negation) mana += scene.negation
  if (spell.extraMana) mana += spell.extraMana
  if (spell.factors.duration === "a6") mana++
  if (spell.attainments.permanence) mana++
  if (spell.attainments.conditionalDuration) mana++
  if (spell.attainments.timeInABottle) mana++
  if (spell.attainments.sympatheticRange) mana++
  if (spell.attainments.temporalSympathy) mana++
  if (spell.attainments.everywhere) mana++
  return mana
}

export const getBaseCastingTime = (caster: Caster) => {
  for (let [key, value] of baseCastingTimes) {
    if (caster.traits.Gnosis >= key) {
      return value
    }
  }
  return {
    increment: 3,
    unit: "hour",
  }
}

export const getWithstand = (spell: Spell, scene: Scene) => {
  let withstand = 0
  if (spell.factors.potency === "a1") withstand -= 2
  return withstand
}

export const getPotencyPenalty = (caster: Caster, spell: Spell) => {
  if (spell === undefined || !spell.primaryArcana.arcana || !spell.primaryArcana.level) return 0
  let penalty = (parseInt(spell.factors.potency.substring(1)) - 1) * 2
  if (spell.primaryFactor === "Potency") {
    penalty -= (caster.arcana[spell.primaryArcana.arcana].dots - 1) * 2
  }
  if (penalty <= 0) {
    penalty = 0
  }
  return penalty
}

export const getDurationPenalty = (caster: Caster, spell: Spell) => {
  if (spell === undefined || !spell.primaryArcana.arcana || !spell.primaryArcana.level) return 0
  let penalty = durations.get(spell.factors.duration)?.penalty ?? 0
  if (spell.primaryFactor === "Duration") {
    penalty -= (caster.arcana[spell.primaryArcana.arcana].dots - 1) * 2
  }
  if (penalty <= 0) {
    penalty = 0
  }
  return penalty
}

export const getScalePenalty = (caster: Caster, spell: Spell) => {
  return scales.get(spell.factors.scale)?.penalty ?? 0
}

export const getDicePool = (caster: Caster, spell: Spell, scene: Scene) => {
  if (spell === undefined || !spell.factors || !spell.primaryArcana.arcana || !spell.primaryArcana.level) return 0
  // base pool
  let pool = caster.traits.Gnosis + caster.arcana[spell.primaryArcana.arcana].dots
  if (spell.spendWillpower) pool += 3
  // casting time
  if (spell.factors["castingTime"][0] !== "a") {
    pool += parseInt(spell.factors.castingTime[1]) - 1
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
  penalties += getScalePenalty(caster, spell)
  // yantras
  spell.yantras.forEach((yantra: Yantra) => {
    bonus += yantra.bonus
  })
  // maximum yantra bonus after penalties is 5
  bonus = bonus - penalties
  if (bonus > 5) bonus = 5
  pool += bonus
  return pool
}

export const getParadoxDice = (caster: Caster, spell: Spell, scene: Scene) => {
  let pool = 0,
    mustRoll = false,
    usedReach = 0,
    freeReach = 0
  if (spell.name || spell.custom) {
    usedReach = getUsedReach(caster, spell)
    freeReach = getFreeReach(caster, spell)
  }
  // check reach
  if (usedReach > freeReach) {
    pool += (freeReach - usedReach) * -1
    mustRoll = true
  }
  // gnosis multiplies paradox from additional reach
  pool *= Math.ceil(caster.traits.Gnosis / 2)
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
  // extra mana spent
  pool -= scene.negation
  // dedicated tools
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

export const getPotencySummary = (caster: Caster, spell: Spell) => {
  let output = spell.factors.potency.substring(1)
  output += " potency"
  if (spell.factors.potency[0] === "a") output += " (-2 Withstand)"
  return output
}

export const getDurationSummary = (caster: Caster, spell: Spell) => {
  let output = durations.get(spell.factors.duration)?.time ?? "1 turn"
  let attainments = []
  if (spell.attainments.permanence) attainments.push("Permanence")
  if (spell.attainments.conditionalDuration) attainments.push("Conditional")
  output += " duration"
  if (attainments.length) output += ` (${attainments.join(", ")})`
  return output
}

export const getCastingNameSummary = (caster: Caster, spell: Spell) => {
  return `**${spell.name}** (${spell.primaryArcana.arcana} ${Array.from({ length: spell.primaryArcana.level }, (v) => "&bull;").join("")})}}`
}

export const getCastingDescriptionSummary = (caster: Caster, spell: Spell) => {
  let output = ""
  let type = getCastingType(caster, spell)
  if (type) output += `(**${type}**) `
  output += `${spell.description}`
  output += `\n${spell.page}`
  return output
}

export const getCastingTimeSummary = (caster: Caster, spell: Spell) => {
  let time = getBaseCastingTime(caster)
  let type = getCastingType(caster, spell)
  // standard
  if (spell.factors.castingTime[0] === "s") {
    let increment = time.increment * parseInt(spell.factors.castingTime[1])
    if (type === "Grimoire") increment = increment + increment
    let unit = time.unit + (increment !== 1 ? "s" : "")
    let output = increment + " " + unit
    output += " casting time"
    if (spell.attainments.timeInABottle) output += " (Time in a Bottle)"
    return output
  }
  // advanced
  else {
    let turns = spell.yantras.length <= 1 ? 1 : spell.yantras.length
    if (some(spell.yantras, ["yantraKey", "a3"])) turns = turns == 1 ? 2 : turns
    let output = `${turns} turn${turns !== 1 ? "s" : ""}`
    output += " casting time"
    if (spell.attainments.timeInABottle) output += " (Time in a Bottle)"
    return output
  }
}

export const getRangeSummary = (caster: Caster, spell: Spell) => {
  let output = ""
  if (spell.factors.range === "s1") {
    output = "Touch"
  } else if (spell.attainments.sympatheticRange || spell.attainments.temporalSympathy) {
    let range = []
    if (spell.attainments.sympatheticRange) {
      range.push("Sympathetic")
    }
    if (spell.attainments.temporalSympathy) {
      range.push("Temporal Sympathetic")
    }
    output = range.join(" and ")
  } else {
    if (spell.factors.range === "a1") output = "Sensory"
    if (spell.factors.range === "a2") output = "Remote"
  }
  output += " range"
  return output
}

export const getScaleSummary = (caster: Caster, spell: Spell) => {
  let scale = scales.get(spell.factors.scale)
  let output = scale ? `${scale.number} subjects or ${scale.area.toLowerCase()}` : ""
  if (spell.attainments.everywhere) output += " (Everywhere)"
  return output
}

export const getYantrasSummary = (caster: Caster, spell: Spell) => {
  let yantrasNames = []
  let yantras = getYantras(caster, spell)
  for (let yantra of spell.yantras) {
    let name = yantras.get(yantra.yantraKey).name
    if (yantra.isDedicatedTool) name = "Dedicated " + name
    if (yantra.id && yantra.name !== "") name = `${yantra.name} (${name})`
    if (yantra.id && yantra.name === "") name = `${name}`
    yantrasNames.push(name)
  }
  if (yantrasNames.length === 0) return "None"
  return yantrasNames.join(", ")
}

export const getDicePoolSummary = (caster: Caster, spell: Spell, scene: Scene) => {
  let dice = getDicePool(caster, spell, scene)
  if (dice < 1) {
    return "Chance"
  } else if (dice == 1) {
    return `${dice} die`
  } else {
    return `${dice} dice`
  }
}

export const getParadoxSummary = (caster: Caster, spell: Spell, scene: Scene) => {
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

export const getFactorSummary = (caster: Caster, spell: Spell) => {
  let standard = 0
  let advanced = 0
  for (let factor in spell.factors) {
    if (spell.factors[factor as keyof Spell["factors"]][0] === "s") standard++
    if (spell.factors[factor as keyof Spell["factors"]][0] === "a") advanced++
  }
  return `${standard} Standard, ${advanced} Advanced`
}

export const getCastingFactorsSummary = (caster: Caster, spell: Spell) => {
  let summary = []
  summary.push(`${getPotencySummary(caster, spell).toLowerCase()}`)
  summary.push(`${getDurationSummary(caster, spell).toLowerCase()}`)
  summary.push(`${getCastingTimeSummary(caster, spell).toLowerCase()}`)
  summary.push(`${getRangeSummary(caster, spell).toLowerCase()}`)
  summary.push(`${getScaleSummary(caster, spell).toLowerCase()}`)
  return summary.join(", ")
}

export const getCastingEffectsSummary = (caster: Caster, spell: Spell) => {
  let summary = spell.effects.map((effect) => effect.effect)
  if (spell.spendWillpower) summary.unshift("Willpower spent.")
  if (spell.commonEffects.changePrimaryFactor) summary.push("Changed primary factor.")
  if (caster.active.length >= caster.traits.Gnosis) summary.push("Casting spells above active limit.")
  if (spell.custom) spell.page = "Creative, " + spell.practice
  return summary.join(" ")
}
