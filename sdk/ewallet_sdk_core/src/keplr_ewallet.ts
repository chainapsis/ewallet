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
import type { KeplrEWalletCoreEventMap, KeplrEWalletCoreOn } from "./types";

export class KeplrEWallet {
  apiKey: string;
  iframe: HTMLIFrameElement;
  sdkEndpoint: string;
  eventEmitter: EventEmitter2<KeplrEWalletCoreEventMap>;
  readonly origin: string;

  publicKey: string | null;
  isInitialized: boolean;
  initError: string | null;

  on: KeplrEWalletCoreOn;

  public constructor(
    apiKey: string,
    iframe: HTMLIFrameElement,
    sdkEndpoint: string,
  ) {
    this.apiKey = apiKey;
    this.iframe = iframe;
    this.sdkEndpoint = sdkEndpoint;
    this.origin = window.location.origin;
    this.eventEmitter = new EventEmitter2<KeplrEWalletCoreEventMap>();
    this.isInitialized = false;
    this.initError = null;
    this.publicKey = null;
    this.on = on.bind(this);

    this.lazyInit()
      .then((initPayload) => {
        if (!initPayload.success) {
          console.error("[keplr] lazy init fail");
          this.initError = initPayload.err;
          this.eventEmitter.emit("_init", {
            success: false,
            err: initPayload.err,
          });
        } else {
          console.log("[keplr] lazy init success");

          this.isInitialized = true;
          this.publicKey = initPayload.data.public_key;
          this.eventEmitter.emit("_init", {
            success: true,
            data: {
              publicKey: initPayload.data.public_key,
            },
          });
        }

        // CHECK: there might be a timing gap between subscription and event emission
      })
      .catch((err: any) => {
        console.error("[keplr] lazy init fail, err: %s", err.toString());
        this.initError = err.toString();
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
  // waitUntilInitialized(): Promise<boolean> {
  //   return Promise.resolve(true);
  //   // return this.initializationPromise;
  // }
}
