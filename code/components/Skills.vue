<template>
  <Card title="Skills" :summary="summary">
    <template #content>
      <n-grid y-gap="12" x-gap="24" cols="1 600:3">
        <n-gi>
          <Dots v-for="(skill, name) in caster.skills.mental" is-editable :name="name"
            :checked="skill.rote || caster.details.order?.roteSkills.includes(name)"
            :checked-disabled="caster.details.order?.roteSkills.includes(name)" @update-checked="skill.rote = $event"
            :dots="skill.dots" @update-dots="skill.dots = $event" :label="skill.label"
            @update-label="skill.label = $event">
          </Dots>
        </n-gi>
        <n-gi>
          <Dots v-for="(skill, name) in caster.skills.physical" is-editable :name="name"
            :checked="skill.rote || caster.details.order?.roteSkills.includes(name)"
            :checked-disabled="caster.details.order?.roteSkills.includes(name)" @update-checked="skill.rote = $event"
            :dots="skill.dots" @update-dots="skill.dots = $event" :label="skill.label"
            @update-label="skill.label = $event">
          </Dots>
        </n-gi>
        <n-gi>
          <Dots v-for="(skill, name) in caster.skills.social" is-editable :name="name"
            :checked="skill.rote || caster.details.order?.roteSkills.includes(name)"
            :checked-disabled="caster.details.order?.roteSkills.includes(name)" @update-checked="skill.rote = $event"
            :dots="skill.dots" @update-dots="skill.dots = $event" :label="skill.label"
            @update-label="skill.label = $event">
          </Dots>
        </n-gi>
      </n-grid>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { caster } from "../store/store";
import Dots from "../components/Dots.vue";
import Card from "../components/Card.vue";
import { computed, watch } from "vue";

const summary = computed(() => {
  let mental = Object.values(caster.skills.mental).reduce((acc, cur) => acc + cur.dots, 0);
  let physical = Object.values(caster.skills.physical).reduce((acc, cur) => acc + cur.dots, 0);
  let social = Object.values(caster.skills.social).reduce((acc, cur) => acc + cur.dots, 0);
  return `${mental} Mental, ${physical} Physical, ${social} Social`;
})

</script>
