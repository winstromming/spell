<template>
  <Card title="Experience" :icon="true" :summary="summary">
    <template #icon>
      <n-icon :component="TicketOutline"></n-icon>
    </template>
    <template #footer>
      <n-grid x-gap="12" y-gap="12" :cols="2">
        <n-gi>
          <n-input-number v-model:value="caster.progress.mundane.Experience" :format="formatExperience" :parse="parse"
            size="small" min="0" max="10">
          </n-input-number>
        </n-gi>
        <n-gi>
          <n-input-number v-model:value="caster.progress.arcane.Experience" size="small" min="0" max="10"
            :format="formatArcaneExperience" :parse="parse">
          </n-input-number>
        </n-gi>
        <n-gi>
          <n-input-number v-model:value="caster.progress.mundane.Beats" :format="formatBeats" :parse="parse" size="small"
            min="0" max="5">
          </n-input-number>
        </n-gi>
        <n-gi>
          <n-input-number v-model:value="caster.progress.arcane.Beats" size="small" min="0" max="5"
            :format="formatArcaneBeats" :parse="parse">
          </n-input-number>
        </n-gi>
        <n-gi span="1 350:2">
          <n-space vertical size="small">
            <n-text strong>Aspirations</n-text>
            <n-input type="textarea" :autosize="{ minRows: 3 }" placeholder="" v-model:value="caster.details.aspirations">
            </n-input>
          </n-space>
        </n-gi>
        <n-gi span="1 350:2">
          <n-space vertical size="small">
            <n-text strong>Obsessions</n-text>
            <n-input type="textarea" :autosize="{ minRows: 3 }" placeholder="" v-model:value="caster.details.obsessions">
            </n-input>
          </n-space>
        </n-gi>
      </n-grid>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { TicketOutline } from "@vicons/ionicons5"
import Dots from "../components/Dots.vue";
import Card from "../components/Card.vue";
import { caster } from "../store/store";
import { computed, watch } from "vue";

const formatBeats = (num: number | null) => {
  return `${num ?? 0} Beats`
}
const formatExperience = (num: number | null) => {
  return `${num ?? 0} Regular`
}
const formatArcaneBeats = (num: number | null) => {
  return `${num ?? 0} Beats`
}
const formatArcaneExperience = (num: number | null) => {
  return `${num ?? 0} Arcane`
}
const parse = (input: string) => {
  const nums = input.replace(/[^0-9]+/g, '').trim()
  return nums === '' ? null : Number(nums)
}

watch(caster.progress.mundane, () => {
  if (caster.progress.mundane.Beats === 5) {
    caster.progress.mundane.Beats -= 5
    caster.progress.mundane.Experience += 1
  }
})
watch(caster.progress.arcane, () => {
  if (caster.progress.arcane.Beats === 5) {
    caster.progress.arcane.Beats -= 5
    caster.progress.arcane.Experience += 1
  }
})

const summary = computed(() => {
  return `${caster.progress.mundane.Experience} Regular, ${caster.progress.arcane.Experience} Arcane`;
})

</script>