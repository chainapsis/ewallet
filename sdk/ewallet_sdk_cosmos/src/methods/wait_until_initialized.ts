import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export async function waitUntilInitialized(this: CosmosEWallet): Promise<void> {
  console.log("[cosmos] waitUntilInitialized: start");

  return new Promise((resolve, reject) => {
    try {
      if (this.eWallet.isInitialized) {
        console.log("[cosmos] waitUntilInitialized: already initialized");
        resolve(void 0);
      } else {
        if (this.eWallet.initError) {
          reject(new Error(this.eWallet.initError));
        }

        if (this.eWallet.waitUntilInitialized) {
          this.eWallet.waitUntilInitialized
            .then(() => {
              resolve(void 0);
            })
            .catch((error: any) => {
              reject(error);
            });
        } else {
          reject(new Error("initPromise is not set"));
        }
      }
    } catch (error: any) {
      console.error("[cosmos] waitUntilInitialized failed with error:", error);
      throw error;
    }
  });
}
