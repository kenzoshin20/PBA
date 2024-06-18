import assert from 'assert'

export function assertEquals<T>(actual: T, expected: T, message?: string) {
  assert.strictEqual(actual, expected, message)
}

export function assertTrue(actual: boolean, message?: string) {
  assert.strictEqual(actual, true, message)
}

export function assertFalse(actual: boolean, message?: string) {
  assert.strictEqual(actual, false, message)
}

export function assertNull(actual?: any, message?: string) {
  assert.strictEqual(actual == null, true, message)
}

export function assertNotNull(actual?: any, message?: string) {
  assert.strictEqual(actual != null, true, message)
}

export async function assertThrows(callback: () => void, message?: string) {
  let caught = false
  try {
    callback()
  } catch (err) {
    caught = true
  }
  assertTrue(caught, message)
}

export function assertArrayEquals<T>(actual: T[], expected: T[], message?: string) {
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)
  assert.deepStrictEqual(actualSet, expectedSet, message)
}