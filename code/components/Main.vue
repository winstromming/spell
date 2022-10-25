<template>
  <n-config-provider :theme="theme" :theme-overrides="{ common: { fontWeightStrong: '600' } }">
    <n-layout static embedded>
      <n-tabs default-value="spell" animated>
        <template #suffix>
          <!-- <n-switch v-model:value="dark" @update:value="setDark">
            <template #checked>Dark</template>
            <template #unchecked>Dark</template>
          </n-switch> -->
          <n-space size="small">
            <n-button class="btn-only-icon-when-small" title="Reset" :disabled="canCastSpell === false" size="tiny" type="warning" @click="reset">
              <template #icon>
                <n-icon>
                  <ArrowUndo />
                </n-icon>
              </template>
              Reset
            </n-button>
            <n-button class="btn-only-icon-when-small" title="Copy for Roll20" :disabled="canCastSpell === false" size="tiny" type="info" @click="copyActiveSpell()">
              <template #icon>
                <n-icon>
                  <DocumentText />
                </n-icon>
              </template>
              Roll20
            </n-button>
            <n-button class="btn-only-icon-when-small" title="Save" :disabled="canCastSpell === false" size="tiny" type="success" @click="saveActiveSpell()">
              <template #icon>
                <n-icon>
                  <Bookmark />
                </n-icon>
              </template>
              Save
            </n-button>
          </n-space>
        </template>
        <n-tab-pane name="caster" tab="Caster">
          <n-space vertical>
            <!-- Gnosis -->
            <Card title="Gnosis" :summary="gnosisSummary">
              <template #content>
                <n-rate clearable :count="10" v-model:value="caster.gnosis">
                  <n-icon>
                    <EllipseOutline />
                  </n-icon>
                </n-rate>
              </template>
            </Card>
            <!-- Praxes -->
            <Card title="Praxes" :summary="casterPraxesSummary">
              <template #content>
                <n-space vertical>
                  <n-table v-if="caster.praxes.length > 0" striped class="s-table">
                    <tbody>
                      <tr v-for="item in caster.praxes" :key="item.name">
                        <td>{{ item.name }}</td>
                        <td width="20">
                          <n-button size="tiny" type="error" @click="removePraxisSpell(item.name)">
                            <template #icon>
                              <n-icon>
                                <Close />
                              </n-icon>
                            </template>
                          </n-button>
                        </td>
                      </tr>
                    </tbody>
                  </n-table>
                  <n-select ref="choosePraxisDropdown" filterable :value="choosePraxisValue" placeholder="Choose spell to add" @update:value="(v) => choosePraxisFromDropdown(v)" :options="chooseSpellOptions" />
                </n-space>
              </template>
            </Card>
            <!-- Rotes -->
            <Card title="Rotes" :summary="casterRotesSummary">
              <template #content>
                <n-space vertical class="s-table">
                  <n-table v-if="caster.rotes.length > 0" striped class="s-table">
                    <tbody>
                      <tr v-for="item in caster.rotes" :key="item.name">
                        <td>{{ item.name}}</td>
                        <td width="50">
                          <n-rate clearable :count="5" v-model:value="item.skill">
                            <n-icon>
                              <EllipseOutline />
                            </n-icon>
                          </n-rate>
                        </td>
                        <td width="20">
                          <n-button size="tiny" type="error" @click="removeRoteSpell(item.name)">
                            <template #icon>
                              <n-icon>
                                <Close />
                              </n-icon>
                            </template>
                          </n-button>
                        </td>
                      </tr>
                    </tbody>
                  </n-table>
                  <n-select ref="chooseRoteDropdown" filterable :value="chooseRoteValue" placeholder="Choose spell to add" @update:value="(v) => chooseRoteFromDropdown(v)" :options="chooseSpellOptions" />
                </n-space>
              </template>
            </Card>
            <!-- Arcana -->
            <Card title="Arcana" :summary="arcanaSummary">
              <template #content>
                <n-table striped :bordered="false" class="s-table" style="margin-left: -8px; width: calc(100% + 16px)">
                  <tbody>
                    <tr v-for="(item, name) of caster.arcana" :key="name">
                      <td width="50">
                        <n-text>{{ name }}</n-text>
                      </td>
                      <td width="20">
                        <n-switch size="small" v-model:value="item.ruling" />
                      </td>
                      <td>
                        <n-rate clearable :count="5" v-model:value="item.level">
                          <n-icon>
                            <EllipseOutline />
                          </n-icon>
                        </n-rate>
                      </td>
                    </tr>
                  </tbody>
                </n-table>
              </template>
            </Card>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="spell" tab="Spell" :ref="container">
          <n-space vertical>
            <!-- Info -->
            <n-alert type="info" v-if="hasConfiguredCaster === false">
              <n-text>You need to configure your Gnosis and Arcana in the <b>Caster</b> tab first.</n-text>
            </n-alert>
            <n-affix id="spellAffix" v-if="hasConfiguredCaster === true" :trigger-top="10" position="absolute" listen-to=".n-layout-scroll-container">
              <n-card class="spellSummary">
                <n-space align="center" justify="space-between">
                  <n-space size="small" v-if="canCastSpell">
                    <n-tag size="small" :bordered="false" round strong :type="usedReach > freeReach ? 'warning' : 'success'"> {{ usedReach }}/{{ freeReach }} Reach</n-tag>
                    <n-tag size="small" :bordered="false" round strong :type="isDicePoolTooLow ? 'warning' : 'success'"> {{ dicePool }} Dice</n-tag>
                    <n-tag size="small" :bordered="false" round strong type="success">{{ totalMana }} Mana</n-tag>
                    <n-tag v-if="hasParadox" size="small" :bordered="false" round strong type="error">{{ paradoxDice }} Paradox</n-tag>
                  </n-space>
                  <n-space size="small" v-if="canCastSpell === false">
                    <n-tag size="small" disabled :bordered="false" round strong>0/0 Reach</n-tag>
                    <n-tag size="small" disabled :bordered="false" round strong>0 Dice</n-tag>
                    <n-tag size="small" disabled :bordered="false" round strong>0 Mana</n-tag>
                  </n-space>
                </n-space>
              </n-card>
            </n-affix>
            <!-- Spell -->
            <Card title="Spell" :summary="spellSummary" v-if="hasConfiguredCaster" style="margin-top: 48px">
              <template #content>
                <n-space vertical size="large">
                  <n-select filterable placeholder="What spell are you casting?" :value="chooseSpellLabel" @update:value="chooseSpell" :options="chooseSpellOptions" />
                  <n-alert type="warning" v-if="(spell.name || spell.custom) && isSpellArcanaTooHigh">
                    <n-text>You don't have the arcana required for this spell</n-text>
                  </n-alert>
                  <n-alert type="info" v-if="hasPraxis(spell.name)">
                    <n-text>{{ spell.name }} is one of your Praxes.</n-text>
                  </n-alert>
                  <n-alert type="info" v-if="hasRote(spell.name)">
                    <n-text>{{ spell.name }} is one of your Rotes (+{{ hasRote(spell.name).skill }} bonus).</n-text>
                  </n-alert>
                </n-space>
              </template>
              <template #footer v-if="spell.name">
                <n-space vertical size="large">
                  <n-text depth="3" v-if="spell.description">
                    {{ spell.description }} <span v-if="spell.page">({{ spell.page }})</span>
                  </n-text>
                  <n-grid :cols="4">
                    <n-grid-item>
                      <n-text> <b>Practice</b><br />{{ spell.practice }} </n-text>
                    </n-grid-item>
                    <n-grid-item>
                      <n-text> <b>Factor</b><br />{{ spell.primaryFactor }} </n-text>
                    </n-grid-item>
                    <n-grid-item :span="2" v-if="spell.roteSkills.length > 0">
                      <n-text> <b>Rote Skills</b><br />{{  spell.roteSkills.join(", ") }}</n-text>
                    </n-grid-item>
                  </n-grid>
                </n-space>
              </template>
              <template #footer v-if="!spell.name && spell.custom">
                <n-space vertical size="large">
                  <n-grid :cols="2" :x-gap="10" :y-gap="10">
                    <n-grid-item>
                      <n-space vertical size="small">
                        <b>Name</b>
                        <n-input v-model:value="spell.customName" type="text" placeholder="What is the spell named?" />
                      </n-space>
                    </n-grid-item>
                    <n-grid-item>
                      <n-space vertical size="small">
                        <b>Arcana</b>
                        <n-select placeholder="Choose an arcanum" filterable v-model:value="spell.primaryArcana.arcana" :options="arcanaOptions" />
                      </n-space>
                    </n-grid-item>
                    <n-grid-item>
                      <n-space vertical size="small">
                        <b>Practice</b>
                        <n-select placeholder="Choose a practice" filterable :value="choosePracticeValue" :options="choosePracticeOptions" @update:value="choosePractice" />
                      </n-space>
                    </n-grid-item>
                    <n-grid-item>
                      <n-space vertical size="small">
                        <b>Factor</b>
                        <n-select placeholder="Choose a primary factor" filterable v-model:value="spell.primaryFactor" :options="choosePrimaryFactorOptions" />
                      </n-space>
                    </n-grid-item>
                  </n-grid>
                  <n-input v-model:value="spell.description" type="textarea" placeholder="What does this spell do? Describe the effects and conditions that would apply. Entering this description is mostly useful if you are going to save the spell." />
                  <n-space justify="end">
                    <n-button :disabled="spell.primaryArcana.arcana == undefined || spell.practice === undefined || spell.customName === undefined || spell.customName === ''" type="success" @click="applyCustomSpell">Create this spell</n-button>
                  </n-space>
                </n-space>
              </template>
            </Card>
            <!-- Effects -->
            <Card title="Effects" collapsed :summary="effectsSummary" v-if="canCastSpell">
              <template #content>
                <n-space vertical>
                  <n-table bordered striped class="s-table" style="margin-left: -5px; width: calc(100% + 10px)">
                    <tbody>
                      <tr v-if="spell.custom === true">
                        <td>
                          <n-switch size="small" :disabled="true" :value="spell.extraMana > 0" />
                        </td>
                        <td colspan="2">
                          <n-space vertical>
                            <b>+{{ spell.extraMana }} Mana for spell effects</b>
                            <n-slider :tooltip="false" v-model:value="spell.extraMana" :min="0" :max="10" />
                          </n-space>
                        </td>
                      </tr>
                      <tr v-if="spell.custom === true">
                        <td>
                          <n-switch size="small" :disabled="true" :value="spell.extraReach > 0" />
                        </td>
                        <td colspan="2">
                          <n-space vertical>
                            <b>+{{ spell.extraReach }} Reach for spell effects</b>
                            <n-slider :tooltip="false" v-model:value="spell.extraReach" :min="0" :max="10" />
                          </n-space>
                        </td>
                      </tr>
                      <tr>
                        <td width="20" style="padding-right: 0">
                          <n-switch size="small" v-model:value="spell.spendWillpower" />
                        </td>
                        <td width="150" colspan="2"><b>+1 Willpower:</b><br />Gain +3 spellcasting dice.</td>
                      </tr>
                      <tr>
                        <td width="20" style="padding-right: 0">
                          <n-switch size="small" v-model:value="spell.commonEffects.changePrimaryFactor" />
                        </td>
                        <td colspan="2"><b>+1 Reach:</b><br />Change the primary factor.</td>
                      </tr>
                      <tr v-if="spell.custom !== true" v-for="(item, index) of spell.additionalEffects" :key="index">
                        <td v-if="item.cost" width="20" style="padding-right: 0">
                          <n-switch size="small" :disabled="isEffectRestricted(item)" :value="isEffectAdded(item)" @update:value="toggleEffect(item)" />
                        </td>
                        <td v-if="item.cost" colspan="2">
                          <b>{{ item.cost.map(c => `+${c.value} ${c.type}`).join(", ")}}</b
                          ><b v-if="item.requirement"> ({{ item.requirement.map(v => `${v.arcana} ${v.value}`).join(", ") }})</b><b>:</b><br />
                          {{ item.effect }}
                        </td>
                      </tr>
                    </tbody>
                  </n-table>
                </n-space>
              </template>
            </Card>
            <!-- Potency -->
            <Card title="Potency" collapsed :summary="potencySummary" v-if="canCastSpell">
              <template #content>
                <n-select v-model:value="spell.factors.potency" :options="potencyOptions" />
              </template>
              <template #footer> Advanced Potency grants an additional -2 to Withstand. </template>
            </Card>
            <!-- Duration -->
            <Card title="Duration" collapsed :summary="durationSummary" v-if="canCastSpell">
              <template #content>
                <n-select v-model:value="spell.factors.duration" :options="durationOptions" />
              </template>
              <template #footer v-if="spell.factors.duration === 'a6'"> Indefinite duration requires +1 Reach and +1 Mana above the normal amount.</template>
            </Card>
            <!-- Casting Time -->
            <Card title="Casting Time" collapsed :summary="castingTimeSummary" v-if="canCastSpell">
              <template #content>
                <n-select v-model:value="spell.factors.castingTime" :options="castingTimeOptions" />
              </template>
              <template #footer v-if="isAdvanced('castingTime')"> Using more than one Yantra (or High Speech) will increase this time. </template>
            </Card>
            <!-- Range -->
            <Card title="Range" collapsed :summary="rangeSummary" v-if="canCastSpell">
              <template #content>
                <n-select v-model:value="spell.factors.range" :options="rangeOptions" />
              </template>
              <template #footer v-if="spell.factors.range === 'a2'"> Remote Viewing range requires +1 Reach above the normal amount.</template>
            </Card>
            <!-- Scale -->
            <Card title="Scale" collapsed :summary="scaleSummary" v-if="canCastSpell">
              <template #content>
                <n-select v-model:value="spell.factors.scale" :options="scaleOptions" />
              </template>
              <template #footer> Advanced Scale doubles the number of subjects and adds 5 size per additional -2 dice penalty. </template>
            </Card>
            <!-- Yantras -->
            <Card title="Yantras" collapsed :summary="yantrasSummary" v-if="canCastSpell">
              <template #content>
                <n-space vertical>
                  <n-table striped v-if="spell.yantras.length > 0">
                    <tbody>
                      <tr v-for="yantra, index in spell.yantras" :key="index">
                        <td>
                          <n-space vertical size="small">
                            <n-text strong>{{ yantra.label }}</n-text>
                            <n-text>{{ yantra.desc }}</n-text>
                            <n-space size="small" v-if="yantra.yantraKey === 't2' || yantra.yantraKey === 't3'">
                              <n-switch size="small" v-model:value="yantra.isDedicatedTool" @update:value="(v) => updateYantraIsDedicatedTool(yantra.yantraKey, v)" />
                              <n-text>This is your Dedicated Tool</n-text>
                            </n-space>
                          </n-space>
                        </td>
                        <td width="20" valign="top" style="vertical-align: top">
                          <n-button size="small" type="error" @click="deleteYantra(yantra.yantraKey)">
                            <template #icon>
                              <n-icon>
                                <Close />
                              </n-icon>
                            </template>
                          </n-button>
                        </td>
                      </tr>
                    </tbody>
                  </n-table>
                  <n-select ref="chooseYantraDropdown" :options="yantraOptions" :value="chooseYantraValue" :render-label="renderYantraLabel" filterable @update:value="chooseYantraFromDropdown" />
                </n-space>
              </template>
              <template #footer> Gnosis {{ caster.gnosis }} allows the use of {{ maxYantras }} yantras. </template>
            </Card>
            <!-- Paradox -->
            <Card title="Paradox" collapsed :summary="paradoxSummary" v-if="canCastSpell">
              <template #content>
                <n-space vertical>
                  <n-table bordered striped class="s-table" style="margin-left: -5px; width: calc(100% + 10px)">
                    <tbody>
                      <tr>
                        <td width="20" style="padding-right: 0">
                          <n-switch size="small" v-model:value="paradox.inured" />
                        </td>
                        <td colspan="2">
                          <b>Mage is inured?</b>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          <n-space vertical>
                            <b>Previous paradox rolls? ({{paradox.previous}})</b>
                            <n-slider placement="bottom" v-model:value="paradox.previous" :min="0" :max="10" />
                          </n-space>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          <n-space vertical>
                            <b>Sleeper witnesses? ({{ ['None', 'One', 'Some', 'Many', 'Crowd'][paradox.sleepers] }})</b>
                            <n-slider placement="bottom" v-model:value="paradox.sleepers" :min="0" :max="4" />
                          </n-space>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="3">
                          <n-space vertical>
                            <b>Mana spent? ({{ paradox.manaSpent }})</b>
                            <n-slider placement="bottom" v-model:value="paradox.manaSpent" :min="0" :max="caster.gnosis" />
                          </n-space>
                        </td>
                      </tr>
                    </tbody>
                  </n-table>
                </n-space>
              </template>
              <template #footer> Multiple witnesses do not add Paradox dice, but increase the chances of a Paradox occurring. Mana can be spent to mitigate Paradox, but is limited by Gnosis. </template>
            </Card>
            <!-- Conditions -->
            <Card title="Conditions" collapsed :summary="conditionsSummary" v-if="canCastSpell">
              <template #content>
                <n-table bordered striped class="s-table" style="margin-left: -5px; width: calc(100% + 10px)">
                  <tbody>
                    <tr>
                      <td colspan="3">
                        <n-space vertical>
                          <b>Bonus spellcasting dice (+{{conditions.bonusDice}} dice)</b>
                          <n-slider placement="bottom" v-model:value="conditions.bonusDice" :min="0" :max="10" />
                        </n-space>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="3">
                        <n-space vertical>
                          <b>Number of active spells ({{conditions.activeSpells}})</b>
                          <n-slider placement="bottom" v-model:value="conditions.activeSpells" :min="0" :max="10" />
                        </n-space>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="3">
                        <n-space vertical>
                          <b>Withstand rating of subject (+{{conditions.subjectWithstand}})</b>
                          <n-slider placement="bottom" v-model:value="conditions.subjectWithstand" :min="0" :max="10" />
                        </n-space>
                      </td>
                    </tr>
                  </tbody>
                </n-table>
              </template>
              <template #footer v-if="conditionsSummary !== 'None'">
                <n-space vertical>
                  <n-text v-if="conditions.bonusDice > 0"><b>Bonus:</b> Can come from Fate magic, Merits, Artefacts, or the Storyteller.</n-text>
                  <n-text v-if="conditions.activeSpells > 0"><b>Spells:</b> Maintaining more spells than the caster's Gnosis adds +1 Reach for each spell over the limit.</n-text>
                  <n-text v-if="conditions.subjectWithstand > 0"><b>Withstand:</b> Potency must exceed this rating for the spell to take effect.</n-text>
                </n-space>
              </template>
            </Card>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="saved" :tab="`Saved (${saved.length})`">
          <n-space vertical>
            <n-card embedded v-if="saved.length === 0">
              <n-text italic depth="3">No saved spells found</n-text>
            </n-card>
            <!-- Saved -->
            <Card :title="item.name" collapsed :summary="item.summary" v-for="(item, index) in saved" :key="item.id">
              <template #content>
                <n-space vertical size="large">
                  <n-space size="small" v-if="item.tags">
                    <n-tag v-if="item.tags.method" size="small" :bordered="false" round strong style="text-transform: capitalize">{{ item.tags.method }}</n-tag>
                    <n-tag size="small" :bordered="false" round strong type="success">{{ item.tags.reach }} Reach</n-tag>
                    <n-tag size="small" :bordered="false" round strong type="success"> {{ item.tags.dice }} Dice</n-tag>
                    <n-tag size="small" :bordered="false" round strong type="success">{{ item.tags.mana }} Mana</n-tag>
                    <n-tag v-if="item.tags.paradox" size="small" :bordered="false" round strong type="error">{{ item.tags.paradox }} Paradox</n-tag>
                  </n-space>
                  <n-text><b>Factors:</b> {{ item.factorSummary }}.</n-text>
                  <n-text v-if="item.effectSummary"><b>Effects:</b> {{ item.effectSummary }}</n-text>
                  <n-text v-if="item.yantraSummary"><b>Yantras:</b> {{ item.yantraSummary }}.</n-text>
                </n-space>
              </template>
              <template #footer>
                <n-space justify="space-between">
                  <n-button class="btn-only-icon-when-small" title="Remove" size="tiny" type="error" @click="removeSpell(item)">
                    <template #icon>
                      <n-icon>
                        <Trash />
                      </n-icon>
                    </template>
                    Remove
                  </n-button>
                  <n-space>
                    <n-button class="btn-only-icon-when-small" title="Copy for Roll20" size="tiny" type="info" @click="copySavedSpell(item)">
                      <template #icon>
                        <n-icon>
                          <DocumentText />
                        </n-icon>
                      </template>
                      Roll20
                    </n-button>
                    <n-button class="btn-only-icon-when-small" title="Edit" size="tiny" type="success" @click="loadSpell(item)">
                      <template #icon>
                        <n-icon>
                          <Build />
                        </n-icon>
                      </template>
                      Edit
                    </n-button>
                  </n-space>
                </n-space>
              </template>
            </Card>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-layout>
  </n-config-provider>
</template>

<script>
import { ref, h } from "vue"
import { clone, max, some, capitalize, findIndex, range } from "lodash"
import { useMessage } from "naive-ui"
import { darkTheme, lightTheme } from "naive-ui"

import { Close, DocumentText, Save, Trash, Build, Bookmark, ArrowUndo, Reload, ChevronDown, ChevronUp, Ellipse, EllipseOutline } from "@vicons/ionicons5"

import Card from "./Card.vue"

import {
  arcanaNames,
  baseCastingTimes,
  castingMethods,
  factors,
  gnosisManaLimits,
  durations,
  scales,
  practices,
  yantrasBaseData,
} from "../constants/constants.js"
import { spells } from "../constants/spells.js"

function dots(num) {
  return Array.from({ length: num }, () => "•").join("")
}

const defaultCaster = {
  gnosis: 0,
  arcana: {
    Death: { level: 0, ruling: false },
    Fate: { level: 0, ruling: false },
    Forces: { level: 0, ruling: false },
    Life: { level: 0, ruling: false },
    Matter: { level: 0, ruling: false },
    Mind: { level: 0, ruling: false },
    Prime: { level: 0, ruling: false },
    Spirit: { level: 0, ruling: false },
    Space: { level: 0, ruling: false },
    Time: { level: 0, ruling: false },
  },
  praxes: [],
  rotes: [],
}
const defaultSpell = {
  name: undefined,
  isRote: false,
  isPraxis: false,
  practice: undefined,
  primaryFactor: undefined,
  primaryArcana: { arcana: undefined, level: undefined },
  secondaryArcana: { arcana: undefined, level: undefined },
  description: undefined,
  effects: [],
  additionalEffects: [],
  commonEffects: {
    changePrimaryFactor: false,
  },
  description: undefined,
  page: undefined,
  factors: {
    castingTime: "s1",
    potency: "s1",
    range: "s1",
    duration: "s1",
    scale: "s1",
  },
  roteSkills: [],
  roteSkill: 0,
  spendWillpower: false,
  extraReach: 0,
  extraMana: 0,
  yantras: [],
  yantraAlsoDedicatedTool: null,
  attainments: {
    conditionalDuration: false,
    everywhere: false,
    permanence: false,
    sympatheticRange: false,
    temporalSympathy: false,
    timeInABottle: false,
  },
}
const defaultConditions = {
  subjectWithstand: 0,
  activeSpells: 0,
  bonusDice: 0,
}
const defaultParadox = {
  inured: false,
  previous: 0,
  sleepers: 0,
  manaSpent: 0,
}

export default {
  components: { Card, DocumentText, Trash, Build, Bookmark, ArrowUndo, Save, Reload, Close, ChevronDown, ChevronUp, Ellipse, EllipseOutline },
  setup() {
    const message = useMessage()
    const container = ref(undefined)
    const chooseYantraDropdown = ref(undefined)
    const choosePraxisDropdown = ref(undefined)
    const chooseRoteDropdown = ref(undefined)
    return {
      darkTheme,
      lightTheme,
      container: container,
      message: message,
      chooseYantraDropdown,
      choosePraxisDropdown,
      chooseRoteDropdown,
      // theme: lightTheme,
    }
  },
  data() {
    return {
      caster: clone(defaultCaster),
      spell: clone(defaultSpell),
      conditions: clone(defaultConditions),
      paradox: clone(defaultParadox),
      saved: [],
      theme: lightTheme,
      dark: false,
      chooseYantraValue: null,
      choosePraxisValue: null,
      chooseRoteValue: null,
    }
  },
  computed: {
    hasConfiguredCaster() {
      return this.caster.gnosis > 0 && this.highestCasterArcana.length > 0
    },
    canCastSpell() {
      if (this.spell.name === undefined) return false
      if (this.isSpellArcanaTooHigh === true) return false
      return true
    },
    chooseSpellLabel() {
      if (this.spell.name === undefined && this.spell.custom) return "Creative Thaumaturgy"
      if (this.spell.name !== undefined && this.spell.custom) return `${this.spell.name} (Custom)`
      return this.spell.name
    },
    chooseSpellOptions() {
      let options = []

      options.push({
        type: "group",
        label: "Custom",
        key: "custom",
        children: [{
          label: "Creative Thaumaturgy",
          value: {
            name: "Creative Thaumaturgy",
          }
        }]
      })

      for (let arcanaName of arcanaNames) {
        options.push({
          type: "group",
          label: arcanaName,
          key: arcanaName,
          children: spells
            .filter((s) => s.primaryArcana.arcana === arcanaName)
            .sort((a, b) => a.primaryArcana.level - b.primaryArcana.level)
            .map((s) => {
              return {
                label: `${dots(s.primaryArcana.level)} ${s.name}`,
                value: s,
              }
            }),
        })
      }

      return options
    },
    methodOptions() {
      let options = []

      for (let method of castingMethods) {
        options.push({
          label: method,
          value: method,
        })
      }

      return options
    },
    arcanaNameOptions() {
      let options = []

      for (let arcanaName of arcanaNames) {
        options.push({
          label: arcanaName,
          value: arcanaName,
        })
      }

      return options
    },
    highestCasterArcana() {
      let highest = max(Object.values(this.caster.arcana).map((a) => a.level))
      let arcanas = []
      if (highest === 0) return arcanas
      for (let arcana in this.caster.arcana) {
        if (this.caster.arcana[arcana].level === highest) arcanas.push(arcana)
      }
      return arcanas
    },
    maxCasterArcana() {
      let arcana

      if (this.highestCasterArcana.includes(this.spell.primaryArcana.arcana)) {
        if (this.caster.gnosis >= 5) {
          arcana = 5
        } else if (this.caster.gnosis >= 3) {
          arcana = 4
        } else {
          arcana = 3
        }
      } else {
        if (this.caster.gnosis >= 6) {
          arcana = 5
        } else if (this.caster.gnosis >= 4) {
          arcana = 4
        } else {
          arcana = 3
        }
      }

      return arcana
    },
    isCasterArcanaTooHigh() {
      return this.caster.arcana[this.spell.primaryArcana.arcana].level > this.maxCasterArcana
    },
    isSpellArcanaTooHigh() {
      if (this.spell.primaryArcana && this.spell.primaryArcana.arcana && this.spell.primaryArcana.level && this.caster.arcana[this.spell.primaryArcana.arcana].level < this.spell.primaryArcana.level) return true
      if (this.spell.secondaryArcana && this.spell.secondaryArcana.arcana && this.spell.secondaryArcana.level && this.caster.arcana[this.spell.secondaryArcana.arcana].level < this.spell.secondaryArcana.level) return true
      return false
    },
    freeReach() {
      let arcana

      if (this.spell.isRote) {
        arcana = 5
      } else {
        arcana = this.caster.arcana[this.spell.primaryArcana.arcana].level
      }

      return arcana - this.spell.primaryArcana.level + 1
    },
    usedReach() {
      let reach = 0

      if (this.conditions.activeSpells >= this.caster.gnosis) {
        reach += this.conditions.activeSpells - this.caster.gnosis + 1
      }

      // check factors (advanced factor keys begin with "a")
      for (let factor of factors) {
        if (this.spell.factors[factor][0] === "a") {
          reach++
        }
      }

      // check effects
      for (let effect of this.spell.effects) {
        if (effect.cost) {
          for (let cost of effect.cost) {
            if (cost.type === "Reach") reach += cost.value
          }
        }
      }

      // check for common effects
      if (this.spell.commonEffects.changePrimaryFactor) {
        reach += 1
      }

      // remote viewing range costs 1 additional reach
      if (this.spell.factors.range === "a2") {
        reach += 1
      }

      // indefinite duration costs 1 additional reach
      if (this.spell.factors.duration === "a6") {
        reach += 1
      }

      // spell-specific extra reach
      reach += this.spell.extraReach

      if (this.spell.attainments.permanence) {
        reach--
      }

      if (this.spell.attainments.timeInABottle) {
        reach--
      }

      if (this.spell.attainments.everywhere) {
        reach--
      }

      return reach
    },
    roteOrPraxis() {
      if (this.spell.isRote) {
        return "rote"
      } else if (this.spell.isPraxis) {
        return "praxis"
      } else {
        return null
      }
    },
    baseParadoxDice() {
      return Math.ceil(this.caster.gnosis / 2)
    },
    paradoxDice() {
      let pool, mustRoll

      pool = 0
      mustRoll = false

      if (this.usedReach > this.freeReach) {
        pool += (this.freeReach - this.usedReach) * -1
        mustRoll = true
      }

      // gnosis multiplies paradox from additional reach
      pool *= this.baseParadoxDice

      if (this.paradox.inured) {
        pool += 2
        mustRoll = true
      }

      if (this.paradox.previous > 0) {
        pool += this.paradox.previous
        mustRoll = true
      }

      if (this.paradox.sleepers > 0) {
        pool++
        mustRoll = true
      }

      if (this.isDedicatedToolYantraUsed) {
        pool -= 2
      }

      pool -= this.paradox.manaSpent

      if (pool <= 0 && mustRoll) {
        return "Chance"
      }
      if (pool < 0) return 0

      return pool
    },
    hasParadox() {
      return (
        this.usedReach > this.freeReach ||
        this.paradox.inured ||
        this.paradox.previous > 0 ||
        this.paradox.sleepers > 0
      )
    },
    durationPenalty() {
      let penalty = durations.get(this.spell.factors.duration).penalty

      if (this.isPrimaryFactor("Duration")) {
        penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
      }

      if (penalty <= 0) {
        penalty = 0
      }

      return penalty
    },
    potencyValue() {
      return this.spell.factors.potency.substr(1)
    },
    potencyPenalty() {
      let penalty = (this.potencyValue - 1) * 2

      if (this.isPrimaryFactor("Potency")) {
        penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
      }

      if (penalty <= 0) {
        penalty = 0
      }

      return penalty
    },
    dicePool() {
      // base pool
      let pool = this.caster.gnosis + this.caster.arcana[this.spell.primaryArcana.arcana].level

      pool += this.conditions.bonusDice

      if (this.spell.spendWillpower) {
        pool += 3
      }

      // casting time
      if (!this.isAdvanced("castingTime")) {
        pool += this.spell.factors.castingTime[1] - 1
      }

      // withstand
      pool -= this.totalWithstand

      // potency
      pool -= this.potencyPenalty

      // duration
      pool -= this.durationPenalty

      // scale
      pool -= scales.get(this.spell.factors.scale).penalty

      // yantras
      this.spell.yantras.forEach((yantra) => {
        pool += yantra.bonus
      })

      return pool
    },
    isDicePoolTooLow() {
      return this.dicePool < 1
    },
    spellFactorOptions() {
      return [
        {
          label: "Duration",
          value: "Duration",
        },
        {
          label: "Potency",
          value: "Potency",
        },
      ]
    },
    primaryFactor() {
      return this.spell.primaryFactor
    },
    primaryFactorLabel() {
      return capitalize(this.spell.primaryFactor)
    },
    totalWithstand() {

      let withstand = this.conditions.subjectWithstand

      if (this.spell.factors.potency === "a1") {
        withstand -= 2
      }

      return withstand
    },
    yantras() {
      let expandedYantras = new Map()

      for (let [key, yantraBaseData] of yantrasBaseData) {
        // bonus can contain a single number or a range. Arrayify.
        let bonuses
        if (Array.isArray(yantraBaseData.bonus)) {
          bonuses = range(yantraBaseData.bonus[0], yantraBaseData.bonus[1] + 1)
        } else {
          bonuses = [yantraBaseData.bonus]
        }

        bonuses.forEach((bonus) => {
          let expandedYantra = clone(yantraBaseData)

          /*
           * Bonus
           */

          // rote skill mudra: bonus = skill dots
          if (key === "a1" && this.spell.isRote) {
            bonus = this.spell.roteSkill
          }

          // sympathetic yantras don't give a bonus to sympathetic or temporal spells
          if (
            ["t4", "t5"].includes(key) &&
            (this.spell.attainments.sympatheticRange || this.spell.attainments.temporalSympathy)
          ) {
            bonus = 0
          }

          expandedYantra.yantraKey = Array.isArray(yantraBaseData.bonus) ? key + "_" + bonus : key // key is a reserved property in Vue so we use "yantraKey"
          expandedYantra.bonus = bonus
          expandedYantra.value = expandedYantra.yantraKey
          expandedYantra.label = `${yantraBaseData.name} (+${bonus} ${
            bonus === 1 ? "die" : "dice"
          })`
          expandedYantra.isDedicatedTool = false
          expandedYantras.set(expandedYantra.yantraKey, expandedYantra)
        })
      }

      return expandedYantras
    },
    maxYantras() {
      return Math.ceil(this.caster.gnosis / 2) + 1
    },
    numYantras() {
      return this.spell.yantras.length
    },
    isConcentrationMantraAllowed() {
      return this.isPrimaryFactor("Duration") || this.spell.factors.duration !== "s1"
    },
    isDedicatedToolYantraUsed: {
      cache: false,
      // getter
      get() {
        if (this.hasYantra("t1")) {
          return true
        }

        return some(this.spell.yantras, ["isDedicatedTool", true])
      },
      // setter (bool)
      set(isUsed) {
        if (isUsed) {
          console.log('set is used')
          if (this.isDedicatedToolYantraUsed) {
            console.log('but warn')
            this.message.warning("Dedicated Tool is already being used")
          }
          this.spell.yantras.push(this.yantras.get("t1"))
        } else {
          console.log('delete t1?')
          this.deleteYantra("t1")

          for (let key of this.spell.yantras) {
            this.spell.yantras[key].isDedicatedTool = false
          }

          this.$forceUpdate() // cache: false and this.$forceUpdate() means the getter shows updated value
        }
      },
    },
    totalMana() {
      let mana = 0

      if (
        !this.caster.arcana[this.spell.primaryArcana.arcana].ruling &&
        !this.spell.isRote &&
        !this.spell.isPraxis
      ) {
        mana++
      }

      // check effects
      for (let effect of this.spell.effects) {
        if (effect.cost) {
          for (let cost of effect.cost) {
            if (cost.type === "Mana") mana += cost.value
          }
        }
      }

      if (this.spell.extraMana) mana += this.spell.extraMana

      if (this.spell.factors.duration === "a6") {
        mana++
      }

      if (this.spell.attainments.permanence) {
        mana++
      }

      if (this.spell.attainments.timeInABottle) {
        mana++
      }

      if (this.spell.attainments.sympatheticRange) {
        mana++
      }

      if (this.spell.attainments.temporalSympathy) {
        mana++
      }

      if (this.spell.attainments.everywhere) {
        mana++
      }

      mana += this.paradox.manaSpent

      return mana
    },
    maxMana() {
      return gnosisManaLimits[this.caster.gnosis]
    },
    // use this to watch attainments changing
    attainmentsByName() {
      let attainments = []

      each(this.spell.attainments, (value, key) => {
        if (value) {
          attainments.push(key)
        }
      })

      return attainments
    },
    isSympatheticYantraMissing() {
      return (
        (this.spell.attainments.sympatheticRange || this.spell.attainments.temporalSympathy) &&
        !this.hasYantra("t3") &&
        !this.hasYantra("t4") &&
        !this.hasYantra("t5")
      )
    },
    isCastable() {
      return !this.isDicePoolTooLow && !this.isSympatheticYantraMissing
    },
    baseCastingTime() {
      for (let [key, value] of baseCastingTimes) {
        if (this.caster.gnosis >= key) {
          return value
        }
      }
      return null
    },
    arcanaOptions() {
      let options = arcanaNames.map((arcana) => {
        return {
          label: arcana,
          value: arcana,
        }
      });
      return options
    },
    choosePracticeValue() {
      return this.spell.practice
    },
    choosePracticeOptions() {
      let options = []
      for (let practice of practices) {
        options.push({
          label: `${dots(practice.level)} ${practice.name}`,
          value: practice,
        })
      }
      return options
    },
    choosePrimaryFactorOptions() {
      let options = ["Duration", "Potency"].map((factor) => {
        return {
          label: factor,
          value: factor,
        }
      });
      return options
    },
    standardCastingTimeOptions() {
      let options = [],
        i = 0

      while (i++ <= 5) {
        let increment = this.baseCastingTime.increment * i,
          unit = this.baseCastingTime.unit + (increment !== 1 ? "s" : ""),
          bonus = i - 1

        options.push({
          value: "s" + i,
          label: `${increment} ${unit} (+${bonus} dice)`,
        })
      }

      return options
    },
    castingTimeOptions() {
      let options = []
      options.push({
        type: "group",
        label: "Standard (Ritual Casting)",
        key: "standard",
        children: this.standardCastingTimeOptions,
      })
      options.push({
        type: "group",
        label: "Advanced (Quick Casting)",
        key: "advanced",
        children: [{ value: "a1", label: "1 Turn" }],
      })
      return options
    },
    standardPotencyOptions() {
      let options = [],
        i = 0

      while (i++ < 11) {
        let penalty = (i - 1) * 2

        if (this.isPrimaryFactor("Potency")) {
          penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
        }

        if (penalty < 0) {
          penalty = 0
        }

        options.push({
          value: "s" + i,
          label: `${i} (-${penalty} dice)`,
        })
      }

      return options
    },
    advancedPotencyOptions() {
      let options = []
      let i = 0
      while (i++ < 11) {
        let penalty = (i - 1) * 2

        if (this.isPrimaryFactor("Potency")) {
          penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
        }

        if (penalty < 0) {
          penalty = 0
        }

        options.push({
          value: "a" + i,
          label: `${i} (-${penalty} dice)`,
        })
      }

      return options
    },
    potencyOptions() {
      let options = []
      options.push({
        type: "group",
        label: "Standard",
        key: "standard",
        children: this.standardPotencyOptions,
      })
      options.push({
        type: "group",
        label: "Advanced",
        key: "advanced",
        children: this.advancedPotencyOptions,
      })
      return options
    },
    rangeOptions() {
      let options = []
      options.push({
        type: "group",
        label: "Standard",
        key: "standard",
        children: [{ value: "s1", label: "Touch" }],
      })
      options.push({
        type: "group",
        label: "Advanced",
        key: "advanced",
        children: [
          { value: "a1", label: "Sensory" },
          { value: "a2", label: "Remote" },
        ],
      })
      return options
    },
    standardDurationOptions() {
      let options = []

      for (let [key, duration] of durations) {
        if (key[0] === "s") {
          let penalty = duration.penalty

          if (this.isPrimaryFactor("Duration")) {
            penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
          }

          if (penalty < 0) {
            penalty = 0
          }

          options.push({
            value: key,
            successes: key[1],
            time: duration.time,
            label: `${duration.time} (-${penalty} dice)`,
          })
        }
      }

      return options
    },
    advancedDurationOptions() {
      let options = []

      for (let [key, duration] of durations) {
        if (key[0] === "a") {
          let penalty = duration.penalty

          if (this.isPrimaryFactor("Duration")) {
            penalty -= (this.caster.arcana[this.spell.primaryArcana.arcana].level - 1) * 2
          }

          if (penalty < 0) {
            penalty = 0
          }

          options.push({
            value: key,
            successes: key[1],
            time: duration.time,
            label: `${duration.time} (-${penalty} dice)`,
          })
        }
      }

      return options
    },
    durationOptions() {
      let options = []
      options.push({
        type: "group",
        label: "Standard",
        key: "standard",
        children: this.standardDurationOptions,
      })
      options.push({
        type: "group",
        label: "Advanced",
        key: "advanced",
        children: this.advancedDurationOptions,
      })
      return options
    },
    standardScaleOptions() {
      let options = []

      for (let [key, scale] of scales) {
        if (key[0] === "s") {
          let s = clone(scale)
          s.value = key
          s.penalty = `-${scale.penalty}`
          options.push(s)
        }
      }

      return options
    },
    advancedScaleOptions() {
      let options = []

      for (let [key, scale] of scales) {
        if (key[0] === "a") {
          let s = clone(scale)
          s.value = key
          s.penalty = `-${scale.penalty}`
          options.push(s)
        }
      }

      return options
    },
    scaleOptions() {
      let options = []
      options.push({
        type: "group",
        label: "Standard",
        key: "standard",
        children: this.standardScaleOptions.map(({ value, number, size, area, penalty }) => {
          return {
            value: value,
            label: `${number} subjects or ${area.toLowerCase()} (${penalty} dice)`,
          }
        }),
      })
      options.push({
        type: "group",
        label: "Advanced",
        key: "advanced",
        children: this.advancedScaleOptions.map(({ value, number, size, area, penalty }) => {
          return {
            value: value,
            label: `${number} subjects or ${area.toLowerCase()} (${penalty} dice)`,
          }
        }),
      })
      return options
    },
    locationYantraOptions() {
      return this.getYantraOptions("l")
    },
    actionYantraOptions() {
      return this.getYantraOptions("a")
    },
    toolYantraOptions() {
      return this.getYantraOptions("t")
    },
    yantraOptions() {
      return [
        { type: "group", label: "Locations", key: "locations", children: this.locationYantraOptions },
        { type: "group", label: "Actions", key: "actions", children: this.actionYantraOptions },
        { type: "group", label: "Tools", key: "tools", children: this.toolYantraOptions },
      ]
    },
    casterPraxesSummary() {
      let summary = this.caster.praxes.map(p => p.name);
      if (summary.length === 0) return "None"
      return summary.join(", ")
    },
    casterRotesSummary() {
      let summary = this.caster.rotes.map(p => p.name);
      if (summary.length === 0) return "None"
      if (summary.length === 1) return "1 Spell"
      return `${summary.length} Spells`
    },
    gnosisSummary() {
      let summary = ""
      if (this.caster.gnosis > 0) summary += `Gnosis ${this.caster.gnosis}`
      if (summary.length === 0) return "None"
      return summary
    },
    arcanaSummary() {
      let summary = []
      for (let arcana in this.caster.arcana) {
        let level = this.caster.arcana[arcana].level
        if (level > 0) summary.push(`${arcana} ${level}`)
      }
      if (summary.length === 0) return "None"
      return summary.join(", ")
    },
    effectsSummary() {
      let summary = []
      if (this.spell.effects.length || this.spell.spendWillpower) summary.push(`${this.spell.effects.length + (this.spell.spendWillpower ? 1 : 0)}`)
      if (this.spell.custom) {
        if (this.spell.extraReach > 0 || this.spell.extraMana > 0) summary.push("Custom")
      }
      if (summary.length === 0) return "None"
      return "Effects (" + summary.join(", ") + ")"
    },
    conditionsSummary() {
      let summary = []
      if (this.conditions.bonusDice > 0) summary.push(`+${this.conditions.bonusDice} dice`)
      if (this.conditions.activeSpells > 0) summary.push(`${this.conditions.activeSpells} active`)
      if (this.conditions.subjectWithstand > 0) summary.push(`${this.conditions.subjectWithstand} withstand`)
      if (summary.length === 0) return "None"
      return summary.join(", ")
    },
    spellSummary() {
      let summary = ""
      if (this.spell.name) summary += `${this.spell.name} (`
      if (this.spell.primaryArcana?.arcana && this.spell.primaryArcana?.level) summary += `${this.spell.primaryArcana.arcana} ${this.spell.primaryArcana.level}`
      if (this.spell.secondaryArcana?.arcana && this.spell.secondaryArcana?.level) summary += `, ${this.spell.secondaryArcana.arcana} ${this.spell.secondaryArcana.level}`
      if (this.spell.name) summary += ")"
      if (summary.length === 0) return "None"
      return summary
    },
    paradoxDiceSummary() {
      let summary

      if (this.paradoxDice === "Chance") {
        summary = "Chance"
      } else if (this.paradoxDice === 1) {
        summary = this.paradoxDice + " die"
      } else {
        summary = this.paradoxDice + " dice"
      }

      if (this.paradox.sleepers > 0) {
        if (this.paradox.sleepers === 2) {
          summary += " (9-again)"
        } else if (this.paradox.sleepers === 3) {
          summary += " (8-again)"
        } else if (this.paradox.sleepers === 4) {
          summary += " (as rote)"
        }
      }

      return summary
    },
    dicePoolSummary() {
      if (this.dicePool < 1) {
        return "Chance"
      } else if (this.dicePool == 1) {
        return `${this.dicePool} die`
      } else {
        return `${this.dicePool} dice`
      }
    },
    castingTimeSummary() {
      // standard
      if (this.spell.factors.castingTime[0] === "s") {
        let increment = this.baseCastingTime.increment * this.spell.factors.castingTime[1],
          unit = this.baseCastingTime.unit + (increment !== 1 ? "s" : "")

        return increment + " " + unit
      }
      // advanced
      else {
        let turns = this.numYantras <= 1 ? 1 : this.numYantras

        if (this.hasYantra("a3")) {
          turns = turns == 1 ? 2 : turns
        }

        return `${turns} turn${turns !== 1 ? "s" : ""}`
      }
    },
    durationSummary() {
      return durations.get(this.spell.factors.duration).time
    },
    potencySummary() {
      return this.potencyValue
    },
    rangeSummary() {
      if (this.spell.factors.range === "s1") {
        return "Touch"
      } else if (
        this.spell.attainments.sympatheticRange ||
        this.spell.attainments.temporalSympathy
      ) {
        let range = []

        if (this.spell.attainments.sympatheticRange) {
          range.push("Sympathetic")
        }

        if (this.spell.attainments.temporalSympathy) {
          range.push("Temporal Sympathetic")
        }

        return range.join(" and ")
      } else {
        if (this.spell.factors.range === "a1") return "Sensory"
        if (this.spell.factors.range === "a2") return "Remote"
      }
    },
    scaleSummary() {
      let scale = scales.get(this.spell.factors.scale)
      return scale ? `${scale.number} subjects or ${scale.area.toLowerCase()}` : ""
    },
    scalePenalty() {
      let scale = scales.get(this.spell.factors.scale)
      return scale ? scale.penalty : ""
    },
    paradoxSummary() {
      return this.paradoxDiceSummary
    },
    yantrasSummary() {
      let yantrasNames = []

      for (let yantra of this.spell.yantras) {
        yantrasNames.push(this.yantras.get(yantra.yantraKey).name)
      }
      if (yantrasNames.length === 0) return "None"

      return yantrasNames.join(", ")
    },
    factorCastingTime() {
      return this.spell.factors.castingTime
    },
    factorDuration() {
      return this.spell.factors.duration
    },
    factorRange() {
      return this.spell.factors.range
    },
    factorScale() {
      return this.spell.factors.scale
    },
  },
  watch: {
    caster: {
      handler(value) {
        console.log('value', value)
        localStorage.setItem("caster", JSON.stringify(value))
      },
      deep: true,
    },
    saved: {
      handler(value) {
        localStorage.setItem("saved", JSON.stringify(value))
      },
      deep: true,
    },
    dark: {
      handler(value) {
        console.log('dark changed', value)
        localStorage.setItem("dark", JSON.stringify(value))
      },
    },
    "spell.isRote": function (newer, older) {
      if (older === true && newer === false && this.hasYantra("a1")) {
        this.deleteYantra("a1")
        this.message.warning("Rote Skill Mudra removed from yantras")
      }
        // if (this.hasYantra("a1") && spell.isRote === true) {
        //   setTimeout(() => {
        //     let yantra = spell.yantras.findIndex((y) => y.yantraKey === "a1")
        //     if (yantra.bonus !== spell.roteSkill) {
        //       this.message.info("Rote Skill Mudra updated to +" + spell.roteSkill)
        //       spell.yantras[yantra].bonus = spell.roteSkill
        //     }
        //   }, 250)
        // }
    },
    "spell.commonEffects.changePrimaryFactor": function (newer, older) {
      const current = this.spell.primaryFactor
      if (newer === true && current === "Potency") this.spell.primaryFactor = "Duration"
      if (newer === true && current === "Duration") this.spell.primaryFactor = "Potency"
      if (newer === false && current === "Duration") this.spell.primaryFactor = "Potency"
      if (newer === false && current === "Potency") this.spell.primaryFactor = "Duration"
    },
    "conditions.subjectWithstand": function (newer, older) {
      let extraPotency = this.spell.factors.potency[1] - 1
      let prefix = this.spell.factors.potency[0]
      let minPotency = this.totalWithstand
      let isStandard = prefix !== "a"

      // Advanced Potency reduces Withstand by 2
      if (!isStandard) minPotency -= 2

      // Potency too low?
      if (extraPotency < minPotency) {
        this.spell.factors.potency = prefix + minPotency
        this.message.info(`Potency (${prefix === "s" ? "Standard" : "Advanced"}) increased to ${minPotency}`)
      }
    },
  },
  methods: {
    setDark(value) {
      if (value === true) this.theme = darkTheme
      if (value === false) this.theme = lightTheme
    },
    choosePractice(practice) {
      this.spell.practice = practice.name
      this.spell.primaryArcana.level = practice.level
    },
    chooseYantraFromDropdown(option) {
      if (this.chooseYantraDropdown) {
        this.chooseYantraDropdown.blur()
        this.chooseYantraValue = null
      }
      this.addYantra(option)
    },
    choosePraxisFromDropdown(option) {
      if (this.choosePraxisDropdown) {
        this.choosePraxisDropdown.blur()
        this.choosePraxisValue = null
      }
      this.caster.praxes = this.caster.praxes || []
      this.caster.praxes.push({
        name: option.name,
        arcana: option.primaryArcana.arcana,
        level: option.primaryArcana.level,
      });
    },
    chooseRoteFromDropdown(option) {
      if (this.chooseRoteDropdown) {
        this.chooseRoteDropdown.blur()
        this.chooseRoteValue = null
      }
      this.caster.rotes = this.caster.rotes || []
      this.caster.rotes.push({
        name: option.name,
        arcana: option.primaryArcana.arcana,
        level: option.primaryArcana.level,
        skill: 0,
      });
    },
    hasPraxis(name) {
      if (!this.caster.praxes) return false;
      return this.caster.praxes.find((s) => s.name === name)
    },
    hasRote(name) {
      if (!this.caster.rotes) return false;
      return this.caster.rotes.find((s) => s.name === name)
    },
    removePraxisSpell(name) {
      let index = this.caster.praxes.findIndex((s) => s.name === name);
      if (index !== -1) this.caster.praxes.splice(index, 1);
    },
    removeRoteSpell(name) {
      let index = this.caster.rotes.findIndex((s) => s.name === name);
      if (index !== -1) this.caster.rotes.splice(index, 1);
    },
    renderYantraLabel(option) {
      if (option.type === "group") return option.label
      return h(
        'div',
        {
          style: { padding: '4px 0' },
        },
        [
          h('b', option.label),
          h('br'),
          option.disabledWarning || option.desc,
        ]
      )
    },
    customSpell(spell) {
      const cloned = clone(defaultSpell)
      this.spell = cloned
      this.spell.custom = true
      this.spell.customName = undefined
      this.spell.primaryArcana.arcana = undefined
      this.spell.primaryArcana.level = undefined
      this.spell.secondaryArcana.arcana = undefined
      this.spell.secondaryArcana.level = undefined
      this.spell.primaryFactor = cloned.primaryFactor
      this.spell.roteSkill = cloned.roteSkill
      this.spell.roteSkills = cloned.roteSkills
      this.spell.description = cloned.description
      this.spell.additionalEffects = cloned.additionalEffects
      this.spell.effects = []
      this.spell.yantras = []
      this.spell.factors = {
        castingTime: "s1",
        potency: "s1",
        range: "s1",
        duration: "s1",
        scale: "s1",
      }
      this.spell.page = cloned.page
      this.spell.isPraxis = false
      this.spell.isRote = false
      this.spell.roteSkill = undefined
    },
    applyCustomSpell(spell) {
      this.spell.name = this.spell.customName
    },
    chooseSpell(spell) {
      if (spell.name === "Creative Thaumaturgy") {
        return this.customSpell(spell)
      }
      const cloned = clone(defaultSpell)
      this.spell = cloned
      this.spell.name = spell.name
      this.spell.practice = spell.practice
      this.spell.primaryArcana.arcana = spell.primaryArcana?.arcana
      this.spell.primaryArcana.level = spell.primaryArcana?.level
      this.spell.secondaryArcana.arcana = spell.secondaryArcana?.arcana
      this.spell.secondaryArcana.level = spell.secondaryArcana?.level
      this.spell.primaryFactor = spell.primaryFactor
      this.spell.roteSkill = spell.roteSkill
      this.spell.roteSkills = spell.roteSkills
      this.spell.description = spell.description
      this.spell.additionalEffects = spell.additionalEffects
      this.spell.effects = []
      this.spell.yantras = []
      this.spell.factors = {
        castingTime: "s1",
        potency: "s1",
        range: "s1",
        duration: "s1",
        scale: "s1",
      }
      this.spell.page = spell.page

      const hasPraxis = this.hasPraxis(spell.name)
      if (hasPraxis) {
        this.spell.isPraxis = true
      }

      const hasRote = this.hasRote(spell.name)
      if (hasRote) {
        this.spell.isRote = true
        this.spell.roteSkill = hasRote.skill
      }
    },
    addCommonReachEffects() {
      let effects = []
      effects.push({
        cost: [{ type: "Reach", value: 1 }],
        effect: "Change the primary factor"
      });
      effects.push({
        cost: [{ type: "Reach", value: 1 }],
        requirement: [{ factor: "Range", value: "a1" }],
        effect: "Change the range to remote viewing"
      });
      effects.push({
        cost: [{ type: "Reach", value: 1 }],
        requirement: [{ factor: "Range", value: "a1" }],
        effect: "Change the active spells limit"
      });
      effects.push({
        cost: [{ type: "Reach", value: 1 }, { type: "Mana", value: 1 }],
        requirement: [{ factor: "Duration", value: "a" }],
        effect: "Change the duration to indefinite"
      });
    },
    dots(num) {
      return Array.from({ length: num }, () => "•").join("")
    },
    isAdvanced(factorName) {
      return this.spell.factors[factorName][0] === "a"
    },
    isPrimaryFactor(factorName) {
      return this.spell.primaryFactor === factorName
    },
    setRote(value) {
      this.spell.isRote = value
    },
    setPraxis(value) {
      this.spell.isPraxis = value
    },
    checkAttainments() {
      // time in a bottle requires advanced
      if (this.spell.attainments.timeInABottle && !this.isAdvanced("castingTime")) {
        // debounce(() => {
        //   this.spell.attainments.timeInABottle = false
        //   Toast.create(
        //     "Time in a Bottle attainment requires advanced Casting Time. Deselecting attainment."
        //   )
        // })()
      }

      // permanence requires advanced
      if (
        this.spell.attainments.permanence &&
        (this.spell.primaryArcana.arcana !== "Matter" || !this.isAdvanced("Duration"))
      ) {
        // debounce(() => {
        //   this.spell.attainments.permanence = false
        //   Toast.create(
        //     "Permanence attainment requires advanced Duration. Deselecting attainment."
        //   )
        // })()
      }

      // everywhere requires advanced
      if (this.spell.attainments.everywhere && !this.isAdvanced("scale")) {
        // debounce(() => {
        //   this.spell.attainments.everywhere = false
        //   Toast.create(
        //     "Everywhere attainment requires advanced Scale. Deselecting attainment."
        //   )
        // })()
      }

      // sympathy requires advanced
      if (this.spell.attainments.sympatheticRange && !this.isAdvanced("range")) {
        // debounce(() => {
        //   this.spell.attainments.sympatheticRange = false
        //   Toast.create(
        //     "Sympathetic Range attainment requires advanced Range. Deselecting attainment."
        //   )
        // })()
      }

      // temporal sympathy requires advanced
      if (this.spell.attainments.temporalSympathy && !this.isAdvanced("range")) {
        // debounce(() => {
        //   this.spell.attainments.temporalSympathy = false
        //   Toast.create(
        //     "Temporal Sympathy attainment requires advanced Range. Deselecting attainment."
        //   )
        // })()
      }
    },
    isUniqueYantraUsed(key) {
      let yantra = this.yantras.get(key)

      // ignore non-uniques
      if (!yantra.unique) {
        return false
      }

      // this version is used?
      if (this.hasYantra(key)) {
        return true
      }

      // there are multiple version of this yantra - check for others
      if (key.indexOf("_") !== -1) {
        let baseKey = key.split("_")[0]
        if (this.spell.yantras.some((yantra) => yantra.yantraKey.indexOf(baseKey) === 0)) {
          return true
        }
      }

      return false
    },
    getYantraOptions(prefix) {
      let options = []

      for (let [key, yantra] of this.yantras) {
        if (key[0] === prefix) {
          // 'l', 'a', or 't'
          // disabled?
          let disabledWarning

          if (key === "a1" && this.spell.isRote === false) {
            disabledWarning = "Only available when casting Rotes."
          }

          if (key === "a2" && !this.isConcentrationMantraAllowed) {
            disabledWarning = "Duration must be more than 1 turn to use concentration."
          }

          if (this.isUniqueYantraUsed(key)) {
            disabledWarning = "Only one of this Yantra may be used."
          }

          if (key === "t1" && this.isDedicatedToolYantraUsed) {
            disabledWarning = "Dedicated Tool is already being used."
          }

          yantra.disabledWarning = disabledWarning
          yantra.disabled = !!disabledWarning

          // add to options
          options.push(yantra)
        }
      }

      return options
    },
    hasYantra(key) {
      return some(this.spell.yantras, ["yantraKey", key]) // `_.matchesProperty` iteratee shorthand.
    },
    addYantra(key) {
      let yantra = this.yantras.get(key)

      this.spell.yantras.push(yantra)
    },
    deleteYantra(key) {
      let index = findIndex(this.spell.yantras, (yantra) => yantra.yantraKey === key)
      this.spell.yantras.splice(index, 1)
    },
    updateYantraIsDedicatedTool(key, newValue) {
      let index = findIndex(this.spell.yantras, (yantra) => yantra.yantraKey === key)
      this.spell.yantras[index].isDedicatedTool = newValue
    },
    isEffectRestricted(item) {
      let answer = false
      if (item.requirement) {
        item.requirement.forEach(i => {
          if (i.arcana) {
            if (this.caster.arcana[i.arcana].level < i.value) answer = true
          }
          if (i.practice) {
            if (this.spell.practice !== i.practice) answer = true
          }
        })
      }
      return answer
    },
    isEffectAdded(item) {
      const existing = this.spell.effects.findIndex(added => added.effect === item.effect);
      return existing !== -1
    },
    // Effects
    toggleEffect(item) {
      if (this.isEffectAdded(item)) {
        this.spell.effects.splice(this.spell.effects.findIndex(added => added.effect === item.effect), 1)
      } else {
        this.spell.effects.push(item)
      }
    },
    // Spell Stuff
    getSpellWithSummary(spell) {
      const item = clone(spell)
      const itemCastingSummary = []
      if (item.isRote) itemCastingSummary.push("Rote")
      if (item.isPraxis) itemCastingSummary.push("Praxis")
      itemCastingSummary.push(`${this.usedReach}/${this.freeReach} Reach`)
      itemCastingSummary.push(`${this.dicePool} Dice`)
      itemCastingSummary.push(`${this.totalMana} Mana`)
      itemCastingSummary.push(`${this.paradoxDice} Paradox`)
      const itemFactorSummary = [];
      itemFactorSummary.push(`${this.potencySummary.toLowerCase()} potency`)
      itemFactorSummary.push(`${this.durationSummary.toLowerCase()} duration`)
      itemFactorSummary.push(`${this.castingTimeSummary.toLowerCase()} casting time`)
      itemFactorSummary.push(`${this.rangeSummary.toLowerCase()} range`)
      itemFactorSummary.push(`${this.scaleSummary.toLowerCase()}`)
      const itemEffectSummary = item.effects.map(effect => effect.effect);
      if (item.spendWillpower) itemEffectSummary.unshift("Willpower spent.")
      if (item.commonEffects.changePrimaryFactor) itemEffectSummary.push("Changed primary factor.")
      if (this.conditions.activeSpells >= this.caster.gnosis) itemEffectSummary.push("Casting above active limit.")
      if (item.custom) itemEffectSummary.push(`${item.description} (Creative Thaumaturgy, ${item.practice})`)
      const itemYantraSummary = item.yantras.map(yantra => yantra.name);
      const about = []
      if (this.dicePool > 7) about.push(`easy`);
      if (this.dicePool < 4) about.push(`hard`);
      if (this.paradoxDice === 0) about.push(`safe`);
      else if (typeof this.paradoxDice !== "string") about.push(`risky`);
      if (item.factors.castingTime === "a1") about.push("quick")
      else if (Number(item.factors.castingTime[1]) > 3) about.push("slow")
      if (item.factors.duration[0] === "s") about.push("short")
      if (item.factors.duration[0] === "a") about.push("long")
      if (Number(item.factors.scale[1]) > 3) about.push("big")
      if (this.usedReach > 4) about.push("complex")

      item.id = new Date().getTime()
      item.tags = {
        method: this.roteOrPraxis,
        reach: `${this.usedReach}/${this.freeReach}`,
        dice: this.dicePool,
        mana: this.totalMana,
        paradox: this.paradoxDice,
      }
      item.summary = about.join(", ")
      item.castingSummary = itemCastingSummary.join(", ")
      item.factorSummary = itemFactorSummary.join(", ")
      item.effectSummary = itemEffectSummary.join(" ")
      item.yantraSummary = itemYantraSummary.join(", ")
      item.conditionSummary = this.conditionsSummary
      item.actionSummary = this.dicePoolSummary
      return item
    },
    putSpellMacroInClipboard(spell) {
      const out = [];
      out.push("&{template:default}");
      out.push(`{{name=**${spell.name}** (${spell.primaryArcana.arcana} ${Array.from({ length: spell.primaryArcana.level }, v => "&bull;").join("")})}}`)
      out.push(`{{casting=${spell.castingSummary}}}`)
      out.push(`{{factors=${spell.factorSummary}}}`)
      out.push(`{{effects=${spell.effectSummary || "None"}}}`)
      out.push(`{{yantras=${spell.yantraSummary || "None"}}}`)
      if (spell.conditionSummary !== "None") out.push(`{{conditions=${spell.conditionSummary}}}`)
      out.push(`{{=[Roll ${spell.actionSummary} to cast](!&#13;&#91;[&#63;{Number of dice|${spell.tags.dice}}d10>8!>&#63;{Explodes on|10}]&#93; Successes)}}`);
      const text = out.join(" ");
      navigator.clipboard.writeText(text).then(() => {
        this.message.info(`${spell.name} was copied to clipboard`)
      });
    },
    copyActiveSpell() {
      const spell = this.getSpellWithSummary(this.spell)
      this.putSpellMacroInClipboard(spell)
    },
    copySavedSpell(spell) {
      this.putSpellMacroInClipboard(spell)
    },
    removeSpell(spell) {
      let index = findIndex(this.saved, (item) => item.id === spell.id)
      this.saved.splice(index, 1)
      this.message.error(`${spell.name} was removed`)
    },
    loadSpell(spell) {
      const cloned = clone(spell)
      this.spell = cloned
      this.spell.primaryArcana.arcana = spell.primaryArcana.arcana;
      this.spell.primaryArcana.level = spell.primaryArcana.level;
      this.spell.secondaryArcana.arcana = spell.secondaryArcana.arcana;
      this.spell.secondaryArcana.level = spell.secondaryArcana.level;
      this.paradox = clone(defaultParadox)
      this.conditions = clone(defaultConditions)
      this.message.success(`${cloned.name} was loaded`)
      if (cloned.conditionSummary !== "None") {
        this.message.info(`Condition settings have been cleared`)
      }
      if (cloned.tags.paradox !== 0) {
        this.message.info(`Paradox settings has been cleared`)
      }
    },
    saveActiveSpell() {
      const spell = this.getSpellWithSummary(this.spell)
      this.saved.push(spell)
      this.message.success(`${spell.name} was saved`)
    },
    reset() {
      const cloned = clone(defaultSpell)
      this.spell = cloned
      this.spell.primaryArcana.arcana = undefined
      this.spell.primaryArcana.level = undefined
      this.spell.secondaryArcana.arcana = undefined
      this.spell.secondaryArcana.level = undefined
      this.spell.primaryFactor = cloned.primaryFactor
      this.spell.roteSkill = cloned.roteSkill
      this.spell.roteSkills = cloned.roteSkills
      this.spell.description = cloned.description
      this.spell.additionalEffects = []
      this.spell.effects = []
      this.spell.yantras = []
      this.spell.factors = {
        castingTime: "s1",
        potency: "s1",
        range: "s1",
        duration: "s1",
        scale: "s1",
      }
      this.paradox = clone(defaultParadox)
      this.conditions = clone(defaultConditions)
      this.message.warning("Spell config has been reset")
    },
    log(text) {
      console.log(text)
    },
  },
  mounted() {
    if (localStorage.getItem("caster")) {
      try {
        this.caster = JSON.parse(localStorage.getItem("caster"))
        this.caster.praxes = this.caster.praxes || []
        this.caster.rotes = this.caster.rotes || []
      } catch (err) {
        console.error(err)
        localStorage.removeItem("caster")
      }
    }
    if (localStorage.getItem("saved")) {
      try {
        this.saved = JSON.parse(localStorage.getItem("saved"))
      } catch (err) {
        console.error(err)
        localStorage.removeItem("saved")
      }
    }
    if (localStorage.getItem("dark")) {
      try {
        this.dark = JSON.parse(localStorage.getItem("dark"))
        this.setDark(this.dark)
      } catch (err) {
        console.error(err)
        localStorage.removeItem("dark")
      }
    }
  },
}
</script>

<style>
html {
  height: 100%;
}
body {
  height: 100%;
  overflow: hidden;
}
.n-tabs .n-tabs-pane-wrapper {
  overflow: visible;
}
.n-layout {
  height: 100vh;
}
.n-tabs {
  padding: 0 10px;
  max-width: 600px;
  margin: 80px auto;
}
.n-tabs .n-tabs-tab-pad {
  width: 5px;
}
.n-tabs .n-tabs-tab {
  padding: 10px;
}
.s-modal {
  min-width: 400px;
  max-width: 400px;
  margin: 30px auto;
}
.s-table td {
  vertical-align: middle;
  line-height: 19px;
}
.s-table td .n-switch {
  vertical-align: middle;
}
.n-card {
  border-radius: 5px;
  box-shadow: var(--n-box-shadow);
}
.n-card-header__extra {
  flex: 1;
  justify-content: flex-end;
}
.n-rate {
  vertical-align: middle;
}
.n-rate__item svg circle {
  stroke: var(--n-text-color);
}
.n-rate__item--active svg circle {
  fill: var(--n-text-color);
  stroke: var(--n-text-color);
}
.n-tabs-nav__suffix .n-switch.n-switch--active .n-switch__rail {
    /* background-color: #f2c97d; */
}
.quick {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}
.n-affix.n-affix--affixed.n-affix--absolute-positioned {
  position: fixed !important;
  z-index: 10;
}
#spellAffix {
  margin-bottom: -48px;
  width: 100%;
  max-width: 580px;
}
.btn-only-icon-when-small {
  height: auto !important;
}
@media only screen
  and (max-width: 600px) {
  #spellAffix {
    max-width: 100%;
  }
  #spellAffix.n-affix.n-affix--affixed.n-affix--absolute-positioned {
    max-width: calc(100% - 20px);
  }
  .btn-only-icon-when-small .n-button__icon { margin-right: 0; }
  .btn-only-icon-when-small .n-button__content { display: none !important; }
}
.spellSummary {
  height: 45px;
}
.spellSummary .n-card__content  {
  padding: 10px !important;
}
.quick .n-card__content {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 10px !important;
}
#spellOptions {
  position: fixed;
  right: 10px;
  bottom: 10px;
  border-radius: 70px;
  width: auto;
}
#spellOptions .n-card__content {
  padding: 10px !important;
}
</style>
