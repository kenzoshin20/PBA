import { getTextLines } from '../util/text-utils.js'
import { assertEquals, assertFalse, assertNotNull, assertTrue } from './assert.js'

describe('get text lines', () => {
  it('undefined text', () => {
    const fullText = undefined
    const lines = getTextLines(fullText as any, 50)
    assertEquals(lines.length, 0)
  })
  it('empty text', () => {
    const fullText = ''
    const lines = getTextLines(fullText, 50)
    assertEquals(lines.length, 0)
  })
  it('one line for small text', () => {
    const fullText = 'Foo'
    const lines = getTextLines(fullText, 50)
    assertEquals(lines.length, 1)
    assertEquals(lines[0], 'Foo')
  })
  it('one line for text with length equal to max line length', () => {
    let fullText = 'aaaaa'
    const lines = getTextLines(fullText, 5)
    assertEquals(lines.length, 1)
    assertEquals(lines[0], 'aaaaa')
  })
  it('one line for text with length equal to max line length - 1', () => {
    let fullText = 'aaaa'
    const lines = getTextLines(fullText, 5)
    assertEquals(lines.length, 1)
    assertEquals(lines[0], 'aaaa')
  })
  it('two lines for text with one word equal to max line length plus one small word', () => {
    let fullText = 'aaaaa b'
    const lines = getTextLines(fullText, 5)
    assertEquals(lines.length, 2)
    assertEquals(lines[0], 'aaaaa')
    assertEquals(lines[1], 'b')
  })
  it('two lines for two words equal to max length', () => {
    let fullText = 'aaa bbb'
    const lines = getTextLines(fullText, 3)
    assertEquals(lines.length, 2)
    assertEquals(lines[0], 'aaa')
    assertEquals(lines[1], 'bbb')
  })
  it('two lines with a big word on edge of line', () => {
    let fullText = 'Foo bar xxxxxxxx'
    const lines = getTextLines(fullText, 10)
    assertEquals(lines.length, 2)
    assertEquals(lines[0], 'Foo bar')
    assertEquals(lines[1], 'xxxxxxxx')
  })
  it('two lines with a big word on edge of line then small word', () => {
    let fullText = 'Foo bar xxxxx yy'
    const lines = getTextLines(fullText, 10)
    assertEquals(lines.length, 2)
    assertEquals(lines[0], 'Foo bar')
    assertEquals(lines[1], 'xxxxx yy')
  })
})

