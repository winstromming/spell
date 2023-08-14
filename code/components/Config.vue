<template>
  <n-space :size="2">
    <n-dropdown trigger="click" :options="options" placement="bottom-start" @select="choose">
      <n-button size="tiny">
        <template #icon>
          <n-icon :component="Person" />
        </template>
      </n-button>
    </n-dropdown>
    <n-button size="tiny" @click="clicktheme">
      <template #icon>
        <n-icon :component="theme.name === 'dark' ? Moon : Sunny" />
      </template>
    </n-button>
    <n-button size="tiny" @click="settings = true">
      <template #icon>
        <n-icon :component="Settings" />
      </template>
    </n-button>
  </n-space>
  <n-modal :auto-focus="false" transform-origin="center" v-model:show="settings">
    <Card title="Settings" :icon="true" style="max-width: 500px">
      <template #icon>
        <n-icon :component="Settings" />
      </template>
      <template #footer>
        <n-space justify="space-between">
          <n-button size="small" type="success" quaternary @click="onExport">
            <template #icon>
              <n-icon :component="CloudDownloadOutline" />
            </template>
            Export (.json)
          </n-button>
          <n-button size="small" type="success" quaternary @click="onSaveText">
            <template #icon>
              <n-icon :component="CloudDownloadOutline" />
            </template>
            Export (.txt)
          </n-button>
          <n-upload :show-file-list="false" accept=".json" :custom-request="onImport">
            <n-button size="small" type="warning" quaternary>
              <template #icon>
                <n-icon :component="CloudUploadOutline" />
              </template>
              Import (.json)
            </n-button>
          </n-upload>
        </n-space>
      </template>
      <template #header>
        <a style="display: none" id="dl" href="#">dl.json</a>
        <n-button quaternary @click="settings = false">Close</n-button>
      </template>
    </Card>
  </n-modal>
</template>
<script setup lang="ts">

import { darkTheme, lightTheme, type UploadCustomRequestOptions, type UploadFileInfo } from "naive-ui"
import { ref, toRaw, watch } from "vue";
import { theme } from "../store/store"
import Chooser from "./Chooser.vue"
import { computed, h } from "vue";
import Card from "../components/Card.vue";

import { caster, casters, defaultCaster } from "../store/store";
import type { Caster } from "../store/store"
import { NIcon, useMessage } from "naive-ui";
import { CloudDownloadOutline, Settings, AddCircleOutline, Person, People, Moon, Sunny, CloudUploadOutline, DocumentTextOutline } from "@vicons/ionicons5";
import { assign, cloneDeep } from "lodash";

const message = useMessage()

const settings = ref(false)

const clicktheme = () => {
  if (theme.name === "dark") {
    theme.set("light")
  } else {
    theme.set("dark")
  }
}

const onExport = () => {
  const file = JSON.stringify(toRaw(caster), null, 2)
  const blob = new Blob([file], { type: "application/json" })
  const anchor = document.getElementById('dl') as HTMLAnchorElement;
  if (anchor) {
    anchor.download = `${caster.details.name || 'character'}.json`
    anchor.href = window.URL.createObjectURL(blob);
    anchor.dataset.downloadUrl = ["application/json", anchor.download, anchor.href].join(':');
    anchor.click()
    message.success(`${caster.details.name || 'Character'} exported successfully`)
  }
}

const onSaveText = () => {
  let format = "";
  format += `${caster.details.name || 'Character'}, ${caster.details.concept || 'Concept'}\n`
  format += `${caster.details.path?.name || 'Path'} (${caster.details.order?.name || 'Order'}${caster.details.legacy ? ', ' + caster.details.legacy : ''})\n`
  format += `  ${caster.details.virtue || 'Virtue'}/${caster.details.vice || 'Vice'}\n`
  format += `  ${caster.traits.Gnosis} Gnosis, ${caster.traits.Wisdom} Wisdom\n`
  format += `  ${caster.traits.Willpower} Willpower, ${caster.traits.Mana} Mana\n`
  format += `\n`
  format += `Experience:\n`
  format += `  ${caster.progress.mundane.Experience} Regular (${caster.progress.mundane.Beats}/5 Beats)\n`
  format += `  ${caster.progress.arcane.Experience} Arcane (${caster.progress.arcane.Beats}/5 Beats)\n`
  format += `\n`
  format += `Aspirations:\n`
  format += `${caster.details.aspirations.trim()}\n`
  format += `\n`
  format += `Obsessions:\n`
  format += `${caster.details.obsessions.trim()}\n`
  format += `\n`
  format += `Arcana:\n`
  format += `${Object.entries(caster.arcana).filter((value) => value[1].dots > 0).map((value) => String("  " + value[0] + " " + value[1].dots)).join("\n")}`
  format += `\n`
  format += `\n`
  format += `Merits:\n`
  format += `${Object.entries(caster.merits).filter((value) => value[1].dots > 0).map((value) => String("  " + value[1].label + " (" + value[1].dots + " dots)")).join("\n")}`
  format += `\n`
  format += `\n`
  format += `Rotes:\n`
  format += `${caster.rotes.map((rote) => String("  " + rote.name + " (" + rote.arcana + " " + rote.level + ")")).join("\n")}`
  format += `\n`
  format += `\n`
  format += `Praxes:\n`
  format += `${caster.praxes.map((praxis) => String("  " + praxis.name + " (" + praxis.arcana + " " + praxis.level + ")")).join("\n")}`
  format += `\n`
  const blob = new Blob([format], { type: "application/text" })
  const anchor = document.getElementById('dl') as HTMLAnchorElement;
  if (anchor) {
    anchor.download = `${caster.details.name || 'character'}.txt`
    anchor.href = window.URL.createObjectURL(blob);
    anchor.dataset.downloadUrl = ["application/text", anchor.download, anchor.href].join(':');
    anchor.click()
    message.success(`${caster.details.name || 'Character'} exported successfully`)
  }
}

const parse = async (file: UploadFileInfo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event: any) => {
      try {
        resolve(JSON.parse(event.target.result))
      } catch (error: any) {
        reject(error)
      }
    }
    reader.readAsText(file.file as File)
  })
}

const onImport = ({
  file,
  data,
  onProgress,
  onFinish,
  onError,
}: UploadCustomRequestOptions) => {
  parse(file).then((json) => {
    const uploaded = json as Caster
    assign(caster, uploaded)
    message.success(`${uploaded.details.name || 'Character'} imported successfully`);
    onProgress({ percent: 100 })
    onFinish();
  }).catch((error) => {
    message.error(error.toString())
    onError()
  });
}

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