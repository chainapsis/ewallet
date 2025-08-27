export class EventEmitter2<EventMap extends Record<string, any>> {
  protected _listeners: {
    [K in keyof EventMap]?: Array<(payload: EventMap[K]) => void>;
  } = {};

  get listeners() {
    return this._listeners;
  }

  on<K extends keyof EventMap>(
    eventName: K,
    handler: (payload: EventMap[K]) => void,
  ) {
    if (typeof handler !== "function") {
      throw new TypeError(
        `The "handler" argument must be of type function. Received ${handler === null ? "null" : typeof handler}`,
      );
    }

    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(handler);
  }

  emit<K extends keyof EventMap>(eventName: K, payload: EventMap[K]) {
    console.log("emit, eventName: %s", String(eventName), this._listeners);
    const handlers = this._listeners[eventName];
    if (handlers && handlers.length > 0) {
      handlers.forEach((listener) => listener(payload));
    }
  }

  off<K extends keyof EventMap>(
    eventName: K,
    handler: (payload: EventMap[K]) => void,
  ) {
    const handlers = this._listeners[eventName];
    if (!handlers) {
      return;
    }

    const index = handlers.indexOf(handler);
    if (index === -1) {
      return;
    }

    handlers.splice(index, 1);

    if (handlers.length === 0) {
      delete this._listeners[eventName];
    }
  }
}
