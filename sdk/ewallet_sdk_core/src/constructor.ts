import { lazyInit } from "./private/lazy_init";
import type {
  KeplrEWalletCoreEvent2,
  KeplrEWalletCoreEventHandler2,
  KeplrEWalletInterface,
  KeplrEWalletStaticInterface,
} from "./types";
import { EventEmitter3 } from "./event";

export const KeplrEWallet = function(
  this: KeplrEWalletInterface,
  apiKey: string,
  iframe: HTMLIFrameElement,
  sdkEndpoint: string,
) {
  this.apiKey = apiKey;
  this.iframe = iframe;
  this.sdkEndpoint = sdkEndpoint;
  this.origin = window.location.origin;
  this.eventEmitter = new EventEmitter3<
    KeplrEWalletCoreEvent2,
    KeplrEWalletCoreEventHandler2
  >();
  this.state = {
    email: null,
    publicKey: null,
  };
  this.waitUntilInitialized = lazyInit(this).then();
} as any as KeplrEWalletStaticInterface;
