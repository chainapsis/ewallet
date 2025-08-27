import type {
  EventEmitter3,
  KeplrEWalletInterface,
  MakeCosmosSigData,
} from "@keplr-ewallet/ewallet-sdk-core";
import type {
  ChainInfo,
  KeplrSignOptions,
  SettledResponses,
} from "@keplr-wallet/types";
import type { Key } from "@keplr-wallet/types";
import type {
  AccountData,
  AminoSignResponse,
  OfflineAminoSigner,
  StdSignature,
  StdSignDoc,
} from "@cosmjs/amino";
import type {
  DirectSignResponse,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";

import type {
  KeplrEWalletCosmosEvent2,
  KeplrEWalletCosmosEventHandler2,
} from "./event";
import type { ShowModalResult } from "./modal";
import type { SignDoc } from "@keplr-ewallet-sdk-cosmos/types/sign";
import type { Result } from "@keplr-ewallet/stdlib-js";
import type { LazyInitError } from "@keplr-ewallet-sdk-cosmos/methods/lazy_init";

export interface CosmosEWalletState {
  publicKey: Uint8Array | null;
}

export interface CosmosEWalletInterface {
  state: CosmosEWalletState;
  eWallet: KeplrEWalletInterface;
  eventEmitter: EventEmitter3<
    KeplrEWalletCosmosEvent2,
    KeplrEWalletCosmosEventHandler2
  >;
  cosmosChainInfo: ChainInfo[];
  cacheTime: number;
  waitUntilInitialized: Promise<Result<CosmosEWalletState, LazyInitError>>;

  lazyInit: () => Promise<Result<CosmosEWalletState, LazyInitError>>;
  setUpEventHandlers: () => void;
  enable: (_chainId: string) => Promise<void>;
  on: (handlerDef: KeplrEWalletCosmosEventHandler2) => void;
  getPublicKey: () => Promise<Uint8Array | null>;
  getCosmosChainInfo: () => Promise<ChainInfo[]>;
  experimentalSuggestChain: (_chainInfo: ChainInfo) => Promise<void>;
  getAccounts: () => Promise<AccountData[]>;
  getOfflineSigner: (
    chainId: string,
    signOptions?: KeplrSignOptions,
  ) => OfflineDirectSigner;

  getOfflineSignerOnlyAmino: (
    chainId: string,
    signOptions?: KeplrSignOptions,
  ) => OfflineAminoSigner;

  getOfflineSignerAuto: (
    chainId: string,
    signOptions?: KeplrSignOptions,
  ) => Promise<OfflineDirectSigner | OfflineAminoSigner>;

  getKey: (chainId: string) => Promise<Key>;

  getKeysSettled: (chainIds: string[]) => Promise<SettledResponses<Key>>;

  sendTx: (
    chainId: string,
    tx: unknown,
    mode: "async" | "sync" | "block",
    options: {
      silent?: boolean;
      onFulfill?: (tx: any) => void;
    },
  ) => Promise<Uint8Array>;

  signAmino: (
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: KeplrSignOptions,
  ) => Promise<AminoSignResponse>;

  signDirect: (
    chainId: string,
    signer: string,
    signDoc: SignDoc,
    signOptions?: KeplrSignOptions,
  ) => Promise<DirectSignResponse>;

  signArbitrary: (
    chainId: string,
    signer: string,
    data: string | Uint8Array,
  ) => Promise<StdSignature>;

  verifyArbitrary: (
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature,
  ) => Promise<boolean>;
  showModal: (data: MakeCosmosSigData) => Promise<ShowModalResult>;
}
