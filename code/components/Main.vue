<template>
  <n-config-provider :theme="theme" :theme-overrides="{ common: { fontWeightStrong: '600' } }">
    <n-layout static embedded>
      <n-tabs default-value="spell" animated>
        <template #suffix>
          <n-select ref="chooseCasterDropdown" :value="chooseCasterValue" filterable placeholder="Choose character to edit" @update:value="chooseCaster" :options="chooseCasterOptions">
            <template #action>
              <n-button @click="createCaster" type="success" text>Create a new character</n-button>
            </template>
          </n-select>
        </template>
        <n-tab-pane name="caster" tab="Caster">
          <n-space vertical>
            <!-- Info -->
            <n-alert type="warning" v-if="caster === undefined || caster === null">
              <n-text>You don't have a character selected</n-text>
            </n-alert>
            <!-- Caster -->
            <Card title="" v-if="caster">
              <template #content>
                <n-space vertical size="large">
                  <n-grid :cols="2" :x-gap="10" :y-gap="10">
                    <n-grid-item>
                      <n-space vertical size="small">
                        <b>Name</b>
                        <n-input v-model:value="caster.name" type="text" placeholder="eg. Merlin" />
                      </n-space>
                    </n-grid-item>
                    <n-grid-item>
                      <n-space vertical size="small">
                        <b>Category</b>
                        <n-input v-model:value="caster.type" type="text" placeholder="eg. Cabal" />
                      </n-space>
                    </n-grid-item>
                  </n-grid>
                </n-space>
              </template>
              <template #footer>
                <n-space justify="space-between">
                  <n-button strong text type="error" @click="removeCaster(caster.id)">
                    <template #icon>
                      <n-icon>
                        <Trash />
                      </n-icon>
                    </template>
                    Delete this character
                  </n-button>
                </n-space>
              </template>
            </Card>
            <!-- Gnosis -->
            <Card title="Gnosis" :summary="gnosisSummary" v-if="caster">
              <template #content>
                <n-rate clearable :count="10" v-model:value="caster.gnosis">
                  <n-icon>
                    <EllipseOutline />
                  </n-icon>
                </n-rate>
              </template>
            </Card>
            <!-- Praxes -->
            <Card title="Praxes" :summary="casterPraxesSummary" v-if="caster">
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
            <Card title="Rotes" :summary="casterRotesSummary" v-if="caster">
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
            <Card title="Arcana" :summary="arcanaSummary" v-if="caster">
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
            <n-alert type="warning" v-if="hasConfiguredCaster === false">
              <n-text v-if="caster === undefined || caster === null">You don't have a character selected</n-text>
              <n-text v-else>You haven't set Gnosis and Arcana for this character</n-text>
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
                    {{ spell.description }} <span v-if="spell.page"><br />({{ spell.page }})</span>
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
            <!-- Info -->
            <n-alert type="warning" v-if="hasConfiguredCaster === false">
              <n-text v-if="caster === undefined || caster === null">You don't have a character selected</n-text>
              <n-text v-if="caster !== undefined && caster !== null">You haven't set Gnosis and Arcana for this character</n-text>
            </n-alert>
            <n-alert type="info" v-if="saved.length === 0">
              <n-text>You don't have any saved spells</n-text>
            </n-alert>
            <!-- Saved -->
            <Card v-if="hasConfiguredCaster" :title="item.name" collapsed :summary="item.summary" v-for="(item) in saved" :key="item.id">
              <template #content>
                <n-space vertical size="large">
                  <n-space size="small">
                    <n-tag size="small" :bordered="false" round strong :type="getUsedReachFor(item) > getFreeReachFor(item) ? 'warning' : 'success'">{{getUsedReachFor(item)}}/{{getFreeReachFor(item)}} Reach</n-tag>
                    <n-tag size="small" :bordered="false" round strong type="success">{{getDicePoolFor(item)}} Dice</n-tag>
                    <n-tag size="small" :bordered="false" round strong type="success">{{getTotalManaFor(item)}} Mana</n-tag>
                    <n-tag size="small" :bordered="false" round strong type="error">{{getParadoxDiceFor(item)}} Paradox</n-tag>
                    <n-tag v-if="getRoteOrPraxisFor(item)" size="small" :bordered="false" round strong style="text-transform: capitalize">{{getRoteOrPraxisFor(item)}}</n-tag>
                  </n-space>
                  <n-text v-if="getFactorsSummaryFor(item)"><b>Factors:</b> {{getFactorsSummaryFor(item)}}.</n-text>
                  <n-text v-if="getEffectsSummaryFor(item)"><b>Extra:</b> {{getEffectsSummaryFor(item)}}</n-text>
                  <n-text v-if="getYantrasSummaryFor(item)"><b>Yantras:</b> {{getYantrasSummaryFor(item)}}.</n-text>
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
import {
  getRoteOrPraxis,
  getUsedReach,
  getFreeReach,
  getTotalMana,
  getWithstand,
  getYantras,
  getPotencyPenalty,
  getDurationPenalty,
  getBaseCastingTime,
  getDicePool,
  getParadoxDice,
  getPotencySummary,
  getDurationSummary,
  getCastingTimeSummary,
  getRangeSummary,
  getScaleSummary,
  getYantrasSummary,
  getDicePoolSummary,
  getParadoxSummary,
  getConditionsSummary,
} from "../constants/methods"
import { spells } from "../constants/spells.js"

function dots(num) {
  return Array.from({ length: num }, () => "•").join("")
}

const defaultCaster = {
  id: 0,
  name: "Character",
  type: "Uncategorised",
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
    const createCasterButton = ref(undefined)
    const chooseCasterDropdown = ref(undefined)
    const chooseYantraDropdown = ref(undefined)
    const choosePraxisDropdown = ref(undefined)
    const chooseRoteDropdown = ref(undefined)
    return {
      darkTheme,
      lightTheme,
      container: container,
      message: message,
      chooseCasterDropdown,
      chooseYantraDropdown,
      choosePraxisDropdown,
      chooseRoteDropdown,
      // theme: lightTheme,
    }
  },
  data() {
    return {
      caster: null,
      casters: [],
      spell: clone(defaultSpell),
      conditions: clone(defaultConditions),
      paradox: clone(defaultParadox),
      saved: [],
      theme: lightTheme,
      dark: false,
      // chooseCasterValue: null,
      chooseYantraValue: null,
      choosePraxisValue: null,
      chooseRoteValue: null,
    }
  },
  computed: {
    hasConfiguredCaster() {
      if (!this.caster) return false
      return this.caster.gnosis > 0 && this.highestCasterArcana.length > 0
    },
    canCastSpell() {
      if (this.spell.name === undefined) return false
      if (this.isSpellArcanaTooHigh === true) return false
      return true
    },
    chooseCasterValue() {
      if (!this.caster) return null
      return this.caster.name
    },
    chooseCasterOptions() {
      let options = []
      let types = []

      for (let caster of this.casters) {
        if (types.includes(caster.type) === false) types.push(caster.type)
      }

      for (let type of types) {
        options.push({
          type: "group",
          label: type,
          key: type,
          children: this.casters
            .filter((c) => c.type === type)
            .map((c) => {
              return {
                label: c.name,
                value: c,
              }
            }),
        })
      }

      return options
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
      return getFreeReach(this.caster, this.spell)
    },
    usedReach() {
      return getUsedReach(this.caster, this.spell, this.conditions)
    },
    roteOrPraxis() {
      return getRoteOrPraxis(this.caster, this.spell)
    },
    baseParadoxDice() {
      return Math.ceil(this.caster.gnosis / 2)
    },
    paradoxDice() {
      return getParadoxDice(this.caster, this.spell, this.conditions, this.paradox)
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
      return getDurationPenalty(this.caster, this.spell)
    },
    potencyPenalty() {
      return getPotencyPenalty(this.caster, this.spell)
    },
    dicePool() {
      return getDicePool(this.caster, this.spell, this.conditions)
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
      return getWithstand(this.spell, this.conditions)
    },
    yantras() {
      return getYantras(this.caster, this.spell)
    },
    maxYantras() {
      return Math.ceil(this.caster.gnosis / 2) + 1
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
      return getTotalMana(this.caster, this.spell, this.paradox)
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
      return getBaseCastingTime(this.caster)
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
      return getConditionsSummary(this.conditions)
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
    dicePoolSummary() {
      return getDicePoolSummary(this.caster, this.spell)
    },
    castingTimeSummary() {
      return getCastingTimeSummary(this.caster, this.spell)
    },
    durationSummary() {
      return getDurationSummary(this.caster, this.spell)
    },
    potencySummary() {
      return getPotencySummary(this.caster, this.spell)
    },
    rangeSummary() {
      return getRangeSummary(this.caster, this.spell)
    },
    scaleSummary() {
      return getScaleSummary(this.caster, this.spell)
    },
    paradoxSummary() {
      return getParadoxSummary(this.caster, this.spell, this.conditions, this.paradox)
    },
    yantrasSummary() {
      return getYantrasSummary(this.caster, this.spell)
    },
  },
  watch: {
    caster: {
      handler(value) {
        localStorage.setItem("caster", JSON.stringify(value))
        if (value && value.id && this.casters.find(c => c.id === value.id) === undefined) {
          this.casters.push(value)
        }
      },
      deep: true,
    },
    casters: {
      handler(value) {
        localStorage.setItem("casters", JSON.stringify(value))
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
    getFreeReachFor(spell) {
      return getFreeReach(this.caster, spell)
    },
    getUsedReachFor(spell) {
      return getUsedReach(this.caster, spell, this.conditions)
    },
    getTotalManaFor(spell) {
      return getTotalMana(this.caster, spell, this.paradox)
    },
    getDicePoolFor(spell) {
      return getDicePool(this.caster, spell, this.conditions)
    },
    getParadoxDiceFor(spell) {
      return getParadoxDice(this.caster, spell, this.conditions, this.paradox)
    },
    getRoteOrPraxisFor(spell) {
      return getRoteOrPraxis(this.caster, spell)
    },
    getDicePoolSummaryFor(spell) {
      return getDicePoolSummary(this.caster, spell, this.conditions)
    },
    getCastingTimeSummaryFor(spell) {
      return getCastingTimeSummary(this.caster, spell)
    },
    getDurationSummaryFor(spell) {
      return getDurationSummary(this.caster, spell)
    },
    getPotencySummaryFor(spell) {
      return getPotencySummary(this.caster, spell)
    },
    getRangeSummaryFor(spell) {
      return getRangeSummary(this.caster, spell)
    },
    getScaleSummaryFor(spell) {
      return getScaleSummary(this.caster, spell)
    },
    getParadoxSummaryFor(spell) {
      return getParadoxSummary(this.caster, spell, this.conditions, this.paradox)
    },
    getCastingSummaryFor(spell) {
      let summary = []
      let method = this.getRoteOrPraxisFor(spell)
      if (method === "rote") summary.push("Rote")
      if (method === "praxis}") summary.push("Praxis")
      summary.push(`${this.getUsedReachFor(spell)}/${this.getFreeReachFor(spell)} Reach`)
      summary.push(`${this.getDicePoolFor(spell)} Dice`)
      summary.push(`${this.getTotalManaFor(spell)} Mana`)
      summary.push(`${this.getParadoxDiceFor(spell)} Paradox`)
      return summary.join(", ")
    },
    getFactorsSummaryFor(spell) {
      let summary = []
      summary.push(`${this.getPotencySummaryFor(spell).toLowerCase()} potency`)
      summary.push(`${this.getDurationSummaryFor(spell).toLowerCase()} duration`)
      summary.push(`${this.getCastingTimeSummaryFor(spell).toLowerCase()} casting time`)
      summary.push(`${this.getRangeSummaryFor(spell).toLowerCase()} range`)
      summary.push(`${this.getScaleSummaryFor(spell).toLowerCase()}`)
      return summary.join(", ")
    },
    getConditionsSummaryFor(spell) {
      return getConditionsSummary(this.conditions)
    },
    getEffectsSummaryFor(spell) {
      let summary = spell.effects.map(effect => effect.effect)
      if (spell.spendWillpower) summary.unshift("Willpower spent.")
      if (spell.commonEffects.changePrimaryFactor) summary.push("Changed primary factor.")
      if (this.conditions.activeSpells >= this.caster.gnosis) summary.push("Casting above active limit.")
      if (spell.custom) spell.page = "Creative, " + spell.practice
      return summary.join(" ")
    },
    getYantrasSummaryFor(spell) {
      return getYantrasSummary(this.caster, spell)
    },
    choosePractice(practice) {
      this.spell.practice = practice.name
      this.spell.primaryArcana.level = practice.level
    },
    createCaster() {
      if (this.chooseCasterDropdown) {
        this.chooseCasterDropdown.blur()
        this.chooseCasterDropdown.show = false
        // this.chooseCasterValue = caster
      }
      let caster = { ...clone(defaultCaster), id: new Date().getTime() }
      this.caster = caster
      this.caster.rotes = []
      this.caster.praxes = []
    },
    chooseCaster(caster) {
      if (this.chooseCasterDropdown) {
        this.chooseCasterDropdown.blur()
        // this.chooseCasterValue = null
      }
      this.caster = caster
      this.caster.rotes = caster.rotes
      this.caster.praxes = caster.praxes
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
    removeCaster(id) {
      let index = this.casters.findIndex((s) => s.id === id)
      if (index !== -1) {
        const name = this.casters[index].name
        this.casters.splice(index, 1)
        this.message.error(`${name} was removed`)
        this.caster = null
      }
    },
    removePraxisSpell(name) {
      let index = this.caster.praxes.findIndex((s) => s.name === name)
      if (index !== -1) this.caster.praxes.splice(index, 1)
    },
    removeRoteSpell(name) {
      let index = this.caster.rotes.findIndex((s) => s.name === name)
      if (index !== -1) this.caster.rotes.splice(index, 1)
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
    putSpellMacroInClipboard(spell) {
      const out = [];
      out.push("&{template:default}");
      out.push(`{{name=**${spell.name}** (${spell.primaryArcana.arcana} ${Array.from({ length: spell.primaryArcana.level }, v => "&bull;").join("")})}}`)
      out.push(`{{summary=${spell.description}\n(${spell.page})}}`)
      out.push(`{{casting=${this.getCastingSummaryFor(spell)}}}`)
      out.push(`{{factors=${this.getFactorsSummaryFor(spell)}}}`)
      out.push(`{{extras=${this.getEffectsSummaryFor(spell) || "None"}}}`)
      out.push(`{{yantras=${this.getYantrasSummaryFor(spell) || "None"}}}`)
      if (this.getConditionsSummaryFor(spell) !== "None") out.push(`{{conditions=${this.getConditionsSummaryFor(spell)}}}`)
      out.push(`{{=[Roll ${this.getDicePoolSummaryFor(spell)} to cast](!&#13;&#91;[&#63;{Number of dice|${this.getDicePoolFor(spell)}d10>8!>&#63;{Explodes on|10}]&#93; Successes)}}`);
      const text = out.join(" ");
      navigator.clipboard.writeText(text).then(() => {
        this.message.info(`${spell.name} was copied to clipboard`)
      });
    },
    copyActiveSpell() {
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
      this.spell = { ...cloned }
      this.spell.primaryArcana.arcana = spell.primaryArcana.arcana;
      this.spell.primaryArcana.level = spell.primaryArcana.level;
      this.spell.secondaryArcana.arcana = spell.secondaryArcana.arcana;
      this.spell.secondaryArcana.level = spell.secondaryArcana.level;
      this.paradox = { ...clone(defaultParadox) }
      this.conditions = { ...clone(defaultConditions) }
      this.message.success(`${cloned.name} was loaded`)
      if (cloned.conditionSummary !== "None") {
        this.message.info(`Condition settings have been cleared`)
      }
      if (cloned.tags.paradox !== 0) {
        this.message.info(`Paradox settings has been cleared`)
      }
    },
    saveActiveSpell() {
      const spell = clone(this.spell)// this.getSpellWithSummary(this.spell)
      this.saved.push(spell)
      this.message.success(`${spell.name} was saved`)
    },
    reset() {
      const cloned = clone(defaultSpell)
      this.spell = { ...cloned }
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
      this.paradox = { ...clone(defaultParadox) }
      this.conditions = { ...clone(defaultConditions) }
      this.message.warning("Spell config has been reset")
    },
    log(text) {
      console.log(text)
    },
  },
  mounted() {
    if (localStorage.getItem("caster")) {
      try {
        let caster = JSON.parse(localStorage.getItem("caster"))
        if (caster) {
          this.caster = caster
          this.caster.id = this.caster.id || new Date().getTime()
          this.caster.name = this.caster.name || "You"
          this.caster.type = this.caster.type || "Cabal"
          this.caster.praxes = this.caster.praxes || []
          this.caster.rotes = this.caster.rotes || []
        }
      } catch (err) {
        console.error(err)
        localStorage.removeItem("caster")
      }
    }
    if (localStorage.getItem("casters")) {
      try {
        const casters = JSON.parse(localStorage.getItem("casters"))
        this.casters = casters
      } catch (err) {
        console.error(err)
        localStorage.removeItem("casters")
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
