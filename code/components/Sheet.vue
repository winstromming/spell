<template>
  <StickyHeader>
    <Theme />
  </StickyHeader>
  <n-space vertical style="padding: 24px;">
    <n-grid y-gap="12" x-gap="12" cols="1 700:5">
      <n-gi span="1 700:5">
        <n-grid y-gap="12" x-gap="12" cols="5">
          <n-gi span="3">
            <Chooser />
          </n-gi>
          <n-gi span="2">
            <Chooser />
          </n-gi>
        </n-grid>
      </n-gi>
      <n-gi span="1 700:3">
        <n-grid y-gap="12" x-gap="12" cols="1 600:2">
          <n-gi :span="2">
            <Character />
          </n-gi>
          <n-gi :span="2">
            <Attributes />
          </n-gi>
          <n-gi :span="2">
            <Skills />
          </n-gi>
          <n-gi :span="2">
            <MeritsArcana />
          </n-gi>
          <n-gi :span="2">
            <Notes />
          </n-gi>
        </n-grid>
      </n-gi>
      <n-gi span="1 700:2">
        <n-grid y-gap="12" x-gap="12" cols="1">
          <n-gi>
            <Beats />
          </n-gi>
          <n-gi>
            <Health />
          </n-gi>
          <n-gi>
            <Conditions />
          </n-gi>
          <n-gi>
            <Praxes />
          </n-gi>
          <n-gi>
            <Rotes />
          </n-gi>
          <n-gi>
            <Tools />
          </n-gi>
          <n-gi>
            <Active />
          </n-gi>
          <n-gi>
            <Saved />
          </n-gi>
        </n-grid>
      </n-gi>
    </n-grid>
  </n-space>
</template>

<script setup lang="ts">
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
import StickyHeader from "./StickyHeader.vue"

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