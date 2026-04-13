import type { App } from 'vue'
import QueryBuilder from './components/QueryBuilder.vue'
import type { QueryBuilderGroup, QueryBuilderRule, QueryBuilderFilter } from './types/querybuilder'
import { FilterType, Operator } from './types/querybuilder'
import {
  toSQL,
  toMongo,
  toMnpQuery,
  fromSQL,
  fromMongo,
  convertToSql,
  convertToMongo,
} from './utils/query-converter'
import en from './i18n/locales/en'
import vi from './i18n/locales/vi'

export { QueryBuilder }
export { FilterType, Operator }
export { en, vi }
export type { QueryBuilderGroup, QueryBuilderRule, QueryBuilderFilter }
export { toSQL, toMongo, toMnpQuery, fromSQL, fromMongo, convertToSql, convertToMongo }

export const install = (app: App) => {
  app.component('QueryBuilder', QueryBuilder)
}
