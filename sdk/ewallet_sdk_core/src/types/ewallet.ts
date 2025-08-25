import type { EventEmitter2 } from "@keplr-ewallet-sdk-core/event";
import type {
  KeplrEWalletCoreEventHandler,
  KeplrEWalletCoreEventMap,
  KeplrEWalletCoreEventName,
} from "./event";
import type { EWalletMsg } from "./msg";
import type { Result } from "@keplr-ewallet/stdlib-js";

export interface KeplrEwalletInitArgs {
  api_key: string;
  sdk_endpoint?: string;
}

export interface InitMsgHandlerArgs { }

export interface InitResult {
  email: string | null;
  public_key: string | null;
}

export interface KeplrEWalletInterface {
  apiKey: string;
  iframe: HTMLIFrameElement;
  sdkEndpoint: string;
  eventEmitter: EventEmitter2<KeplrEWalletCoreEventMap>;
  origin: string;

  _email: string | null;
  _publicKey: string | null;

  _isInitialized: boolean;
  _initError: string | null;
  _initPromise: Promise<void>;

  lazyInit: () => Promise<Result<InitResult, string>>;
  showModal: () => void;
  hideModal: () => void;
  sendMsgToIframe: (msg: EWalletMsg) => Promise<EWalletMsg>;
  signIn: () => void;
  signOut: () => void;
  getCosmosChainInfo: () => void;
  getPublicKey: () => Promise<string | null>;
  getEmail: () => Promise<string | null>;
  makeSignature: () => void;
  on: <N extends KeplrEWalletCoreEventName>(
    eventName: N,
    handler: KeplrEWalletCoreEventHandler<N>,
  ) => Promise<void>;
}
