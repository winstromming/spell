<template>
  <n-input class="dots-input" size="small" :readonly="props.isEditable === false" type="text" :value="props.label"
    :on-update:value="updateLabel" :placeholder="props.placeholder ?? ''">
    <template #prefix v-if="props.name || props.checked !== undefined">
      <n-checkbox class="dots-check" v-if="props.checked !== undefined" size="small" :disabled="props.checkedDisabled"
        v-model:checked="props.checked" :on-update:checked="updateChecked" />
      <n-text v-if="props.name" strong>{{ props.name }}</n-text>
    </template>
    <template #suffix v-if="props.dots !== undefined">
      <n-rate class="dots-rate" size="small" clearable :count="props.max" v-model:value="props.dots"
        :on-update:value="updateDots">
        <n-icon :component="EllipseOutline">
          <EllipseOutline />
        </n-icon>
      </n-rate>
    </template>
  </n-input>
</template>

<script setup lang="ts">
import { EllipseOutline } from '@vicons/ionicons5';

const props = defineProps({
  name: {
    type: String,
    default: undefined,
  },
  dots: {
    type: Number,
    default: undefined,
  },
  placeholder: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: undefined,
  },
  isEditable: {
    type: Boolean,
    default: false,
  },
  checked: {
    type: Boolean,
    default: undefined
  },
  checkedDisabled: {
    type: Boolean,
    default: false,
  },
  max: {
    type: Number,
    default: 5,
  }
});

const emit = defineEmits<{
  (event: "updateDots", dots: number): void;
  (event: "updateLabel", label: string): void;
  (event: "updateChecked", check: boolean): void;
}>();

const updateDots = (dots: number) => emit("updateDots", dots);
const updateLabel = (label: string) => emit("updateLabel", label);
const updateChecked = (checked: boolean) => emit("updateChecked", checked);
</script>

<style>
.dots-input {
  flex: 1;
  background-color: transparent !important;
}

.dots-input .n-input-wrapper {
  padding-left: 0;
  padding-right: 0;
}

.dots-input .n-input__border,
.dots-input .n-input__state-border {
  display: none;
}

.dots-check {
  margin-right: 6px
}

.dots-input .n-input__prefix {
  margin-right: 6px;
}

.dots-input .n-input__suffix {
  flex-shrink: 0;
  flex-grow: 0;
}

.dots-rate.n-rate {
  vertical-align: middle;
}

.dots-rate.n-rate .n-rate__item {
  margin-left: 0;
}

.dots-rate.n-rate .n-rate__item svg circle {
  stroke: var(--n-text-color);
}

.dots-rate.n-rate .n-rate__item--active svg circle {
  fill: var(--n-text-color);
  stroke: var(--n-text-color);
}
</style>