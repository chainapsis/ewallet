import { sendMsgToIframe } from "./window_msg/send_msg_to_iframe";
import { showModal } from "./api/show_modal";
import { signIn } from "./api/sign_in";
import { signOut } from "./api/sign_out";
import { getPublicKey } from "./api/get_public_key";
import { getEmail } from "./api/get_email";
import { hideModal } from "./api/hide_modal";
import { makeSignature } from "./api/make_signature";
import { initState } from "./api/init_state";
import { on } from "./api/on";
import { EventEmitter2 } from "./event/emitter";
import type { KeplrWalletCoreEventHandlerMap } from "./types";
import { getCosmosChainInfo } from "./api/get_cosmos_chain_info";

export class KeplrEWallet {
  apiKey: string;
  iframe: HTMLIFrameElement;
  sdkEndpoint: string;
  eventEmitter: EventEmitter2;
  readonly origin: string;

  on: <
    N extends KeplrWalletCoreEventHandlerMap["eventName"],
    M extends { eventName: N } & KeplrWalletCoreEventHandlerMap,
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
    this.on = on.bind(this);
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
  initState = initState.bind(this);
  // on = on.bind(this);
}
