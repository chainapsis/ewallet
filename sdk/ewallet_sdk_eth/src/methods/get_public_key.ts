import { type Hex } from "viem";

import type { EthEWalletInterface } from "@keplr-ewallet-sdk-eth/types";

export async function getPublicKey(this: EthEWalletInterface): Promise<Hex> {
  console.log("[eth] getPublicKey: start");

  if (this.publicKey !== null) {
    console.log("[eth] getPublicKey: cached public key");

    return this.publicKey;
  }

  console.log("[eth] getPublicKey: getPublicKey from eWallet");

  const ret = await this.eWallet.getPublicKey();
  if (ret === null) {
    throw new Error("Failed to fetch public key");
  }

  this.publicKey = `0x${ret}`;

  return `0x${ret}`;
}
