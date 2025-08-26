import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import type { KeyData } from "@keplr-ewallet-sdk-cosmos/types/key";

// TODO: @retto
export async function getKeysSettled(
  this: CosmosEWalletInterface,
  chainIds: string[],
): Promise<KeyData[]> {
  await this.waitUntilInitialized;

  let ret = [];
  for (let idx = 0; idx < chainIds.length; idx += 1) {
    const key = await this.getKey(chainIds[idx]);
    ret.push({ chainId: chainIds[idx], key });
  }

  return ret;
  // return Promise.allSettled(chainIds.map((chainId) => this.getKey(chainId)));
}
