export type Arcana = "Death" | "Fate" | "Forces" | "Life" | "Matter" | "Mind" | "Prime" | "Space" | "Spirit" | "Time"
export type Skill =
  | "Academics"
  | "Computers"
  | "Crafts"
  | "Investigation"
  | "Medicine"
  | "Occult"
  | "Politics"
  | "Science"
  | "Athletics"
  | "Brawl"
  | "Drive"
  | "Firearms"
  | "Larceny"
  | "Stealth"
  | "Survival"
  | "Weaponry"
  | "Animals"
  | "Empathy"
  | "Expression"
  | "Intimidation"
  | "Persuasion"
  | "Socialise"
  | "Streetwise"
  | "Subterfuge"
export type Level = 1 | 2 | 3 | 4 | 5 | number
export type Effect = {
  cost?: { type: string; value: number; multiple?: boolean }[]
  requirement?: { arcana: Arcana; value: number }[]
  effect: string
}
export type Factor = "castingTime" | "potency" | "range" | "duration" | "scale"
export type Practice = "Knowing" | "Compelling" | "Unveiling" | "Ruling" | "Veiling" | "Shielding" | "Weaving" | "Fraying" | "Perfecting" | "Patterning" | "Unraveling" | "Making" | "Unmaking"
export type Tool = {
  name: string
  type: string
  description: string
  dedicated: boolean
  id: number
}
export type Rote = {
  name: string
  arcana: Arcana
  level: Level
  skills: Skill[]
  skill?: Skill
}
export type Source = {
  name: string
  primaryArcana: {
    arcana: Arcana
    level: Level
  }
  secondaryArcana?: {
    arcana: Arcana
    level: Level
  }
  extraMana?: number
  practice: Practice
  withstand?: string
  primaryFactor: "Duration" | "Potency"
  roteSkills: Skill[]
  page: string
  description: string
  additionalEffects?: Effect[]
}
export type Condition = {
  name: string
  type: "Mental" | "Physical" | "Social" | "Supernatural" | "Awakened" | "Paradox" | "Other"
  page: string
  persist: true | false | undefined
  description: string
}
export type Yantra = {
  id?: number
  name: string
  bonus: number
  value: string
  label: string
  yantraKey: string
  isDedicatedTool: boolean
}
