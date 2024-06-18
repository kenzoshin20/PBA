
import { validateUsername, validatePassword } from '../model/signup-validation.js'
import { assertEquals, assertFalse, assertNotNull, assertThrows, assertTrue } from './assert.js'

describe('validateUsername', () => {
  it('should validate username length', () => {
    assertEquals(validateUsername(null as any).isValid, false)
    assertEquals(validateUsername(undefined as any).isValid, false)
    assertEquals(validateUsername('').isValid, false)
    assertEquals(validateUsername(' ').isValid, false)
    assertEquals(validateUsername('`').isValid, false)
    assertEquals(validateUsername('1').isValid, false)
    assertEquals(validateUsername('12').isValid, false)
    assertEquals(validateUsername('a').isValid, false)
    assertEquals(validateUsername('     ').isValid, false)
    assertEquals(validateUsername('1234567890123456').isValid, false)

    assertEquals(validateUsername('123').isValid, true)
    assertEquals(validateUsername('123a').isValid, true)
    assertEquals(validateUsername('123456789012345').isValid, true)
  })
  it('should validate username characters', () => {
    assertEquals(validateUsername('12😀').isValid, false)
    assertEquals(validateUsername('12🤘').isValid, false)
    assertEquals(validateUsername('12Ä').isValid, false)

    assertEquals(validateUsername('one two three').isValid, true)
    assertEquals(validateUsername('a!!').isValid, true)
    assertEquals(validateUsername(';lkjasdflkj').isValid, true)
    assertEquals(validateUsername(';+_)(*&^%$#@!').isValid, true)
    assertEquals(validateUsername('Brock!!! :)').isValid, true)
    assertEquals(validateUsername('user@()1').isValid, true)
  })
})

describe('validatePassword', () => {
  it('should validate password length', () => {
    assertEquals(validatePassword(null as any).isValid, false)
    assertEquals(validatePassword(undefined as any).isValid, false)
    assertEquals(validatePassword('').isValid, false)
    assertEquals(validatePassword(' ').isValid, false)
    assertEquals(validatePassword('`').isValid, false)
    assertEquals(validatePassword('1').isValid, false)
    assertEquals(validatePassword('12').isValid, false)
    assertEquals(validatePassword('a').isValid, false)
    assertEquals(validatePassword('                        ').isValid, false)
    assertEquals(validatePassword('12').isValid, false)

    assertEquals(validatePassword('123').isValid, true)
    assertEquals(validatePassword('123a').isValid, true)
    assertEquals(validatePassword('123456789012345').isValid, true)
    assertEquals(validatePassword('aU&6@kdj)( 12').isValid, true)
  })
  it('should validate password characters', () => {
    assertEquals(validatePassword('aaaaaaa12😀').isValid, false)
    assertEquals(validatePassword('aaaaaaa12🤘').isValid, false)
    assertEquals(validatePassword('aaaaaaaa12Ä').isValid, false)

    assertEquals(validatePassword('aaa;+_)(*&^%$#@!').isValid, true)
  })
})