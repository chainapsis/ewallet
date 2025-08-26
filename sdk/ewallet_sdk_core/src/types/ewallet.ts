import type { Result } from "@keplr-ewallet/stdlib-js";

import type { EventEmitter3 } from "@keplr-ewallet-sdk-core/event";
import type {
  KeplrEWalletCoreEvent2,
  KeplrEWalletCoreEventHandler,
  KeplrEWalletCoreEventHandler2,
  KeplrEWalletCoreEventMap,
  KeplrEWalletCoreEventName,
} from "./event";
import type { EWalletMsg, EWalletMsgShowModal } from "./msg";
import type { ModalResult } from "./modal";
import type { SignOutput } from "./sign";
import type { InitPayload } from "./init";

export interface KeplrEWalletInterface {
  apiKey: string;
  iframe: HTMLIFrameElement;
  sdkEndpoint: string;
  eventEmitter: EventEmitter3<
    KeplrEWalletCoreEvent2,
    KeplrEWalletCoreEventHandler2
  >;
  origin: string;
  state: null | KeplrEWalletState;
  waitUntilInitialized: Promise<Result<KeplrEWalletState, string>>;
  lazyInit: () => Promise<Result<KeplrEWalletState, string>>;

  // _email: string | null;
  // _publicKey: string | null;
  // _initError: string | null;
  // _initPromise: Promise<void>;

  showModal: (msg: EWalletMsgShowModal) => Promise<ModalResult>;
  hideModal: () => Promise<void>;
  sendMsgToIframe: (msg: EWalletMsg) => Promise<EWalletMsg>;
  signIn: (type: "google") => Promise<void>;
  signOut: () => Promise<void>;

  // getCosmosChainInfo: () => void;

  getPublicKey: () => Promise<string | null>;
  getEmail: () => Promise<string | null>;

  on: <N extends KeplrEWalletCoreEventName>(
    eventName: N,
    handler: KeplrEWalletCoreEventHandler<N>,
  ) => Promise<void>;
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
