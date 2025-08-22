import { type CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export async function waitUntilInitialized(this: CosmosEWallet): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (this.eWallet.isLazyInit) {
        resolve(void 0);
      } else {
        this.eWallet.onInit((initSuccess) => {
          console.log("onInit callback, initSuccess: %s", initSuccess);

          if (initSuccess) {
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
