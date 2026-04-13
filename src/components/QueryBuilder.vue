<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="query-builder" data-test="query-builder">
    <n-card>
      <div class="group">
        <!-- group header -->
        <div class="group-header">
          <div class="group-header-left">
            <div class="condition-switch">
              <n-switch
                v-model:value="isAndCondition"
                @update:value="onConditionChange"
                data-test="condition-switch"
              >
                <template #checked>{{ labelAnd || t('queryBuilder.and') }}</template>
                <template #unchecked>{{ labelOr || t('queryBuilder.or') }}</template>
              </n-switch>
            </div>
            <n-button
              type="primary"
              @click="addRule"
              :disabled="!canAddRule"
              data-test="add-rule"
            >
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
          </div>
          <div class="group-header-right">
            <div v-show="isRoot">(version: {{ version }})</div>
          </div>
        </div>
        <!-- end group header -->

    <!-- rules -->
    <div class="rules">
      <div
        v-for="(rule, index) in group.rules"
        :key="index"
        class="rule"
        :data-test="'rule-' + index"
      >
        <!-- Group rule -->
        <template v-if="isGroup(rule)">
          <QueryBuilder
            v-model="group.rules[index]"
            :filters="filters"
            :is-root="false"
            :max-depth="maxDepth"
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
            <template v-for="slotName in Object.keys($slots)" #[slotName]="slotData">
              <slot :name="slotName" v-bind="slotData" />
            </template>
          </QueryBuilder>
        </template>
            <!-- end Group rule -->

            <!-- Rule -->
            <template v-else>
              <div class="rule-container">
                <!-- Field select -->
                <div class="field-select-wrapper">
                  <n-select
                    v-model:value="castRule(rule).field"
                    :options="getAvailableFilterOptions(castRule(rule).field)"
                    :style="{ width: `${widthFieldSelect}px` }"
                    :placeholder="labelSelectField || t('queryBuilder.selectField')"
                    @update:value="onFieldChange(castRule(rule))"
                    data-test="field-select"
                    clearable
                  />
                  <div 
                    v-if="getFilter(castRule(rule).field)?.maxOccurrences && getOccurrences(castRule(rule).field) >= (getFilter(castRule(rule).field)?.maxOccurrences || 0)"
                    class="validation-info"
                  >
                    {{ t('queryBuilder.maxOccurrencesReached', { max: getFilter(castRule(rule).field)?.maxOccurrences }) }}
                  </div>
                </div>
                <!-- end Field select -->
                <!-- Operator select -->
                <n-select
                  v-model:value="castRule(rule).operator"
                  :options="getOperatorOptions(castRule(rule).field)"
                  :style="{ width: `${widthOperatorSelect}px` }"
                  :placeholder="labelSelectOperator || t('queryBuilder.selectOperator')"
                  @update:value="onOperatorChange(castRule(rule))"
                  data-test="operator-select"
                  clearable
                />
                <!-- end Operator select -->
                <!-- Value input -->
                <slot
                  :name="castRule(rule).field"
                  :filter="getFilter(castRule(rule).field)"
                  :operator="castRule(rule).operator"
                  :value="castRule(rule).value"
                  :isBetween="isBetweenOperator(castRule(rule).operator)"
                  :rule="castRule(rule)"
                  :index="index"
                  :widthValueInput="widthValueInput"
                >
                  <div class="value-input-container">
                    <!-- Between Inputs -->
                    <template v-if="isBetweenOperator(castRule(rule).operator)">
                      <div class="between-inputs">
                        <component
                          :is="getInputComponent(castRule(rule).field)"
                          v-bind="getInputProps(castRule(rule).field)"
                          :value="getValueAtIndex(castRule(rule).value, 0)"
                          :placeholder="labelFrom || t('queryBuilder.from')"
                          :style="{ width: `${widthValueInput / 2 - 8}px` }"
                          data-test="value-input-from"
                          @update:value="handleValueUpdate(castRule(rule), $event, 0)"
                        />
                        <span class="between-separator">{{ t('queryBuilder.to') }}</span>
                        <component
                          :is="getInputComponent(castRule(rule).field)"
                          v-bind="getInputProps(castRule(rule).field)"
                          :value="getValueAtIndex(castRule(rule).value, 1)"
                          :placeholder="labelTo || t('queryBuilder.to')"
                          :style="{ width: `${widthValueInput / 2 - 8}px` }"
                          data-test="value-input-to"
                          @update:value="handleValueUpdate(castRule(rule), $event, 1)"
                        />
                      </div>
                    </template>

                    <!-- Single Input -->
                    <template v-else-if="!hasNoValueOperator(castRule(rule).operator)">
                      <component
                        :is="getInputComponent(castRule(rule).field)"
                        v-bind="getFilteredInputProps(castRule(rule))"
                        :placeholder="labelEnterValue || t('queryBuilder.enterValue')"
                        :style="{ width: `${widthValueInput}px` }"
                        clearable
                        data-test="value-input"
                        @update:value="handleValueUpdate(castRule(rule), $event)"
                        @update:checked="handleValueUpdate(castRule(rule), $event)"
                      >
                        <template v-if="getFilter(castRule(rule).field)?.type === FilterType.BOOLEAN">
                          {{ getFilter(castRule(rule).field)?.label }}
                        </template>
                      </component>
                    </template>
                  </div>
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
              </div>
            </template>
            <!-- end Rule -->
          </div>
        </div>
        <!-- end rules -->
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NCard, NSwitch, NButton, NSelect, NInput, NIcon, NInputNumber, NDatePicker, NCheckbox } from 'naive-ui'
import { Add as AddIcon, Folder as FolderAddIcon, Trash as TrashIcon } from '@vicons/ionicons5'
import type {
  QueryBuilderGroup,
  QueryBuilderRule,
  QueryBuilderFilter,
  QueryBuilderValue,
} from '../types/querybuilder'
import { FilterType, Operator, OperatorText } from '../types/querybuilder'

const version = '1.1.0'

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

// Map để lưu trữ operator trước đó của mỗi rule
const previousOperators = new Map<string, Operator>()

const group = computed<QueryBuilderGroup>(() => {
  return props.modelValue as QueryBuilderGroup
})

const isGroup = (rule: QueryBuilderRule | QueryBuilderGroup): rule is QueryBuilderGroup => {
  return 'condition' in rule
}

const castRule = (rule: QueryBuilderRule | QueryBuilderGroup): QueryBuilderRule => {
  return rule as QueryBuilderRule
}

watch(
  () => group.value.rules,
  (rules) => {
    rules.forEach((rule) => {
      if (!isGroup(rule)) {
        if (rule.operator === Operator.BETWEEN || rule.operator === Operator.NOT_BETWEEN) {
          if (!Array.isArray(rule.value)) {
            rule.value = [0, 0]
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
  emit('update:modelValue', group.value)
}

const onFieldChange = (rule: QueryBuilderRule) => {
  rule.operator = getOperators(rule.field)[0]
  if ([Operator.BETWEEN, Operator.NOT_BETWEEN].includes(rule.operator)) {
    rule.value = [undefined, undefined]
  } else {
    rule.value = undefined
  }
  emit('update:modelValue', group.value)
}

const onOperatorChange = (rule: QueryBuilderRule) => {
  // Lấy operator trước đó từ Map
  const previousOperator = previousOperators.get(rule.id)

  // Kiểm tra xem có sự chuyển đổi giữa các group không
  const isBetweenGroup = [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(rule.operator)
  const wasBetweenGroup = previousOperator
    ? [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(previousOperator)
    : false

  // Chỉ reset value khi có sự chuyển đổi giữa các group khác nhau
  if (isBetweenGroup !== wasBetweenGroup) {
    if (isBetweenGroup) {
      rule.value = [undefined, undefined]
    } else {
      rule.value = undefined
    }
  }

  // Lưu operator hiện tại làm previous cho lần sau
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

const getInputComponent = (field: string) => {
  const filter = getFilter(field)
  if (!filter) return NInput

  if (filter.input === 'select' || filter.values) return NSelect
  if (filter.input === 'date' || filter.type === FilterType.DATE) return NDatePicker
  if (filter.input === 'number' || filter.type === FilterType.NUMBER || filter.type === FilterType.INTEGER)
    return NInputNumber
  if (filter.input === 'checkbox' || filter.type === FilterType.BOOLEAN) return NCheckbox

  return NInput
}

const getInputProps = (field: string) => {
  const filter = getFilter(field)
  if (!filter) return {}

  const props: Record<string, any> = {}

  if (filter.input === 'select' || filter.values) {
    props.options = filter.values?.map((v) => ({ label: v.text, value: v.value }))
    props.multiple = [Operator.IN, Operator.NOT_IN].includes(getRuleByField(field)?.operator as Operator)
  }

  if (filter.input === 'date' || filter.type === FilterType.DATE) {
    props.type = 'date'
    props.format = filter.validation?.format || 'yyyy-MM-dd'
  }

  if (
    filter.input === 'number' ||
    filter.type === FilterType.NUMBER ||
    filter.type === FilterType.INTEGER
  ) {
    props.min = filter.validation?.min
    props.max = filter.validation?.max
    props.precision = filter.type === FilterType.INTEGER ? 0 : undefined
  }

  return props
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
  return { ...baseProps, value: rule.value }
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

    if ([Operator.BETWEEN, Operator.NOT_BETWEEN].includes(operator)) {
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

    // Khởi tạo previous operator cho rule mới
    previousOperators.set(rule.id, operator)

    group.value.rules.push(rule)
    emit('update:modelValue', group.value)
  }
}

const addGroup = () => {
  const newGroup: QueryBuilderGroup = {
    condition: 'AND',
    rules: [],
  }
  group.value.rules.push(newGroup)
  emit('update:modelValue', group.value)
}

const removeRule = (index: number) => {
  const rule = group.value.rules[index]
  if (!isGroup(rule)) {
    // Xóa previous operator khỏi Map
    previousOperators.delete(rule.id)
  }
  group.value.rules.splice(index, 1)
  emit('update:modelValue', group.value)
}

const removeGroup = () => {
  emit('remove')
}

const canAddGroup = computed(() => {
  if (props.maxDepth === 0) return true
  if (props.maxDepth === 1) return false

  // Tính toán độ sâu hiện tại của group
  const calculateDepth = (group: QueryBuilderGroup): number => {
    let maxDepth = 0
    for (const rule of group.rules) {
      if (isGroup(rule)) {
        const depth = calculateDepth(rule)
        maxDepth = Math.max(maxDepth, depth)
      }
    }
    return maxDepth + 1
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

.group-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.group-header-left {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.group-header-right {
  display: flex;
  gap: 1rem;
  margin-left: auto;
  color: #a1a1aa;
  font-size: 0.875rem;
}

.condition-switch {
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
}

.rules {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-left: 0.5rem;
  border-left: 2px solid #e4e4e7;
  margin-left: 0.5rem;
}

.value-input-container {
  display: flex;
  align-items: center;
}

.between-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.between-separator {
  color: #71717a;
  font-size: 0.875rem;
}

.field-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.validation-info {
  font-size: 11px;
  color: #f0a020;
  margin-left: 4px;
}

:deep(.n-card) {
  border-radius: 16px;
  border: 1px solid #e4e4e7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-card:hover) {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
}

:deep(.n-card-header) {
  padding-bottom: 0;
}
</style>
