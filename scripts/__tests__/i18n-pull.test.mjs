import assert from 'node:assert/strict'
import { test } from 'node:test'
import { flatten, parseKey, unflatten } from '../i18n-pull.mjs'

test('parseKey splits dots and array indexes', () => {
  assert.deepEqual(parseKey('order.reasons[1].value'), [
    'order',
    'reasons',
    1,
    'value',
  ])
  assert.deepEqual(parseKey('common.smile'), ['common', 'smile'])
})

test('flatten and unflatten round-trip nested objects and arrays', () => {
  const source = {
    a: {
      b: 'x',
      list: [
        { id: 1, v: 'y' },
        { id: 2, v: 'z' },
      ],
    },
    c: 'w',
  }
  const flat = flatten(source)
  assert.equal(flat['a.list[1].v'], 'z')
  assert.deepEqual(unflatten(flat, Object.keys(flat)), source)
})

test('unflatten follows the reference key order and appends unknown keys', () => {
  const result = unflatten({ c: '3', a: '1', z: '9' }, ['a', 'b', 'c'])
  assert.deepEqual(Object.keys(result), ['a', 'c', 'z'])
})
