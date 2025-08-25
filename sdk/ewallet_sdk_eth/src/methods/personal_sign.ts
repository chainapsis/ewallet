import type { Hex } from "viem";

import type { EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";
import type { EthEWalletInterface } from "@keplr-ewallet-sdk-eth/types";

export async function personalSign(
  this: EthEWalletInterface,
  message: string,
): Promise<Hex> {
  const result = await this.makeSignature({
    type: "personal_sign",
    data: {
      address: await this.getAddress(),
      message,
    },
  });

  if (result.type !== "signature") {
    throw new Error("Invalid result type");
  }

  return result.signature;
}
