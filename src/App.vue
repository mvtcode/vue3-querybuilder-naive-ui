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
    NDatePicker,
    NInput,
    NCheckbox,
    NGrid,
    NGi,
    NDivider,
  } from 'naive-ui'
  import { Refresh as RefreshIcon, Code as CodeIcon, Globe as GlobeIcon } from '@vicons/ionicons5'
  import QueryBuilder from './components/QueryBuilder.vue'
  import type { QueryBuilderGroup, QueryBuilderFilter, QueryBuilderRule } from './types/querybuilder'
  import { FilterType, Operator } from './types/querybuilder'
  import { toSQL, toMongo, toMnpQuery } from './utils/query-converter'

  const { locale, t } = useI18n()

  const rules = ref<QueryBuilderGroup>({
    condition: 'AND',
    rules: [],
  })

  const filters: QueryBuilderFilter[] = [
    {
      field: 'name',
      label: 'Name',
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
        Operator.IN,
        Operator.NOT_IN,
      ],
    },
    {
      field: 'email',
      label: 'Email',
      type: FilterType.EMAIL,
      operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.CONTAINS, Operator.NOT_CONTAINS, Operator.IS_EMPTY, Operator.IS_NOT_EMPTY],
      input: 'email',
    },
    {
      field: 'age',
      label: 'Age',
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
        Operator.IN,
        Operator.NOT_IN,
      ],
    },
    {
      field: 'birthdate',
      label: 'Birth Date',
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
    },
    {
      field: 'birthdatetime',
      label: 'Birth DateTime',
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
      label: 'Active',
      type: FilterType.BOOLEAN,
      input: 'checkbox',
    },
    {
      field: 'status',
      label: 'Status',
      type: FilterType.STRING,
      input: 'select',
      value: 'pending',
      operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.IN, Operator.NOT_IN, Operator.IS_EMPTY, Operator.IS_NOT_EMPTY],
      values: [
        { text: 'Pending', value: 'pending' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
    },
  ]

  // const statusOptions = [
  //   { label: 'Pending', value: 'pending' },
  //   { label: 'Completed', value: 'completed' },
  //   { label: 'Cancelled', value: 'cancelled' },
  // ]

  const langOptions = [
    { label: 'Tiếng Việt', value: 'vi' },
    { label: 'English', value: 'en' },
  ]

  const sqlOutput = computed(() => toSQL(rules.value))
  const mongoOutput = computed(() => JSON.stringify(toMongo(rules.value), null, 2))
  const mnpOutput = computed(() => toMnpQuery(rules.value, filters))

  const resetRules = () => {
    rules.value = {
      condition: 'AND',
      rules: [],
    }
  }

  const castRule = (rule: any): QueryBuilderRule => rule

  const getRuleValue = (rule: any, index?: number): any => {
    const r = castRule(rule)
    if (index !== undefined) {
      return Array.isArray(r.value) ? r.value[index] : undefined
    }
    return r.value
  }

  const updateRuleValue = (rule: any, val: any, index?: number) => {
    const r = castRule(rule)
    if (index !== undefined) {
      if (!Array.isArray(r.value)) {
        r.value = [undefined, undefined]
      }
      r.value[index] = val
    } else {
      r.value = val
    }
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
                Vue 3 QueryBuilder
              </n-gradient-text>
              <n-tag type="primary" size="small" round quaternary style="margin-left: 8px">Naive UI</n-tag>
            </n-space>
            <n-space align="center" :size="20">
              <n-select
                v-model:value="locale"
                :options="langOptions"
                style="width: 140px"
                size="medium"
              >
                <template #prefix>
                  <n-icon><GlobeIcon /></n-icon>
                </template>
              </n-select>
              <n-button type="error" ghost @click="resetRules" size="medium">
                <template #icon>
                  <n-icon><RefreshIcon /></n-icon>
                </template>
                {{ t('queryBuilder.reset') }}
              </n-button>
            </n-space>
          </n-space>
        </n-layout-header>

        <n-layout-content class="content">
          <n-grid :cols="24" :x-gap="12" :y-gap="24">
            <!-- Row 1: Query Builder -->
            <n-gi :span="24">
              <n-card :title="t('queryBuilder.condition')" class="builder-card">
                <QueryBuilder v-model="rules" :filters="filters" :max-depth="3">
                  <!-- Example of custom slot for status -->
                  <template #status="{ rule, widthValueInput, filter, operator }">
                    <n-select
                      v-if="![Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(operator)"
                      :value="getRuleValue(rule)"
                      :options="filter?.values?.map(v => ({ label: v.text, value: v.value }))"
                      :multiple="[Operator.IN, Operator.NOT_IN].includes(castRule(rule).operator)"
                      max-tag-count="responsive"
                      clearable
                      :style="{ width: `${widthValueInput}px` }"
                      @update:value="updateRuleValue(rule, $event)"
                    />
                  </template>

                  <!-- Example of custom slot for age with different UI -->
                  <template #age="{ isBetween, rule, widthValueInput, operator }">
                    <template v-if="![Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(operator)">
                      <div v-if="!isBetween">
                         <n-input-number
                          :value="getRuleValue(rule)"
                          :min="0"
                          :max="120"
                          placeholder="Age"
                          clearable
                          :style="{ width: `${widthValueInput}px` }"
                          @update:value="updateRuleValue(rule, $event)"
                        />
                      </div>
                      <div v-else style="display: flex; align-items: center; gap: 8px">
                        <n-input-number
                          :value="getRuleValue(rule, 0)"
                          :min="0"
                          :max="120"
                          placeholder="Min"
                          clearable
                          :style="{ width: `${widthValueInput / 2 - 8}px` }"
                          @update:value="updateRuleValue(rule, $event, 0)"
                        />
                        <span style="color: #71717a">to</span>
                        <n-input-number
                          :value="getRuleValue(rule, 1)"
                          :min="0"
                          :max="120"
                          placeholder="Max"
                          clearable
                          :style="{ width: `${widthValueInput / 2 - 8}px` }"
                          @update:value="updateRuleValue(rule, $event, 1)"
                        />
                      </div>
                    </template>
                  </template>
                </QueryBuilder>
              </n-card>
            </n-gi>

            <!-- Row 2: Output Queries -->
            <n-gi :span="24">
              <n-card
                title="Output Queries"
                class="output-card"
                :segmented="{ content: true, footer: true }"
              >
                <template #header-extra>
                  <n-tag type="success" size="small" round>Real-time</n-tag>
                </template>
                <n-tabs type="line" animated>
                  <n-tab-pane name="sql" tab="SQL">
                    <pre class="code-block">{{ sqlOutput || '-- No rules added yet --' }}</pre>
                  </n-tab-pane>
                  <n-tab-pane name="mongo" tab="MongoDB">
                    <pre class="code-block">{{ mongoOutput }}</pre>
                  </n-tab-pane>
                  <n-tab-pane name="mnp" tab="MNP">
                    <pre class="code-block">{{ mnpOutput || '-- No rules added yet --' }}</pre>
                  </n-tab-pane>
                  <n-tab-pane name="json" tab="JSON">
                    <pre class="code-block">{{ JSON.stringify(rules, null, 2) }}</pre>
                  </n-tab-pane>
                </n-tabs>
                <template #footer>
                  <n-space vertical :size="16">
                    <div class="footer-hint">
                      Generated queries are automatically updated as you build.
                    </div>
                    <n-divider style="margin: 8px 0" />
                    <n-space justify="space-between" align="center" :wrap="false">
                      <n-space vertical :size="4">
                        <div style="font-weight: 700; font-size: 1.1rem; color: #1e293b">Mạc Tân (mvtcode)</div>
                        <n-space :size="12">
                          <n-button text tag="a" href="https://github.com/mvtcode" target="_blank" type="primary">GitHub</n-button>
                          <n-button text tag="a" href="https://www.facebook.com/mvt.hp.star" target="_blank" type="info">Facebook</n-button>
                          <n-button text tag="a" href="https://t.me/tanmac" target="_blank" type="success">Telegram</n-button>
                        </n-space>
                      </n-space>
                      <n-space vertical align="end" :size="4">
                        <div style="color: #64748b; font-size: 0.9rem">
                          Email: <a href="mailto:tanmv@mpos.vn" style="color: #18a058; text-decoration: none">tanmv@mpos.vn</a> | 
                          <a href="mailto:macvantan@gmail.com" style="color: #18a058; text-decoration: none">macvantan@gmail.com</a>
                        </div>
                        <div style="color: #64748b; font-size: 0.9rem">
                          Skype: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569">trai_12a1</code>
                        </div>
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
