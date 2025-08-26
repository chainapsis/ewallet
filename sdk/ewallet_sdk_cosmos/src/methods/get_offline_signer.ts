import type { KeplrSignOptions } from "@keplr-wallet/types";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";

import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";

export function getOfflineSigner(
  this: CosmosEWalletInterface,
  chainId: string,
  signOptions?: KeplrSignOptions,
): OfflineDirectSigner {
  return {
    getAccounts: this.getAccounts,
    signDirect: (signerAddress, signDoc) =>
      this.signDirect(chainId, signerAddress, signDoc, signOptions),
  };
}
