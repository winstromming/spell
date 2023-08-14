<template></template>

<script setup lang="ts">
import Actions from "./Actions.vue"
import Spell from "./Spell.vue"
import Factors from "./Factors.vue"
import Yantras from "./Yantras.vue"
import Paradox from "./Paradox.vue"
import Character from "./Character.vue"
import Attributes from "./Attributes.vue";
import Skills from "./Skills.vue";
import Health from "./Health.vue";
import Beats from "./Beats.vue";
import Praxes from "./Praxes.vue";
import Rotes from "./Rotes.vue";
import Tools from "./Tools.vue";
import Conditions from "./Conditions.vue";
import MeritsArcana from "./MeritsArcana.vue";
import Chooser from "./Chooser.vue";
import Active from "./Active.vue";
import Saved from "./Saved.vue";
import Notes from "./Notes.vue";
import Theme from "./Theme.vue";

import { caster, casters } from "../store/store";
import { watch, onMounted, toRaw } from "vue";
import { assign } from "lodash";

onMounted(() => {
  const hasCaster = JSON.parse(localStorage.getItem("caster") ?? "null")
  if (hasCaster) assign(caster, hasCaster)
  const hasCasters = JSON.parse(localStorage.getItem("casters") ?? "null")
  if (hasCasters) assign(caster, hasCasters)
})

watch(caster, () => {
  if (caster.id === 0) caster.id = Date.now()
  localStorage.setItem("caster", JSON.stringify(toRaw(caster)));
  if (caster && caster.id && casters.find(c => c.id === caster.id) === undefined) casters.push(caster)
})

watch(casters, () => {
  localStorage.setItem("casters", JSON.stringify(toRaw(casters)));
})
</script>