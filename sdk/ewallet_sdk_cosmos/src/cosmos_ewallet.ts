import {
  EventEmitter3,
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
  KeplrEWalletCosmosEvent2,
  KeplrEWalletCosmosEventHandler2,
} from "@keplr-ewallet-sdk-cosmos/types";
import { init } from "./static/init";
import { lazyInit } from "./methods/lazy_init";

export function CosmosEWallet(
  this: CosmosEWalletInterface,
  eWallet: KeplrEWalletInterface,
) {
  this.eWallet = eWallet;
  this.cosmosChainInfo = [];
  this.cacheTime = 0;
  this.eventEmitter = new EventEmitter3<
    KeplrEWalletCosmosEvent2,
    KeplrEWalletCosmosEventHandler2
  >();
  this.state = null;
  this.waitUntilInitialized = this.lazyInit();
}

CosmosEWallet.init = init;

const ptype: CosmosEWalletInterface = CosmosEWallet.prototype;

ptype.enable = enable;
ptype.on = on;
ptype.lazyInit = lazyInit;
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
ptype.showModal = showModal;
