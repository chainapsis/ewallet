import type { Key, SettledResponse } from "@keplr-wallet/types";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";

export function getKeysSettled(
  this: CosmosEWalletInterface,
  chainIds: string[],
): Promise<SettledResponse<Key>[]> {
  return Promise.allSettled(chainIds.map((chainId) => this.getKey(chainId)));
}
