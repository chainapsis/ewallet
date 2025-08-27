import type {
  Key,
  SettledResponse,
  SettledResponses,
} from "@keplr-wallet/types";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";

export async function getKeysSettled(
  this: CosmosEWalletInterface,
  chainIds: string[],
): Promise<SettledResponses<Key>> {
  await this.waitUntilInitialized;

  return Promise.allSettled(chainIds.map((chainId) => this.getKey(chainId)));
}
