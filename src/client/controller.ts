import { BattleEvent } from "../model/battle-event"
import { logDebug } from "../util/logger"

interface SubscriptionCallback {
  (battleEvent: any): void
}

export class Controller {

  private subscriptions: Record<string, SubscriptionCallback[]> = {}

  subscribe(eventType: string, callback: SubscriptionCallback) {
    if (!this.subscriptions[eventType]) {
      this.subscriptions[eventType] = []
    }
    logDebug('Adding subscription to ' + eventType)
    this.subscriptions[eventType].push(callback)
  }

  unsubscribe(eventType: string, callback: SubscriptionCallback) {
    let success = false
    const subscriptionsForType = this.subscriptions[eventType]
    if (subscriptionsForType && subscriptionsForType.includes(callback)) {
      const index = subscriptionsForType.indexOf(callback);
      if (index > -1) {
        subscriptionsForType.splice(index, 1)
        success = true
      }
    }
    return success
  }

  async publish(event: BattleEvent) {
    // Note: Don't log event JSON because sometimes the event will contain a Proxy which
    // throws max call stack error when passed to JSON.stringify()
    logDebug('Publishing event ' + event.type)
    const subscriptions = this.subscriptions[event.type]
    if (subscriptions) {
      // logDebug(`Found ${subscriptions.length} subscriptions for ` + event.type)
      for (const callback of subscriptions) {
        await callback(event)
      }
    }
  }

}
