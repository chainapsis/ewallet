import type { CosmosEWalletInterface } from "@keplr-ewallet-sdk-cosmos/types";

export async function getPublicKey(
  this: CosmosEWalletInterface,
): Promise<Uint8Array> {
  console.log("[keplr] getPublicKey: start");
  try {
    // return cached public key if available
    if (this.publicKey) {
      console.log("[keplr] getPublicKey: cached public key");
      return this.publicKey;
    }

    console.log("[keplr] getPublicKey: getPublicKey from eWallet");

    const pubKey = await this.eWallet.getPublicKey();

    if (pubKey === null) {
      this.publicKey = null;
      throw new Error("Failed to get public key");
      // return { success: false, err: "Failed to get public key" };
    }

    const publicKey = Buffer.from(pubKey, "hex");
    this.publicKey = publicKey;
    return this.publicKey;
    // return { success: true, data: Buffer.from(pubKey, "hex") };
  } catch (error: any) {
    console.error("[keplr] getPublicKey failed with error:", error);
    throw error;
    // return { success: false, err: error.toString() };
  }
}
