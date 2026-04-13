<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="query-builder" data-test="query-builder">
    <n-card :bordered="!isRoot" :class="{ 'root-card': isRoot }">
      <div class="group">
        <!-- group header -->
        <n-flex justify="space-between" align="center" style="margin-bottom: 1.5rem">
          <n-flex align="center" :size="[12, 12]">
            <n-switch
              v-model:value="isAndCondition"
              @update:value="onConditionChange"
              data-test="condition-switch"
            >
              <template #checked>{{ labelAnd || t('queryBuilder.and') }}</template>
              <template #unchecked>{{ labelOr || t('queryBuilder.or') }}</template>
            </n-switch>
            <n-button type="primary" @click="addRule" :disabled="!canAddRule" data-test="add-rule">
              <template #icon>
                <n-icon><AddIcon /></n-icon>
              </template>
              {{ labelAddRule || t('queryBuilder.addRule') }}
            </n-button>
            <n-button
              secondary
              type="primary"
              @click="addGroup"
              :disabled="!canAddGroup"
              data-test="add-group"
            >
              <template #icon>
                <n-icon><FolderAddIcon /></n-icon>
              </template>
              {{ labelAddGroup || t('queryBuilder.addGroup') }}
            </n-button>
            <n-button
              quaternary
              type="error"
              @click="removeGroup"
              v-if="!isRoot"
              data-test="remove-group"
            >
              <template #icon>
                <n-icon><TrashIcon /></n-icon>
              </template>
              {{ labelRemoveGroup || t('queryBuilder.removeGroup') }}
            </n-button>
          </n-flex>
          <div v-show="isRoot">
            <n-text depth="3" style="font-size: 0.875rem">(version: {{ version }})</n-text>
          </div>
        </n-flex>
        <!-- end group header -->

        <!-- rules -->
        <n-flex vertical :size="[16, 16]">
          <div v-for="(rule, index) in group.rules" :key="index" :data-test="'rule-' + index">
            <!-- Group rule -->
            <template v-if="isGroup(rule)">
              <QueryBuilder
                v-model="group.rules[index]"
                :filters="filters"
                :is-root="false"
                :max-depth="maxDepth > 0 ? maxDepth - 1 : 0"
                :label-add-rule="labelAddRule"
                :label-add-group="labelAddGroup"
                :label-remove-group="labelRemoveGroup"
                :label-from="labelFrom"
                :label-to="labelTo"
                :label-and="labelAnd"
                :label-or="labelOr"
                :label-select-field="labelSelectField"
                :label-select-operator="labelSelectOperator"
                :label-enter-value="labelEnterValue"
                :label-remove-rule="labelRemoveRule"
                :label-condition="labelCondition"
                :width-field-select="widthFieldSelect"
                :width-operator-select="widthOperatorSelect"
                :width-value-input="widthValueInput"
                @remove="removeRule(index)"
              >
                <template v-for="(_, name) in $slots" #[name]="slotData: any">
                  <slot :name="name" v-bind="slotData" />
                </template>
              </QueryBuilder>
            </template>
            <!-- end Group rule -->

            <!-- Rule -->
            <template v-else>
              <n-flex align="center" :size="[12, 12]" style="padding: 0.5rem 0">
                <!-- Field select -->
                <n-flex vertical :size="[4, 4]">
                  <n-select
                    v-model:value="rule.field"
                    :options="getAvailableFilterOptions(rule.field)"
                    :style="{ width: `${widthFieldSelect}px` }"
                    :placeholder="labelSelectField || t('queryBuilder.selectField')"
                    @update:value="onFieldChange(rule)"
                    data-test="field-select"
                  />
                  <n-text
                    v-if="
                      getFilter(rule.field)?.maxOccurrences &&
                      getOccurrences(rule.field) >= (getFilter(rule.field)?.maxOccurrences || 0)
                    "
                    depth="3"
                    type="warning"
                    style="font-size: 11px; margin-left: 4px"
                  >
                    {{
                      t('queryBuilder.maxOccurrencesReached', {
                        max: getFilter(rule.field)?.maxOccurrences,
                      })
                    }}
                  </n-text>
                </n-flex>
                <!-- end Field select -->

                <!-- Operator select -->
                <n-select
                  v-model:value="rule.operator"
                  :options="getOperatorOptions(rule.field)"
                  :style="{ width: `${widthOperatorSelect}px` }"
                  :placeholder="labelSelectOperator || t('queryBuilder.selectOperator')"
                  @update:value="onOperatorChange(rule)"
                  data-test="operator-select"
                />
                <!-- end Operator select -->

                <!-- Value input -->
                <slot
                  :name="rule.field"
                  :filter="getFilter(rule.field)"
                  :operator="rule.operator"
                  :value="rule.value"
                  :isBetween="isBetweenOperator(rule.operator)"
                  :rule="rule"
                  :index="index"
                  :widthValueInput="widthValueInput"
                >
                  <n-flex align="center">
                    <!-- Between Inputs -->
                    <template v-if="isBetweenOperator(rule.operator)">
                      <n-flex align="center" :size="[8, 8]">
                        <component
                          :is="getInputComponent(rule.field)"
                          v-bind="getDynamicInputProps(rule, 0)"
                          :placeholder="labelFrom || t('queryBuilder.from')"
                          :style="{ width: `${widthValueInput / 2 - 8}px` }"
                          data-test="value-input-from"
                          @update:value="handleValueUpdate(rule, $event, 0)"
                          @update:formatted-value="handleValueUpdate(rule, $event, 0)"
                        />
                        <n-text depth="3" style="font-size: 0.875rem">{{
                          labelTo || t('queryBuilder.to')
                        }}</n-text>
                        <component
                          :is="getInputComponent(rule.field)"
                          v-bind="getDynamicInputProps(rule, 1)"
                          :placeholder="labelTo || t('queryBuilder.to')"
                          :style="{ width: `${widthValueInput / 2 - 8}px` }"
                          data-test="value-input-to"
                          @update:value="handleValueUpdate(rule, $event, 1)"
                          @update:formatted-value="handleValueUpdate(rule, $event, 1)"
                        />
                      </n-flex>
                    </template>

                    <!-- Single Input -->
                    <template v-else-if="!hasNoValueOperator(rule.operator)">
                      <component
                        :is="getInputComponent(rule.field)"
                        v-bind="getFilteredInputProps(rule)"
                        :placeholder="labelEnterValue || t('queryBuilder.enterValue')"
                        :style="{ width: `${widthValueInput}px` }"
                        clearable
                        data-test="value-input"
                        @update:value="handleValueUpdate(rule, $event)"
                        @update:checked="handleValueUpdate(rule, $event)"
                        @update:formatted-value="handleValueUpdate(rule, $event)"
                      >
                        <template v-if="getFilter(rule.field)?.type === FilterType.BOOLEAN">
                          {{ getFilter(rule.field)?.label }}
                        </template>
                      </component>
                    </template>
                  </n-flex>
                </slot>
                <!-- end Value input -->

                <!-- Remove rule -->
                <n-button
                  circle
                  quaternary
                  type="error"
                  @click="removeRule(index)"
                  data-test="remove-rule"
                >
                  <template #icon>
                    <n-icon><TrashIcon /></n-icon>
                  </template>
                </n-button>
                <!-- end Remove rule -->
              </n-flex>
            </template>
            <!-- end Rule -->
          </div>
        </n-flex>
        <!-- end rules -->
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NCard,
  NSwitch,
  NButton,
  NSelect,
  NInput,
  NIcon,
  NInputNumber,
  NDatePicker,
  NCheckbox,
  NFlex,
  NText,
} from 'naive-ui'
import { Add as AddIcon, FolderOpen as FolderAddIcon, Trash as TrashIcon } from '@vicons/ionicons5'
import type {
  QueryBuilderGroup,
  QueryBuilderRule,
  QueryBuilderFilter,
  QueryBuilderValue,
} from '../types/querybuilder'
import { FilterType, Operator, OperatorText } from '../types/querybuilder'

import pkg from '../../package.json'

const version = pkg.version

interface Props {
  modelValue: QueryBuilderGroup | QueryBuilderRule
  filters: QueryBuilderFilter[]
  isRoot?: boolean
  maxDepth?: number
  labelAddRule?: string
  labelAddGroup?: string
  labelRemoveGroup?: string
  labelFrom?: string
  labelTo?: string
  labelAnd?: string
  labelOr?: string
  labelSelectField?: string
  labelSelectOperator?: string
  labelEnterValue?: string
  labelRemoveRule?: string
  labelCondition?: string
  widthFieldSelect?: number
  widthOperatorSelect?: number
  widthValueInput?: number
}

const props = withDefaults(defineProps<Props>(), {
  isRoot: true,
  widthFieldSelect: 200,
  widthOperatorSelect: 180,
  widthValueInput: 250,
  maxDepth: 0,
})

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'update:modelValue', value: QueryBuilderGroup | QueryBuilderRule): void
  (e: 'remove'): void
}>()

// Map to store previous operator of each rule for transition handling
const previousOperators = new Map<string, Operator>()

const group = computed<QueryBuilderGroup>(() => {
  return props.modelValue as QueryBuilderGroup
})

const isGroup = (rule: QueryBuilderRule | QueryBuilderGroup): rule is QueryBuilderGroup => {
  return 'condition' in rule
}

watch(
  () => group.value.rules,
  (rules) => {
    rules.forEach((rule) => {
      if (!isGroup(rule)) {
        if (rule.operator === Operator.BETWEEN || rule.operator === Operator.NOT_BETWEEN) {
          if (!Array.isArray(rule.value)) {
            rule.value = [undefined, undefined]
          }
        }
      }
    })
  },
  { deep: true, immediate: true },
)

const isAndCondition = computed({
  get: () => group.value.condition === 'AND',
  set: (value) => {
    group.value.condition = value ? 'AND' : 'OR'
  },
})

const onConditionChange = (value: boolean) => {
  group.value.condition = value ? 'AND' : 'OR'
  emit('update:modelValue', { ...group.value })
}

const onFieldChange = (rule: QueryBuilderRule) => {
  const operators = getOperators(rule.field)
  rule.operator = operators[0] || Operator.EQUAL

  if (isBetweenOperator(rule.operator)) {
    rule.value = [undefined, undefined]
  } else {
    const filter = getFilter(rule.field)
    rule.value = filter?.value !== undefined ? filter.value : undefined
  }
  emit('update:modelValue', { ...group.value })
}

const onOperatorChange = (rule: QueryBuilderRule) => {
  const previousOperator = previousOperators.get(rule.id)
  const isBetween = isBetweenOperator(rule.operator)
  const wasBetween = previousOperator ? isBetweenOperator(previousOperator) : false

  if (isBetween !== wasBetween) {
    if (isBetween) {
      rule.value = [undefined, undefined]
    } else {
      rule.value = undefined
    }
  }

  previousOperators.set(rule.id, rule.operator)
  emit('update:modelValue', { ...group.value })
}

const getOccurrences = (field: string): number => {
  return group.value.rules.filter(
    (rule: QueryBuilderRule | QueryBuilderGroup) => !isGroup(rule) && rule.field === field,
  ).length
}

const getFilter = (field: string): QueryBuilderFilter | undefined => {
  return props.filters.find((filter) => filter.field === field)
}

const getAvailableFilters = (currentField?: string): QueryBuilderFilter[] => {
  return props.filters.filter((filter) => {
    const occurrences = getOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return filter.field === currentField || occurrences < maxOccurrences
  })
}

const getAvailableFilterOptions = (currentField?: string) => {
  return getAvailableFilters(currentField).map((filter) => ({
    label: filter.label,
    value: filter.field,
  }))
}

const canAddRule = computed(() => {
  return props.filters.some((filter) => {
    const occurrences = getOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return occurrences < maxOccurrences
  })
})

const getOperators = (field: string): Operator[] => {
  const filter = getFilter(field)
  return filter?.operators || [Operator.EQUAL]
}

const getOperatorOptions = (field: string) => {
  return getOperators(field).map((operator) => ({
    label: t(OperatorText[operator]),
    value: operator,
  }))
}

const isBetweenOperator = (operator: Operator) => {
  return [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(operator)
}

const hasNoValueOperator = (operator: Operator) => {
  return [Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(operator)
}

const isDatePicker = (field: string) => {
  const filter = getFilter(field)
  return (
    filter?.input === 'date' ||
    filter?.type === FilterType.DATE ||
    filter?.type === FilterType.DATETIME
  )
}

const getInputComponent = (field: string) => {
  const filter = getFilter(field)
  if (!filter) return NInput

  if (filter.input === 'select' || filter.values) return NSelect
  if (
    filter.input === 'date' ||
    filter.type === FilterType.DATE ||
    filter.type === FilterType.DATETIME
  )
    return NDatePicker
  if (
    filter.input === 'number' ||
    filter.type === FilterType.NUMBER ||
    filter.type === FilterType.INTEGER
  )
    return NInputNumber
  if (filter.input === 'checkbox' || filter.type === FilterType.BOOLEAN) return NCheckbox

  return NInput
}

const getInputProps = (field: string) => {
  const filter = getFilter(field)
  if (!filter) return {}

  const inputProps: Record<string, any> = {}

  if (filter.input === 'select' || filter.values) {
    inputProps.options = filter.values?.map((v) => ({ label: v.text, value: v.value }))
    inputProps.multiple = [Operator.IN, Operator.NOT_IN].includes(
      getRuleByField(field)?.operator as Operator,
    )
    inputProps.maxTagCount = 'responsive'
  }

  if (
    filter.input === 'date' ||
    filter.type === FilterType.DATE ||
    filter.type === FilterType.DATETIME
  ) {
    inputProps.type = filter.type === FilterType.DATETIME ? 'datetime' : 'date'
    inputProps.format =
      filter.validation?.format ||
      (filter.type === FilterType.DATETIME ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd')
  }

  if (
    filter.input === 'number' ||
    filter.type === FilterType.NUMBER ||
    filter.type === FilterType.INTEGER
  ) {
    inputProps.min = filter.validation?.min
    inputProps.max = filter.validation?.max
    inputProps.precision = filter.type === FilterType.INTEGER ? 0 : undefined
  }

  return inputProps
}

const getValueAtIndex = (value: QueryBuilderValue, index: number): any => {
  if (Array.isArray(value)) {
    return value[index]
  }
  return undefined
}

const getFilteredInputProps = (rule: QueryBuilderRule) => {
  const filter = getFilter(rule.field)
  if (!filter) return {}

  const baseProps = getInputProps(rule.field)
  if (filter.type === FilterType.BOOLEAN || filter.input === 'checkbox') {
    return { ...baseProps, checked: rule.value }
  }
  if (isDatePicker(rule.field)) {
    return { ...baseProps, formattedValue: rule.value }
  }
  return { ...baseProps, value: rule.value }
}

const getDynamicInputProps = (rule: QueryBuilderRule, index: number) => {
  const baseProps = getInputProps(rule.field)
  const key = isDatePicker(rule.field) ? 'formattedValue' : 'value'
  return {
    ...baseProps,
    [key]: getValueAtIndex(rule.value, index),
  }
}

const getRuleByField = (field: string): QueryBuilderRule | undefined => {
  const findRule = (g: QueryBuilderGroup): QueryBuilderRule | undefined => {
    for (const r of g.rules) {
      if (isGroup(r)) {
        const found = findRule(r)
        if (found) return found
      } else if (r.field === field) {
        return r
      }
    }
    return undefined
  }
  return findRule(group.value)
}

const handleValueUpdate = (rule: QueryBuilderRule, value: unknown, index?: number) => {
  updateRuleValue(rule, value as QueryBuilderValue, index)
}

const updateRuleValue = (rule: QueryBuilderRule, value: QueryBuilderValue, index?: number) => {
  if (index !== undefined) {
    if (!Array.isArray(rule.value)) {
      rule.value = [undefined, undefined]
    }
    ;(rule.value as any[])[index] = value
  } else {
    rule.value = value
  }
  emit('update:modelValue', { ...group.value })
}

const addRule = () => {
  const availableFilter = props.filters.find((filter) => {
    const occurrences = getOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return occurrences < maxOccurrences
  })

  if (availableFilter) {
    const operator = getOperators(availableFilter.field)[0]
    let defaultValue: QueryBuilderValue

    if (isBetweenOperator(operator)) {
      defaultValue = [undefined, undefined]
    } else {
      defaultValue = availableFilter.value !== undefined ? availableFilter.value : undefined
    }

    const rule: QueryBuilderRule = {
      id: crypto.randomUUID(),
      field: availableFilter.field,
      operator: operator,
      value: defaultValue,
      error: undefined,
    }

    previousOperators.set(rule.id, operator)
    group.value.rules.push(rule)
    emit('update:modelValue', { ...group.value })
  }
}

const addGroup = () => {
  const newGroup: QueryBuilderGroup = {
    condition: 'AND',
    rules: [],
  }
  group.value.rules.push(newGroup)
  emit('update:modelValue', { ...group.value })
}

const removeRule = (index: number) => {
  const rule = group.value.rules[index]
  if (!isGroup(rule)) {
    previousOperators.delete(rule.id)
  }
  group.value.rules.splice(index, 1)
  emit('update:modelValue', { ...group.value })
}

const removeGroup = () => {
  emit('remove')
}

const canAddGroup = computed(() => {
  if (props.maxDepth === 0) return true
  if (props.maxDepth === 1) return false

  const calculateDepth = (g: QueryBuilderGroup): number => {
    let maxSubDepth = 0
    for (const rule of g.rules) {
      if (isGroup(rule)) {
        const depth = calculateDepth(rule)
        maxSubDepth = Math.max(maxSubDepth, depth)
      }
    }
    return maxSubDepth + 1
  }

  const currentDepth = calculateDepth(group.value)
  return currentDepth < props.maxDepth
})
</script>

<style scoped>
.query-builder {
  margin: 0;
}

.group {
  padding: 0;
}

:deep(.n-card) {
  border-radius: 12px;
  border-color: #e4e4e7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.root-card) {
  border: none;
  box-shadow: none;
}

:deep(.n-card:not(.root-card):hover) {
  border-color: #18a058;
}

:deep(.n-card-header) {
  padding-bottom: 0;
}
</style>
