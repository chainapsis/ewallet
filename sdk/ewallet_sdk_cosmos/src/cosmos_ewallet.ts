import {
  type KeplrEWallet,
  EventEmitter2,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { ChainInfo } from "@keplr-wallet/types";

import type { KeplrWalletCosmosEventNames } from "./types";
import type { KeplrWalletCosmosEventHandlerMap } from "./types";
import { enable } from "@keplr-ewallet-sdk-cosmos/api/enable";
import { getCosmosChainInfo } from "@keplr-ewallet-sdk-cosmos/api/get_cosmos_chain_info";
import { getAccounts } from "@keplr-ewallet-sdk-cosmos/api/get_accounts";
import { experimentalSuggestChain } from "@keplr-ewallet-sdk-cosmos/api/experimental_suggest_chain";
import { getKey } from "@keplr-ewallet-sdk-cosmos/api/get_key";
import { getOfflineSigner } from "@keplr-ewallet-sdk-cosmos/api/get_offline_signer";
import { getOfflineSignerOnlyAmino } from "@keplr-ewallet-sdk-cosmos/api/get_offline_signer_only_amino";
import { getOfflineSignerAuto } from "@keplr-ewallet-sdk-cosmos/api/get_offline_signer_auto";
import { getKeysSettled } from "./api/get_keys_settled";
import { sendTx } from "./api/send_tx";
import { signAmino } from "./api/sign_amino";
import { signDirect } from "./api/sign_direct";
import { signArbitrary } from "./api/sign_arbitrary";
import { verifyArbitrary } from "./api/verify_arbitrary";
import { showModal } from "./api/show_modal";
import { makeSignature } from "./api/make_signature";
import { getPublicKey } from "./api/get_public_key";
import { on } from "./api/on";

export class CosmosEWallet {
  public eWallet: KeplrEWallet;
  protected _cosmosChainInfo: ChainInfo[] | null = null;
  protected _cacheTime: number = 0;
  eventEmitter: EventEmitter2 | null = null;

  on: <
    N extends KeplrWalletCosmosEventNames,
    M extends { eventName: N } & KeplrWalletCosmosEventHandlerMap,
  >(
    eventType: N,
    handler: M["handler"],
  ) => void;

  constructor(eWallet: KeplrEWallet) {
    this.eWallet = eWallet;
    this.eventEmitter = new EventEmitter2();
    this.on = on.bind(this);

    this.setupEventHandlers();
  }

  enable = enable;
  getPublicKey = getPublicKey.bind(this);
  getCosmosChainInfo = getCosmosChainInfo.bind(this);
  experimentalSuggestChain = experimentalSuggestChain;
  getAccounts = getAccounts.bind(this);
  getOfflineSigner = getOfflineSigner.bind(this);
  getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino.bind(this);
  getOfflineSignerAuto = getOfflineSignerAuto.bind(this);
  getKey = getKey.bind(this);
  getKeysSettled = getKeysSettled.bind(this);
  sendTx = sendTx.bind(this);
  signAmino = signAmino.bind(this);
  signDirect = signDirect.bind(this);
  signArbitrary = signArbitrary.bind(this);
  verifyArbitrary = verifyArbitrary.bind(this);
  protected showModal = showModal.bind(this);
  protected makeSignature = makeSignature.bind(this);

  setupEventHandlers() {
    console.log("[keplr] set up event handlers");

    this.eWallet.on("_accountsChanged", (payload: any) => {
      if (this.eventEmitter) {
        this.eventEmitter.emit("accountsChanged", payload);
      }
    });

    this.eWallet.on("_chainChanged", (payload: any) => {
      if (this.eventEmitter) {
        this.eventEmitter.emit("chainChanged", payload);
      }
    });
  }
}
