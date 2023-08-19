<template>
  <n-message-provider>
    <n-dialog-provider>
      <n-config-provider :theme="theme.value" :theme-overrides="overrides">
        <n-layout position="absolute" embedded>
          <n-layout-header position="absolute" style="z-index: 10">
            <Navigation />
          </n-layout-header>
          <n-layout-content position="absolute" embedded style="top: 50px">
            <n-space vertical style="padding: 24px;" :size="12">
              <n-grid y-gap="12" x-gap="12" cols="1 600:12">
                <n-gi span="1 600:12 900:4 1300:6">
                  <n-space vertical :size="12">
                    <Character />
                    <Attributes />
                    <Skills />
                    <n-grid y-gap="12" x-gap="12" cols="1 550:2">
                      <n-gi>
                        <Arcana />
                      </n-gi>
                      <n-gi>
                        <Merits />
                      </n-gi>
                    </n-grid>
                    <Notes />
                  </n-space>
                </n-gi>
                <n-gi span="1 600:6 900:4 1300:3">
                  <n-space vertical :size="12">
                    <Beats />
                    <Health />
                    <Power />
                    <Conditions />
                    <Praxes />
                    <Rotes />
                    <Tools />
                    <Active />
                    <Saved />
                  </n-space>
                </n-gi>
                <n-gi span="1 600:6 900:4 1300:3">
                  <n-space vertical :size="12">
                    <Spell />
                    <Factors />
                    <Yantras />
                    <Paradox />
                  </n-space>
                </n-gi>
              </n-grid>
            </n-space>
          </n-layout-content>
        </n-layout>
      </n-config-provider>
    </n-dialog-provider>
  </n-message-provider>
</template>

<script setup lang="ts">

import { watch, toRaw, onBeforeMount } from "vue";
import { assign, cloneDeep } from "lodash";

import Spell from "./components/Spell.vue"
import Arcana from "./components/Arcana.vue"
import Factors from "./components/Factors.vue"
import Yantras from "./components/Yantras.vue"
import Paradox from "./components/Paradox.vue"
import Character from "./components/Character.vue"
import Attributes from "./components/Attributes.vue";
import Skills from "./components/Skills.vue";
import Power from "./components/Power.vue";
import Health from "./components/Health.vue";
import Beats from "./components/Beats.vue";
import Praxes from "./components/Praxes.vue";
import Rotes from "./components/Rotes.vue";
import Tools from "./components/Tools.vue";
import Conditions from "./components/Conditions.vue";
import Merits from "./components/Merits.vue";
import Active from "./components/Active.vue";
import Saved from "./components/Saved.vue";
import Notes from "./components/Notes.vue";
import Navigation from "./components/Navigation.vue";

import { caster, casters, theme } from "./store/store";

const overrides = {
  common: {
    fontWeightStrong: "600"
  }
}

onBeforeMount(() => {
  const hasCasters = JSON.parse(localStorage.getItem("csp-casters") ?? "null")
  if (hasCasters) assign(casters, hasCasters)
  const hasCaster = JSON.parse(localStorage.getItem("csp-caster") ?? "null")
  if (hasCaster) assign(caster, hasCaster)
})

watch(caster, () => {
  if (caster.id === 0) caster.id = Date.now()
  const raw = cloneDeep(toRaw(caster))
  localStorage.setItem("csp-caster", JSON.stringify(raw));
  const has = casters.find(c => c.id === caster.id)
  if (has) {
    assign(has, raw)
  } else {
    casters.push(raw)
  }
})

watch(casters, () => {
  localStorage.setItem("csp-casters", JSON.stringify(toRaw(casters)));
})

</script>

<style>
html {
  height: 100%;
}

body {
  height: 100%;
  overflow: hidden;
  background-color: var(--n-color-bg-base);
}

.bg {
  background-color: var(--n-color-bg-base);
}
</style>
