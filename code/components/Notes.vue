<template>
  <Card title="Notes">
    <template #footer>
      <n-grid y-gap="12" x-gap="12" cols="1 350:2">
        <n-gi :span="1">
          <n-space vertical>
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Allies"
              v-model:value="caster.extras.allies" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Mentors"
              v-model:value="caster.extras.mentors" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Contacts"
              v-model:value="caster.extras.contacts" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Retainers"
              v-model:value="caster.extras.retainers" />
          </n-space>
        </n-gi>
        <n-gi :span="1">
          <n-space vertical>
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Familiars"
              v-model:value="caster.extras.familiars" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Locations"
              v-model:value="caster.extras.locations" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Professions"
              v-model:value="caster.extras.professions" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Organisations"
              v-model:value="caster.extras.organisations" />
          </n-space>
        </n-gi>
        <n-gi :span="1">
          <n-space vertical>
            <n-text strong>Items</n-text>
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Imbued"
              v-model:value="caster.extras.imbued" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Enhanced"
              v-model:value="caster.extras.enhanced" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Grimoires"
              v-model:value="caster.extras.grimoires" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Artifacts"
              v-model:value="caster.extras.artifacts" />
          </n-space>
        </n-gi>
        <n-gi :span="1">
          <n-space vertical>
            <n-text strong>&nbsp;</n-text>
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Armour"
              v-model:value="caster.extras.armour" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Weapons"
              v-model:value="caster.extras.weapons" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Equipment"
              v-model:value="caster.extras.equipment" />
            <n-input type="textarea" :autosize="{ minRows: 1 }" placeholder="Resources"
              v-model:value="caster.extras.resources" />
          </n-space>
        </n-gi>
        <n-gi :span="2">
          <n-space vertical>
            <n-text strong>Nimbus</n-text>
            <n-input type="textarea" :autosize="{ minRows: 3 }" placeholder="Nimbus Tilt and Description"
              v-model:value="caster.extras.nimbus" />
          </n-space>
        </n-gi>
        <n-gi :span="2">
          <n-space vertical>
            <n-text strong>Attainments</n-text>
            <n-input type="textarea" :autosize="{ minRows: 3 }" placeholder="Arcana and/or Legacy Attainments"
              v-model:value="caster.extras.attainments" />
          </n-space>
        </n-gi>
      </n-grid>
    </template>
  </Card>
</template>


    <!-- allies: "",
    mentors: "",
    contacts: "",
    retainers: "",
    familiars: "",
    resources: "",
    professions: "",
    relics: "",
    imbued: "",
    weapons: "",
    enchanted: "",
    attainments: "",
    nimbus: "", -->

<script setup lang="ts">
import Card from "../components/Card.vue";
import { caster } from "../store/store";

</script>