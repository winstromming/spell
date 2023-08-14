<template>
  <n-space :size="2">
    <Chooser />
    <n-button size="tiny" :disabled="theme.name === 'dark'" @click="() => theme.set('dark')">
      <template #icon>
        <n-icon :component="Moon" />
      </template>
    </n-button>
    <n-button size="tiny" :disabled="theme.name === 'light'" @click="() => theme.set('light')">
      <template #icon>
        <n-icon :component="Sunny" />
      </template>
    </n-button>
  </n-space>
</template>
<script setup lang="ts">

import { darkTheme, lightTheme } from "naive-ui"
import { Moon, Sunny, CaretDown } from "@vicons/ionicons5"
import { ref, watch } from "vue";
import { theme } from "../store/store"
import Chooser from "./Chooser.vue"

</script>