<template>
  <Card title="Character" :summary="summary">
    <template #content>
      <n-grid y-gap="12" x-gap="12" cols="1 350:2 700:4">
        <n-gi>
          <n-input placeholder="Name" v-model:value="caster.details.name">
          </n-input>
        </n-gi>
        <n-gi>
          <n-input placeholder="Concept" v-model:value="caster.details.concept">
          </n-input>
        </n-gi>
        <n-gi>
          <n-input placeholder="Virtue" v-model:value="caster.details.virtue">
          </n-input>
        </n-gi>
        <n-gi>
          <n-input placeholder="Vice" v-model:value="caster.details.vice">
          </n-input>
        </n-gi>
        <n-gi>
          <n-select filterable :value="caster.details.path?.name" placeholder="Path"
            @update:value="caster.details.path = $event" :options="pathOptions" />
        </n-gi>
        <n-gi>
          <n-select filterable :value="caster.details.order?.name" placeholder="Order"
            @update:value="caster.details.order = $event" :options="orderOptions" />
        </n-gi>
        <n-gi>
          <n-input placeholder="Cabal" v-model:value="caster.details.cabal">
          </n-input>
        </n-gi>
        <n-gi>
          <n-input placeholder="Legacy" v-model:value="caster.details.legacy">
          </n-input>
        </n-gi>
      </n-grid>
    </template>
    <template #footer>
      <n-space justify="center">
        <n-button text type="error" @click="remove">Delete this character</n-button>
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDialog, useMessage } from "naive-ui";
import { caster, casters, defaultCaster } from "../store/store";
import { Orders, Paths } from "../constants/constants"
import Card from "../components/Card.vue"
import { assign, cloneDeep } from "lodash";

const dialog = useDialog()
const message = useMessage()

const orderOptions = computed(() => {
  return Orders.map((order) => {
    return {
      label: order.name,
      value: order
    }
  })
})

const pathOptions = computed(() => {
  return Paths.map((path) => {
    return {
      label: path.name,
      value: path
    }
  })
});

const create = () => {
  let created = { ...cloneDeep(defaultCaster), id: Date.now() }
  assign(caster, created)
}

const choose = (id: number | "create") => {
  let choice = casters.find(c => c.id === id)
  assign(caster, choice)
}

const remove = () => {
  dialog.error({
    title: 'Are you sure?',
    positiveText: 'Yes, delete',
    negativeText: 'No, cancel',
    onPositiveClick: () => {
      let index = casters.findIndex((s) => s.id === caster.id)
      if (index !== -1) {
        const name = casters[index].details.name
        casters.splice(index, 1)
        message.error(`${name || 'This character'} was removed`)
        if (casters.length === 0) create()
        else choose(casters[0].id)
      }
    },
  })
}

const summary = computed(() => {
  let string = "";
  if (caster.details.name) string += caster.details.name;
  if (caster.details.name && caster.details.concept) string += `, ${caster.details.concept}`;
  if (caster.details.path?.name || caster.details.order?.name) string += " (";
  if (caster.details.path?.name) string += caster.details.path?.name;
  if (caster.details.path?.name && caster.details.order?.name) string += "/";
  if (caster.details.order?.name) string += caster.details.order?.name;
  if (caster.details.path?.name || caster.details.order?.name) string += ")";
  return string;
})

</script>
