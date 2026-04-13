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
} from 'naive-ui'
import { Refresh as RefreshIcon, Code as CodeIcon } from '@vicons/ionicons5'
import QueryBuilder from './components/QueryBuilder.vue'
import type { QueryBuilderGroup, QueryBuilderFilter, QueryBuilderRule } from './types/querybuilder'
import { FilterType, Operator } from './types/querybuilder'
import { toSQL, toMongo } from './utils/query-converter'

const { locale } = useI18n()

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
    ],
  },
  {
    field: 'email',
    label: 'Email',
    type: FilterType.EMAIL,
    operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.CONTAINS, Operator.NOT_CONTAINS],
    input: 'email',
  },
  {
    field: 'age',
    label: 'Age',
    type: FilterType.INTEGER,
    validation: {
      min: 0,
      max: 100,
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
    ],
  },
  {
    field: 'birthdate',
    label: 'Birth Date',
    type: FilterType.DATE,
    input: 'date',
    validation: {
      format: 'YYYY-MM-DD',
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
    operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.IN, Operator.NOT_IN],
  },
]

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
]

const langOptions = [
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'English', value: 'en' },
]

const sqlOutput = computed(() => toSQL(rules.value))
const mongoOutput = computed(() => JSON.stringify(toMongo(rules.value), null, 2))

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
                Vue 3 QueryBuilder (Naive UI)
              </n-gradient-text>
            </n-space>
            <n-space align="center" :size="20">
              <n-select
                v-model:value="locale"
                :options="langOptions"
                style="width: 140px"
                size="medium"
              />
              <n-button type="primary" ghost @click="resetRules" size="medium">
                <template #icon>
                  <n-icon><RefreshIcon /></n-icon>
                </template>
                Reset
              </n-button>
            </n-space>
          </n-space>
        </n-layout-header>

        <n-layout-content class="content">
          <div class="container">
            <div class="main-grid">
              <!-- Result card -->
              <div class="side-panel">
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
                    <n-tab-pane name="json" tab="JSON Structure">
                      <pre class="code-block">{{ JSON.stringify(rules, null, 2) }}</pre>
                    </n-tab-pane>
                  </n-tabs>
                  <template v-for="(_, name) in $slots" #[name]="slotData">
                    <slot :name="name" v-bind="slotData" />
                  </template>
                  <template #footer>
                    <div class="footer-hint">
                      Generated queries are automatically updated as you build.
                    </div>
                  </template>
                </n-card>
              </div>

              <!-- Main Query Builder -->
              <div class="builder-panel">
                <n-card title="Build Your Query" class="builder-card">
                  <QueryBuilder v-model="rules" :filters="filters">
                    <!-- Status is still custom to show NSelect multiple if needed, 
                         though QueryBuilder now supports select built-in -->
                    <template #status="{ rule, widthValueInput }">
                      <n-select
                        :value="getRuleValue(rule)"
                        :options="statusOptions"
                        :multiple="[Operator.IN, Operator.NOT_IN].includes(castRule(rule).operator)"
                        clearable
                        :style="{ width: `${widthValueInput}px` }"
                        @update:value="updateRuleValue(rule, $event)"
                      />
                    </template>

                    <!-- Demonstrating customized number input for age -->
                    <template #age="{ isBetween, rule, widthValueInput }">
                      <n-input-number
                        v-if="!isBetween"
                        :value="getRuleValue(rule)"
                        :min="0"
                        :max="120"
                        placeholder="Age"
                        clearable
                        :style="{ width: `${widthValueInput}px` }"
                        @update:value="updateRuleValue(rule, $event)"
                      />
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
                  </QueryBuilder>
                </n-card>
              </div>
            </div>
          </div>
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
  padding: 40px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.main-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
  align-items: start;
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

.builder-card,
.output-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  border: none;
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
  max-height: 500px;
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
</style>
