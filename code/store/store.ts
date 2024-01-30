import { reactive, computed, ref } from "vue"
import type { Arcana, Attribute, Category, Condition, Effect, Factor, Level, Practice, Rote, Skill, Tool, Yantra } from "../constants/types"
import { assign, cloneDeep, max } from "lodash"
import { darkTheme, lightTheme } from "naive-ui"

export const theme = reactive({
  name: "light",
  value: lightTheme,
  set(type: "light" | "dark") {
    this.name = type
    this.value = type === "light" ? lightTheme : darkTheme
  },
})

export const scene = reactive({
  witnesses: 0,
  negation: 0,
  reset() {
    this.witnesses = 0
    this.negation = 0
  },
})

export type Scene = typeof scene

export const spell = reactive({
  id: 0,
  name: undefined,
  isRote: false,
  isPraxis: false,
  custom: false,
  customName: undefined,
  practice: undefined as Practice | undefined,
  primaryFactor: undefined as "Duration" | "Potency" | undefined,
  primaryArcana: { arcana: undefined as Arcana | undefined, level: 0 as Level },
  secondaryArcana: { arcana: undefined as Arcana | undefined, level: 0 as Level },
  description: undefined,
  effects: [] as Effect[],
  additionalEffects: [] as Effect[],
  commonEffects: {
    changePrimaryFactor: false,
  },
  page: "",
  factors: {
    castingTime: "s1",
    potency: "s1",
    range: "s1",
    duration: "s1",
    scale: "s1",
  } as Record<Factor, string>,
  roteSkills: [] as Skill[],
  roteSkill: 0 as number,
  spendWillpower: false,
  extraReach: 0,
  extraMana: 0,
  yantras: [] as Yantra[],
  yantraAlsoDedicatedTool: null,
  attainments: {
    conditionalDuration: false,
    everywhere: false,
    permanence: false,
    sympatheticRange: false,
    temporalSympathy: false,
    timeInABottle: false,
  },
  reset() {
    this.id = 0
    this.name = undefined
    this.isRote = false
    this.isPraxis = false
    this.custom = false
    this.customName = undefined
    this.practice = undefined
    this.primaryFactor = undefined
    this.primaryArcana = { arcana: undefined, level: 1 }
    this.secondaryArcana = { arcana: undefined, level: 1 }
    this.description = undefined
    this.effects = []
    this.additionalEffects = []
    this.commonEffects = {
      changePrimaryFactor: false,
    }
    this.page = ""
    this.factors = {
      castingTime: "s1",
      potency: "s1",
      range: "s1",
      duration: "s1",
      scale: "s1",
    }
    this.roteSkills = []
    this.roteSkill = 0
    this.spendWillpower = false
    this.extraReach = 0
    this.extraMana = 0
    this.yantras = []
    this.yantraAlsoDedicatedTool = null
    this.attainments = {
      conditionalDuration: false,
      everywhere: false,
      permanence: false,
      sympatheticRange: false,
      temporalSympathy: false,
      timeInABottle: false,
    }
  },
})

export type Spell = typeof spell

export const defaultCaster = {
  id: 0,
  details: {
    name: "",
    cabal: "",
    concept: "",
    virtue: "",
    vice: "",
    path: undefined as undefined | { name: string; arcana: Arcana[] },
    order: undefined as undefined | { name: string; roteSkills: Skill[] },
    legacy: "",
    aspirations: "",
    obsessions: "",
  },
  health: {
    maximum: { base: 0, modifier: 0 },
    bashing: 0,
    lethal: 0,
    aggravated: 0,
  },
  traits: {
    Size: { base: 5, modifier: undefined },
    Speed: { base: 0, modifier: undefined },
    Defense: { base: 0, modifier: undefined },
    Armour: { base: 0, modifier: undefined },
    Initiative: { base: 0, modifier: undefined },
    Mana: 0,
    Wisdom: 0,
    Gnosis: 0,
    Willpower: 0,
  },
  progress: {
    mundane: {
      Beats: 0,
      Experience: 0,
    },
    arcane: {
      Beats: 0,
      Experience: 0,
    },
  },
  arcana: {
    Prime: { dots: 0, ruling: false },
    Forces: { dots: 0, ruling: false },
    Fate: { dots: 0, ruling: false },
    Time: { dots: 0, ruling: false },
    Mind: { dots: 0, ruling: false },
    Space: { dots: 0, ruling: false },
    Spirit: { dots: 0, ruling: false },
    Life: { dots: 0, ruling: false },
    Death: { dots: 0, ruling: false },
    Matter: { dots: 0, ruling: false },
  } as Record<Arcana, { dots: number; ruling: boolean }>,
  arcanaExtras: {
    other: "",
  },
  merits: {
    merit0: { dots: 0, label: "" },
    merit1: { dots: 0, label: "" },
    merit2: { dots: 0, label: "" },
    merit3: { dots: 0, label: "" },
    merit4: { dots: 0, label: "" },
    merit5: { dots: 0, label: "" },
    merit6: { dots: 0, label: "" },
    merit7: { dots: 0, label: "" },
    merit8: { dots: 0, label: "" },
    merit9: { dots: 0, label: "" },
    merit10: { dots: 0, label: "" },
    merit11: { dots: 0, label: "" },
  },
  extras: {
    allies: "",
    mentors: "",
    contacts: "",
    retainers: "",
    familiars: "",
    locations: "",
    professions: "",
    organisations: "",
    imbued: "",
    enhanced: "",
    grimoires: "",
    artifacts: "",
    armour: "",
    weapons: "",
    resources: "",
    equipment: "",
    other: "",
    nimbus: "",
    attainments: "",
  },
  attributes: {
    mental: {
      Intelligence: { dots: 1 },
      Wits: { dots: 1 },
      Resolve: { dots: 1 },
    },
    physical: {
      Strength: { dots: 1 },
      Dexterity: { dots: 1 },
      Stamina: { dots: 1 },
    },
    social: {
      Presence: { dots: 1 },
      Manipulation: { dots: 1 },
      Composure: { dots: 1 },
    },
  } as Record<Category, Record<Attribute, { dots: number }>>,
  skills: {
    mental: {
      Academics: { rote: false, label: "", dots: 0 },
      Computers: { rote: false, label: "", dots: 0 },
      Crafts: { rote: false, label: "", dots: 0 },
      Investigation: { rote: false, label: "", dots: 0 },
      Medicine: { rote: false, label: "", dots: 0 },
      Occult: { rote: false, label: "", dots: 0 },
      Politics: { rote: false, label: "", dots: 0 },
      Science: { rote: false, label: "", dots: 0 },
    },
    physical: {
      Athletics: { rote: false, label: "", dots: 0 },
      Brawl: { rote: false, label: "", dots: 0 },
      Drive: { rote: false, label: "", dots: 0 },
      Firearms: { rote: false, label: "", dots: 0 },
      Larceny: { rote: false, label: "", dots: 0 },
      Stealth: { rote: false, label: "", dots: 0 },
      Survival: { rote: false, label: "", dots: 0 },
      Weaponry: { rote: false, label: "", dots: 0 },
    },
    social: {
      Animals: { rote: false, label: "", dots: 0 },
      Empathy: { rote: false, label: "", dots: 0 },
      Expression: { rote: false, label: "", dots: 0 },
      Intimidation: { rote: false, label: "", dots: 0 },
      Persuasion: { rote: false, label: "", dots: 0 },
      Socialise: { rote: false, label: "", dots: 0 },
      Streetwise: { rote: false, label: "", dots: 0 },
      Subterfuge: { rote: false, label: "", dots: 0 },
    },
  } as Record<Category, Record<Skill, SkillRecord>>,
  status: {
    conditions: [] as Condition[],
    equipment: [],
  },
  praxes: [] as { name: string; arcana: Arcana; level: Level }[],
  rotes: [] as Rote[],
  tools: [] as Tool[],
  active: [] as Spell[],
  saved: [] as Spell[],
  paradox: 0,
}

export const caster = reactive(cloneDeep(defaultCaster))
export type Caster = typeof caster

export const casters = reactive([] as Caster[])
export type Casters = typeof casters

type SkillRecord = { rote: boolean; label: string; dots: Level }
