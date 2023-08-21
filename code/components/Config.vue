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
            Export (.pdf)
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
import * as pdfmake from "pdfmake/build/pdfmake"
import * as pdffonts from "pdfmake/build/vfs_fonts"

import { darkTheme, lightTheme, type UploadCustomRequestOptions, type UploadFileInfo } from "naive-ui"
import { ref, toRaw, watch } from "vue";
import { theme } from "../store/store"
import Chooser from "./Chooser.vue"
import { computed, h } from "vue";
import Card from "../components/Card.vue";

import type { Attribute, Category, Skill } from "../constants/types"

import { caster, casters, defaultCaster } from "../store/store";
import type { Caster } from "../store/store"
import { NIcon, useMessage } from "naive-ui";
import { CloudDownloadOutline, Settings, AddCircleOutline, Person, People, Moon, Sunny, CloudUploadOutline, DocumentTextOutline } from "@vicons/ionicons5";
import { assign, cloneDeep } from "lodash";

(<any> pdfmake).vfs = pdffonts.pdfMake.vfs

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

// ● ○
const d = (n: number, t: number) => Array.from({ length: n }, () => "●").concat(Array.from({ length: t - n }, () => "○")).join("")
// const d = (n: number, t: number) => `${n}`

const onSaveText = () => {

  pdfmake.createPdf({
    defaultStyle: {
      font: 'arial',
      fontSize: 10,
    },
    content: [
      {
        columns: [
          [
            { bold: true, text: `${caster.details.name || 'Character'}, ${caster.details.concept || 'Concept'}` },
            { text: `${caster.details.path?.name || 'Path'}, ${caster.details.order?.name || 'Order'}` },
            { text: `${caster.details.legacy ? caster.details.legacy : ' '}` },
            { text: `Virtue: ${caster.details.virtue || "None"}` },
            { text: `Vice: ${caster.details.vice || "None"}` },
          ],
          [
            { bold: true, text: "Experience:" },
            `${caster.progress.mundane.Experience} Regular (${caster.progress.mundane.Beats}/5 Beats)`,
            `${caster.progress.arcane.Experience} Arcane (${caster.progress.arcane.Beats}/5 Beats)`,
            `Wisdom ${caster.traits.Wisdom}`,
            `Gnosis ${caster.traits.Gnosis}`,
          ],
        ],
      },
      { text: ' ' },
      {
        columns: [
          [
            { bold: true, text: "Aspirations:" },
            { text: caster.details.aspirations.trim() },
          ],
          [
            { bold: true, text: "Obsessions:" },
            { text: caster.details.obsessions.trim() },
          ],
        ]
      },
      { text: ' ' },
      {
        columns: Object.entries(caster.attributes).map(([key, value]) => {
          return Object.entries(value).map(([key, value]) => {
            return `${key} ${d(value.dots, 5)}`
          }).join("\n")
        }),
      },
      { text: ' ' },
      {
        columns: Object.entries(caster.skills).map(([key, value]) => {
          return Object.entries(value).map(([key, value]) => {
            return `${key}${value.label !== "" ? " (" + value.label + ")" : ""} ${d(value.dots, 5)}`
          }).join("\n")
        }),
      },
      { text: ' ' },
      {
        columns: [
          [
            { bold: true, text: "Merits:" },
            Object.entries(caster.merits).filter((value) => value[1].dots > 0).map((value) => `${value[1].label} ${d(value[1].dots, 5)}`).join("\n")
          ],
          [
            { bold: true, text: "Arcana:" },
            Object.entries(caster.arcana).filter((value) => value[1].dots > 0).map((value) => `${value[0]} ${d(value[1].dots, 5)}`).join("\n"),
            { text: ' ' },
            { bold: true, text: "Praxes:" },
            caster.praxes.map((praxis) => `${praxis.name} (${praxis.arcana} ${d(praxis.level, praxis.level)})`).join("\n"),
            { text: ' ' },
            { bold: true, text: "Rotes:" },
            caster.rotes.map((rote) => `${rote.name} (${rote.skill || "None"}, ${rote.arcana} ${d(rote.level, rote.level)})`).join("\n")
          ],
        ]
      },
      { text: ' ' },
      ...Object.entries(caster.extras).filter(([key, value]) => value !== "").map(([key, value]) => [
        { text: ' ' },
        { bold: true, text: `${key[0].toUpperCase() + key.substring(1)}:` },
        { text: `${value}` }
      ])
    ]
  }, undefined, {
    arial: {
      normal: "Arial-Regular.ttf",
      bold: "Arial-Medium.ttf",
      italics: "Arial-Italic.ttf",
      bolditalics: "Arial-MediumItalic.ttf",
    },
  }).download(`${caster.details.name || 'character'}.pdf`);
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