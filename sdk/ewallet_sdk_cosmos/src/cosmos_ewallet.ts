import {
  type KeplrEWallet,
  type KeplrWalletCoreEventTypeMap,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { ChainInfo } from "@keplr-wallet/types";
import { EventEmitter2 } from "@keplr-ewallet/ewallet-sdk-core";

import { enable } from "./api/enable";
import { getCosmosChainInfo } from "./api/get_cosmos_chain_info";
import { getAccounts } from "./api/get_accounts";
import { experimentalSuggestChain } from "./api/experimental_suggest_chain";
import { getKey } from "./api/get_key";
import { getOfflineSigner } from "./api/get_offline_signer";
import { getOfflineSignerOnlyAmino } from "./api/get_offline_signer_only_amino";
import { getOfflineSignerAuto } from "./api/get_offline_signer_auto";
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

  constructor(eWallet: KeplrEWallet) {
    this.eWallet = eWallet;

    if (!this.eventEmitter) {
      this.eventEmitter = new EventEmitter2();
    }
    const emitter = this.eventEmitter;

    //TODO: fix 현재 제네릭에서 KeplrEWalletEventTypeMap에서 각 해당 이벤트에 대한
    //파라미터 타입이 제대로 잡히지가 않는 버그가 있음
    this.eWallet.on("accountsChanged", (payload: any) => {
      // post processing
      if (emitter) {
        emitter.emit("keyringChanged", payload);
      }
    });

    this.eWallet.on(
      "chainChanged",
      (payload: KeplrWalletCoreEventTypeMap["chainChanged"]) => {
        // post processing
        if (emitter) {
          emitter.emit("chainChanged", payload);
        }
      },
    );
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
  on = on.bind(this);

  protected showModal = showModal.bind(this);
  protected makeSignature = makeSignature.bind(this);
}
