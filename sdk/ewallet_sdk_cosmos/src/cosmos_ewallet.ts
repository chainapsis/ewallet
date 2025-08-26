import {
  EventEmitter2,
  type KeplrEWalletInterface,
} from "@keplr-ewallet/ewallet-sdk-core";

import { enable } from "@keplr-ewallet-sdk-cosmos/methods/enable";
import { getCosmosChainInfo } from "@keplr-ewallet-sdk-cosmos/methods/get_cosmos_chain_info";
import { getAccounts } from "@keplr-ewallet-sdk-cosmos/methods/get_accounts";
import { experimentalSuggestChain } from "@keplr-ewallet-sdk-cosmos/methods/experimental_suggest_chain";
import { getKey } from "@keplr-ewallet-sdk-cosmos/methods/get_key";
import { getOfflineSigner } from "@keplr-ewallet-sdk-cosmos/methods/get_offline_signer";
import { getOfflineSignerOnlyAmino } from "@keplr-ewallet-sdk-cosmos/methods/get_offline_signer_only_amino";
import { getOfflineSignerAuto } from "@keplr-ewallet-sdk-cosmos/methods/get_offline_signer_auto";
import { getKeysSettled } from "@keplr-ewallet-sdk-cosmos/methods/get_keys_settled";
import { sendTx } from "@keplr-ewallet-sdk-cosmos/methods/send_tx";
import { signAmino } from "@keplr-ewallet-sdk-cosmos/methods/sign_amino";
import { signDirect } from "@keplr-ewallet-sdk-cosmos/methods/sign_direct";
import { signArbitrary } from "@keplr-ewallet-sdk-cosmos/methods/sign_arbitrary";
import { verifyArbitrary } from "@keplr-ewallet-sdk-cosmos/methods/verify_arbitrary";
import { showModal } from "@keplr-ewallet-sdk-cosmos/methods/show_modal";
import { getPublicKey } from "@keplr-ewallet-sdk-cosmos/methods/get_public_key";
import { on } from "@keplr-ewallet-sdk-cosmos/methods/on";
import type {
  CosmosEWalletInterface,
  KeplrWalletCosmosEventMap,
} from "@keplr-ewallet-sdk-cosmos/types";
import { setUpEventHandlers } from "@keplr-ewallet-sdk-cosmos/methods/set_up_event_handlers";
import { waitUntilInitialized } from "@keplr-ewallet-sdk-cosmos/methods/wait_until_initialized";
import { init } from "./static/init";

export function CosmosEWallet(
  this: CosmosEWalletInterface,
  eWallet: KeplrEWalletInterface,
) {
  this.eWallet = eWallet;
  this.cosmosChainInfo = [];
  this.cacheTime = 0;
  this.eventEmitter = new EventEmitter2<KeplrWalletCosmosEventMap>();
  this.publicKey = null;
  this.setUpEventHandlers();
}

CosmosEWallet.init = init;

const ptype: CosmosEWalletInterface = CosmosEWallet.prototype;

ptype.enable = enable;
ptype.on = on;
ptype.getPublicKey = getPublicKey;
ptype.getCosmosChainInfo = getCosmosChainInfo;
ptype.experimentalSuggestChain = experimentalSuggestChain;
ptype.getAccounts = getAccounts;
ptype.getOfflineSigner = getOfflineSigner;
ptype.getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino;
ptype.getOfflineSignerAuto = getOfflineSignerAuto;
ptype.getKey = getKey;
ptype.getKeysSettled = getKeysSettled;
ptype.sendTx = sendTx;
ptype.signAmino = signAmino;
ptype.signDirect = signDirect;
ptype.signArbitrary = signArbitrary;
ptype.verifyArbitrary = verifyArbitrary;
ptype.setUpEventHandlers = setUpEventHandlers;
ptype.waitUntilInitialized = waitUntilInitialized;
ptype.showModal = showModal;

// export class CosmosEWallet {
//   public eWallet: KeplrEWalletInterface;
//   eventEmitter: EventEmitter2<KeplrWalletCosmosEventMap>;
//
//   protected _cosmosChainInfo: ChainInfo[];
//   protected _cacheTime: number;
//
//   protected _publicKey: Uint8Array | null;
//
//   constructor(eWallet: KeplrEWalletInterface) {
//     this.eWallet = eWallet;
//     this._cosmosChainInfo = [];
//     this._cacheTime = 0;
//     this.eventEmitter = new EventEmitter2<KeplrWalletCosmosEventMap>();
//     this._publicKey = null;
//     this.setUpEventHandlers();
//   }
//
//   get publicKey(): Uint8Array | null {
//     return this._publicKey;
//   }
//
//   protected set publicKey(value: Uint8Array | null) {
//     this._publicKey = value;
//   }

// enable = enable;
// on = on.bind(this);
// getPublicKey = getPublicKey.bind(this);
// getCosmosChainInfo = getCosmosChainInfo.bind(this);
// experimentalSuggestChain = experimentalSuggestChain;
// getAccounts = getAccounts.bind(this);
// getOfflineSigner = getOfflineSigner.bind(this);
// getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino.bind(this);
// getOfflineSignerAuto = getOfflineSignerAuto.bind(this);
// getKey = getKey.bind(this);
// getKeysSettled = getKeysSettled.bind(this);
// sendTx = sendTx.bind(this);
// signAmino = signAmino.bind(this);
// signDirect = signDirect.bind(this);
// signArbitrary = signArbitrary.bind(this);
// verifyArbitrary = verifyArbitrary.bind(this);
// setUpEventHandlers = setUpEventHandlers.bind(this);
// waitUntilInitialized = waitUntilInitialized.bind(this);
// showModal = showModal.bind(this);

// export class CosmosEWallet {
//   public eWallet: KeplrEWalletInterface;
//   eventEmitter: EventEmitter2<KeplrWalletCosmosEventMap>;
//
//   protected _cosmosChainInfo: ChainInfo[];
//   protected _cacheTime: number;
//
//   protected _publicKey: Uint8Array | null;
//
//   constructor(eWallet: KeplrEWalletInterface) {
//     this.eWallet = eWallet;
//     this._cosmosChainInfo = [];
//     this._cacheTime = 0;
//     this.eventEmitter = new EventEmitter2<KeplrWalletCosmosEventMap>();
//     this._publicKey = null;
//     this.setUpEventHandlers();
//   }
//
//   get publicKey(): Uint8Array | null {
//     return this._publicKey;
//   }
//
//   protected set publicKey(value: Uint8Array | null) {
//     this._publicKey = value;
//   }
//
//   enable = enable;
//   on = on.bind(this);
//   getPublicKey = getPublicKey.bind(this);
//   getCosmosChainInfo = getCosmosChainInfo.bind(this);
//   experimentalSuggestChain = experimentalSuggestChain;
//   getAccounts = getAccounts.bind(this);
//   getOfflineSigner = getOfflineSigner.bind(this);
//   getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino.bind(this);
//   getOfflineSignerAuto = getOfflineSignerAuto.bind(this);
//   getKey = getKey.bind(this);
//   getKeysSettled = getKeysSettled.bind(this);
//   sendTx = sendTx.bind(this);
//   signAmino = signAmino.bind(this);
//   signDirect = signDirect.bind(this);
//   signArbitrary = signArbitrary.bind(this);
//   verifyArbitrary = verifyArbitrary.bind(this);
//   setUpEventHandlers = setUpEventHandlers.bind(this);
//   waitUntilInitialized = waitUntilInitialized.bind(this);
//   showModal = showModal.bind(this);
//   makeSignature = makeSignature.bind(this);
// }
