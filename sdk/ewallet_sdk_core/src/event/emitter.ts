export class EventEmitter2 {
  listeners: {
    [key: string]: Function[];
  };

  constructor() {
    this.listeners = {};
  }

  on(eventName: string, handler: Function) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
  }

  emit(eventName: string, payload: any) {
    console.log("emit, eventName: %s", eventName, this.listeners);

    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => listener(payload));
    }
  }
}
