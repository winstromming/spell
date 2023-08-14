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
        <Card :title="item.name ?? 'Tool'" collapsed :summary="item.dedicated ? `Dedicated ${item.type}` : `${item.type}`"
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
    { type: "group", label: "Tools", key: "tools", children: getYantraOptions("t") },
    { type: "group", label: "Soul Stones", key: "soulstones", children: getYantraOptions("s") },
  ];
})

const getYantraOptions = (prefix: string) => {
  let options = []
  for (let [key, yantraBaseData] of yantrasBaseData) {
    if (key[0] === prefix) {
      let labelkey = `${yantraBaseData.name} (+${yantraBaseData.bonus} ${yantraBaseData.bonus === 1 ? "die" : "dice"})`
      options.push({ label: labelkey, value: yantraBaseData })
    }
  }
  return options
};

const choose = (key: string, option: { label: string; value: any }) => {
  console.log(option);
  let tool: Tool = {
    name: option.value.name as string,
    type: option.label as string,
    dedicated: false,
    description: option.value.desc as string,
    id: new Date().getTime(),
  };
  caster.tools.push(tool)
};

const remove = (option: Tool) => {
  let index = caster.tools.findIndex((s) => s.id === option.id)
  if (index !== -1) caster.tools.splice(index, 1)
};
</script>