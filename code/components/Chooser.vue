<template>
  <n-dropdown trigger="click" :options="options" placement="bottom-start" @select="choose">
    <n-button size="tiny">
      <template #icon>
        <n-icon :component="Person" />
      </template>
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { computed, h } from "vue";
import Card from "../components/Card.vue";

import { caster, casters, defaultCaster } from "../store/store";
import type { Caster } from "../store/store"
import { NIcon, useMessage } from "naive-ui";
import { AddCircleOutline, Person, People, CaretDown } from "@vicons/ionicons5";
import { assign, cloneDeep } from "lodash";

const message = useMessage()

const valueOf = (c: Caster) => {
  if (c.details.name === "") return "Unnamed"
  if (c.details.concept === "") return c.details.name
  return `${c.details.name}, ${c.details.concept}`
}

const choose = (id: number | "create") => {
  if (id === "create") {
    let created = { ...cloneDeep(defaultCaster), id: Date.now() }
    assign(caster, created)
    message.success("New character created")
  } else {
    let choice = casters.find(c => c.id === id)
    assign(caster, choice)
  }
}

const options = computed(() => {
  let items = []
  let cabals: string[] = []

  for (let each of casters) {
    if (cabals.includes(each.details.cabal) === false) cabals.push(each.details.cabal)
  }

  for (let cabal of cabals) {
    items.push({
      label: cabal || "Other",
      key: cabal,
      icon() {
        return h(NIcon, null, {
          default: () => h(People)
        })
      },
      children: casters
        .filter((c) => c.details.cabal === cabal)
        .map((c) => {
          return {
            label: valueOf(c),
            key: c.id,
            disabled: caster.id === c.id,
          }
        }),
    })
  }

  items.push({
    key: "d2",
    type: "divider",
  })

  items.push({
    label: "New character",
    key: "create",
    icon() {
      return h(NIcon, null, {
        default: () => h(AddCircleOutline)
      })
    },
  });

  return items
});

</script>