<template>
  <n-card size="small" class="card">
    <template #header v-if="title && title.length > 0">
      <n-button size="large" text block @click="!icon ? data.open = !data.open : undefined">
        <template #icon>
          <slot name="icon">
            <n-icon>
              <ChevronUp v-if="data.open == true" />
              <ChevronDown v-if="data.open === false" />
            </n-icon>
          </slot>
        </template>
        <n-text strong class="card-title">{{ title }}</n-text>
        <n-text v-if="summary" depth="3" class="card-summary" editable>{{ summary }}</n-text>
      </n-button>
    </template>
    <template #header-extra>
      <slot name="header"></slot>
    </template>
    <template #default v-if="data.open === true">
      <slot name="content"></slot>
    </template>
    <template #action v-if="data.open === true">
      <slot name="footer"></slot>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronUp } from "@vicons/ionicons5"
import { reactive } from "vue";

const props = defineProps<{
  title?: string;
  summary?: string;
  collapsed?: boolean;
  icon?: boolean;
}>();

const data = reactive({
  open: props.collapsed !== undefined ? !props.collapsed : false
});
</script>

<style>
.card[data-disabled] {
  opacity: 0.7
}

.card>.n-card-header {
  padding: 0;
}

.card>.n-card-header>.n-card-header__extra {
  padding-right: var(--n-padding-left);
  z-index: 2;
}

.card>.n-card-header .n-card-header__main .n-button {
  padding: var(--n-padding-top) var(--n-padding-left);
}

.card>.n-card-header .n-card-header__main .n-button__content {
  flex: 1;
  width: 100px;
}

.card>.n-card-header .n-card-header__main .n-button__content .card-title {
  padding-right: var(--n-padding-left);
}

.card>.n-card-header .n-card-header__main .n-button__content .card-summary {
  flex: 1;
  align-items: flex-end;
  justify-content: flex-end;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 85%;
  line-height: 1.5;
}

.card .n-card__action {
  border-top: 1px solid var(--n-border-color);
}

.card.n-card {
  border-radius: 5px;
  border-width: 0;
  box-shadow: var(--n-box-shadow);
}

.card.n-card .n-card-header__extra {
  flex: 1;
  justify-content: flex-end;
}
</style>
