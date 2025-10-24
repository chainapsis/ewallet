import { EventEmitter } from "eventemitter3";

import type {
  ProviderEvent,
  ProviderEventHandler,
  ProviderEventMap,
} from "./types";

export class ProviderEventEmitter extends EventEmitter<ProviderEvent> {
  on<K extends ProviderEvent>(
    event: K,
    handler: ProviderEventHandler<K>,
  ): this {
    return super.on(event, handler);
  }

  once<K extends ProviderEvent>(
    event: K,
    handler: ProviderEventHandler<K>,
  ): this {
    return super.once(event, handler);
  }

  off<K extends ProviderEvent>(
    event: K,
    handler: ProviderEventHandler<K>,
  ): this {
    return super.off(event, handler);
  }

  emit<K extends ProviderEvent>(
    event: K,
    payload: ProviderEventMap[K],
  ): boolean {
    return super.emit(event, payload);
  }

  addListener<K extends ProviderEvent>(
    event: K,
    handler: ProviderEventHandler<K>,
  ): this {
    return this.on(event, handler);
  }

  removeListener<K extends ProviderEvent>(
    event: K,
    handler: ProviderEventHandler<K>,
  ): this {
    return this.off(event, handler);
  }
}
