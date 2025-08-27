import type { Result } from "@keplr-ewallet/stdlib-js";

import type { EventEmitter3 } from "@keplr-ewallet-sdk-core/event";
import type {
  KeplrEWalletCoreEvent2,
  KeplrEWalletCoreEventHandler2,
} from "./event";
import type { EWalletMsg, EWalletMsgShowModal } from "./msg";
import type { ModalResult } from "./modal";

export interface KeplrEWalletInterface {
  state: KeplrEWalletState;
  apiKey: string;
  iframe: HTMLIFrameElement;
  sdkEndpoint: string;
  eventEmitter: EventEmitter3<
    KeplrEWalletCoreEvent2,
    KeplrEWalletCoreEventHandler2
  >;
  origin: string;
  waitUntilInitialized: Promise<Result<KeplrEWalletState, string>>;

  lazyInit: () => Promise<Result<KeplrEWalletState, string>>;
  showModal: (msg: EWalletMsgShowModal) => Promise<ModalResult>;
  hideModal: () => Promise<void>;
  sendMsgToIframe: (msg: EWalletMsg) => Promise<EWalletMsg>;
  signIn: (type: "google") => Promise<void>;
  signOut: () => Promise<void>;
  getPublicKey: () => Promise<string | null>;
  getEmail: () => Promise<string | null>;
  on: (handlerDef: KeplrEWalletCoreEventHandler2) => void;
}

export interface KeplrEwalletInitArgs {
  api_key: string;
  sdk_endpoint?: string;
}

export interface InitMsgHandlerArgs {}

export interface KeplrEWalletState {
  email: string | null;
  publicKey: string | null;
}
