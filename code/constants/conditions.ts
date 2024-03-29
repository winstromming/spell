import type { Condition } from "./types"

export const conditions: Condition[] = [
  {
    name: "Agoraphobic",
    type: "Mental",
    persist: false,
    description: "You avoid open spaces and crowds.",
    page: "PTC 2e p306",
  },
  {
    name: "Addled",
    type: "Mental",
    persist: false,
    description: "Your memories are jumbled and confused.",
    page: "GTS 2e p299",
  },
  {
    name: "Amnesia",
    type: "Mental",
    persist: true,
    description: "You've lost a large swath of memory.",
    page: "CofD p288",
  },
  {
    name: "Broken",
    type: "Mental",
    persist: true,
    description: "Your will is broken and you back down from everything.",
    page: "CofD p288",
  },
  {
    name: "Captivated",
    type: "Mental",
    persist: false,
    description: "You're heavily preoccupied with something and can't split your attention.",
    page: "DTD p211",
  },
  {
    name: "Confused",
    type: "Mental",
    persist: false,
    description: "You can't think straight.",
    page: "VTR 2e p302",
  },
  {
    name: "Cowed",
    type: "Mental",
    persist: false,
    description: "Someone has weakened you through a display of dominance.",
    page: "WTF 2e p307",
  },
  {
    name: "Delusional",
    type: "Mental",
    persist: true,
    description: "Paranoid delusions dominate your behavior.",
    page: "VTR 2e p302",
  },
  {
    name: "Demoralized",
    type: "Mental",
    persist: false,
    description: "Failure dampens your fighting initiative.",
    page: "WTF 2e p307",
  },
  {
    name: "Detached",
    type: "Mental",
    persist: true,
    description: "You've run with occult circles for so long you've forgotten how to interact with humans.",
    page: "HD p123",
  },
  {
    name: "Deprived",
    type: "Mental",
    persist: undefined,
    description: "You're weakened by an unfed addiction.",
    page: "CofD p288",
  },
  {
    name: "Disoriented",
    type: "Mental",
    persist: false,
    description: "You've lost equilibrium and need an opportunity to recenter.",
    page: "DTD p211",
  },
  {
    name: "Dissociation",
    type: "Mental",
    persist: false,
    description: "Surreality plagues you with doubts of your own experiences.",
    page: "CTL 2e p336",
  },
  {
    name: "Distracted",
    type: "Mental",
    persist: false,
    description: "You're buffeted from all sides, splitting your attention terribly.",
    page: "VTR 2e p302",
  },
  {
    name: "Doubtful",
    type: "Mental",
    persist: true,
    description: "You've lost confidence in all but your most secure actions.",
    page: "HMR p147",
  },
  {
    name: "Driven",
    type: "Mental",
    persist: false,
    description: "Your surety in your ambition is a great well of strength.",
    page: "MTC 2e p351",
  },
  {
    name: "Emboldened",
    type: "Mental",
    persist: false,
    description: "An uninhibited atmosphere makes you impulsive and prone to temptation.",
    page: "HMR p150",
  },
  {
    name: "Faith",
    type: "Mental",
    persist: true,
    description: "Your trust in the next world can be exploited by angelic forces.",
    page: "DSG p81",
  },
  {
    name: "First Trimester",
    type: "Mental",
    persist: true,
    description: "You experience flulike symptoms and vivid dreams that are signs of early pregnancy.",
    page: "HtH p41",
  },
  {
    name: "Second Trimester",
    type: "Mental",
    persist: true,
    description: "You feel more creative, but worry as something grows within you.",
    page: "HtH p42",
  },
  {
    name: "Third Trimester",
    type: "Mental",
    persist: true,
    description: "Your body and brain prepare for giving birth, enhancing perception but causing distraction.",
    page: "HtH p42",
  },
  {
    name: "Frightened",
    type: "Mental",
    persist: false,
    description: "You're terrified and moved to panic and flee.",
    page: "VTR 2e p304",
  },
  {
    name: "Fugue",
    type: "Mental",
    persist: true,
    description: "You've shied away from trauma by shutting out the experience.",
    page: "CofD p289",
  },
  {
    name: "Guilty",
    type: "Mental",
    persist: false,
    description: "Feelings of remorse leave you emotionally vulnerable.",
    page: "CofD p289",
  },
  {
    name: "Informed",
    type: "Mental",
    persist: false,
    description: "You're well equipped to tackle a given subject.",
    page: "CofD p289",
  },
  {
    name: "Inspired",
    type: "Mental",
    persist: false,
    description: "The spirit moves you to confident action.",
    page: "CofD p289",
  },
  {
    name: "Lost",
    type: "Mental",
    persist: false,
    description: "You've lost your sense of place and need to reorient.",
    page: "CofD p289",
  },
  {
    name: "Lost Tracker",
    type: "Mental",
    persist: false,
    description: "Frustrations on a hunt leave your tracking skills sloppy and halfhearted.",
    page: "WTF 2e p308",
  },
  {
    name: "Madness",
    type: "Mental",
    persist: true,
    description: "Unnatural horror has shattered your ability to process life.",
    page: "CofD p289",
  },
  {
    name: "Obsession",
    type: "Mental",
    persist: undefined,
    description: "Something controls your attention and distracts from all else.",
    page: "CofD p290",
  },
  {
    name: "Shaken",
    type: "Mental",
    persist: false,
    description: "You're shocked or deeply rattled, unsteadying your hand.",
    page: "CofD p290",
  },
  {
    name: "Sleepwalking",
    type: "Mental",
    persist: true,
    description: "Sleep and wakefulness blur, and you suffer from lost time and poor recollection.",
    page: "CTL 2e p344",
  },
  {
    name: "Spooked",
    type: "Mental",
    persist: false,
    description: "Otherworldly wonder moves you unwisely.",
    page: "CofD p291",
  },
  {
    name: "Steadfast",
    type: "Mental",
    persist: false,
    description: "Your resolve to act is steeled and ready.",
    page: "CofD p291",
  },
  {
    name: "Stoic",
    type: "Mental",
    persist: false,
    description: "Distance and emotional guard ease lies, but inhibit perspective and passion.",
    page: "CTL 2e p345",
  },
  {
    name: "Strained",
    type: "Mental",
    persist: false,
    description: "You've held back the shock of witnessing supernal sorcery, but the pressure remains.",
    page: "MTA 2e p318",
  },
  {
    name: "Swooned",
    type: "Mental",
    persist: false,
    description: "You're charmed or bedazzled by a particular person.",
    page: "CofD p291",
  },
  {
    name: "Withdrawn",
    type: "Mental",
    persist: false,
    description: "Doubt and insecurity drive you inward, sapping the will to action.",
    page: "CTL 2e p346",
  },
  {
    name: "Arm Disability",
    type: "Physical",
    persist: true,
    description: "At least one arm is either chronically or permanently nonfunctional.",
    page: "HL p57",
  },
  {
    name: "Blind",
    type: "Physical",
    persist: undefined,
    description: "You've lost or can't exercise your sense of sight.",
    page: "CofD p288",
  },
  {
    name: "Chronic Agony",
    type: "Physical",
    persist: true,
    description: "You're vulnerable to incapacitating pain spells.",
    page: "HL p57",
  },
  {
    name: "Chronic Sickness",
    type: "Physical",
    persist: true,
    description: "Sickness or poison lingers in you, aggravated by stress.",
    page: "HL p57",
  },
  {
    name: "Deaf",
    type: "Physical",
    persist: true,
    description: "Your hearing is severely impaired.",
    page: "HL p58",
  },
  {
    name: "Disabled",
    type: "Physical",
    persist: undefined,
    description: "You can't effectively walk on your own power.",
    page: "CofD p288",
  },
  {
    name: "Drained",
    type: "Physical",
    persist: false,
    description: "You're weak and woozy from blood loss.",
    page: "VTR 2e p303",
  },
  {
    name: "Easy Prey",
    type: "Physical",
    persist: false,
    description: "You've left a strong trail for a hunter to follow and exploit.",
    page: "WTF 2e p307",
  },
  {
    name: "Energized",
    type: "Physical",
    persist: false,
    description: "A chemically induced rush.",
    page: "HD p123",
  },
  {
    name: "Exhausted",
    type: "Physical",
    persist: false,
    description: "You're run ragged on the edge of unconsciousness.",
    page: "WTF 2e p307",
  },
  {
    name: "Fatigued",
    type: "Physical",
    persist: false,
    description: "You've pushed yourself too far, and your fatigue hangs over you constantly.",
    page: "PTC 2e p309",
  },
  {
    name: "Fragile",
    type: "Physical",
    persist: false,
    description: "You're using equipment not sturdy enough to endure continued use.",
    page: "CofD p102",
  },
  {
    name: "Intoxicated",
    type: "Physical",
    persist: false,
    description: "Your discretion is dulled by altered consciousness.",
    page: "VTR 2e p304",
  },
  {
    name: "Invisible Predator",
    type: "Physical",
    persist: false,
    description: "You've skulked on the hunt, leaving nary a trace of your approach.",
    page: "WTF 2e p308",
  },
  {
    name: "Leg Disability",
    type: "Physical",
    persist: true,
    description: "At least one leg is either chronically or permanently nonfunctional.",
    page: "HL p58",
  },
  {
    name: "Lethargic",
    type: "Physical",
    persist: false,
    description: "Fatigue tires you so heavily you cannot muster Willpower.",
    page: "VTR 2e p305",
  },
  {
    name: "Mute",
    type: "Physical",
    persist: undefined,
    description: "You cannot speak or use your voice.",
    page: "CofD p290",
  },
  {
    name: "Numb",
    type: "Physical",
    persist: true,
    description: "Detachment from the world dulls the feeling in your body.",
    page: "CTL 2e p343",
  },
  {
    name: "Recovery",
    type: "Physical",
    persist: true,
    description: "The pain and weakness of breaking a heavy chemical dependency.",
    page: "HD p123",
  },
  {
    name: "Scarred",
    type: "Physical",
    persist: false,
    description: "You're rattled and volatile from a sudden assault.",
    page: "VTR 2e p305",
  },
  {
    name: "Sickly",
    type: "Physical",
    persist: false,
    description: "Disease is making its way through your system.",
    page: "DSG p105",
  },
  {
    name: "Stumbled",
    type: "Physical",
    persist: false,
    description: "A complication has arisen to interrupt an ongoing project.",
    page: "WTF 2e p311",
  },
  {
    name: "Untraceable",
    type: "Physical",
    persist: false,
    description: "You've thoroughly covered any trail a hunter might use to find you.",
    page: "WTF 2e p311",
  },
  {
    name: "Volatile",
    type: "Physical",
    persist: false,
    description: "You're using unstable equipment prone to backfiring.",
    page: "CofD p102",
  },
  {
    name: "Bonded",
    type: "Social",
    persist: false,
    description: "You've established trust with a particular animal.",
    page: "CofD p288",
  },
  {
    name: "Connected",
    type: "Social",
    persist: undefined,
    description: "You've made inroads with a particular group of people.",
    page: "CofD p288",
  },
  {
    name: "Embarrassing Secret",
    type: "Social",
    persist: false,
    description: "There are skeletons in your closet to exploit.",
    page: "CofD p289",
  },
  {
    name: "Hunted",
    type: "Social",
    persist: true,
    description: "Dangerous enemies have your trail.",
    page: "DTD p119",
  },
  {
    name: "Leveraged",
    type: "Social",
    persist: false,
    description: "A particular character is holding something over your head to compel you.",
    page: "CofD p289",
  },
  {
    name: "Notoriety",
    type: "Social",
    persist: false,
    description: "Odious blame follows you, whether true or not.",
    page: "CofD p290",
  },
  {
    name: "Tasked",
    type: "Social",
    persist: false,
    description: "Your duty-bound allies have issued you a serious task you must carry out.",
    page: "VTR 2e p307",
  },
  {
    name: "Watched",
    type: "Social",
    persist: true,
    description: "Someone is stalking you, suspicious of an unnatural secret you hide.",
    page: "PTC 2e p312",
  },
  {
    name: "Defeated",
    type: "Awakened",
    persist: false,
    description: "A rival has won magical advantage over you in the Duel Arcane.",
    page: "MTA 2e p315",
  },
  {
    name: "Humbled",
    type: "Awakened",
    persist: false,
    description: "Someone stands to you as a valuable reminder of the power of humanity.",
    page: "MTA 2e p316",
  },
  {
    name: "Megalomaniacal",
    type: "Awakened",
    persist: false,
    description: "You are blinded by hubris.",
    page: "MTA 2e p317",
  },
  {
    name: "Mystery Commands",
    type: "Awakened",
    persist: true,
    description: "You receive the arcane will of the Exarchs.",
    page: "MTA 2e p317",
  },
  {
    name: "Rampant",
    type: "Awakened",
    persist: false,
    description: "Your spellcasting is ruled by a cavalier, reckless attitude.",
    page: "MTA 2e p317",
  },
  {
    name: "Triumphant",
    type: "Awakened",
    persist: false,
    description: "You carry your victory in the Dual Arcane with you in Awakened society.",
    page: "MTA 2e p319",
  },
  {
    name: "Abyssal Backlash",
    type: "Paradox",
    persist: false,
    description: "	A Paradox casts a shadow over you, threatening to break through on the next spell that gives it an opening.",
    page: "MTA 2e p117",
  },
  {
    name: "Abyssal Imago",
    type: "Paradox",
    persist: false,
    description: "	A Paradox intrudes upon the spells you envision, compelling dangerous Reach.",
    page: "MTA 2e p117",
  },
  {
    name: "Abyssal Nimbus",
    type: "Paradox",
    persist: false,
    description: "	A Paradox has leaked across your Nimbus and invites Abyssal manifestations.",
    page: "MTA 2e p116",
  },
  {
    name: "Monster",
    type: "Paradox",
    persist: false,
    description: "A Paradox has mutated an animal into a miserable, fearsome nemesis.",
    page: "DE p81",
  },
  {
    name: "Unclean",
    type: "Paradox",
    persist: false,
    description: "A Paradox has turned your magical tools and methods against you.",
    page: "DE p81",
  },
]
