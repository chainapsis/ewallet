import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

// CHECK: only check initialized in core as a single source of truth for better error handling
export async function waitUntilInitialized(this: CosmosEWallet): Promise<void> {
  console.log("[cosmos] waitUntilInitialized: start");

  return new Promise((resolve, reject) => {
    try {
      if (this.eWallet.isInitialized) {
        console.log("[cosmos] waitUntilInitialized: already initialized");
        resolve(void 0);
      } else {
        this.eWallet.on("_init", (initResult) => {
          console.log("[cosmos] _init callback, initSuccess: %s", initResult);

          // TODO: if pubkey is not null, resolve with public key
          if (initResult.success) {
            resolve(void 0);
          } else {
            reject();
          }
        });
      }
    } catch (error: any) {
      console.error("[cosmos] waitUntilInitialized failed with error:", error);
      throw error;
    }
  });
}
