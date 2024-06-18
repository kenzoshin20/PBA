import { Poller } from '../util/poller.js'

import { assertEquals, assertFalse, assertNotNull, assertThrows, assertTrue } from './assert.js'

describe('Poller', () => {
  it('should poll', async () => {
    let count = 0
    const poller = new Poller()
    poller.action = async () => { count++ }
    poller.endCondition = async () => count === 2 
    await poller.run()
    assertEquals(count, 2)
  })
})