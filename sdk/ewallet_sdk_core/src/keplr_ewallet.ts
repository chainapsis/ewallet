import { sendMsgToIframe } from "./methods/send_msg_to_iframe";
import { showModal } from "./methods/show_modal";
import { signIn } from "./methods/sign_in";
import { signOut } from "./methods/sign_out";
import { getPublicKey } from "./methods/get_public_key";
import { getEmail } from "./methods/get_email";
import { hideModal } from "./methods/hide_modal";
import { makeSignature } from "./methods/make_signature";
import { on } from "./methods/on";
import { getCosmosChainInfo } from "./methods/get_cosmos_chain_info";
import { lazyInit } from "./methods/lazy_init";
import { EventEmitter2 } from "./event/emitter";
import type { KeplrEWalletCoreEventHandlerMap } from "./types";

export class KeplrEWallet {
  apiKey: string;
  iframe: HTMLIFrameElement;
  sdkEndpoint: string;
  eventEmitter: EventEmitter2;
  readonly origin: string;

  // private initializationPromise: Promise<boolean>;
  // private initialized: boolean = false;
  // private initializationError: Error | null = null;

  on: <
    N extends KeplrEWalletCoreEventHandlerMap["eventName"],
    M extends { eventName: N } & KeplrEWalletCoreEventHandlerMap,
  >(
    eventType: N,
    handler: M["handler"],
  ) => void;

  public constructor(
    apiKey: string,
    iframe: HTMLIFrameElement,
    sdkEndpoint: string,
    // initPromise: Promise<boolean>,
  ) {
    this.apiKey = apiKey;
    this.iframe = iframe;
    this.sdkEndpoint = sdkEndpoint;
    this.origin = window.location.origin;
    this.eventEmitter = new EventEmitter2();
    // TODO: @elden
    this.on = on.bind(this);

    this.lazyInit()
      .then((isInitialized) => {
        if (!isInitialized) {
          console.error("[keplr] lazy init fail");
        }
      })
      .catch((err: any) => {
        console.error("[keplr] lazy init fail, err: %s", err.toString());
      });

    // this.initializationPromise = initPromise
    //   .then((res) => {
    //     this.initialized = res;
    //     return res;
    //   })
    //   .catch((err: any) => {
    //     this.initialized = false;
    //     this.initializationError =
    //       err instanceof Error ? err : new Error(String(err));
    //     throw this.initializationError;
    //   });
  }

  lazyInit = lazyInit.bind(this);
  showModal = showModal.bind(this);
  hideModal = hideModal.bind(this);
  sendMsgToIframe = sendMsgToIframe.bind(this);
  signIn = signIn.bind(this);
  signOut = signOut.bind(this);
  getCosmosChainInfo = getCosmosChainInfo.bind(this);
  getPublicKey = getPublicKey.bind(this);
  getEmail = getEmail.bind(this);
  makeSignature = makeSignature.bind(this);
  // on = on.bind(this);

  isInitialized(): boolean {
    // TODO: @elden
    return true;
    // return this.initialized;
  }

  waitUntilInitialized(): Promise<boolean> {
    return Promise.resolve(true);
    // return this.initializationPromise;
  }
}
