import { sendMsgToIframe } from "./methods/send_msg_to_iframe";
import { showModal } from "./methods/show_modal";
import { signIn } from "./methods/sign_in";
import { signOut } from "./methods/sign_out";
import { getPublicKey } from "./methods/get_public_key";
import { getEmail } from "./methods/get_email";
import { hideModal } from "./methods/hide_modal";
import { makeSignature } from "./methods/make_signature";
import { on } from "./methods/on";
import { lazyInit } from "./methods/lazy_init";
import { EventEmitter2 } from "./event/emitter";
import type { KeplrEWalletCoreEventMap, KeplrEWalletInterface } from "./types";
import { init } from "./static/init";

export function KeplrEWallet(
  this: KeplrEWalletInterface,
  apiKey: string,
  iframe: HTMLIFrameElement,
  sdkEndpoint: string,
) {
  this.apiKey = apiKey;
  this.iframe = iframe;
  this.sdkEndpoint = sdkEndpoint;
  this.origin = window.location.origin;
  this.eventEmitter = new EventEmitter2<KeplrEWalletCoreEventMap>();
  this.waitUntilInitialized = this.lazyInit();
}

KeplrEWallet.prototype.lazyInit = lazyInit;
KeplrEWallet.prototype.showModal = showModal;
KeplrEWallet.prototype.hideModal = hideModal;
KeplrEWallet.prototype.sendMsgToIframe = sendMsgToIframe;
KeplrEWallet.prototype.signIn = signIn;
KeplrEWallet.prototype.signOut = signOut;
KeplrEWallet.prototype.getPublicKey = getPublicKey;
KeplrEWallet.prototype.getEmail = getEmail;
KeplrEWallet.prototype.makeSignature = makeSignature;
KeplrEWallet.prototype.on = on;

KeplrEWallet.init = init;
