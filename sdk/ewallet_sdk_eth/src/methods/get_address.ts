import { isAddress, type Hex } from "viem";

import type { EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";
import { publicKeyToEthereumAddress } from "@keplr-ewallet-sdk-eth/utils";
import { standardError } from "@keplr-ewallet-sdk-eth/errors";
import type { EthEWalletInterface } from "@keplr-ewallet-sdk-eth/types";

export async function getAddress(this: EthEWalletInterface): Promise<Hex> {
  if (this.address !== null) {
    return this.address;
  }

  const publicKey = await this.getPublicKey();
  const address = publicKeyToEthereumAddress(publicKey);
  if (!isAddress(address)) {
    throw standardError.ethEWallet.invalidAddress({});
  }

  this.address = address;

  return address;
}
