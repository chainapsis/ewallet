import type { KeplrSignOptions } from "@keplr-wallet/types";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";

import type { CosmosEWalletInterface } from "@oko-wallet-sdk-cosmos/types";

export function getOfflineSigner(
  this: CosmosEWalletInterface,
  chainId: string,
  signOptions?: KeplrSignOptions,
): OfflineDirectSigner {
  return {
    getAccounts: this.getAccounts.bind(this),
    signDirect: (signerAddress, signDoc) =>
      this.signDirect(chainId, signerAddress, signDoc, signOptions),
  };
}
