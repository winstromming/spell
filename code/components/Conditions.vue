<template>
  <Card title="Conditions" :icon="true">
    <template #icon>
      <n-icon>
        <PricetagOutline />
      </n-icon>
    </template>
    <template #header>
      <n-select v-model:value="selected" ref="select" tag clearable :clear-filter-after-select="true" filterable
        :options="options" @update:value="update" placeholder="Choose condition to add" />
    </template>
    <template #footer v-if="caster.status.conditions.length > 0">
      <n-space vertical>
        <Card v-for="condition of caster.status.conditions" :title="condition.name" :summary="condition.type"
          :collapsed="true">
          <template #content>
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Description"
              v-model:value="condition.description" />
          </template>
          <template #footer>
            <n-space justify="space-between">
              <n-button quaternary class="btn-only-icon-when-small" title="Remove" size="small" type="error"
                @click="caster.status.conditions.splice(caster.status.conditions.indexOf(condition), 1)">
                <template #icon>
                  <n-icon>
                    <Trash />
                  </n-icon>
                </template>
              </n-button>
              <n-text depth="3">Source: {{ condition.page ?? "Custom" }}</n-text>
            </n-space>
          </template>
        </Card>
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { caster } from "../store/store";
import Card from "../components/Card.vue"
import { Trash, PricetagOutline } from "@vicons/ionicons5"
import { computed, ref } from "vue";

import { conditions } from "../constants/conditions"
import type { Condition } from "../constants/types"
import type { SelectInst } from "naive-ui";

const select = ref<SelectInst | null>(null)
const selected = ref<string | null>(null)

const update = (value: string | Condition) => {
  let condition: Partial<Condition> = {};
  if (typeof value === "string") {
    condition.name = value;
    condition.type = "Other";
    condition.persist = false;
    condition.description = "";
    condition.page = "Custom";
  } else {
    condition = value;
  }
  caster.status.conditions = caster.status.conditions || []
  caster.status.conditions.push(condition as Condition)
  select.value?.blur()
  selected.value = null
}

const options = computed(() => {
  let options = []
  let types = [...new Set(conditions.map((c) => c.type))]
  for (let type of types) {
    options.push({
      type: "group",
      label: type,
      key: type,
      children: conditions
        .filter((c) => c.type === type)
        .map((c) => {
          return {
            label: c.name,
            value: c,
          }
        }),
    })
  }
  return options
});

</script>