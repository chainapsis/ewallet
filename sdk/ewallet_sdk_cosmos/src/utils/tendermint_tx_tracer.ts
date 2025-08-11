import { Buffer } from "buffer";

type Listeners = {
  [K in keyof TxEventMap]?: TxEventMap[K][];
};

type QueryParams = Record<string, string | number | boolean>;
type TxQuery = Uint8Array | QueryParams;

interface PendingOperation {
  resolver: (data?: unknown) => void;
  rejector: (error: Error) => void;
}

interface TxSubscription extends PendingOperation {
  params: QueryParams;
}

interface PendingQuery extends PendingOperation {
  method: string;
  params: QueryParams;
}

enum WsReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
  NONE,
}

interface TxEventMap {
  close: (e: CloseEvent) => void;
  error: (e: Event) => void;
  message: (e: MessageEvent) => void;
  open: (e: Event) => void;
}

export class TendermintTxTracer {
  private ws: WebSocket;
  private newBlockSubscribes: Array<{ handler: (block: any) => void }> = [];
  private txSubscribes = new Map<number, TxSubscription>();
  private pendingQueries = new Map<number, PendingQuery>();
  private listeners: Listeners = {};

  constructor(
    protected readonly url: string,
    protected readonly wsEndpoint: string,
    protected readonly options: {
      wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
    } = {}
  ) {
    this.ws = this.options.wsObject
      ? new this.options.wsObject(this.getWsEndpoint())
      : new WebSocket(this.getWsEndpoint());
    this.ws.onopen = this.onOpen;
    this.ws.onmessage = this.onMessage;
    this.ws.onclose = this.onClose;
    this.ws.onerror = this.onError;
  }

  protected getWsEndpoint(): string {
    let url = this.url;
    if (url.startsWith("http")) {
      url = url.replace("http", "ws");
    }
    if (!url.endsWith(this.wsEndpoint)) {
      const wsEndpoint = this.wsEndpoint.startsWith("/")
        ? this.wsEndpoint
        : "/" + this.wsEndpoint;

      url = url.endsWith("/") ? url + wsEndpoint.slice(1) : url + wsEndpoint;
    }

    return url;
  }

  close() {
    this.ws.close();
  }

  get readyState(): WsReadyState {
    switch (this.ws.readyState) {
      case 0:
        return WsReadyState.CONNECTING;
      case 1:
        return WsReadyState.OPEN;
      case 2:
        return WsReadyState.CLOSING;
      case 3:
        return WsReadyState.CLOSED;
      default:
        return WsReadyState.NONE;
    }
  }

  addEventListener<T extends keyof TxEventMap>(
    type: T,
    listener: TxEventMap[T]
  ) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type]!.push(listener);
  }

  protected readonly onOpen = (e: Event) => {
    if (this.newBlockSubscribes.length > 0) {
      this.sendSubscribeBlockRpc();
    }

    for (const [id, tx] of this.txSubscribes) {
      this.sendSubscribeTxRpc(id, tx.params);
    }

    for (const [id, query] of this.pendingQueries) {
      this.sendQueryRpc(id, query.method, query.params);
    }

    for (const listener of this.listeners.open ?? []) {
      listener(e);
    }
  };

  protected readonly onMessage = (e: MessageEvent) => {
    for (const listener of this.listeners.message ?? []) {
      listener(e);
    }

    if (e.data) {
      try {
        const obj = JSON.parse(e.data);

        if (obj?.id) {
          if (this.pendingQueries.has(obj.id)) {
            if (obj.error) {
              this.pendingQueries
                .get(obj.id)!
                .rejector(new Error(obj.error.data || obj.error.message));
            } else {
              if (obj.result?.tx_result) {
                this.pendingQueries.get(obj.id)!.resolver(obj.result.tx_result);
              } else {
                this.pendingQueries.get(obj.id)!.resolver(obj.result);
              }
            }

            this.pendingQueries.delete(obj.id);
          }
        }

        if (obj?.result?.data?.type === "tendermint/event/NewBlock") {
          for (const handler of this.newBlockSubscribes) {
            handler.handler(obj.result.data.value);
          }
        }

        if (obj?.result?.data?.type === "tendermint/event/Tx") {
          if (obj?.id) {
            if (this.txSubscribes.has(obj.id)) {
              if (obj.error) {
                this.txSubscribes
                  .get(obj.id)!
                  .rejector(new Error(obj.error.data || obj.error.message));
              } else {
                this.txSubscribes
                  .get(obj.id)!
                  .resolver(obj.result.data.value.TxResult.result);
              }

              this.txSubscribes.delete(obj.id);
            }
          }
        }
      } catch (e) {
        console.log(
          `Tendermint websocket jsonrpc response is not JSON: ${
            e.message || e.toString()
          }`
        );
      }
    }
  };

  protected readonly onClose = (e: CloseEvent) => {
    for (const listener of this.listeners.close ?? []) {
      listener(e);
    }
  };

  protected readonly onError = (e: Event) => {
    for (const listener of this.listeners.error ?? []) {
      listener(e);
    }
    this.close();
  };

  subscribeBlock(handler: (block: any) => void) {
    this.newBlockSubscribes.push({
      handler,
    });

    if (this.newBlockSubscribes.length === 1) {
      this.sendSubscribeBlockRpc();
    }

    return () => {
      this.newBlockSubscribes = this.newBlockSubscribes.filter(
        (s) => s.handler !== handler
      );
    };
  }

  protected sendSubscribeBlockRpc(): void {
    if (this.readyState === WsReadyState.OPEN) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method: "subscribe",
          params: ["tm.event='NewBlock'"],
          id: 1,
        })
      );
    }
  }

  traceTx(query: TxQuery): Promise<any> {
    let resolved = false;
    return new Promise<any>((resolve) => {
      this.queryTx(query)
        .then((result) => {
          if (query instanceof Uint8Array) {
            resolve(result);
            return;
          }

          if (result?.total_count !== "0") {
            resolve(result);
            return;
          }
        })
        .catch(() => {
          // noop
        });

      (async () => {
        while (true) {
          if (
            resolved ||
            this.readyState === WsReadyState.CLOSED ||
            this.readyState === WsReadyState.CLOSING
          ) {
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 10000));

          this.queryTx(query)
            .then((result) => {
              if (query instanceof Uint8Array) {
                resolve(result);
                return;
              }

              if (result?.total_count !== "0") {
                resolve(result);
                return;
              }
            })
            .catch(() => {
              // noop
            });
        }
      })();

      this.subscribeTx(query).then(resolve);
    }).then((tx) => {
      resolved = true;
      return new Promise((resolve) => {
        setTimeout(() => resolve(tx), 100);
      });
    });
  }

  subscribeTx(query: TxQuery): Promise<any> {
    if (query instanceof Uint8Array) {
      const id = this.createRandomId();

      const params = {
        query: `tm.event='Tx' AND tx.hash='${Buffer.from(query)
          .toString("hex")
          .toUpperCase()}'`,
      };

      return new Promise<unknown>((resolve, reject) => {
        this.txSubscribes.set(id, {
          params,
          resolver: resolve,
          rejector: reject,
        });

        this.sendSubscribeTxRpc(id, params);
      });
    } else {
      const id = this.createRandomId();

      const params = {
        query:
          `tm.event='Tx' AND ` +
          Object.keys(query)
            .map((key) => {
              return {
                key,
                value: query[key],
              };
            })
            .map((obj) => {
              return `${obj.key}=${
                typeof obj.value === "string" ? `'${obj.value}'` : obj.value
              }`;
            })
            .join(" AND "),
        page: "1",
        per_page: "1",
        order_by: "asc",
      };

      return new Promise<unknown>((resolve, reject) => {
        this.txSubscribes.set(id, {
          params,
          resolver: resolve,
          rejector: reject,
        });

        this.sendSubscribeTxRpc(id, params);
      });
    }
  }

  protected sendSubscribeTxRpc(
    id: number,
    params: Record<string, string | number | boolean>
  ): void {
    if (this.readyState === WsReadyState.OPEN) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method: "subscribe",
          params: params,
          id,
        })
      );
    }
  }

  queryTx(query: TxQuery): Promise<any> {
    if (query instanceof Uint8Array) {
      return this.query("tx", {
        hash: Buffer.from(query).toString("base64"),
        prove: false,
      });
    } else {
      const params = {
        query: Object.keys(query)
          .map((key) => {
            return {
              key,
              value: query[key],
            };
          })
          .map((obj) => {
            return `${obj.key}=${
              typeof obj.value === "string" ? `'${obj.value}'` : obj.value
            }`;
          })
          .join(" AND "),
        page: "1",
        per_page: "1",
        order_by: "asc",
      };

      return this.query("tx_search", params);
    }
  }

  protected query(
    method: string,
    params: Record<string, string | number | boolean>
  ): Promise<any> {
    const id = this.createRandomId();

    return new Promise<unknown>((resolve, reject) => {
      this.pendingQueries.set(id, {
        method,
        params,
        resolver: resolve,
        rejector: reject,
      });

      this.sendQueryRpc(id, method, params);
    });
  }

  protected sendQueryRpc(
    id: number,
    method: string,
    params: Record<string, string | number | boolean>
  ) {
    if (this.readyState === WsReadyState.OPEN) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id,
        })
      );
    }
  }

  private createRandomId(): number {
    return Math.floor(Math.random() * 1000000);
  }
}