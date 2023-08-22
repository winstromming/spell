<template>
  <Card title="Tools" :icon="true">
    <template #icon>
      <n-icon>
        <BuildOutline />
      </n-icon>
    </template>
    <template #header>
      <n-select ref="chooseToolDropdown" filterable :value="value" placeholder="Choose tool to add" @update:value="choose"
        :options="options" />
    </template>
    <template #footer v-if="caster.tools.length > 0">
      <n-space vertical>
        <Card :title="item.name || ' '" collapsed :summary="item.dedicated ? `Dedicated ${item.type}` : `${item.type}`"
          v-for="item in caster.tools" :key="item.id">
          <template #content>
            <n-space vertical size="small">
              <n-input v-model:value="item.name" placeholder="Name" />
              <n-input v-model:value="item.description" placeholder="Description" type="textarea" rows="2" />
            </n-space>
          </template>
          <template #footer>
            <n-space justify="space-between">
              <n-button quaternary class="btn-only-icon-when-small" title="Remove" size="small" type="error"
                @click="remove(item)">
                <template #icon>
                  <n-icon>
                    <Trash />
                  </n-icon>
                </template>
              </n-button>
              <n-space>
                <n-checkbox size="small" title="Dedicate" v-model:checked="item.dedicated" />
              </n-space>
            </n-space>
          </template>
        </Card>
        <n-alert type="error" v-if="profligate">{{ profligate }}</n-alert>
        <n-alert type="error" v-if="broad">{{ broad }}</n-alert>
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Card from "../components/Card.vue";
import Dots from "../components/Dots.vue";
import { caster } from "../store/store";
import { Trash, BuildOutline } from "@vicons/ionicons5";
import { yantrasBaseData } from "../constants/constants";
import type { SelectGroupOption } from "naive-ui";
import type { Tool, Yantra } from "../constants/types";

const value = ref(null);

const options = computed(() => {
  return [
    { type: "group", label: "Tool", key: "tools", children: getYantraOptions("t") },
    { type: "group", label: "Soul Stone", key: "soulstones", children: getYantraOptions("s") },
    { type: "group", label: "Location", key: "locations", children: getYantraOptions("l") },
    { type: "group", label: "Action", key: "actions", children: getYantraOptions("a") },
    { type: "group", label: "Sympathy", key: "sympathys", children: getYantraOptions("y") },
    { type: "group", label: "Sacrament", key: "sacraments", children: getYantraOptions("c") },
    { type: "group", label: "Persona", key: "personas", children: getYantraOptions("p") },
  ];
})

const profligate = computed(() => {
  return caster.tools.filter((t) => t.dedicated).length > 2 && Object.values(caster.merits).some(m => m.label.toLowerCase().includes("profligate dedication")) === false ? "Profligate Dedication merit required!" : null;
})

const broad = computed(() => {
  return caster.tools.some((t) => t.dedicated && t.key[0] !== "t" && t.key[0] !== "s") && Object.values(caster.merits).some(m => m.label.toLowerCase().includes("broad dedication")) === false ? "Broad Dedication merit required!" : null;
})

const getYantraOptions = (prefix: string) => {
  let options = []
  for (let [key, yantraBaseData] of yantrasBaseData) {
    if (key[0] === prefix) {
      let labelkey = `${yantraBaseData.name} (+${yantraBaseData.bonus} ${yantraBaseData.bonus === 1 ? "die" : "dice"})`
      options.push({ label: labelkey, value: { ...yantraBaseData, key } })
    }
  }
  return options
};

const choose = (key: string, option: { label: string; value: any }) => {
  let tool: Tool = {
    name: '',
    type: option.label as string,
    dedicated: false,
    description: '',
    key: option.value.key,
    id: new Date().getTime(),
  };
  caster.tools.push(tool)
};

const remove = (option: Tool) => {
  let index = caster.tools.findIndex((s) => s.id === option.id)
  if (index !== -1) caster.tools.splice(index, 1)
};
</script>