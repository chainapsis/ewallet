import { type Hex } from "viem";

import type { EthEWalletInterface } from "@keplr-ewallet-sdk-eth/types";

export async function getPublicKey(this: EthEWalletInterface): Promise<Hex> {
  console.log("[keplr-eth] getPublicKey: start");

  if (this.state.publicKey !== null) {
    console.log("[keplr-eth] getPublicKey: cached public key");

    return this.state.publicKey;
  }

  await this.waitUntilInitialized;

  console.log("[keplr-eth] getPublicKey: getPublicKey from eWallet");

  const ret = await this.eWallet.getPublicKey();
  if (ret === null) {
    throw new Error("Failed to fetch public key");
  }

  this.state.publicKey = `0x${ret}`;

  return `0x${ret}`;
}
