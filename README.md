# Vue 3 QueryBuilder (Naive UI)

A powerful, flexible, and type-safe query builder component for Vue 3, beautifully crafted with **Naive UI**.

[![npm version](https://img.shields.io/npm/v/@mvtcode/vue3-querybuilder-naive-ui.svg)](https://www.npmjs.com/package/@mvtcode/vue3-querybuilder-naive-ui)
[![license](https://img.shields.io/npm/l/@mvtcode/vue3-querybuilder-naive-ui.svg)](https://github.com/mvtcode/vue3-querybuilder-naive-ui/blob/main/LICENSE)

## ✨ Features

- 🚀 **Vue 3 & Composition API**: Built from the ground up for modern Vue development.
- 🎨 **Naive UI Integration**: Uses Naive UI components for a premium look and feel.
- 🌐 **Internationalization (i18n)**: Full support for multiple languages (English and Vietnamese included by default).
- 🧩 **Type Safe**: Written in TypeScript with full type definitions.
- 🛠️ **Customizable**: Extensive props and slots for deep customization of fields and operators.
- 🔄 **Query Converters**: Built-in utilities to convert queries to SQL and MongoDB formats.
- 📱 **Responsive**: Works smoothly across different screen sizes.

## 📦 Installation

```sh
npm install @mvtcode/vue3-querybuilder-naive-ui naive-ui vue-i18n
# or
pnpm add @mvtcode/vue3-querybuilder-naive-ui naive-ui vue-i18n
# or
yarn add @mvtcode/vue3-querybuilder-naive-ui naive-ui vue-i18n
```

## 🚀 Quick Start

### 1. Setup i18n

```typescript
// i18n.ts
import { createI18n } from 'vue-i18n'
import { en, vi } from '@mvtcode/vue3-querybuilder-naive-ui'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en, vi }
})

export default i18n
```

### 2. Use in your component

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { QueryBuilder, FilterType, Operator } from '@mvtcode/vue3-querybuilder-naive-ui'
import type { QueryBuilderGroup, QueryBuilderFilter } from '@mvtcode/vue3-querybuilder-naive-ui'

const rules = ref<QueryBuilderGroup>({
  condition: 'AND',
  rules: []
})

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
    operators: [Operator.GREATER, Operator.LESS, Operator.BETWEEN]
  }
]
</script>

<template>
  <QueryBuilder v-model="rules" :filters="filters" />
</template>
```

## 🛠️ API Reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `QueryBuilderGroup` | (Required) | The current state of the query. |
| `filters` | `QueryBuilderFilter[]` | (Required) | Available fields and their configurations. |
| `isRoot` | `boolean` | `true` | Whether this is the root group. |
| `maxDepth` | `number` | `0` | Maximum nesting level (0 for unlimited). |
| `widthFieldSelect` | `number` | `200` | Width of the field selection dropdown. |
| `widthOperatorSelect` | `number` | `180` | Width of the operator selection dropdown. |
| `widthValueInput` | `number` | `250` | Width of the default value input. |

### Slots

You can customize the value input for specific fields using slots:

```vue
<template #field_name="{ rule, widthValueInput }">
  <n-input v-model:value="rule.value" :style="{ width: widthValueInput + 'px' }" />
</template>
```

## 📜 License

MIT License © 2024 [tanmv](https://github.com/tanmv)
