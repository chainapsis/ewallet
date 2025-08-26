import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";
import type { KeyData } from "@keplr-ewallet-sdk-cosmos/types/key";

// TODO: @retto
// keplr랑 타입을 맞출 필요가 있는지 내일 회의 필요함. @retto
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
