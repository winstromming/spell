<template>
  <Card :icon="true" title="Active" :summary="`(${caster.active.length}/${caster.traits.Gnosis})`">
    <template #icon>
      <n-icon>
        <FlashOutline />
      </n-icon>
    </template>
    <template #footer v-if="caster.active.length > 0">
      <n-space vertical>
        <Card collapsed :title="item.name" :summary="String(item.id)" v-for="(item) in caster.active" :key="item.id">
          <template #content>
            <n-space vertical size="small">
              <n-text v-if="getCastingFactorsSummary(caster, item)"><b>Factors:</b> {{
    getCastingFactorsSummary(caster, item)
  }}.</n-text>
              <n-text v-if="getCastingEffectsSummary(caster, item)"><b>Extra:</b> {{ getCastingEffectsSummary(caster,
    item) }}</n-text>
              <n-text v-if="getYantrasSummary(caster, item)"><b>Yantras:</b> {{
    getYantrasSummary(caster, item)
                }}.</n-text>
            </n-space>
          </template>
          <template #footer>
            <n-button text strong class="btn-only-icon-when-small" title="Stop" size="small" type="error"
              @click="uncastSpell(item)">
              <template #icon>
                <n-icon>
                  <Ban />
                </n-icon>
              </template>
              Stop
            </n-button>
          </template>
        </Card>
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">

import { findIndex } from "lodash";
import Card from "../components/Card.vue"
import { getCastingFactorsSummary, getCastingEffectsSummary, getYantrasSummary } from "../constants/methods";

import { FlashOutline, Ban } from "@vicons/ionicons5";
import { caster, spell } from "../store/store";
import type { Spell } from "../store/store";

const uncastSpell = (choice: Spell) => {
  let index = findIndex(caster.active, (spell) => choice.id === spell.id)
  caster.active.splice(index, 1)
};

</script>