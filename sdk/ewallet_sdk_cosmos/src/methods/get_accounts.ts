import type { AccountData } from "@cosmjs/amino";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import {
  isEthereumCompatible,
  getEthAddress,
  getCosmosAddress,
  getBech32Address,
} from "@keplr-ewallet-sdk-cosmos/utils/address";
import { sendGetCosmosChainInfo } from "@keplr-ewallet-sdk-cosmos/utils/chain";

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
