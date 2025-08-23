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
import type { KeplrEWalletCoreEventMap } from "./types";

export class KeplrEWallet {
  apiKey: string;
  iframe: HTMLIFrameElement;
  sdkEndpoint: string;
  eventEmitter: EventEmitter2<KeplrEWalletCoreEventMap>;
  readonly origin: string;

  protected _email: string | null;
  protected _publicKey: string | null;

  protected _isInitialized: boolean;
  protected _initError: string | null;
  protected _initPromise: Promise<void>;

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
    this._email = null;
    this._publicKey = null;
    this._isInitialized = false;
    this._initError = null;
    this._initPromise = this.lazyInit()
      .then((initPayload) => {
        if (!initPayload.success) {
          console.error("[keplr] lazy init fail");
          throw new Error(initPayload.err);
        }

        // CHECK: there might be a timing gap between subscription and event emission
        console.log("[keplr] lazy init success");

        this.isInitialized = true;
        this.email = initPayload.data.email;
        this.publicKey = initPayload.data.public_key;
        this.eventEmitter.emit("_init", {
          success: true,
          data: {
            email: initPayload.data.email,
            publicKey: initPayload.data.public_key,
          },
        });
      })
      .catch((err: any) => {
        console.error("[keplr] lazy init fail, err: %s", err.toString());
        this.isInitialized = false;
        this.initError = err.toString();
        this.eventEmitter.emit("_init", {
          success: false,
          err: err.toString(),
        });
        throw err;
      });
  }

  get email(): string | null {
    return this._email;
  }

  get publicKey(): string | null {
    return this._publicKey;
  }

  protected set email(value: string | null) {
    this._email = value;
  }

  protected set publicKey(value: string | null) {
    this._publicKey = value;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get initError(): string | null {
    return this._initError;
  }

  get waitUntilInitialized(): Promise<void> {
    return this._initPromise;
  }

  protected set isInitialized(value: boolean) {
    this._isInitialized = value;
  }

  protected set initError(value: string | null) {
    this._initError = value;
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
  on = on.bind(this);
  // waitUntilInitialized(): Promise<boolean> {
  //   return Promise.resolve(true);
  //   // return this.initializationPromise;
  // }
}
