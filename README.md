# 🛡️ Vue 3 QueryBuilder (Naive UI)

A powerful, highly flexible, and type-safe query builder component for Vue 3, elegantly crafted with **Naive UI**.

[![npm version](https://img.shields.io/npm/v/@mvtcode/vue3-querybuilder-naive-ui.svg?style=flat-square)](https://www.npmjs.com/package/@mvtcode/vue3-querybuilder-naive-ui)
[![license](https://img.shields.io/npm/l/@mvtcode/vue3-querybuilder-naive-ui.svg?style=flat-square)](https://github.com/mvtcode/vue3-querybuilder-naive-ui/blob/main/LICENSE)
[![Vue Version](https://img.shields.io/badge/vue-3.x-4fc08d?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![UI Framework](https://img.shields.io/badge/UI-Naive%20UI-18a058?style=flat-square)](https://www.naiveui.com/)

---

> [!NOTE]
> This project is a specialized port of [@mvtcode/vue3-querybuilder](https://github.com/mvtcode/vue3-querybuilder). While the original version is built for Element Plus, this version is rebuilt from the ground up to utilize **Naive UI**, providing a more refined, premium aesthetic and deeper integration with Naive UI's component ecosystem.

---

## ✨ Features

- 🚀 **Modern Vue 3**: Native Composition API and TypeScript support.
- 🎨 **Naive UI Design**: Premium look and feel out of the box.
- 🌐 **Deep i18n Integration**: Built-in support for English and Vietnamese, easily extensible.
- 🧩 **Advanced Slots**: Dynamic slots for every field with rich context (`isBetween`, `width`, `rule`, `filter`).
- 🔄 **Multi-format Converters**:
  - **SQL**: Standard WHERE clause generation.
  - **MongoDB**: Query object generation.
  - **MNP**: Custom format for specialized engines.
- 📱 **Responsive & Fluid**: Adaptive layouts using Naive UI's Flex and Grid systems.
- 🛡️ **Rule Limits**: New `maxOccurrences` to control how many times a field can be filtered.

---

## 📦 Installation

```bash
pnpm add @mvtcode/vue3-querybuilder-naive-ui naive-ui vue-i18n dayjs
# or
npm install @mvtcode/vue3-querybuilder-naive-ui naive-ui vue-i18n dayjs
```

---

## 🚀 Quick Start

### 1. Configure i18n

The component requires `vue-i18n` to handle labels and operators.

```typescript
// i18n.ts
import { createI18n } from 'vue-i18n'
import { en, vi } from '@mvtcode/vue3-querybuilder-naive-ui'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, vi },
})

export default i18n
```

### 2. Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { QueryBuilder, FilterType, Operator } from '@mvtcode/vue3-querybuilder-naive-ui'
import type { QueryBuilderGroup, QueryBuilderFilter } from '@mvtcode/vue3-querybuilder-naive-ui'

const rules = ref<QueryBuilderGroup>({
  condition: 'AND',
  rules: [],
})

const filters: QueryBuilderFilter[] = [
  {
    field: 'name',
    label: 'Full Name',
    type: FilterType.STRING,
    operators: [Operator.EQUAL, Operator.CONTAINS],
  },
  {
    field: 'age',
    label: 'Age',
    type: FilterType.INTEGER,
    operators: [Operator.GREATER, Operator.LESS, Operator.BETWEEN],
  },
]
</script>

<template>
  <QueryBuilder v-model="rules" :filters="filters" />
</template>
```

---

## 🛠️ API Reference

### Props

| Prop                  | Type                   | Default      | Description                              |
| :-------------------- | :--------------------- | :----------- | :--------------------------------------- |
| `modelValue`          | `QueryBuilderGroup`    | _(Required)_ | V-model for the query state.             |
| `filters`             | `QueryBuilderFilter[]` | _(Required)_ | Configuration for available fields.      |
| `maxDepth`            | `number`               | `0`          | Max nesting level (0 = unlimited).       |
| `isRoot`              | `boolean`              | `true`       | Whether this is the top-level container. |
| `widthFieldSelect`    | `number`               | `200`        | Width of field selection (px).           |
| `widthOperatorSelect` | `number`               | `180`        | Width of operator selection (px).        |
| `widthValueInput`     | `number`               | `250`        | Width of the value input area (px).      |

### Custom Labels

You can override default i18n labels using these props:
`labelAddRule`, `labelAddGroup`, `labelRemoveGroup`, `labelFrom`, `labelTo`, `labelAnd`, `labelOr`, `labelSelectField`, `labelSelectOperator`, `labelEnterValue`, `labelRemoveRule`, `labelCondition`.

---

## 🔗 Enums & Types

### FilterType

```typescript
enum FilterType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  DATE = 'date',
  DATETIME = 'datetime',
  BOOLEAN = 'boolean',
  EMAIL = 'email',
}
```

### Operator

```typescript
enum Operator {
  EQUAL = 'equal',
  NOT_EQUAL = 'not_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  BEGINS_WITH = 'begins_with',
  NOT_BEGINS_WITH = 'not_begins_with',
  ENDS_WITH = 'ends_with',
  NOT_ENDS_WITH = 'not_ends_with',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
  GREATER = 'greater',
  GREATER_OR_EQUAL = 'greater_or_equal',
  LESS = 'less',
  LESS_OR_EQUAL = 'less_or_equal',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  NOT_BETWEEN = 'not_between',
}
```

---

## 🧩 Dynamic Slots

Customize inputs for specific fields using slots named after the field `field`.

| Prop              | Type                 | Description                              |
| :---------------- | :------------------- | :--------------------------------------- |
| `rule`            | `QueryBuilderRule`   | The current rule object.                 |
| `filter`          | `QueryBuilderFilter` | The filter configuration for this field. |
| `operator`        | `Operator`           | The currently selected operator.         |
| `isBetween`       | `boolean`            | True if operator is BETWEEN/NOT_BETWEEN. |
| `widthValueInput` | `number`             | Calculated width for the input.          |

**Example:**

```vue
<template #age="{ rule, isBetween, widthValueInput }">
  <n-input-number
    v-if="!isBetween"
    v-model:value="rule.value"
    :style="{ width: widthValueInput + 'px' }"
  />
  <div v-else class="flex gap-2">
    <n-input-number v-model:value="rule.value[0]" />
    <span>to</span>
    <n-input-number v-model:value="rule.value[1]" />
  </div>
</template>
```

---

## 🔄 Query Conversion

Convert your builder state into various formats:

### To SQL

```typescript
import { toSQL } from '@mvtcode/vue3-querybuilder-naive-ui'
const sql = toSQL(rules.value)
// Result: `age` >= 18 AND `status` = 'active'
```

### To MongoDB

```typescript
import { toMongo } from '@mvtcode/vue3-querybuilder-naive-ui'
const mongo = toMongo(rules.value)
// Result: { $and: [ { age: { $gte: 18 } }, { status: { $eq: 'active' } } ] }
```

### To MNP (Custom)

```typescript
import { toMnpQuery } from '@mvtcode/vue3-querybuilder-naive-ui'
const mnp = toMnpQuery(rules.value, filters)
// Result: {age} >= 18 AND {status} == '''active'''
```

---

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build library
pnpm build

# Run tests
pnpm test:unit
```

---

## 📸 Screenshots

### Vietnamese

![Screenshot VI](./screenshot_vi.png)

### English

![Screenshot EN](./screenshot_en.png)

---

## 👨‍💻 Author

**Mạc Tân (Tanmv)**

- 📧 **Email:** [tanmv@mpos.vn](mailto:tanmv@mpos.vn) | [macvantan@gmail.com](mailto:macvantan@gmail.com)
- 📘 **FB:** [Mạc Tân](https://www.facebook.com/mvt.hp.star)
- ✈️ **Telegram:** [@tanmac](https://t.me/tanmac)
- 🔹 **Skype:** `trai_12a1`

## 🔗 Related Projects

- [vue3-querybuilder](https://github.com/mvtcode/vue3-querybuilder) - The original version built for Element Plus.

## 📜 License

MIT License © 2026-present [Mạc Tân (mvtcode)](https://github.com/mvtcode). See [LICENSE](LICENSE) for details.
