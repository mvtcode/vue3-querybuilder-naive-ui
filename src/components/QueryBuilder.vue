<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="query-builder" data-test="query-builder">
    <n-card>
      <div class="group">
        <!-- group header -->
        <n-flex justify="space-between" align="center" style="margin-bottom: 1rem">
          <n-flex align="center" :size="[12, 12]">
            <n-switch
              v-model:value="isAndCondition"
              @update:value="onConditionChange"
              data-test="condition-switch"
              :size="size"
            >
              <template #checked>{{ labelAnd || t('queryBuilder.and') }}</template>
              <template #unchecked>{{ labelOr || t('queryBuilder.or') }}</template>
            </n-switch>
            <n-button
              ghost
              type="primary"
              @click="addRule"
              :disabled="!canAddRule"
              data-test="add-rule"
              :size="size"
            >
              <template #icon>
                <n-icon><AddIcon /></n-icon>
              </template>
              {{ labelAddRule || t('queryBuilder.addRule') }}
            </n-button>
            <n-button
              ghost
              type="primary"
              @click="addGroup"
              :disabled="!canAddGroup"
              data-test="add-group"
              :size="size"
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
              :size="size"
            >
              <template #icon>
                <n-icon><TrashIcon /></n-icon>
              </template>
              {{ labelRemoveGroup || t('queryBuilder.removeGroup') }}
            </n-button>
          </n-flex>
          <!-- <div v-show="isRoot">
            <n-text depth="3" style="font-size: 0.875rem">(version: {{ version }})</n-text>
          </div> -->
        </n-flex>
        <!-- end group header -->

        <!-- rules -->
        <n-flex vertical :size="[16, 16]">
          <div v-for="(rule, index) in group.rules" :key="index" :data-test="'rule-' + index">
            <!-- Group rule -->
            <template v-if="isGroup(rule)">
              <QueryBuilder
                :model-value="asGroup(group.rules[index])"
                @update:model-value="(val) => (group.rules[index] = val)"
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
                :size="size"
                @remove="removeRule(index)"
              >
                <template v-for="(_, name) in $slots" #[name]="slotData">
                  <slot :name="name" v-bind="slotData" />
                </template>
              </QueryBuilder>
            </template>
            <!-- end Group rule -->

            <!-- Rule -->
            <template v-else>
              <n-flex align="center" :size="[12, 12]" style="padding: 0">
                <!-- Field select -->
                <n-select
                  v-model:value="rule.field"
                  :options="getAvailableFilters(rule.field)"
                  :style="{ width: `${widthFieldSelect}px` }"
                  :key="rule.field"
                  label-field="label"
                  value-field="field"
                  :placeholder="labelSelectField || t('queryBuilder.selectField')"
                  @update:value="onFieldChange(rule)"
                  data-test="field-select"
                  :size="size"
                />
                <!-- end Field select -->

                <!-- Operator select -->
                <n-select
                  v-model:value="rule.operator"
                  :options="getOperators(rule.field)"
                  :style="{ width: `${widthOperatorSelect}px` }"
                  label-field="label"
                  value-field="value"
                  :placeholder="labelSelectOperator || t('queryBuilder.selectOperator')"
                  @update:value="onOperatorChange(rule)"
                  data-test="operator-select"
                  :size="size"
                />
                <!-- end Operator select -->

                <!-- Value input -->
                <slot
                  :name="rule.field"
                  :operator="rule.operator"
                  :value="rule.value"
                  :isBetween="[Operator.BETWEEN, Operator.NOT_BETWEEN].includes(rule.operator)"
                  :rule="rule"
                  :index="index"
                  :widthValueInput="widthValueInput"
                  :size="size"
                  :filter="mapFields[rule.field]"
                  v-if="![Operator.IS_EMPTY, Operator.IS_NOT_EMPTY].includes(rule.operator)"
                >
                  <n-input
                    :value="asString(rule.value)"
                    @update:value="(val) => (rule.value = val)"
                    :style="{ width: `${widthValueInput}px` }"
                    :placeholder="labelEnterValue || t('queryBuilder.enterValue')"
                    clearable
                    :size="size"
                  />
                </slot>
                <!-- end Value input -->

                <!-- Remove rule -->
                <n-button
                  circle
                  quaternary
                  type="error"
                  @click="removeRule(index)"
                  data-test="remove-rule"
                  :size="size"
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NCard, NSwitch, NButton, NSelect, NInput, NIcon, NFlex } from 'naive-ui'
import { Add as AddIcon, FolderOpen as FolderAddIcon, Trash as TrashIcon } from '@vicons/ionicons5'
import type {
  QueryBuilderGroup,
  QueryBuilderRule,
  QueryBuilderFilter,
  QueryBuilderValue,
} from '../types/querybuilder'
import { FilterType, Operator, OperatorText } from '../types/querybuilder'

interface Props {
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
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  isRoot: true,
  widthFieldSelect: 200,
  widthOperatorSelect: 180,
  widthValueInput: 250,
  maxDepth: 0,
  size: 'medium',
})

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'remove'): void
}>()

const mapFields = computed(() => {
  return props.filters.reduce(
    (map, filter) => {
      map[filter.field] = filter
      return map
    },
    {} as Record<string, QueryBuilderFilter>,
  )
})

// Map để lưu trữ operator trước đó của mỗi rule
const previousOperators = new Map<string, Operator>()

const group = defineModel<QueryBuilderGroup>({
  default: {
    condition: 'AND',
    rules: [],
  },
})

const isGroup = (rule: QueryBuilderRule | QueryBuilderGroup): rule is QueryBuilderGroup => {
  return 'condition' in rule
}

const asGroup = (rule: QueryBuilderRule | QueryBuilderGroup): QueryBuilderGroup => {
  return rule as QueryBuilderGroup
}

const asString = (value: QueryBuilderValue): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const isBetweenOperator = (operator: Operator): boolean => {
  return [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(operator)
}

const isInOperator = (operator: Operator): boolean => {
  return [Operator.IN, Operator.NOT_IN].includes(operator)
}

const getDefaultValue = (rule: QueryBuilderRule) => {
  const filter = mapFields.value[rule.field]
  if (isBetweenOperator(rule.operator)) {
    switch (filter?.type) {
      case FilterType.DATE:
      case FilterType.DATETIME:
        return null
      default:
        return []
    }
  } else if (isInOperator(rule.operator)) {
    return []
  } else {
    if (filter?.value) {
      return filter.value
    } else {
      switch (filter?.type) {
        case FilterType.INTEGER:
        case FilterType.NUMBER:
          return 0
        case FilterType.STRING:
        case FilterType.EMAIL:
          return ''
        case FilterType.BOOLEAN:
          return false
        case FilterType.DATE:
        case FilterType.DATETIME:
          return null
        default:
          return null
      }
    }
  }
}

const isAndCondition = computed({
  get: () => group.value.condition === 'AND',
  set: (value) => {
    group.value.condition = value ? 'AND' : 'OR'
  },
})

const onConditionChange = (value: boolean) => {
  group.value.condition = value ? 'AND' : 'OR'
}

const onFieldChange = (rule: QueryBuilderRule) => {
  rule.value = getDefaultValue(rule)
  rule.operator = getOperators.value(rule.field)[0].value
}

const onOperatorChange = (rule: QueryBuilderRule) => {
  // Lấy operator trước đó từ Map
  const previousOperator = previousOperators.get(rule.id)

  // Kiểm tra xem có sự chuyển đổi giữa các group không
  const isBetweenGroup = [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(rule.operator)
  const wasBetweenGroup = previousOperator
    ? [Operator.BETWEEN, Operator.NOT_BETWEEN].includes(previousOperator)
    : false
  const isInGroup = previousOperator
    ? [Operator.IN, Operator.NOT_IN].includes(rule.operator)
    : false
  const wasInGroup = previousOperator
    ? [Operator.IN, Operator.NOT_IN].includes(previousOperator)
    : false

  // Chỉ reset value khi có sự chuyển đổi giữa các group khác nhau
  if (isBetweenGroup !== wasBetweenGroup || isInGroup !== wasInGroup) {
    rule.value = getDefaultValue(rule)
  }

  // Lưu operator hiện tại làm previous cho lần sau
  previousOperators.set(rule.id, rule.operator)
}

const getOccurrences = (field: string): number => {
  return group.value.rules.filter(
    (rule: QueryBuilderRule | QueryBuilderGroup) => !isGroup(rule) && rule.field === field,
  ).length
}

const getAvailableFilters = (currentField?: string): { field: string; label: string }[] => {
  return props.filters
    .filter((filter) => {
      const occurrences = getOccurrences(filter.field)
      const maxOccurrences = filter.maxOccurrences || 1
      return filter.field === currentField || occurrences < maxOccurrences
    })
    .map((filter) => ({ field: filter.field, label: filter.label }))
}

const canAddRule = computed(() => {
  return props.filters.some((filter) => {
    const occurrences = getOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return occurrences < maxOccurrences
  })
})

const getOperators = computed(() => {
  return (field: string): { value: Operator; label: string }[] => {
    return (mapFields.value[field]?.operators || [Operator.EQUAL]).map((operator) => ({
      value: operator,
      label: t(OperatorText[operator]),
    }))
  }
})

const addRule = () => {
  const availableFilter = props.filters.find((filter) => {
    const occurrences = getOccurrences(filter.field)
    const maxOccurrences = filter.maxOccurrences || 1
    return occurrences < maxOccurrences
  })

  if (availableFilter) {
    const operator = getOperators.value(availableFilter.field)[0].value

    const rule: QueryBuilderRule = {
      id: crypto.randomUUID(),
      field: availableFilter.field,
      operator: operator,
      value: undefined,
      error: undefined,
    }

    rule.value = getDefaultValue(rule)

    // Khởi tạo previous operator cho rule mới
    previousOperators.set(rule.id, operator)

    group.value.rules.push(rule)
  }
}

const addGroup = () => {
  const newGroup: QueryBuilderGroup = {
    condition: 'AND',
    rules: [],
  }
  group.value.rules.push(newGroup)
}

const removeRule = (index: number) => {
  const rule = group.value.rules[index]
  if (!isGroup(rule)) {
    // Xóa previous operator khỏi Map
    previousOperators.delete(rule.id)
  }
  group.value.rules.splice(index, 1)
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
