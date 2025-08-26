import type { AccountData } from "@cosmjs/amino";
import type {
  EWalletMsgGetCosmosChainInfo,
  KeplrEWalletInterface,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Result } from "@keplr-ewallet/stdlib-js";
import type { ChainInfo } from "@keplr-wallet/types";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import {
  isEthereumCompatible,
  getEthAddress,
  getCosmosAddress,
  getBech32Address,
} from "@keplr-ewallet-sdk-cosmos/utils/address";

export async function getAccounts(
  this: CosmosEWalletInterface,
): Promise<AccountData[]> {
  try {
    const pubKey = await this.getPublicKey();
    if (pubKey === null) {
      return [];
    }

    // const chainInfoList = await this.eWallet.getCosmosChainInfo();
    const chainInfoRes = await sendGetCosmosChainInfo(this.eWallet);
    if (!chainInfoRes.success) {
      throw new Error(chainInfoRes.err.toString());
    }

    const chainInfoList = chainInfoRes.data;

    const accounts: AccountData[] = [];
    for (const chainInfo of chainInfoList) {
      const prefix = chainInfo.bech32Config?.bech32PrefixAccAddr;
      if (!prefix) {
        continue;
      }

      const hasEthereumSupport = isEthereumCompatible(chainInfo);
      const address = hasEthereumSupport
        ? getEthAddress(pubKey)
        : getCosmosAddress(pubKey);
      const bech32Address = getBech32Address(address, prefix);

      accounts.push({
        address: bech32Address,
        algo: "secp256k1",
        pubkey: pubKey,
      });
    }

    return accounts;
  } catch (error: any) {
    throw error;
  }
}

type SendGetCosmosChainInfoError =
  | { type: "wrong ack message type" }
  | { type: "payload contains err"; err: any };

async function sendGetCosmosChainInfo(
  ewallet: KeplrEWalletInterface,
  chainId?: string,
): Promise<Result<ChainInfo[], SendGetCosmosChainInfoError>> {
  const msg: EWalletMsgGetCosmosChainInfo = {
    target: "keplr_ewallet_attached",
    msg_type: "get_cosmos_chain_info",
    payload: {
      chain_id: chainId ?? null,
    },
  };

  const res = await ewallet.sendMsgToIframe(msg);

  if (res.msg_type !== "get_cosmos_chain_info_ack") {
    return { success: false, err: { type: "wrong ack message type" } };
  }

  if (!res.payload.success) {
    return {
      success: false,
      err: { type: "payload contains err", err: res.payload.err },
    };
  }

  return { success: true, data: res.payload.data };
}
