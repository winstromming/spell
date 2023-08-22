import type { Level, Practice } from "./types"

export const Paths = [
  { name: "Acanthus", arcana: ["Fate", "Time"] },
  { name: "Mastigos", arcana: ["Mind", "Space"] },
  { name: "Moros", arcana: ["Death", "Matter"] },
  { name: "Obrimos", arcana: ["Forces", "Prime"] },
  { name: "Thyrsus", arcana: ["Life", "Spirit"] },
]
export const Orders = [
  { name: "Adamantine Arrow", roteSkills: ["Athletics", "Intimidation", "Medicine"] },
  { name: "Free Council", roteSkills: ["Crafts", "Persuasion", "Science"] },
  { name: "Guardians of the Veil", roteSkills: ["Investigation", "Stealth", "Subterfuge"] },
  { name: "Mysterium", roteSkills: ["Investigation", "Occult", "Survival"] },
  { name: "Silver Ladder", roteSkills: ["Expression", "Persuasion", "Subterfuge"] },
]

export const arcanaNames = ["Prime", "Forces", "Fate", "Time", "Mind", "Space", "Spirit", "Life", "Death", "Matter"]

export const castingMethods = ["Normal", "Rote", "Praxis"]

export const baseCastingTimes = new Map([
  [
    9,
    {
      increment: 1,
      unit: "minute",
    },
  ],
  [
    7,
    {
      increment: 10,
      unit: "minute",
    },
  ],
  [
    5,
    {
      increment: 30,
      unit: "minute",
    },
  ],
  [
    3,
    {
      increment: 1,
      unit: "hour",
    },
  ],
  [
    1,
    {
      increment: 3,
      unit: "hour",
    },
  ],
])

export const factors = ["castingTime", "duration", "potency", "range", "scale"]

export const practices: { name: Practice; level: Level; desc: string }[] = [
  { name: "Knowing", level: 1, desc: "Gain knowledge and understanding of phenomena." },
  { name: "Compelling", level: 1, desc: "Elementary manipulation of phenomena, enough to activate and/or impart direction." },
  { name: "Unveiling", level: 1, desc: "Gain sensory perception of phenomena" },
  { name: "Ruling", level: 2, desc: "Exert elementary command and control over phenomena" },
  { name: "Veiling", level: 2, desc: "Conceal, camouflage or hide phenomena from scrutiny" },
  { name: "Shielding", level: 2, desc: "Protect a target against attacks by providing points of Armor." },
  { name: "Weaving", level: 3, desc: "Alter the capabilities or functions of phenomena" },
  { name: "Fraying", level: 3, desc: "Injure a target" },
  { name: "Perfecting", level: 3, desc: "Fortify, bolster or improve phenomena" },
  { name: "Patterning", level: 4, desc: "Transform phenomena into a related phenomena or shapes, or replace capabilities or functions with different ones." },
  { name: "Unraveling", level: 4, desc: "Significantly injure a target" },
  { name: "Making", level: 5, desc: "Create Phenomena" },
  { name: "Unmaking", level: 5, desc: "Destroy or mutilate a target" },
]

export const gnosisManaLimits = {
  1: 10,
  2: 11,
  3: 12,
  4: 13,
  5: 15,
  6: 20,
  7: 25,
  8: 30,
  9: 50,
  10: 75,
}

export const durations = new Map([
  [
    "s1",
    {
      time: "1 turn",
      penalty: 0,
    },
  ],
  [
    "s2",
    {
      time: "2 turns",
      penalty: 2,
    },
  ],
  [
    "s3",
    {
      time: "3 turns",
      penalty: 4,
    },
  ],
  [
    "s4",
    {
      time: "5 turns",
      penalty: 6,
    },
  ],
  [
    "s5",
    {
      time: "10 turns",
      penalty: 8,
    },
  ],
  [
    "a1",
    {
      time: "1 hour",
      penalty: 0,
    },
  ],
  [
    "a2",
    {
      time: "1 day",
      penalty: 2,
    },
  ],
  [
    "a3",
    {
      time: "1 week",
      penalty: 4,
    },
  ],
  [
    "a4",
    {
      time: "1 month",
      penalty: 6,
    },
  ],
  [
    "a5",
    {
      time: "1 year",
      penalty: 8,
    },
  ],
  [
    "a6",
    {
      time: "Indefinitely",
      penalty: 10,
    },
  ],
])

export const scales = new Map([
  [
    "s1",
    {
      number: 1,
      size: "5",
      area: "within reach",
      penalty: 0,
    },
  ],
  [
    "s2",
    {
      number: 2,
      size: "6",
      area: "small room",
      penalty: 2,
    },
  ],
  [
    "s3",
    {
      number: 4,
      size: "7",
      area: "large room",
      penalty: 4,
    },
  ],
  [
    "s4",
    {
      number: 8,
      size: "8",
      area: "several rooms",
      penalty: 6,
    },
  ],
  [
    "s5",
    {
      number: 16,
      size: "9",
      area: "small house",
      penalty: 8,
    },
  ],
  [
    "s6",
    {
      number: 32,
      size: "10",
      area: "large house",
      penalty: 10,
    },
  ],
  [
    "a1",
    {
      number: 5,
      size: "5",
      area: "large house",
      penalty: 0,
    },
  ],
  [
    "a2",
    {
      number: 10,
      size: "10",
      area: "small warehouse",
      penalty: 2,
    },
  ],
  [
    "a3",
    {
      number: 20,
      size: "15",
      area: "large warehouse",
      penalty: 4,
    },
  ],
  [
    "a4",
    {
      number: 40,
      size: "20",
      area: "shopping mall",
      penalty: 6,
    },
  ],
  [
    "a5",
    {
      number: 80,
      size: "25",
      area: "city block",
      penalty: 8,
    },
  ],
  [
    "a6",
    {
      number: 160,
      size: "30",
      area: "small neighborhood",
      penalty: 10,
    },
  ],
])

/**
 * Expanded and modified by other data in the yantras computed property
 */
export const yantrasBaseData = new Map([
  // locations.
  [
    "l1",
    {
      name: "Demesne",
      desc: "A prepared ritual space with a Soul Stone.",
      bonus: 2,
      unique: true,
    },
  ],
  [
    "l2",
    {
      name: "Location",
      desc: "A place and time symbolically linked to the spell.",
      bonus: 1,
      unique: true,
    },
  ],
  [
    "l3",
    {
      name: "Supernal Verge",
      desc: "A place where the Supernal touches the Fallen World.",
      bonus: 2,
      unique: true,
    },
  ],

  // actions
  [
    "a1",
    {
      name: "Mudra",
      desc: "Uses rote skill dots as bonus. Must be free to make the mnemonic gestures.",
      bonus: 0,
      unique: true,
    },
  ],
  [
    "a2",
    {
      name: "Concentration",
      desc: "Duration must be greater than a turn. Ends if you are hurt or take non-reflexive actions.",
      bonus: 2,
      unique: true,
    },
  ],
  [
    "a3",
    {
      name: "Mantra",
      desc: "High Speech. Must be spoken aloud. Cannot be used reflexively.",
      bonus: 2,
      unique: true,
    },
  ],
  [
    "a4",
    {
      name: "Runes",
      desc: "Must be cast as ritual. Ends if runes on the subject are damaged or disrupted.",
      bonus: 2,
      unique: true,
    },
  ],

  // tools
  [
    "t1",
    {
      name: "Dedicated Tool",
      desc: "Tool which synchronizes with your Nimbus.",
      bonus: 0,
      unique: false,
    },
  ],
  [
    "t2",
    {
      name: "Path Tool",
      desc: "Tool which aligns closely with your Path.",
      bonus: 1,
      unique: false,
    },
  ],
  [
    "t3",
    {
      name: "Order Tool",
      desc: "Tool which uses symbols and teachings of your Order.",
      bonus: 1,
      unique: false,
    },
  ],
  [
    "t4",
    {
      name: "Perfected Tool",
      desc: "Tool which contains a Perfected Metal suited to the spell.",
      bonus: 2,
      unique: false,
    },
  ],
  // Soul Stones
  [
    "s1",
    {
      name: "Soul Stone",
      desc: "Object which embodies your Gnosis.",
      bonus: 0,
      unique: false,
    },
  ],
  [
    "s2",
    {
      name: "Soul Stone",
      desc: "Object which embodies another mage's Gnosis.",
      bonus: 2,
      unique: false,
    },
  ],
  [
    "s3",
    {
      name: "Soul Stone",
      desc: "Object which embodies another mage's higher Gnosis.",
      bonus: 3,
      unique: false,
    },
  ],
  // Sympathy
  [
    "y1",
    {
      name: "Symbolic Sympathy",
      desc: "An indirect representation of the subject.",
      bonus: 0,
      unique: false,
    },
  ],
  [
    "y2",
    {
      name: "Representational Sympathy",
      desc: "An item sympathetically linked to the subject as they were previously.",
      bonus: 1,
      unique: false,
    },
  ],
  [
    "y3",
    {
      name: "Material Sympathy",
      desc: "An item sympathetically linked to the subject as they are now.",
      bonus: 2,
      unique: false,
    },
  ],
  // Sacrement
  [
    "c1",
    {
      name: "Sacrament",
      desc: "An object symbolic of the spell destroyed during casting.",
      bonus: 1,
      unique: false,
    },
  ],
  [
    "c2",
    {
      name: "Rare Sacrament",
      desc: "A sacrament which requires significant effort to acquire.",
      bonus: 2,
      unique: false,
    },
  ],
  [
    "c3",
    {
      name: "Otherworldly Sacrament",
      desc: "A sacrament from somewhere other than the material realm.",
      bonus: 3,
      unique: false,
    },
  ],
  // Persona
  [
    "p1",
    {
      name: "Persona",
      desc: "Uses your Shadow Name and/or Cabal Theme merits.",
      bonus: [1, 4],
      unique: true,
    },
  ],
])
