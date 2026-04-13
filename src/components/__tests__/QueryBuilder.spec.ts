import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import QueryBuilder from '../QueryBuilder.vue'
import { FilterType, Operator, OperatorText } from '@/types/querybuilder'
import type { QueryBuilderFilter, QueryBuilderGroup, QueryBuilderRule } from '@/types/querybuilder'
import i18n from '@/i18n'
import { NInputNumber, NDatePicker, NCheckbox, NSelect } from 'naive-ui'

describe('QueryBuilder.vue', () => {
  const filters: QueryBuilderFilter[] = [
    {
      field: 'name',
      label: 'Name',
      type: FilterType.STRING,
    },
    {
      field: 'age',
      label: 'Age',
      type: FilterType.NUMBER,
      operators: [
        Operator.EQUAL,
        Operator.NOT_EQUAL,
        Operator.GREATER,
        Operator.LESS,
        Operator.BETWEEN,
        Operator.NOT_BETWEEN,
      ],
    },
    {
      field: 'birthdate',
      label: 'Birth Date',
      type: FilterType.DATE,
      operators: [
        Operator.EQUAL,
        Operator.NOT_EQUAL,
        Operator.GREATER,
        Operator.LESS,
        Operator.BETWEEN,
        Operator.NOT_BETWEEN,
      ],
    },
    {
      field: 'active',
      label: 'Active',
      type: FilterType.BOOLEAN,
    },
    {
      field: 'status',
      label: 'Status',
      type: FilterType.STRING,
      values: [
        { text: 'Pending', value: 'pending' },
        { text: 'Done', value: 'done' },
      ],
    },
    {
      field: 'limited',
      label: 'Limited',
      type: FilterType.STRING,
      maxOccurrences: 1,
    },
  ]

  const createWrapper = () => {
    return mount(QueryBuilder, {
      props: {
        modelValue: {
          condition: 'AND',
          rules: [],
        } as QueryBuilderGroup,
        filters,
      },
      global: {
        plugins: [i18n],
      },
      attachTo: document.body,
    })
  }

  // Helper to trigger NSelect update:value via component props
  const triggerNSelectUpdate = async (
    wrapper: ReturnType<typeof mount>,
    dataTest: string,
    value: unknown,
  ) => {
    const component = wrapper.findComponent(`[data-test="${dataTest}"]`)
    if (component.exists()) {
      // Trigger the onUpdateValue prop which is the handler in the parent
      await (component.vm as any).$emit('update:value', value)
      await nextTick()
      return true
    }
    return false
  }

  it('mounts properly', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('switches condition AND → OR', async () => {
    const wrapper = createWrapper()
    await nextTick()
    // n-switch: click the switch element
    const switchEl = wrapper.find('[data-test="condition-switch"]')
    await switchEl.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const value = (emitted as unknown[][])[0][0] as QueryBuilderGroup
    expect(value.condition).toBe('OR')
  })

  it('adds a rule', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const value = (emitted as unknown[][])[0][0] as QueryBuilderGroup
    expect(value.rules).toHaveLength(1)
  })

  it('removes a rule', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()
    await nextTick()
    const removeBtn = wrapper.find('[data-test="remove-rule"]')
    expect(removeBtn.exists()).toBe(true)
    await removeBtn.trigger('click')
    await nextTick()
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const value = (emitted as unknown[][])[1][0] as QueryBuilderGroup
    expect(value.rules).toHaveLength(0)
  })

  it('adds a group', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addGroupBtn = wrapper.find('[data-test="add-group"]')
    await addGroupBtn.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const value = (emitted as unknown[][])[0][0] as QueryBuilderGroup
    const firstRule = value.rules[0] as QueryBuilderGroup
    expect(firstRule.condition).toBe('AND')
  })

  it('adds a new rule with default field', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addButton = wrapper.find('[data-test="add-rule"]')
    await addButton.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const newValue = emitted?.[0]?.[0] as QueryBuilderGroup
    expect(newValue.rules.length).toBe(1)
    const rule = newValue.rules[0] as QueryBuilderRule
    expect(rule.field).toBe('name')
  })

  it('adds a new group with condition AND', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addGroupButton = wrapper.find('[data-test="add-group"]')
    await addGroupButton.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const newValue = emitted?.[0]?.[0] as QueryBuilderGroup
    expect(newValue.rules.length).toBe(1)
    const group = newValue.rules[0] as QueryBuilderGroup
    expect(group.condition).toBeTruthy()
    expect(group.rules).toBeTruthy()
  })

  it('changes field using NSelect component', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    // Trigger field-select's onUpdateValue via component emit
    await triggerNSelectUpdate(wrapper, 'field-select', 'age')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    if (!emitted) return
    const lastEmitted = emitted[emitted.length - 1][0] as QueryBuilderGroup
    const rule = lastEmitted.rules[0] as QueryBuilderRule
    expect(rule.field).toBe('age')
  })

  it('changes operator using NSelect component', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    // Trigger operator-select's onUpdateValue via component emit
    await triggerNSelectUpdate(wrapper, 'operator-select', Operator.CONTAINS)

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    if (!emitted) return
    const lastEmitted = emitted[emitted.length - 1][0] as QueryBuilderGroup
    const rule = lastEmitted.rules[0] as QueryBuilderRule
    expect(rule.operator).toBe(Operator.CONTAINS)
  })

  it('inputs a value via value-input', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    const input = wrapper.find('[data-test="value-input"] input')
    await input.setValue('test')
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted).toBeDefined()
    const emittedArray = emitted as unknown[][]
    const value = emittedArray[emittedArray.length - 1][0] as QueryBuilderGroup
    const firstRule = value.rules[0] as QueryBuilderRule
    expect(firstRule.value).toBe('test')
  })

  it('handles nested groups correctly', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addGroupBtn = wrapper.find('[data-test="add-group"]')
    await addGroupBtn.trigger('click')
    await nextTick()

    // Add a rule to the nested group (second add-rule button)
    const nestedAddButton = wrapper.findAll('[data-test="add-rule"]')[1]
    await nestedAddButton.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const newValue = emitted?.[0]?.[0] as QueryBuilderGroup
    const nestedGroup = newValue.rules[0] as QueryBuilderGroup
    expect(nestedGroup.rules.length).toBe(1)
  })

  it('sets BETWEEN value as array when switching to between operator', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    // Set field to 'age' via field-select emit
    await triggerNSelectUpdate(wrapper, 'field-select', 'age')
    await nextTick()

    // Set operator to BETWEEN via operator-select emit
    await triggerNSelectUpdate(wrapper, 'operator-select', Operator.BETWEEN)
    await nextTick()
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const lastEmitted = (emitted as unknown[][])[emitted!.length - 1][0] as QueryBuilderGroup
    const rule = lastEmitted.rules[0] as QueryBuilderRule
    expect(Array.isArray(rule.value)).toBe(true)
  })

  it('resets value when switching from BETWEEN back to EQUAL', async () => {
    const wrapper = createWrapper()
    await nextTick()
    const addRuleBtn = wrapper.find('[data-test="add-rule"]')
    await addRuleBtn.trigger('click')
    await nextTick()

    // Set age field
    await triggerNSelectUpdate(wrapper, 'field-select', 'age')
    await nextTick()

    // Set operator to BETWEEN
    await triggerNSelectUpdate(wrapper, 'operator-select', Operator.BETWEEN)
    await nextTick()

    // Switch back to EQUAL
    await triggerNSelectUpdate(wrapper, 'operator-select', Operator.EQUAL)
    await nextTick()

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    const lastEmitted = (emitted as unknown[][])[emitted!.length - 1][0] as QueryBuilderGroup
    const rule = lastEmitted.rules[0] as QueryBuilderRule
    expect(Array.isArray(rule.value)).toBe(false)
  })

  it('verifies OperatorText entries exist', () => {
    expect(OperatorText[Operator.EQUAL]).toBe('queryBuilder.operators.equal')
    expect(OperatorText[Operator.NOT_EQUAL]).toBe('queryBuilder.operators.not_equal')
    expect(OperatorText[Operator.BETWEEN]).toBe('queryBuilder.operators.between')
    expect(OperatorText[Operator.NOT_BETWEEN]).toBe('queryBuilder.operators.not_between')
  })

  it('uses NInputNumber for numeric fields', async () => {
    const wrapper = createWrapper()
    await nextTick()
    await wrapper.find('[data-test="add-rule"]').trigger('click')
    await nextTick()

    // Change to 'age'
    await triggerNSelectUpdate(wrapper, 'field-select', 'age')
    await nextTick()
    await nextTick()

    const inputNumber = wrapper.findComponent(NInputNumber)
    expect(inputNumber.exists()).toBe(true)
  })

  it('uses NDatePicker for date fields', async () => {
    const wrapper = createWrapper()
    await nextTick()
    await wrapper.find('[data-test="add-rule"]').trigger('click')
    await nextTick()

    // Change to 'birthdate'
    await triggerNSelectUpdate(wrapper, 'field-select', 'birthdate')
    await nextTick()
    await nextTick()

    const datePicker = wrapper.findComponent(NDatePicker)
    expect(datePicker.exists()).toBe(true)
  })

  it('uses NCheckbox for boolean fields', async () => {
    const wrapper = createWrapper()
    await nextTick()
    await wrapper.find('[data-test="add-rule"]').trigger('click')
    await nextTick()

    // Change to 'active'
    await triggerNSelectUpdate(wrapper, 'field-select', 'active')
    await nextTick()
    await nextTick()

    const checkbox = wrapper.findComponent(NCheckbox)
    expect(checkbox.exists()).toBe(true)
  })

  it('uses NSelect for fields with predefined values', async () => {
    const wrapper = createWrapper()
    await nextTick()
    await wrapper.find('[data-test="add-rule"]').trigger('click')
    await nextTick()

    // Change to 'status'
    await triggerNSelectUpdate(wrapper, 'field-select', 'status')
    await nextTick()
    await nextTick()

    // There are 3 NSelects now: field, operator, and the value input
    const selects = wrapper.findAllComponents(NSelect)
    expect(selects.length).toBe(3)
  })

  it('shows validation message when maxOccurrences is reached', async () => {
    const wrapper = createWrapper()
    await nextTick()

    // Add first 'limited' rule
    await wrapper.find('[data-test="add-rule"]').trigger('click')
    await nextTick()
    await triggerNSelectUpdate(wrapper, 'field-select', 'limited')
    await nextTick()

    const validationInfo = wrapper.find('.validation-info')
    expect(validationInfo.exists()).toBe(true)
    expect(validationInfo.text()).toContain('1')
  })
})
