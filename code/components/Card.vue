<template>
  <n-card size="small" class="card">
    <template #header v-if="title && title.length > 0">
      <n-button size="large" text block @click="!icon ? open = !open : undefined">
        <template #icon>
          <slot name="icon">
            <n-icon>
              <ChevronUp v-if="open == true" />
              <ChevronDown v-if="open === false" />
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
    <template #default v-if="open === true">
      <slot name="content"></slot>
    </template>
    <template #action v-if="open === true">
      <slot name="footer"></slot>
    </template>
  </n-card>
</template>

<script>
import { ChevronDown, ChevronUp } from "@vicons/ionicons5"

export default {
  components: { ChevronDown, ChevronUp },
  props: ["title", "summary", "collapsed", "icon"],
  data() {
    return {
      open: true,
    }
  },
  mounted() {
    if (this.collapsed !== undefined) this.open = !!this.collapsed
  },
}
</script>

<style>
.card[data-disabled] { opacity: 0.7 }
.card > .n-card-header {
  padding: 0;
}
.card > .n-card-header > .n-card-header__extra {
  padding-right: var(--n-padding-left);
}
.card > .n-card-header .n-card-header__main .n-button {
  padding: var(--n-padding-top) var(--n-padding-left);
}
.card > .n-card-header .n-card-header__main .n-button__content {
  flex: 1;
  width: 100px;
}
.card > .n-card-header .n-card-header__main .n-button__content .card-title {
  padding-right: var(--n-padding-left);
}
.card > .n-card-header .n-card-header__main .n-button__content .card-summary {
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
</style>
