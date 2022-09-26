export const arcanaNames = ["Death", "Fate", "Forces", "Life", "Matter", "Mind", "Prime", "Spirit", "Space", "Time"]

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
    "s6",
    {
      time: "20 turns",
      penalty: 10,
    },
  ],
  [
    "s7",
    {
      time: "30 turns",
      penalty: 12,
    },
  ],
  [
    "s8",
    {
      time: "40 turns",
      penalty: 14,
    },
  ],
  [
    "s9",
    {
      time: "50 turns",
      penalty: 16,
    },
  ],
  [
    "s10",
    {
      time: "60 turns",
      penalty: 18,
    },
  ],
  [
    "s11",
    {
      time: "70 turns",
      penalty: 20,
    },
  ],
  [
    "a1",
    {
      time: "1 scene/hour",
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
      time: "Indefinite",
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
      area: "Arms reach",
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
      area: "Several rooms",
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
      area: "small house",
      penalty: 10,
    },
  ],
  [
    "s7",
    {
      number: 64,
      size: "11",
      area: "small house",
      penalty: 12,
    },
  ],
  [
    "s8",
    {
      number: 128,
      size: "12",
      area: "small house",
      penalty: 14,
    },
  ],
  [
    "s9",
    {
      number: 256,
      size: "13",
      area: "small house",
      penalty: 16,
    },
  ],
  [
    "a1",
    {
      number: "5",
      size: "5",
      area: "large house",
      penalty: 0,
    },
  ],
  [
    "a2",
    {
      number: "10",
      size: "10",
      area: "small warehouse",
      penalty: 2,
    },
  ],
  [
    "a3",
    {
      number: "20",
      size: "15",
      area: "large warehouse",
      penalty: 4,
    },
  ],
  [
    "a4",
    {
      number: "40",
      size: "20",
      area: "shopping mall",
      penalty: 6,
    },
  ],
  [
    "a5",
    {
      number: "80",
      size: "25",
      area: "city block",
      penalty: 8,
    },
  ],
  [
    "a6",
    {
      number: "160",
      size: "30",
      area: "small neighborhood",
      penalty: 10,
    },
  ],
  [
    "a7",
    {
      number: "320",
      size: "35",
      area: "small neighborhood",
      penalty: 12,
    },
  ],
  [
    "a8",
    {
      number: "640",
      size: "40",
      area: "small neighborhood",
      penalty: 14,
    },
  ],
  [
    "a9",
    {
      number: "1280",
      size: "45",
      area: "small neighborhood",
      penalty: 16,
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
      desc: "A prepared ritual space with a soul stone",
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
      name: "Rote Skill Mudra",
      desc: "Uses skill dots as a bonus. The character must be free to make whatever mnemonic gestures are used to recall the Rote.",
      bonus: 0,
      unique: true,
    },
  ],
  [
    "a2",
    {
      name: "Concentration",
      desc: "Duration must be greater than a turn. If the mage is hurt or takes a non-reflexive action while the spell is active, it ends immediately.",
      bonus: 2,
      unique: true,
    },
  ],
  [
    "a3",
    {
      name: "Mantra (High Speech)",
      desc: "Must be spoken aloud. Cannot be used reflexively.",
      bonus: 2,
      unique: true,
    },
  ],
  [
    "a4",
    {
      name: "Runes",
      desc: "The subject is marked with runes. Ritual casting only. If anything damages or disrupts the runes while the spell is active, it ends immediately.",
      bonus: 2,
      unique: true,
    },
  ],

  // tools
  [
    "t1",
    {
      name: "Dedicated Tool",
      desc: "Tool which synchronizes with the mage's Nimbus. Reduces Paradox by 2 dice.",
      bonus: 0,
      unique: true,
    },
  ],
  [
    "t2",
    {
      name: "Path Tool",
      desc: "Tools which aligns closely to the mage's Path.",
      bonus: 1,
      unique: false,
    },
  ],
  [
    "t3",
    {
      name: "Order Tool",
      desc: "Tools which draw upon an Order's symbols and teachings.",
      bonus: 1,
      unique: false,
    },
  ],
  [
    "t4",
    {
      name: "Material Sympathy",
      desc: "An item sympathetically linked to the subject as they are now. At least one sympathetic tool is required for sympathetic casting. Does not grant a bonus when used with Sympathetic Range or Temporal Sympathy Attainments.",
      bonus: 2,
      unique: false,
    },
  ],
  [
    "t5",
    {
      name: "Representational Sympathy",
      desc: "An item sympathetically linked to the subject as they were previously. At least one sympathetic tool is required for sympathetic casting. Does not grant a bonus when used with Sympathetic Range or Temporal Sympathy Attainments.",
      bonus: 1,
      unique: false,
    },
  ],
  [
    "t6",
    {
      name: "Symbolic Sympathy",
      desc: "An indirect representation of the subject. At least one sympathetic tool is required for sympathetic casting.",
      bonus: 0,
      unique: false,
    },
  ],
  [
    "t7",
    {
      name: "Sacrament",
      desc: "An object symbolic of the spell destroyed during casting.",
      bonus: 1,
      unique: false,
    },
  ],
  [
    "t8",
    {
      name: "Rare Sacrament",
      desc: "A sacrament which requires significant effort to acquire.",
      bonus: 2,
      unique: false,
    },
  ],
  [
    "t9",
    {
      name: "Otherworldly Sacrament",
      desc: "A sacrament from somewhere other than the material realm.",
      bonus: 3,
      unique: false,
    },
  ],
  [
    "t10",
    {
      name: "Persona",
      desc: "Uses the mage's Shadow Name and Cabal Theme Merits.",
      bonus: [1, 4],
      unique: true,
    },
  ],
])
export const spells = [
  {
    name: "Invisibilty",
    level: 2,
    arcana: "Forces",
    primaryFactor: "duration",
  },
  {
    name: "Dispel",
    level: 1,
    arcana: "Prime",
    primaryFactor: "potency",
  },
]
