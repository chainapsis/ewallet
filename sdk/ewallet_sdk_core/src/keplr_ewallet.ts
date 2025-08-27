import { sendMsgToIframe } from "./methods/send_msg_to_iframe";
import { showModal } from "./methods/show_modal";
import { signIn } from "./methods/sign_in";
import { signOut } from "./methods/sign_out";
import { getPublicKey } from "./methods/get_public_key";
import { getEmail } from "./methods/get_email";
import { hideModal } from "./methods/hide_modal";
import { on } from "./methods/on";
import { lazyInit } from "./methods/lazy_init";
import type {
  KeplrEWalletCoreEvent2,
  KeplrEWalletCoreEventHandler2,
  KeplrEWalletInterface,
} from "./types";
import { init } from "./static/init";
import { EventEmitter3 } from "./event";

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
  this.eventEmitter = new EventEmitter3<
    KeplrEWalletCoreEvent2,
    KeplrEWalletCoreEventHandler2
  >();
  this.state = null;
  this.waitUntilInitialized = this.lazyInit().then();
}

KeplrEWallet.init = init;

const ptype: KeplrEWalletInterface = KeplrEWallet.prototype;

ptype.lazyInit = lazyInit;
ptype.showModal = showModal;
ptype.hideModal = hideModal;
ptype.sendMsgToIframe = sendMsgToIframe;
ptype.signIn = signIn;
ptype.signOut = signOut;
ptype.getPublicKey = getPublicKey;
ptype.getEmail = getEmail;
ptype.on = on;
