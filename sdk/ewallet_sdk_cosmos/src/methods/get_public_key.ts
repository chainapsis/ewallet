import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";

export async function getPublicKey(
  this: CosmosEWalletInterface,
): Promise<Uint8Array | null> {
  console.log("[keplr] getPublicKey: start");

  try {
    await this.waitUntilInitialized;

    if (this.state === null) {
      throw new Error("Cosmos SDK is not properly initialized");
    }

    if (this.state.publicKey) {
      console.log("[keplr] getPublicKey: cached public key");
      return this.state.publicKey;
    }

    console.log("[keplr] getPublicKey: getPublicKey from eWallet");

    const pk = await this.eWallet.getPublicKey();

    if (pk === null) {
      this.state.publicKey = null;
      return null;
    } else {
      const publicKey = Buffer.from(pk, "hex");

      this.state.publicKey = publicKey;
      return this.state.publicKey;
    }
  } catch (error: any) {
    console.error("[keplr] getPublicKey failed with error:", error);

    throw error;
  }
}
