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
import { onInit } from "./methods/on_init";

export class KeplrEWallet {
  apiKey: string;
  iframe: HTMLIFrameElement;
  sdkEndpoint: string;
  eventEmitter: EventEmitter2;
  readonly origin: string;
  isLazyInit: boolean;
  initSubscribers: ((initSuccess: boolean) => void)[];

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
  ) {
    this.apiKey = apiKey;
    this.iframe = iframe;
    this.sdkEndpoint = sdkEndpoint;
    this.origin = window.location.origin;
    this.eventEmitter = new EventEmitter2();
    this.isLazyInit = false;
    this.initSubscribers = [];

    // TODO: @elden
    this.on = on.bind(this);

    this.lazyInit()
      .then((initSuccess) => {
        if (!initSuccess) {
          console.error("[keplr] lazy init fail");
        } else {
          console.log("[keplr] lazy init success");

          this.isLazyInit = true;
        }

        for (let idx = 0; idx < this.initSubscribers.length; idx += 1) {
          this.initSubscribers[idx](initSuccess);
        }

        while (this.initSubscribers.length > 0) {
          const fn = this.initSubscribers.shift();
          if (fn) {
            fn(initSuccess);
          }
        }
      })
      .catch((err: any) => {
        console.error("[keplr] lazy init fail, err: %s", err.toString());
      });
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
  onInit = onInit.bind(this);
  // on = on.bind(this);

  // waitUntilInitialized(): Promise<boolean> {
  //   return Promise.resolve(true);
  //   // return this.initializationPromise;
  // }
}
