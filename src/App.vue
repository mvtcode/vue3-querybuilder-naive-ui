<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NConfigProvider,
  NMessageProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NSpace,
  NCard,
  NTag,
  NButton,
  NSelect,
  NGradientText,
  NTabs,
  NTabPane,
  NInputNumber,
  NIcon,
  NGrid,
  NGi,
  NDivider,
  NDatePicker,
  NCheckbox,
} from 'naive-ui'
import { Refresh as RefreshIcon, Code as CodeIcon } from '@vicons/ionicons5'
import QueryBuilder from './components/QueryBuilder.vue'
import type { QueryBuilderGroup, QueryBuilderFilter } from './types/querybuilder'
import { FilterType, Operator } from './types/querybuilder'
import { toSQL, toMongo, toMnpQuery } from './utils/query-converter'
import packageJson from '../package.json'

const { locale, t } = useI18n()
const size = ref<'small' | 'medium' | 'large'>('small')
const rules = ref<QueryBuilderGroup>({
  condition: 'AND',
  rules: [],
})

const filters = computed(
  () =>
    [
      {
        field: 'name',
        label: t('app.fields.name'),
        type: FilterType.STRING,
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.CONTAINS,
          Operator.NOT_CONTAINS,
          Operator.BEGINS_WITH,
          Operator.NOT_BEGINS_WITH,
          Operator.ENDS_WITH,
          Operator.NOT_ENDS_WITH,
          Operator.IS_EMPTY,
          Operator.IS_NOT_EMPTY,
        ],
      },
      {
        field: 'email',
        label: t('app.fields.email'),
        type: FilterType.EMAIL,
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.CONTAINS,
          Operator.NOT_CONTAINS,
          Operator.BEGINS_WITH,
          Operator.NOT_BEGINS_WITH,
          Operator.ENDS_WITH,
          Operator.NOT_ENDS_WITH,
          Operator.IS_EMPTY,
          Operator.IS_NOT_EMPTY,
        ],
        input: 'email',
      },
      {
        field: 'age',
        label: t('app.fields.age'),
        type: FilterType.INTEGER,
        validation: {
          min: 0,
          max: 120,
        },
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.GREATER,
          Operator.GREATER_OR_EQUAL,
          Operator.LESS,
          Operator.LESS_OR_EQUAL,
          Operator.BETWEEN,
          Operator.NOT_BETWEEN,
          Operator.IS_EMPTY,
          Operator.IS_NOT_EMPTY,
        ],
      },
      {
        field: 'birthdate',
        label: t('app.fields.birthdate'),
        type: FilterType.DATE,
        input: 'date',
        validation: {
          format: 'yyyy-MM-dd',
        },
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.GREATER,
          Operator.GREATER_OR_EQUAL,
          Operator.LESS,
          Operator.LESS_OR_EQUAL,
          Operator.BETWEEN,
          Operator.NOT_BETWEEN,
          Operator.IS_EMPTY,
          Operator.IS_NOT_EMPTY,
        ],
        value: undefined,
      },
      {
        field: 'birthdatetime',
        label: t('app.fields.birthdatetime'),
        type: FilterType.DATETIME,
        input: 'date',
        validation: {
          format: 'yyyy-MM-dd HH:mm:ss',
        },
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.GREATER,
          Operator.GREATER_OR_EQUAL,
          Operator.LESS,
          Operator.LESS_OR_EQUAL,
          Operator.BETWEEN,
          Operator.NOT_BETWEEN,
          Operator.IS_EMPTY,
          Operator.IS_NOT_EMPTY,
        ],
      },
      {
        field: 'active',
        label: t('app.fields.active'),
        type: FilterType.BOOLEAN,
        input: 'checkbox',
      },
      {
        field: 'status',
        label: t('app.fields.status'),
        type: FilterType.STRING,
        input: 'select',
        value: 'pending',
        operators: [
          Operator.EQUAL,
          Operator.NOT_EQUAL,
          Operator.IN,
          Operator.NOT_IN,
          Operator.IS_EMPTY,
          Operator.IS_NOT_EMPTY,
        ],
        values: [
          { text: t('app.statusValues.pending'), value: 'pending' },
          { text: t('app.statusValues.completed'), value: 'completed' },
          { text: t('app.statusValues.cancelled'), value: 'cancelled' },
        ],
      },
    ] as QueryBuilderFilter[],
)

const sqlOutput = computed(() => toSQL(rules.value))
const mongoOutput = computed(() => JSON.stringify(toMongo(rules.value), null, 2))
const mnpOutput = computed(() => toMnpQuery(rules.value, filters.value))

const resetRules = () => {
  rules.value = {
    condition: 'AND',
    rules: [],
  }
}

const toggleLocale = () => {
  locale.value = locale.value === 'vi' ? 'en' : 'vi'
}
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <n-layout class="layout-container">
        <n-layout-header bordered class="header">
          <n-space align="center" justify="space-between" style="height: 100%; padding: 0 40px">
            <n-space align="center">
              <div class="logo-box">
                <n-icon size="24" color="#fff"><CodeIcon /></n-icon>
              </div>
              <n-gradient-text type="primary" :size="24" weight="800">
                {{ t('app.title') }}
              </n-gradient-text>
              <n-tag type="primary" size="small" round quaternary style="margin-left: 8px"
                >Naive UI</n-tag
              >
              <n-tag type="info" size="small" round quaternary style="margin-left: 8px"
                >v{{ packageJson.version }}</n-tag
              >
            </n-space>
            <n-space align="center" :size="20">
              <n-button tertiary circle size="medium" @click="toggleLocale">
                {{ locale }}
              </n-button>
            </n-space>
          </n-space>
        </n-layout-header>

        <n-layout-content class="content">
          <n-grid :cols="24" :x-gap="12" :y-gap="24">
            <!-- Row 1: Query Builder -->
            <n-gi :span="24">
              <n-card :title="t('queryBuilder.condition')" class="builder-card">
                <template #header-extra>
                  <n-space>
                    <n-select
                      v-model:value="size"
                      :options="[
                        { label: t('app.size.small'), value: 'small' },
                        { label: t('app.size.medium'), value: 'medium' },
                        { label: t('app.size.large'), value: 'large' },
                      ]"
                      label-field="label"
                      value-field="value"
                      style="width: 140px"
                      size="medium"
                    />
                    <n-button type="error" ghost @click="resetRules" size="medium">
                      <template #icon>
                        <n-icon><RefreshIcon /></n-icon>
                      </template>
                      {{ t('app.reset') }}
                    </n-button>
                  </n-space>
                </template>
                <QueryBuilder v-model="rules" :filters="filters" :max-depth="3" :size="size">
                  <!-- Example of custom slot for status -->
                  <template #active="{ rule, filter }">
                    <n-checkbox v-model:checked="rule.value">{{ filter.label }}</n-checkbox>
                  </template>

                  <template #status="{ rule, widthValueInput, filter, size }">
                    <n-select
                      v-model:value="rule.value"
                      :options="filter.values || []"
                      label-field="text"
                      value-field="value"
                      :multiple="[Operator.IN, Operator.NOT_IN].includes(rule.operator)"
                      max-tag-count="responsive"
                      clearable
                      :style="{ width: `${widthValueInput}px` }"
                      :size="size"
                    />
                  </template>

                  <!-- Example of custom slot for age with different UI -->
                  <template #age="{ isBetween, rule, widthValueInput, size }">
                    <div v-if="!isBetween">
                      <n-input-number
                        v-model:value="rule.value"
                        :min="0"
                        :max="120"
                        :placeholder="t('app.placeholders.age')"
                        :style="{ width: `${widthValueInput}px` }"
                        :size="size"
                      />
                    </div>
                    <div v-else style="display: flex; align-items: center; gap: 8px">
                      <n-input-number
                        v-model:value="rule.value[0]"
                        :min="0"
                        :max="120"
                        :placeholder="t('app.placeholders.min')"
                        clearable
                        :style="{ width: `${widthValueInput / 2 - 8}px` }"
                        :size="size"
                      />
                      <span style="color: #71717a">{{ t('app.to') }}</span>
                      <n-input-number
                        v-model:value="rule.value[1]"
                        :min="0"
                        :max="120"
                        :placeholder="t('app.placeholders.max')"
                        clearable
                        :style="{ width: `${widthValueInput / 2 - 8}px` }"
                        :size="size"
                      />
                    </div>
                  </template>

                  <template #birthdate="{ isBetween, rule, widthValueInput, size }">
                    <n-date-picker
                      v-model:value="rule.value"
                      :type="isBetween ? 'daterange' : 'date'"
                      :placeholder="t('app.placeholders.birthdate')"
                      value-format="yyyy-MM-dd"
                      :style="{ width: `${widthValueInput}px` }"
                      :size="size"
                    />
                  </template>

                  <template #birthdatetime="{ isBetween, rule, widthValueInput, size }">
                    <n-date-picker
                      v-model:value="rule.value"
                      :type="isBetween ? 'datetimerange' : 'datetime'"
                      :placeholder="t('app.placeholders.birthdatetime')"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      :style="{ width: `${widthValueInput + (isBetween ? 100 : 0)}px` }"
                      :size="size"
                    />
                  </template>
                </QueryBuilder>
              </n-card>
            </n-gi>

            <!-- Row 2: Output Queries -->
            <n-gi :span="24">
              <n-card
                :title="t('app.outputQueries')"
                class="output-card"
                :segmented="{ content: true, footer: true }"
              >
                <template #header-extra>
                  <n-tag type="success" size="small" round>{{ t('app.realTime') }}</n-tag>
                </template>
                <n-tabs type="line" animated>
                  <n-tab-pane name="sql" tab="SQL">
                    <pre class="code-block">{{ sqlOutput || `-- ${t('app.noRules')} --` }}</pre>
                  </n-tab-pane>
                  <n-tab-pane name="mongo" tab="MongoDB">
                    <pre class="code-block">{{ mongoOutput }}</pre>
                  </n-tab-pane>
                  <n-tab-pane name="mnp" tab="MNP">
                    <pre class="code-block">{{ mnpOutput || `-- ${t('app.noRules')} --` }}</pre>
                  </n-tab-pane>
                  <n-tab-pane name="json" tab="JSON">
                    <pre class="code-block">{{ JSON.stringify(rules, null, 2) }}</pre>
                  </n-tab-pane>
                </n-tabs>
                <template #footer>
                  <n-space vertical :size="16">
                    <div class="footer-hint">
                      {{ t('app.footerHint') }}
                    </div>
                    <n-divider style="margin: 8px 0" />
                    <n-space justify="space-between" align="center" :wrap="false">
                      <n-space vertical :size="4">
                        <div style="font-weight: 700; font-size: 1.1rem; color: #1e293b">
                          Mạc Tân (mvtcode)
                        </div>
                        <n-space :size="12">
                          <n-button
                            text
                            tag="a"
                            href="https://github.com/mvtcode"
                            target="_blank"
                            type="primary"
                            >GitHub</n-button
                          >
                          <n-button
                            text
                            tag="a"
                            href="https://www.facebook.com/mvt.hp.star"
                            target="_blank"
                            type="info"
                            >Facebook</n-button
                          >
                          <n-button
                            text
                            tag="a"
                            href="https://t.me/tanmac"
                            target="_blank"
                            type="success"
                            >Telegram</n-button
                          >
                        </n-space>
                      </n-space>
                      <n-space vertical align="end" :size="4">
                        <div style="color: #64748b; font-size: 0.9rem">
                          {{ t('app.emailLabel') }}:
                          <a
                            href="mailto:macvantan@gmail.com"
                            style="color: #18a058; text-decoration: none"
                            >macvantan@gmail.com</a
                          >
                        </div>
                        <!-- <div style="color: #64748b; font-size: 0.9rem">
                          Skype:
                          <code
                            style="
                              background: #f1f5f9;
                              padding: 2px 6px;
                              border-radius: 4px;
                              color: #475569;
                            "
                            >trai_12a1</code
                          >
                        </div> -->
                      </n-space>
                    </n-space>
                  </n-space>
                </template>
              </n-card>
            </n-gi>
          </n-grid>
        </n-layout-content>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
body {
  margin: 0;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  background-color: #f8fafc;
}

.layout-container {
  min-height: 100vh;
}

.header {
  height: 80px;
  background: #fff;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-box {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  padding: 24px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.builder-card,
.output-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.code-block {
  padding: 16px;
  background-color: #0f172a;
  border-radius: 8px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #e2e8f0;
  overflow: auto;
  max-height: 600px;
  white-space: pre-wrap;
  word-break: break-all;
}

.footer-hint {
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

:deep(.n-card-header__title) {
  font-weight: 700 !important;
  font-size: 1.25rem !important;
}

:deep(.n-tabs-tab__label) {
  font-weight: 600;
}
</style>
