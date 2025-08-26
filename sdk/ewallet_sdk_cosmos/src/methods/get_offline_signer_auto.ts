import type { KeplrSignOptions } from "@keplr-wallet/types";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { OfflineAminoSigner } from "@cosmjs/amino";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";

export async function getOfflineSignerAuto(
  this: CosmosEWalletInterface,
  chainId: string,
  signOptions?: KeplrSignOptions,
): Promise<OfflineDirectSigner | OfflineAminoSigner> {
  const key = await this.getKey(chainId);
  if (key.isNanoLedger) {
    return this.getOfflineSignerOnlyAmino(chainId, signOptions);
  }
  return this.getOfflineSigner(chainId, signOptions);
}
