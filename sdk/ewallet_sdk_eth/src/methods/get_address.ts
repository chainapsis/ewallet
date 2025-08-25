import { isAddress, type Hex } from "viem";

import { publicKeyToEthereumAddress } from "@keplr-ewallet-sdk-eth/utils";
import { ErrorCodes } from "@keplr-ewallet-sdk-eth/errors";
import type { EthEWalletInterface } from "@keplr-ewallet-sdk-eth/types";

export async function getAddress(this: EthEWalletInterface): Promise<Hex> {
  if (this.address !== null) {
    return this.address;
  }

  await this.eWallet.waitUntilInitialized;

  const publicKey = await this.getPublicKey();
  const address = publicKeyToEthereumAddress(publicKey);
  if (!isAddress(address)) {
    // const errPayload = standardError.ethEWallet.invalidAddress({});

    const errPayload = {
      code: ErrorCodes.ethEWallet.invalidAddress,
      message:
        '"Invalid address, please check the public key is valid hex string"',
    };

    throw new Error(errPayload.toString());
  }

  this.address = address;

  return address;
}
