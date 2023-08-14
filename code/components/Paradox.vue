<template>
  <Card collapsed title="Paradox"
    :summary="`${caster.paradox} Previous, ${['No', 'Few', 'Some', 'Many', 'Crowd of'][scene.witnesses]} witnesses`">
    <template #content>
      <n-space vertical>
        <b>Number of previous paradox rolls ({{ caster.paradox }})</b>
        <n-slider placement="bottom" v-model:value="caster.paradox" :min="0" :max="10" />
        <b>Number of sleeper witnesses ({{
          ['None', 'Few', 'Some', 'Many', 'Crowd'][scene.witnesses]
        }})</b>
        <n-slider placement="bottom" v-model:value="scene.witnesses" :min="0" :max="4" />
        <b>Amount of Mana spent negating Paradox ({{ spell.extraMana }})</b>
        <n-slider placement="bottom" v-model:value="spell.extraMana" :min="0" :max="6" />
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">

import { computed } from "vue";
import Card from "../components/Card.vue";
import { caster, spell, scene } from "../store/store";

</script>