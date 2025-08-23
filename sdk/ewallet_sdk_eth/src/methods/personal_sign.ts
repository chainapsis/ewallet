import type { Hex } from "viem";

import type { EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";

export async function personalSign(
  this: EthEWallet,
  message: string,
): Promise<Hex> {
  const { signature } = await this.makeSignature({
    type: "personal_sign",
    data: {
      address: await this.getAddress(),
      message,
    },
  });

  return signature;
}
