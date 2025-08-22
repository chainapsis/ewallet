import {
  type KeplrEWallet,
  EventEmitter2,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { ChainInfo } from "@keplr-wallet/types";

import { enable } from "@keplr-ewallet-sdk-cosmos/methods/enable";
import { getCosmosChainInfo } from "@keplr-ewallet-sdk-cosmos/methods/get_cosmos_chain_info";
import { getAccounts } from "@keplr-ewallet-sdk-cosmos/methods/get_accounts";
import { experimentalSuggestChain } from "@keplr-ewallet-sdk-cosmos/methods/experimental_suggest_chain";
import { getKey } from "@keplr-ewallet-sdk-cosmos/methods/get_key";
import { getOfflineSigner } from "@keplr-ewallet-sdk-cosmos/methods/get_offline_signer";
import { getOfflineSignerOnlyAmino } from "@keplr-ewallet-sdk-cosmos/methods/get_offline_signer_only_amino";
import { getOfflineSignerAuto } from "@keplr-ewallet-sdk-cosmos/methods/get_offline_signer_auto";
import { getKeysSettled } from "./methods/get_keys_settled";
import { sendTx } from "./methods/send_tx";
import { signAmino } from "./methods/sign_amino";
import { signDirect } from "./methods/sign_direct";
import { signArbitrary } from "./methods/sign_arbitrary";
import { verifyArbitrary } from "./methods/verify_arbitrary";
import { showModal } from "./methods/show_modal";
import { makeSignature } from "./methods/make_signature";
import { getPublicKey } from "./methods/get_public_key";
import { on } from "./methods/on";
import type { KeplrWalletCosmosEventMap, KeplrWalletCosmosOn } from "./types";
import { setUpEventHandlers } from "./methods/set_up_event_handlers";
import { waitUntilInitialized } from "./methods/wait_until_initialized";

export class CosmosEWallet {
  public eWallet: KeplrEWallet;
  eventEmitter: EventEmitter2<KeplrWalletCosmosEventMap>;

  protected _cosmosChainInfo: ChainInfo[];
  protected _cacheTime: number;

  on: KeplrWalletCosmosOn;

  constructor(eWallet: KeplrEWallet) {
    this.eWallet = eWallet;
    this._cosmosChainInfo = [];
    this._cacheTime = 0;
    this.eventEmitter = new EventEmitter2<KeplrWalletCosmosEventMap>();
    this.on = on.bind(this);
    this.setUpEventHandlers();
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
  setUpEventHandlers = setUpEventHandlers.bind(this);
  waitUntilInitialized = waitUntilInitialized.bind(this);
  protected showModal = showModal.bind(this);
  protected makeSignature = makeSignature.bind(this);
}
