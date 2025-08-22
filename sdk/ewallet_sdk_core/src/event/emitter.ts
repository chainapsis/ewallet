export class EventEmitter2<EventMap extends Record<string, any>> {
  listeners: {
    [K in keyof EventMap]?: Array<(payload: EventMap[K]) => void>;
  } = {};

  on<K extends keyof EventMap>(
    eventName: K,
    handler: (payload: EventMap[K]) => void,
  ) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
  }

  emit<K extends keyof EventMap>(eventName: K, payload: EventMap[K]) {
    console.log("emit, eventName: %s", String(eventName), this.listeners);
    const handlers = this.listeners[eventName];
    if (handlers && handlers.length > 0) {
      handlers.forEach((listener) => listener(payload));
    }
  }
}
