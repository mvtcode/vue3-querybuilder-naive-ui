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
              <template #checked>{{ t('queryBuilder.and') }}</template>
              <template #unchecked>{{ t('queryBuilder.or') }}</template>
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
              {{ t('queryBuilder.addRule') }}
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
              {{ t('queryBuilder.addGroup') }}
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
              {{ t('queryBuilder.removeGroup') }}
            </n-button>
          </n-flex>
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
                :current-depth="currentDepth + 1"
                :language="language"
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
                  :placeholder="t('queryBuilder.selectField')"
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
                  :placeholder="t('queryBuilder.selectOperator')"
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
                    :placeholder="t('queryBuilder.enterValue')"
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
import { computed, watch } from 'vue'
import { NCard, NSwitch, NButton, NSelect, NInput, NIcon, NFlex } from 'naive-ui'
import { Add as AddIcon, FolderOpen as FolderAddIcon, Trash as TrashIcon } from '@vicons/ionicons5'
import type {
  QueryBuilderGroup,
  QueryBuilderRule,
  QueryBuilderFilter,
  QueryBuilderValue,
} from '../types/querybuilder'
import { FilterType, Operator, OperatorText } from '../types/querybuilder'
import { createI18n } from 'vue-i18n'
import en from '../i18n/locales/en'
import vi from '../i18n/locales/vi'

interface Props {
  filters: QueryBuilderFilter[]
  isRoot?: boolean
  maxDepth?: number
  currentDepth?: number
  language?: 'vi' | 'en'
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
  currentDepth: 1,
  size: 'medium',
  language: 'vi',
})

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    vi,
  },
})

const { t, locale } = i18n.global

watch(
  () => props.language,
  (lang) => {
    locale.value = lang
  },
  { immediate: true },
)

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'change'): void
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

// Seed previousOperators từ model value (xử lý cả sync lẫn async - ví dụ sau khi gọi API)
// immediate: true → chạy ngay lập tức khi component setup, không cần chờ mount
// !has(rule.id) → không ghi đè operator đã được user thay đổi
watch(
  () => group.value.rules,
  (rules) => {
    for (const rule of rules) {
      if (!isGroup(rule) && rule.id && rule.operator && !previousOperators.has(rule.id)) {
        previousOperators.set(rule.id, rule.operator)
      }
    }
  },
  { immediate: true },
)

// Emit 'change' khi bất kỳ thay đổi nào xảy ra trong group (thêm/xoá rule, đổi field/operator/value, thêm/xoá group)
// deep: true → theo dõi toàn bộ cây object, bao gồm cả nested sub-groups
// flush: 'post' → sau khi DOM update để đảm bảo model đã được commit
// Không cần bubble up từ nested QueryBuilder qua template vì:
// @update:model-value của nested group sẽ update group.rules[index] (thuộc group.value của parent)
// → deep watch sẽ tự bắt được, tránh double emission
watch(
  () => group.value,
  () => {
    if (props.isRoot) emit('change')
  },
  { deep: true, flush: 'post' },
)

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
          return null
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
  rule.operator = getOperators.value(rule.field)[0].value
  rule.value = getDefaultValue(rule)
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
      value: null,
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
  return props.currentDepth <= props.maxDepth
})
</script>

<style scoped></style>
