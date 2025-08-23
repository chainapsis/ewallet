import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export async function getPublicKey(this: CosmosEWallet): Promise<Uint8Array> {
  console.log("[cosmos] getPublicKey: start");
  try {
    // return cached public key if available
    if (this.publicKey) {
      console.log("[cosmos] getPublicKey: cached public key");
      return this.publicKey;
    }

    console.log("[cosmos] getPublicKey: getPublicKey from eWallet");

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
    console.error("[cosmos] getPublicKey failed with error:", error);
    throw error;
    // return { success: false, err: error.toString() };
  }
}
