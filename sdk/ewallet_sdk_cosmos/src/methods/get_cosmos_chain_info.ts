import type { ChainInfo } from "@keplr-wallet/types";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import { sendGetCosmosChainInfo } from "@keplr-ewallet-sdk-cosmos/utils/chain";

export async function getCosmosChainInfo(
  this: CosmosEWalletInterface,
): Promise<ChainInfo[]> {
  const chainInfoRes = await sendGetCosmosChainInfo(this.eWallet);

  if (!chainInfoRes.success) {
    throw new Error(
      `Failed to get chain registry response: ${chainInfoRes.err.toString()}`,
    );
  }

  return chainInfoRes.data;
}
