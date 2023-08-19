<template>
  <Card title="Health" :icon="true">
    <template #icon>
      <n-icon>
        <HeartOutline />
      </n-icon>
    </template>
    <template #header>
      <n-popover trigger="click" placement="top">
        <template #trigger>
          <n-button quaternary type="error" size="small" title="Suffer damage">
            <template #icon>
              <n-icon :component="EllipsisHorizontal" />
            </template>
          </n-button>
        </template>
        <n-button title="Aggravated" quaternary type="error" size="small" @click="sufferAggravated">
          <template #icon>
            <n-icon :component="SkullOutline" />
          </template>
        </n-button>
        <n-button title="Lethal" quaternary type="error" size="small" @click="sufferLethal">
          <template #icon>
            <n-icon :component="WaterOutline" />
          </template>
        </n-button>
        <n-button title="Bashing" quaternary type="error" size="small" @click="sufferBashing">
          <template #icon>
            <n-icon :component="BandageOutline" />
          </template>
        </n-button>
      </n-popover>
    </template>
    <template #footer>
      <n-space vertical>
        <n-button-group class="health">
          <n-tooltip trigger="hover" v-for="(amount, index) of caster.health.aggravated"
            :disabled="caster.health.lethal > 0 || index + 1 !== caster.health.aggravated">
            <template #trigger>
              <n-button :disabled="caster.health.lethal > 0 || index + 1 !== caster.health.aggravated" size="small"
                @click="healDamage">
                <template #icon>
                  <n-icon :component="SkullOutline" />
                </template>
              </n-button>
            </template>
            Heal (1 week)
          </n-tooltip>
          <n-tooltip trigger="hover" v-for="(amount, index) of caster.health.lethal"
            :disabled="caster.health.bashing > 0 || index + 1 !== caster.health.lethal">
            <template #trigger>
              <n-button :disabled="caster.health.bashing > 0 || index + 1 !== caster.health.lethal" size="small"
                @click="healDamage">
                <template #icon>
                  <n-icon :component="WaterOutline" />
                </template>
              </n-button>
            </template>
            Heal (2 days)
          </n-tooltip>
          <n-tooltip trigger="hover" v-for="(amount, index) of caster.health.bashing"
            :disabled="index + 1 !== caster.health.bashing">
            <template #trigger>
              <n-button :disabled="index + 1 !== caster.health.bashing" size="small" @click="healDamage">
                <template #icon>
                  <n-icon :component="BandageOutline" />
                </template>
              </n-button>
            </template>
            Heal (15 mins)
          </n-tooltip>
          <n-button v-for="amount in remaining" disabled size="small">
            <template #icon>
              <n-icon :component="Square" style="opacity: 0" />
            </template>
          </n-button>
        </n-button-group>
        <n-text v-if="summary" v-html="summary"></n-text>
      </n-space>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { caster } from "../store/store";
import Card from "../components/Card.vue";
import { HeartOutline, EllipsisHorizontal, SkullOutline, BandageOutline, WaterOutline, Square } from "@vicons/ionicons5"

const size = computed(() => {
  let size = caster.traits.Size.base ?? 0
  if (caster.traits.Size.modifier && caster.traits.Size.modifier > 0) size = caster.traits.Size.modifier
  return size
})

watch(caster, () => {
  caster.health.maximum.base = size.value + caster.attributes.physical.Stamina.dots
});

onMounted(() => {
  caster.health.maximum.base = size.value + caster.attributes.physical.Stamina.dots
})

const remaining = computed(() => {
  let num = caster.health.maximum.base - caster.health.bashing - caster.health.lethal - caster.health.aggravated
  return num < 0 ? 0 : num
})

const healDamage = () => {
  if (caster.health.bashing > 0) {
    caster.health.bashing -= 1;
  } else if (caster.health.lethal > 0) {
    caster.health.lethal -= 1;
  } else if (caster.health.aggravated > 0) {
    caster.health.aggravated -= 1;
  }
}

const sufferBashing = () => {
  if (remaining.value === 0) {
    if (caster.health.bashing > 0) {
      caster.health.bashing -= 1;
      caster.health.lethal += 1;
    } else if (caster.health.lethal > 0) {
      caster.health.lethal -= 1;
      caster.health.aggravated += 1;
    }
  } else {
    caster.health.bashing += 1;
  }
}
const sufferLethal = () => {
  if (remaining.value === 0) {
    if (caster.health.bashing > 0) {
      caster.health.bashing -= 1;
      caster.health.lethal += 1;
    } else if (caster.health.lethal > 0) {
      caster.health.lethal -= 1;
      caster.health.aggravated += 1;
    }
  } else {
    caster.health.lethal += 1;
  }
}
const sufferAggravated = () => {
  if (remaining.value === 0) {
    if (caster.health.bashing > 0) {
      caster.health.bashing -= 1;
      caster.health.aggravated += 1;
    } else if (caster.health.lethal > 0) {
      caster.health.lethal -= 1;
      caster.health.aggravated += 1;
    }
  } else {
    caster.health.aggravated += 1;
  }
}

const summary = computed(() => {
  let remaining = caster.attributes.physical.Stamina.dots + size.value - caster.health.bashing - caster.health.lethal - caster.health.aggravated;
  if (caster.health.aggravated >= caster.health.maximum.base) return "You are dead.";
  if (remaining > 2) return null
  let string = [];
  if (remaining === 0 && caster.health.bashing === 0 && caster.health.lethal > 0) string.push("You receive one point damage each turn and");
  if (remaining === 0 && caster.health.bashing > 0) string.push("You must make roll to stay conscious each turn and");
  if (remaining === 0) string.push("suffer -3 penalty on every action.");
  if (remaining === 1) string.push("You suffer -2 penalty on every action.");
  if (remaining === 2) string.push("You suffer -1 penalty on every action.");
  if (string.length === 0) return null;
  return string.join(" ");
})

</script>

<style scoped>
.health {
  display: flex;
  min-width: 100%;
  background-color: var(--n-color);
}

.health>div {
  flex: 1
}

.health .n-button {
  flex-grow: 1;
  flex-shrink: 1;
  display: inline-flex;
  padding-left: 3px;
  padding-right: 3px;
  border-color: var(--n-border) !important;
}

.health .n-button--disabled {
  opacity: 1;
  cursor: default;
}

.health .n-button--disabled .n-icon {
  opacity: 0.25;
}
</style>