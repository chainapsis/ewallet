import { isAddress, type Hex } from "viem";

import { publicKeyToEthereumAddress } from "@keplr-ewallet-sdk-eth/utils";
import type { EthEWalletInterface } from "@keplr-ewallet-sdk-eth/types";

export async function getAddress(this: EthEWalletInterface): Promise<Hex> {
  if (this.address !== null) {
    return this.address;
  }

  await this.eWallet.waitUntilInitialized;

  const publicKey = await this.getPublicKey();
  const address = publicKeyToEthereumAddress(publicKey);
  if (!isAddress(address)) {
    throw new Error("Invalid address");
  }

  this.address = address;

  return address;
}
