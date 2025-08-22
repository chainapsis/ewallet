import { sendMsgToIframe } from "./window_msg/send_msg_to_iframe";
import { showModal } from "./api/show_modal";
import { signIn } from "./api/sign_in";
import { signOut } from "./api/sign_out";
import { getPublicKey } from "./api/get_public_key";
import { getEmail } from "./api/get_email";
import { hideModal } from "./api/hide_modal";
import { makeSignature } from "./api/make_signature";
import { on } from "./api/on";
import { getCosmosChainInfo } from "./api/get_cosmos_chain_info";
import { EventEmitter2 } from "./event/emitter";
import type { KeplrEWalletCoreEventHandlerMap } from "./types";

export class KeplrEWallet {
  apiKey: string;
  iframe: HTMLIFrameElement;
  sdkEndpoint: string;
  eventEmitter: EventEmitter2;
  readonly origin: string;

  private initializationPromise: Promise<boolean>;
  private initialized: boolean = false;
  private initializationError: Error | null = null;

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
    initPromise: Promise<boolean>,
  ) {
    this.apiKey = apiKey;
    this.iframe = iframe;
    this.sdkEndpoint = sdkEndpoint;
    this.origin = window.location.origin;
    this.eventEmitter = new EventEmitter2();
    this.on = on.bind(this);

    this.initializationPromise = initPromise
      .then((res) => {
        this.initialized = res;
        return res;
      })
      .catch((err: any) => {
        this.initialized = false;
        this.initializationError =
          err instanceof Error ? err : new Error(String(err));
        throw this.initializationError;
      });
  }

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
    return this.initialized;
  }

  waitUntilInitialized(): Promise<boolean> {
    return this.initializationPromise;
  }
}
