import { describe, it, expect, vi } from 'vitest'
import {
  toSQL,
  toMongo,
  toMnpQuery,
  fromSQL,
  fromMongo,
  convertToSql,
  convertToMongo,
} from '../query-converter'
import { Operator, FilterType } from '../../types/querybuilder'
import type { QueryBuilderGroup, QueryBuilderFilter, QueryBuilderRule } from '../../types/querybuilder'

// Mock crypto.randomUUID
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  (global as any).crypto = {
    ...(global as any).crypto,
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9),
  }
}

describe('query-converter.ts', () => {
  const mockGroup: QueryBuilderGroup = {
    condition: 'AND',
    rules: [
      {
        id: '1',
        field: 'name',
        operator: Operator.EQUAL,
        value: 'John',
      },
      {
        id: '2',
        field: 'age',
        operator: Operator.GREATER,
        value: 20,
      },
    ],
  }

  describe('toSQL', () => {
    it('converts basic group to SQL', () => {
      const sql = toSQL(mockGroup)
      expect(sql).toBe("name = 'John' AND age > 20")
    })

    it('handles OR condition', () => {
      const group: QueryBuilderGroup = { ...mockGroup, condition: 'OR' }
      const sql = toSQL(group)
      expect(sql).toBe("name = 'John' OR age > 20")
    })

    it('handles nested groups', () => {
      const group: QueryBuilderGroup = {
        condition: 'AND',
        rules: [
          { id: '1', field: 'name', operator: Operator.EQUAL, value: 'John' },
          {
            condition: 'OR',
            rules: [
              { id: '2', field: 'age', operator: Operator.LESS, value: 18 },
              { id: '3', field: 'age', operator: Operator.GREATER, value: 65 },
            ],
          },
        ],
      }
      const sql = toSQL(group)
      expect(sql).toBe("name = 'John' AND (age < 18 OR age > 65)")
    })

    it('handles various operators', () => {
      expect(toSQL({ condition: 'AND', rules: [{ id: '1', field: 'f', operator: Operator.CONTAINS, value: 'v' }] })).toBe("f LIKE '%v%'")
      expect(toSQL({ condition: 'AND', rules: [{ id: '1', field: 'f', operator: Operator.BEGINS_WITH, value: 'v' }] })).toBe("f LIKE 'v%'")
      expect(toSQL({ condition: 'AND', rules: [{ id: '1', field: 'f', operator: Operator.ENDS_WITH, value: 'v' }] })).toBe("f LIKE '%v'")
      expect(toSQL({ condition: 'AND', rules: [{ id: '1', field: 'f', operator: Operator.IN, value: [1, 2] }] })).toBe("f IN (1, 2)")
      expect(toSQL({ condition: 'AND', rules: [{ id: '1', field: 'f', operator: Operator.BETWEEN, value: [1, 10] }] })).toBe("f BETWEEN 1 AND 10")
      expect(toSQL({ condition: 'AND', rules: [{ id: '1', field: 'f', operator: Operator.IS_EMPTY, value: null }] })).toBe("f IS NULL")
    })
  })

  describe('toMongo', () => {
    it('converts basic group to Mongo', () => {
      const mongo = toMongo(mockGroup)
      expect(mongo).toEqual({
        $and: [
          { name: { $eq: 'John' } },
          { age: { $gt: 20 } },
        ],
      })
    })

    it('handles nested groups', () => {
      const group: QueryBuilderGroup = {
        condition: 'AND',
        rules: [
          { id: '1', field: 'name', operator: Operator.EQUAL, value: 'John' },
          {
            condition: 'OR',
            rules: [
              { id: '2', field: 'age', operator: Operator.LESS, value: 18 },
            ],
          },
        ],
      }
      const mongo = toMongo(group)
      expect(mongo).toEqual({
        $and: [
          { name: { $eq: 'John' } },
          { $or: [{ age: { $lt: 18 } }] },
        ],
      })
    })

    it('handles regex operators', () => {
      expect(toMongo({ condition: 'AND', rules: [{ id: '1', field: 'f', operator: Operator.CONTAINS, value: 'v' }] }))
        .toEqual({ $and: [{ f: { $regex: 'v', $options: 'i' } }] })
      
      expect(toMongo({ condition: 'AND', rules: [{ id: '1', field: 'f', operator: Operator.BEGINS_WITH, value: 'v' }] }))
        .toEqual({ $and: [{ f: { $regex: '^v', $options: 'i' } }] })
    })
  })

  describe('fromSQL', () => {
    it('parses basic SQL', () => {
      const sql = "name = 'John' AND age > 20"
      const group = fromSQL(sql)
      expect(group.condition).toBe('AND')
      expect(group.rules).toHaveLength(2)
      // Check for existence of id and field parity
      expect(group.rules[0].field).toBe('name')
      expect(group.rules[0].operator).toBe(Operator.EQUAL)
      expect(group.rules[0].value).toBe('John')
    })
  })

  describe('fromMongo', () => {
    it('parses basic Mongo object', () => {
      const mongo = {
        $and: [
          { name: { $eq: 'John' } },
          { age: { $gt: 20 } },
        ],
      }
      const group = fromMongo(mongo)
      expect(group.condition).toBe('AND')
      expect(group.rules).toHaveLength(2)
      expect(group.rules[0].field).toBe('name')
      expect(group.rules[0].operator).toBe(Operator.EQUAL)
      expect(group.rules[0].value).toBe('John')
    })
  })

  describe('convertToSql & convertToMongo (Single Rule)', () => {
    const rule: QueryBuilderRule = { id: '1', field: 'name', operator: Operator.EQUAL, value: 'John' }

    it('converts single rule to SQL', () => {
      expect(convertToSql(rule)).toBe("`name` = 'John'")
    })

    it('converts single rule to Mongo', () => {
      expect(convertToMongo(rule)).toEqual({ name: 'John' })
    })
  })

  describe('toMnpQuery', () => {
    const filters: QueryBuilderFilter[] = [
      { field: 'name', label: 'Name', type: FilterType.STRING },
      { field: 'age', label: 'Age', type: FilterType.NUMBER },
      { field: 'active', label: 'Active', type: FilterType.BOOLEAN },
      { field: 'created_at', label: 'Created At', type: FilterType.DATE },
      { field: 'updated_at', label: 'Updated At', type: FilterType.DATETIME },
    ]

    it('converts basic group to MNP query', () => {
      const group: QueryBuilderGroup = {
        condition: 'AND',
        rules: [
          { id: '1', field: 'name', operator: Operator.EQUAL, value: 'John' },
          { id: '2', field: 'age', operator: Operator.GREATER, value: 20 },
        ],
      }
      const mnp = toMnpQuery(group, filters)
      expect(mnp).toBe("{name} == '''John''' AND {age} > 20")
    })

    it('handles booleans correctly', () => {
      const group: QueryBuilderGroup = {
        condition: 'AND',
        rules: [{ id: '1', field: 'active', operator: Operator.EQUAL, value: true }],
      }
      expect(toMnpQuery(group, filters)).toBe("{active} == true")
    })

    it('handles string lists (IN operator)', () => {
      const group: QueryBuilderGroup = {
        condition: 'AND',
        rules: [{ id: '1', field: 'name', operator: Operator.IN, value: ['A', 'B'] }],
      }
      expect(toMnpQuery(group, filters)).toBe("{name} IN ['''A''', '''B''']")
    })
  })
})
