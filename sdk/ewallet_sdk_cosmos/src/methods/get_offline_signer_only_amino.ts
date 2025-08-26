import type { OfflineAminoSigner } from "@cosmjs/amino";
import type { KeplrSignOptions } from "@keplr-wallet/types";

import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";

export function getOfflineSignerOnlyAmino(
  this: CosmosEWalletInterface,
  chainId: string,
  signOptions?: KeplrSignOptions,
): OfflineAminoSigner {
  return {
    getAccounts: this.getAccounts,
    signAmino: (signerAddress, signDoc) =>
      this.signAmino(chainId, signerAddress, signDoc, signOptions),
  };
}
